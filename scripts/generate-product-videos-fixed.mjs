#!/usr/bin/env node
/**
 * Runtime patch wrapper for scripts/generate-product-videos.mjs.
 *
 * Fixes the FFmpeg b-roll enhancement failure:
 *   Option loop not found.
 *
 * The original script builds image inputs as: -loop 1 -i image.jpg.
 * Some FFmpeg builds reject that in this command shape after the main MP4 input.
 * This wrapper creates a same-directory runtime copy that uses:
 *   -stream_loop -1 -framerate 30 -i image.jpg
 * and fixes vout label calculation to use usableImages.length.
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sourcePath = path.join(__dirname, 'generate-product-videos.mjs');
const runtimePath = path.join(__dirname, '.generate-product-videos.runtime.mjs');

let source = fs.readFileSync(sourcePath, 'utf8');

const originalImageInputs = "const imageInputs = usableImages.flatMap((img) => ['-loop', '1', '-i', img]);";
const fixedImageInputs = "const imageInputs = usableImages.flatMap((img) => ['-stream_loop', '-1', '-framerate', '30', '-i', img]);";

if (!source.includes(originalImageInputs) && !source.includes(fixedImageInputs)) {
  console.warn('⚠️  Expected FFmpeg image input line was not found; running original script unchanged.');
} else {
  source = source.replace(originalImageInputs, fixedImageInputs);
}

source = source
  .replaceAll("idx === images.length - 1 ? '[vout]' : `[v${idx + 1}]`", "idx === usableImages.length - 1 ? '[vout]' : `[v${idx + 1}]`")
  .replaceAll("idx === images.length - 1 ? segmentEnd", "idx === usableImages.length - 1 ? segmentEnd");

source = source.replace(
  "function enhanceHeyGenVideoWithBroll(videoPath, prod) {",
  "function enhanceHeyGenVideoWithBroll(videoPath, prod) {\n  console.log(`   🔧 FFmpeg b-roll patch active for ${prod.id}`);"
);

fs.writeFileSync(runtimePath, source, 'utf8');

const result = spawnSync(process.execPath, [runtimePath, ...process.argv.slice(2)], {
  cwd: path.resolve(__dirname, '..'),
  stdio: 'inherit',
  env: {
    ...process.env,
    NWS_FFMPEG_BROLL_PATCHED: '1',
  },
});

try {
  if (fs.existsSync(runtimePath)) fs.unlinkSync(runtimePath);
} catch {}

process.exit(result.status ?? 1);
