#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const file = path.resolve(process.env.VIDEO_FILE || process.argv[2] || '');
const minSeconds = Number(process.env.MIN_VIDEO_SECONDS || 18);
const maxSeconds = Number(process.env.MAX_VIDEO_SECONDS || 30);

if (!file || !fs.existsSync(file)) {
  throw new Error(`Video QA failed: file not found: ${file || '(not supplied)'}`);
}

const probe = spawnSync('ffprobe', [
  '-v', 'error',
  '-show_entries', 'format=duration:stream=codec_type,codec_name,width,height',
  '-of', 'json',
  file
], { encoding: 'utf8' });

if (probe.status !== 0) {
  throw new Error(`Video QA failed: ffprobe could not read ${file}`);
}

const data = JSON.parse(probe.stdout);
const duration = Number(data.format?.duration || 0);
const video = data.streams?.find((stream) => stream.codec_type === 'video');
const audio = data.streams?.find((stream) => stream.codec_type === 'audio');
const failures = [];

if (duration < minSeconds || duration > maxSeconds) {
  failures.push(`duration ${duration.toFixed(2)}s is outside ${minSeconds}-${maxSeconds}s`);
}
if (!video) failures.push('video stream is missing');
if (!audio) failures.push('audio stream is missing');
if (video && (Number(video.width) < 1080 || Number(video.height) < 1920)) {
  failures.push(`resolution ${video.width}x${video.height} is below 1080x1920`);
}

if (failures.length) {
  throw new Error(`Video QA failed for ${path.basename(file)}: ${failures.join('; ')}`);
}

console.log(`[Video QA] PASS ${path.basename(file)}: ${duration.toFixed(2)}s, ${video.width}x${video.height}, ${video.codec_name} + ${audio.codec_name}`);
