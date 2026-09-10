import fs from 'fs';
import { spawnSync } from 'child_process';

export function assessVideoProbe({ fileSize = 0, format = {}, streams = [] } = {}) {
  const video = streams.find((stream) => stream.codec_type === 'video') || {};
  const audio = streams.find((stream) => stream.codec_type === 'audio') || {};
  const duration = Number(format.duration || video.duration || 0);
  const width = Number(video.width || 0);
  const height = Number(video.height || 0);
  const failures = [];

  if (width < 720 || height < 720) failures.push(`resolution ${width}x${height} is below 720px`);
  if (duration < 20 || duration > 45) failures.push(`duration ${duration.toFixed(1)}s is outside 20-45s`);
  if (!audio.codec_name) failures.push('audio stream is missing');
  if (fileSize < 750_000) failures.push(`file is only ${fileSize} bytes`);

  return {
    ok: failures.length === 0,
    failures,
    width,
    height,
    duration,
    hasAudio: Boolean(audio.codec_name),
    fileSize
  };
}

export function assessSampledFrames(buffer, { grid = 16 } = {}) {
  const frameBytes = grid * grid * 3;
  const frameCount = Math.floor(buffer.length / frameBytes);
  let greenFrames = 0;

  for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
    const start = frameIndex * frameBytes;
    const frame = buffer.subarray(start, start + frameBytes);
    let green = 0;
    let minLuma = 255;
    let maxLuma = 0;
    let minR = 255, maxR = 0, minG = 255, maxG = 0, minB = 255, maxB = 0;
    let minDominance = 255, maxDominance = 0;

    for (let i = 0; i + 2 < frame.length; i += 3) {
      const r = frame[i], g = frame[i + 1], b = frame[i + 2];
      const luma = (r + g + b) / 3;
      minLuma = Math.min(minLuma, luma);
      maxLuma = Math.max(maxLuma, luma);
      const dominance = g - Math.max(r, b);
      if (g > r * 1.35 && g > b * 1.35 && dominance > 28) {
        green++;
        minR = Math.min(minR, r); maxR = Math.max(maxR, r);
        minG = Math.min(minG, g); maxG = Math.max(maxG, g);
        minB = Math.min(minB, b); maxB = Math.max(maxB, b);
        minDominance = Math.min(minDominance, dominance);
        maxDominance = Math.max(maxDominance, dominance);
      }
    }

    const pixels = frame.length / 3;
    const greenRatio = pixels ? green / pixels : 1;
    const greenRange = green ? Math.max(maxR - minR, maxG - minG, maxB - minB) : 255;
    const dominanceRange = green ? maxDominance - minDominance : 255;
    if ((greenRatio >= 0.90 && maxLuma - minLuma < 65) ||
        (greenRatio >= 0.70 && greenRange < 38 && dominanceRange < 28)) {
      greenFrames++;
    }
  }

  return {
    ok: frameCount >= 10 && greenFrames < 3 && greenFrames / Math.max(frameCount, 1) < 0.12,
    frameCount,
    greenFrames,
    greenRatio: greenFrames / Math.max(frameCount, 1)
  };
}

export function validateVideoForPublishing(videoPath, { ffprobe = 'ffprobe', ffmpeg = 'ffmpeg' } = {}) {
  if (!fs.existsSync(videoPath)) throw new Error(`Video file is missing: ${videoPath}`);
  const result = spawnSync(ffprobe, [
    '-v', 'error',
    '-show_entries', 'format=duration:stream=codec_name,codec_type,width,height,duration',
    '-of', 'json',
    videoPath
  ], { encoding: 'utf8', timeout: 30_000 });
  if (result.error) {
    throw new Error(
      `Video QA could not start ${ffprobe} for ${videoPath}: ${result.error.message}`
    );
  }
  if (result.signal) {
    throw new Error(
      `Video QA inspection was terminated by ${result.signal} for ${videoPath}`
    );
  }
  if (result.status !== 0) {
    const details = String(result.stderr || result.stdout || `exit ${result.status}`).trim();
    throw new Error(`Video QA could not inspect ${videoPath}: ${details}`);
  }
  let probe;
  try {
    probe = JSON.parse(result.stdout || '{}');
  } catch (error) {
    throw new Error(
      `Video QA received invalid ffprobe output for ${videoPath}: ${error.message}`
    );
  }
  const assessment = assessVideoProbe({
    ...probe,
    fileSize: fs.statSync(videoPath).size
  });
  if (!assessment.ok) {
    throw new Error(`Video failed publish QA: ${assessment.failures.join('; ')}`);
  }

  const grid = 16;
  const sampled = spawnSync(ffmpeg, [
    '-hide_banner', '-loglevel', 'error', '-i', videoPath,
    '-vf', `fps=1,scale=${grid}:${grid},format=rgb24`,
    '-f', 'rawvideo', '-'
  ], { encoding: null, timeout: 60_000, maxBuffer: 8 * 1024 * 1024 });
  if (sampled.error) throw new Error(`Video QA could not start ${ffmpeg} for ${videoPath}: ${sampled.error.message}`);
  if (sampled.status !== 0 || !Buffer.isBuffer(sampled.stdout)) {
    throw new Error(`Video QA could not sample frames for ${videoPath}`);
  }
  const frameAssessment = assessSampledFrames(sampled.stdout, { grid });
  if (!frameAssessment.ok) {
    throw new Error(
      `Video failed publish QA: green-screen/placeholder background detected ` +
      `(${frameAssessment.greenFrames}/${frameAssessment.frameCount} sampled frames)`
    );
  }
  return { ...assessment, ...frameAssessment };
}
