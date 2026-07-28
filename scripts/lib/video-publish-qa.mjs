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

export function validateVideoForPublishing(videoPath, { ffprobe = 'ffprobe' } = {}) {
  if (!fs.existsSync(videoPath)) throw new Error(`Video file is missing: ${videoPath}`);
  const result = spawnSync(ffprobe, [
    '-v', 'error',
    '-show_entries', 'format=duration:stream=codec_name,codec_type,width,height,duration',
    '-of', 'json',
    videoPath
  ], { encoding: 'utf8', timeout: 30_000 });
  if (result.status !== 0) {
    throw new Error(`Video QA could not inspect ${videoPath}: ${String(result.stderr || '').trim()}`);
  }
  const probe = JSON.parse(result.stdout || '{}');
  const assessment = assessVideoProbe({
    ...probe,
    fileSize: fs.statSync(videoPath).size
  });
  if (!assessment.ok) {
    throw new Error(`Video failed publish QA: ${assessment.failures.join('; ')}`);
  }
  return assessment;
}
