#!/usr/bin/env node
/**
 * Create visually distinct A/B/C edits from already-rendered variant videos.
 * This uses FFmpeg so you can improve creative variation without spending more HeyGen credits.
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { spawnSync, execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT = path.resolve(__dirname, '..');
const VARIANT_FILE = path.join(PROJECT, 'content', 'video-variants', 'variants.json');
const PERFORMANCE_FILE = path.join(PROJECT, 'content', 'performance', 'video-performance.json');
const OUT_DIR = path.join(PROJECT, 'public', 'videos');

function readArgValue(...names) {
  for (const name of names) {
    const eqArg = process.argv.find((arg) => arg.startsWith(`${name}=`));
    if (eqArg) return eqArg.slice(name.length + 1).trim();
    const idx = process.argv.indexOf(name);
    if (idx >= 0 && process.argv[idx + 1]) return String(process.argv[idx + 1]).trim();
  }
  return null;
}

const TARGET_PRODUCT_ID = readArgValue('--product', '--product-id') || process.env.VIDEO_PRODUCT_ID || null;
const TARGET_VARIANT = readArgValue('--variant') || process.env.VIDEO_VARIANT || null;
const FORCE = process.argv.includes('--force') || process.env.VIDEO_VARIANTS_FORCE === '1';

function hasFfmpeg() {
  try { execSync('ffmpeg -version', { stdio: 'ignore' }); return true; } catch { return false; }
}

function loadJson(file, fallback) {
  try { if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8')); } catch {}
  return fallback;
}

function saveJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function normalizeText(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function shortText(text, maxLen = 58) {
  const normalized = normalizeText(text);
  if (normalized.length <= maxLen) return normalized;
  return `${normalized.slice(0, maxLen - 1).trimEnd()}…`;
}

function ffmpegText(text) {
  return String(text || '')
    .replace(/\\/g, '\\\\')
    .replace(/:/g, '\\:')
    .replace(/'/g, "\\'")
    .replace(/\n/g, ' ');
}

function fileForVariant(variant) {
  return path.join(OUT_DIR, variant.outputName);
}

function editedFileForVariant(variant) {
  return path.join(OUT_DIR, variant.outputName.replace(/\.mp4$/i, '_edited.mp4'));
}

function updatePerformance(variant, patch) {
  const perf = loadJson(PERFORMANCE_FILE, { generatedAt: null, count: 0, records: [] });
  const key = `${variant.productId}:${variant.variant}`;
  const records = Array.isArray(perf.records) ? perf.records : [];
  let record = records.find((item) => `${item.productId}:${item.variant}` === key);
  if (!record) {
    record = { productId: variant.productId, variant: variant.variant, format: variant.format, outputName: variant.outputName, hook: variant.hook, createdAt: new Date().toISOString(), posted: {}, metrics: {} };
    records.push(record);
  }
  Object.assign(record, patch, { updatedAt: new Date().toISOString() });
  perf.records = records;
  perf.count = records.length;
  perf.generatedAt = new Date().toISOString();
  saveJson(PERFORMANCE_FILE, perf);
}

function buildOverlayFilter(variant) {
  const brand = "Nature's Way Soil";
  const hook = shortText(variant.firstTwoSeconds || variant.hook, 64);
  const name = shortText(variant.productName || variant.productId, 46);
  const cta = shortText(variant.cta || 'NaturesWaySoil.com', 50);

  if (variant.variant === 'A') {
    return [
      "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,eq=contrast=1.07:saturation=1.15[v0]",
      "[v0]drawbox=x=0:y=0:w=iw:h=360:color=black@0.62:t=fill[v1]",
      `[v1]drawtext=text='${ffmpegText(hook)}':fontcolor=white:fontsize=58:box=1:boxcolor=black@0.25:boxborderw=18:x=(w-text_w)/2:y=90:enable='between(t,0,4)'[v2]`,
      `[v2]drawtext=text='${ffmpegText('STOP SCROLLING')}':fontcolor=white:fontsize=38:box=1:boxcolor=black@0.55:boxborderw=14:x=48:y=40:enable='between(t,0,2.4)'[v3]`,
      `[v3]drawtext=text='${ffmpegText(brand)}':fontcolor=white:fontsize=34:box=1:boxcolor=black@0.45:boxborderw=12:x=42:y=h-th-58[vout]`
    ].join(';');
  }

  if (variant.variant === 'B') {
    return [
      "[0:v]scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,eq=contrast=1.04:saturation=1.08[v0]",
      "[v0]drawbox=x=0:y=0:w=430:h=720:color=black@0.45:t=fill[v1]",
      `[v1]drawtext=text='${ffmpegText('DEMO')}':fontcolor=white:fontsize=52:box=1:boxcolor=black@0.45:boxborderw=16:x=42:y=56[v2]`,
      `[v2]drawtext=text='${ffmpegText(shortText(variant.hook, 42))}':fontcolor=white:fontsize=34:box=1:boxcolor=black@0.28:boxborderw=14:x=42:y=148:enable='between(t,0,7)'[v3]`,
      `[v3]drawtext=text='${ffmpegText('1. Find the problem | 2. Feed the soil | 3. Repeat as directed')}':fontcolor=white:fontsize=28:x=42:y=310:enable='between(t,5,22)'[v4]`,
      `[v4]drawtext=text='${ffmpegText(brand)}':fontcolor=white:fontsize=28:box=1:boxcolor=black@0.45:boxborderw=10:x=w-tw-36:y=h-th-34[vout]`
    ].join(';');
  }

  return [
    "[0:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:color=0xF5F1E8[v0]",
    "[v0]drawbox=x=760:y=0:w=520:h=720:color=white@0.86:t=fill[v1]",
    `[v1]drawtext=text='${ffmpegText(name)}':fontcolor=0x143d2a:fontsize=38:x=800:y=80[v2]`,
    `[v2]drawtext=text='${ffmpegText('Supports soil health | Easy to apply as directed | Lawn & garden care')}':fontcolor=0x1f1f1f:fontsize=26:x=800:y=230[v3]`,
    `[v3]drawtext=text='${ffmpegText(cta)}':fontcolor=white:fontsize=30:box=1:boxcolor=0x0d3b2a@0.95:boxborderw=18:x=800:y=560[v4]`,
    `[v4]drawtext=text='${ffmpegText(brand)}':fontcolor=0x0d3b2a:fontsize=28:x=40:y=h-th-32[vout]`
  ].join(';');
}

function editVariant(variant) {
  const input = fileForVariant(variant);
  const output = editedFileForVariant(variant);

  if (!fs.existsSync(input)) {
    console.log(`⏭️  Missing rendered source, skipping ${variant.outputName}`);
    return false;
  }

  if (fs.existsSync(output) && !FORCE) {
    console.log(`⏭️  Edited file exists, skipping ${path.basename(output)}`);
    return true;
  }

  const filter = buildOverlayFilter(variant);
  const graphFile = path.join(os.tmpdir(), `${variant.productId}_${variant.variant}_edit.ffscript`);
  fs.writeFileSync(graphFile, filter);

  const args = [
    '-y', '-i', input,
    '-filter_complex_script', graphFile,
    '-map', '[vout]', '-map', '0:a?',
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '21', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', output,
  ];

  const result = spawnSync('ffmpeg', args, { stdio: 'inherit' });
  if (result.status !== 0) {
    console.error('--- FFmpeg filter graph that failed ---');
    console.error(filter);
    throw new Error(`FFmpeg edit failed for ${variant.outputName}`);
  }
  try { fs.unlinkSync(graphFile); } catch {}

  updatePerformance(variant, {
    status: 'edited',
    editedVideoPath: `public/videos/${path.basename(output)}`,
    editedAt: new Date().toISOString(),
  });

  console.log(`✅ ${path.basename(output)}`);
  return true;
}

function main() {
  if (!hasFfmpeg()) {
    console.error('❌ FFmpeg is required. Install with: sudo apt-get update && sudo apt-get install -y ffmpeg');
    process.exit(1);
  }
  if (!fs.existsSync(VARIANT_FILE)) {
    console.error('❌ Missing variants.json. Run node scripts/generate-video-variants.mjs first.');
    process.exit(1);
  }

  const data = loadJson(VARIANT_FILE, { variants: [] });
  let variants = Array.isArray(data.variants) ? data.variants : [];
  if (TARGET_PRODUCT_ID) variants = variants.filter((variant) => variant.productId === TARGET_PRODUCT_ID);
  if (TARGET_VARIANT) variants = variants.filter((variant) => String(variant.variant).toUpperCase() === String(TARGET_VARIANT).toUpperCase());

  if (!variants.length) {
    console.error('❌ No variants matched.');
    process.exit(1);
  }

  console.log(`🎬 Creating visual edits for ${variants.length} variant(s)`);
  for (const variant of variants) editVariant(variant);
  console.log('\n🎉 Visual variant edits complete');
}

main();
