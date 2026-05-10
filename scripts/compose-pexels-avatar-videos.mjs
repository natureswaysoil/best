#!/usr/bin/env node

/**
 * Compose final videos by overlaying a HeyGen green-screen avatar video onto
 * the existing Pexels seed video background.
 *
 * Required inputs:
 * - public/videos/NWS_014.mp4                    Pexels seed video background
 * - public/videos/NWS_014-heygen-avatar.mp4     HeyGen presenter video
 *
 * Output:
 * - public/videos/NWS_014-final-pexels-avatar.mp4
 *
 * Usage:
 *   PRODUCT_ID=NWS_014 node scripts/compose-pexels-avatar-videos.mjs
 *   node scripts/compose-pexels-avatar-videos.mjs --all
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT = path.resolve(__dirname, '..');
const VIDEOS_DIR = path.join(PROJECT, 'public', 'videos');
const BUILD_ALL = process.argv.includes('--all');
const PRODUCT_IDS = (process.env.PRODUCT_IDS || 'NWS_014,NWS_011,NWS_013,NWS_021,NWS_018')
  .split(',')
  .map((x) => x.trim())
  .filter(Boolean);
const TARGET_PRODUCT_ID = process.env.PRODUCT_ID || process.env.VIDEO_PRODUCT_ID || 'NWS_014';
const AVATAR_SUFFIX = process.env.HEYGEN_SEED_SUFFIX || 'heygen-avatar';
const OUTPUT_SUFFIX = process.env.FINAL_VIDEO_SUFFIX || 'final-pexels-avatar';
const AVATAR_WIDTH = Number(process.env.AVATAR_WIDTH || 430);
const AVATAR_MARGIN_X = Number(process.env.AVATAR_MARGIN_X || 36);
const AVATAR_MARGIN_Y = Number(process.env.AVATAR_MARGIN_Y || 36);
const CHROMA_COLOR = process.env.CHROMA_COLOR || '0x00ff00';
const CHROMA_SIMILARITY = process.env.CHROMA_SIMILARITY || '0.28';
const CHROMA_BLEND = process.env.CHROMA_BLEND || '0.08';
const FFMPEG_PRESET = process.env.FFMPEG_PRESET || 'veryfast';
const FFMPEG_TIMEOUT_MS = Number(process.env.FFMPEG_TIMEOUT_MS || 900000);

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: PROJECT,
    stdio: 'inherit',
    timeout: FFMPEG_TIMEOUT_MS
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} failed with exit ${result.status}`);
}

function exists(file) {
  return fs.existsSync(file) && fs.statSync(file).size > 1000;
}

function compose(productId) {
  const background = path.join(VIDEOS_DIR, `${productId}.mp4`);
  const avatar = path.join(VIDEOS_DIR, `${productId}-${AVATAR_SUFFIX}.mp4`);
  const output = path.join(VIDEOS_DIR, `${productId}-${OUTPUT_SUFFIX}.mp4`);

  if (!exists(background)) {
    throw new Error(`Missing Pexels background video: ${path.relative(PROJECT, background)}`);
  }
  if (!exists(avatar)) {
    throw new Error(`Missing HeyGen avatar video: ${path.relative(PROJECT, avatar)}`);
  }

  console.log(`\n🎬 Composing ${productId}`);
  console.log(`Background: ${path.relative(PROJECT, background)}`);
  console.log(`Avatar:     ${path.relative(PROJECT, avatar)}`);
  console.log(`Output:     ${path.relative(PROJECT, output)}`);

  const filter = [
    `[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1[bg]`,
    `[1:v]chromakey=${CHROMA_COLOR}:${CHROMA_SIMILARITY}:${CHROMA_BLEND},scale=${AVATAR_WIDTH}:-1[avatar]`,
    `[bg][avatar]overlay=W-w-${AVATAR_MARGIN_X}:H-h-${AVATAR_MARGIN_Y}:format=auto[v]`
  ].join(';');

  run('ffmpeg', [
    '-y', '-hide_banner', '-loglevel', 'error',
    '-i', background,
    '-i', avatar,
    '-filter_complex', filter,
    '-map', '[v]',
    '-map', '1:a:0',
    '-c:v', 'libx264',
    '-preset', FFMPEG_PRESET,
    '-crf', '23',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '160k',
    '-shortest',
    '-movflags', '+faststart',
    output
  ]);

  console.log(`✅ Ready: ${path.relative(PROJECT, output)}`);
}

function main() {
  run('ffmpeg', ['-version']);
  const selected = BUILD_ALL ? PRODUCT_IDS : [TARGET_PRODUCT_ID];
  for (const productId of selected) compose(productId);
}

try {
  main();
} catch (error) {
  console.error(`❌ Compose failed: ${error.message}`);
  process.exit(1);
}
