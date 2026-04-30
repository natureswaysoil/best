#!/usr/bin/env node
/**
 * Create visually distinct A/B/C edits from already-rendered variant videos.
 * Uses FFmpeg textfile overlays to avoid quote/unicode parsing issues.
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
  return String(text || '').replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/[\u2026]/g, '...').replace(/\s+/g, ' ').trim();
}

function shortText(text, maxLen = 58) {
  const normalized = normalizeText(text);
  if (normalized.length <= maxLen) return normalized;
  return `${normalized.slice(0, maxLen - 3).trimEnd()}...`;
}

function safePath(filePath) {
  return filePath.replace(/\\/g, '/').replace(/:/g, '\\:');
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

function writeText(tmpDir, name, value) {
  const file = path.join(tmpDir, `${name}.txt`);
  fs.writeFileSync(file, normalizeText(value), 'utf8');
  return safePath(file);
}

function drawText(input, output, textFile, opts) {
  const parts = [
    `${input}drawtext=textfile='${textFile}'`,
    `fontcolor=${opts.fontcolor || 'white'}`,
    `fontsize=${opts.fontsize || 34}`,
    opts.box ? `box=1:boxcolor=${opts.boxcolor || 'black@0.45'}:boxborderw=${opts.boxborderw || 12}` : '',
    `x=${opts.x}`,
    `y=${opts.y}`,
    opts.enable ? `enable='${opts.enable}'` : '',
    output,
  ].filter(Boolean);
  return parts.join(':');
}

function buildOverlayFilter(variant, tmpDir) {
  const brandFile = writeText(tmpDir, 'brand', "Nature's Way Soil");
  const hookFile = writeText(tmpDir, 'hook', shortText(variant.firstTwoSeconds || variant.hook, 64));
  const stopFile = writeText(tmpDir, 'stop', 'STOP SCROLLING');
  const demoFile = writeText(tmpDir, 'demo', 'DEMO');
  const stepsFile = writeText(tmpDir, 'steps', '1. Find the problem | 2. Feed the soil | 3. Repeat as directed');
  const nameFile = writeText(tmpDir, 'name', shortText(variant.productName || variant.productId, 46));
  const benefitsFile = writeText(tmpDir, 'benefits', 'Supports soil health | Easy to apply as directed | Lawn & garden care');
  const ctaFile = writeText(tmpDir, 'cta', shortText(variant.cta || 'NaturesWaySoil.com', 50));

  if (variant.variant === 'A') {
    return [
      '[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,eq=contrast=1.07:saturation=1.15[v0]',
      '[v0]drawbox=x=0:y=0:w=iw:h=360:color=black@0.62:t=fill[v1]',
      drawText('[v1]', '[v2]', hookFile, { fontcolor: 'white', fontsize: 58, box: true, boxcolor: 'black@0.25', boxborderw: 18, x: '(w-text_w)/2', y: '90', enable: 'between(t,0,4)' }),
      drawText('[v2]', '[v3]', stopFile, { fontcolor: 'white', fontsize: 38, box: true, boxcolor: 'black@0.55', boxborderw: 14, x: '48', y: '40', enable: 'between(t,0,2.4)' }),
      drawText('[v3]', '[vout]', brandFile, { fontcolor: 'white', fontsize: 34, box: true, boxcolor: 'black@0.45', boxborderw: 12, x: '42', y: 'h-th-58' })
    ].join(';');
  }

  if (variant.variant === 'B') {
    return [
      '[0:v]scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,eq=contrast=1.04:saturation=1.08[v0]',
      '[v0]drawbox=x=0:y=0:w=430:h=720:color=black@0.45:t=fill[v1]',
      drawText('[v1]', '[v2]', demoFile, { fontcolor: 'white', fontsize: 52, box: true, boxcolor: 'black@0.45', boxborderw: 16, x: '42', y: '56' }),
      drawText('[v2]', '[v3]', hookFile, { fontcolor: 'white', fontsize: 34, box: true, boxcolor: 'black@0.28', boxborderw: 14, x: '42', y: '148', enable: 'between(t,0,7)' }),
      drawText('[v3]', '[v4]', stepsFile, { fontcolor: 'white', fontsize: 28, box: false, x: '42', y: '310', enable: 'between(t,5,22)' }),
      drawText('[v4]', '[vout]', brandFile, { fontcolor: 'white', fontsize: 28, box: true, boxcolor: 'black@0.45', boxborderw: 10, x: 'w-tw-36', y: 'h-th-34' })
    ].join(';');
  }

  return [
    '[0:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:color=0xF5F1E8[v0]',
    '[v0]drawbox=x=760:y=0:w=520:h=720:color=white@0.86:t=fill[v1]',
    drawText('[v1]', '[v2]', nameFile, { fontcolor: '0x143d2a', fontsize: 38, box: false, x: '800', y: '80' }),
    drawText('[v2]', '[v3]', benefitsFile, { fontcolor: '0x1f1f1f', fontsize: 26, box: false, x: '800', y: '230' }),
    drawText('[v3]', '[v4]', ctaFile, { fontcolor: 'white', fontsize: 30, box: true, boxcolor: '0x0d3b2a@0.95', boxborderw: 18, x: '800', y: '560' }),
    drawText('[v4]', '[vout]', brandFile, { fontcolor: '0x0d3b2a', fontsize: 28, box: false, x: '40', y: 'h-th-32' })
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

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), `${variant.productId}_${variant.variant}_edit_`));
  const filter = buildOverlayFilter(variant, tmpDir);
  const graphFile = path.join(tmpDir, 'filtergraph.ffscript');
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
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}

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
