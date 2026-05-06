#!/usr/bin/env node
/**
 * Fast one-video generator for Codespaces smoke tests.
 *
 * This avoids the slow full-quality FFmpeg effects used by the production
 * generator. It creates a simple vertical MP4 quickly so you can verify that
 * FFmpeg, product image discovery, and output paths are working.
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT = path.resolve(__dirname, '..');
const TOP_PRODUCTS_FILE = path.join(PROJECT, 'config', 'top-products.json');
const OUT_DIR = path.join(PROJECT, 'public', 'videos');
const PLAN_DIR = path.join(PROJECT, 'content', 'generated-videos');

const PRODUCT_ID = process.env.PRODUCT_ID || process.env.VIDEO_PRODUCT_ID || firstTopProductId();
const W = Number(process.env.TEST_VIDEO_WIDTH || 540);
const H = Number(process.env.TEST_VIDEO_HEIGHT || 960);
const FPS = Number(process.env.TEST_VIDEO_FPS || 24);
const DURATION = Number(process.env.TEST_VIDEO_SECONDS || 16);

function readJson(file, fallback = {}) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

function firstTopProductId() {
  const products = (readJson(TOP_PRODUCTS_FILE, { topProducts: [] }).topProducts || [])
    .slice()
    .sort((a, b) => (a.priority || 999) - (b.priority || 999));
  return products[0]?.id || 'NWS_014';
}

function productConfig(productId) {
  const products = readJson(TOP_PRODUCTS_FILE, { topProducts: [] }).topProducts || [];
  return products.find((p) => p.id === productId) || { id: productId, name: productId, funnelUrl: '/', checkoutUrl: '/' };
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: PROJECT,
    stdio: 'inherit',
    timeout: Number(process.env.FFMPEG_TIMEOUT_MS || 120000)
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed with exit ${result.status}`);
}

function capture(command, args) {
  const result = spawnSync(command, args, { cwd: PROJECT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 30000 });
  return result.status === 0 ? result.stdout.trim() : '';
}

function requireTool(command) {
  const result = spawnSync(command, ['-version'], { stdio: 'ignore' });
  if (result.status !== 0) throw new Error(`${command} is required. Install FFmpeg first.`);
}

function listRecursive(dir, regex, limit = 300) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  const stack = [dir];
  while (stack.length && out.length < limit) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (regex.test(full)) out.push(full);
    }
  }
  return out;
}

function probeImage(file) {
  if (!fs.existsSync(file) || fs.statSync(file).size < 1000) return false;
  const out = capture('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', file]);
  return /^\d+,\d+/.test(out);
}

function pickProductImage(product) {
  const words = [product.id, ...(String(product.name || '').toLowerCase().split(/\W+/).filter(Boolean))];
  const roots = [
    path.join(PROJECT, 'public', 'images', 'products', product.id),
    path.join(PROJECT, 'public', 'products', product.id),
    path.join(PROJECT, 'public', 'images'),
    path.join(PROJECT, 'public')
  ];

  const candidates = [];
  for (const root of roots) {
    for (const file of listRecursive(root, /\.(png|jpe?g|webp)$/i)) {
      const lower = file.toLowerCase();
      if (!words.some((word) => word && lower.includes(String(word).toLowerCase()))) continue;
      if (probeImage(file)) candidates.push(file);
    }
  }

  candidates.sort((a, b) => scoreImage(a, product) - scoreImage(b, product));
  return candidates[0] || null;
}

function scoreImage(file, product) {
  const name = path.basename(file).toLowerCase();
  let score = 100;
  if (name.includes(product.id.toLowerCase())) score -= 30;
  if (name.includes('main')) score -= 30;
  if (name.includes('front')) score -= 20;
  if (name.includes('bottle') || name.includes('jug') || name.includes('bag')) score -= 15;
  if (name.includes('label')) score += 20;
  return score;
}

function safeText(value) {
  return String(value || '')
    .replace(/[“”]/g, '"')
    .replace(/[’]/g, "'")
    .replace(/[—–]/g, '-')
    .replace(/[\r\t]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function textFile(value) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nws_fast_video_'));
  const file = path.join(dir, 'text.txt');
  fs.writeFileSync(file, safeText(value), 'utf8');
  return file;
}

function ff(file) {
  return file.replace(/\\/g, '/').replace(/:/g, '\\:').replace(/'/g, "\\'");
}

function buildVideo(product, image) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(PLAN_DIR, { recursive: true });

  const mp4 = path.join(OUT_DIR, `${product.id}.mp4`);
  const jpg = path.join(OUT_DIR, `${product.id}.jpg`);
  const headline = textFile(product.name || product.id);
  const subhead = textFile('Fast test video - Nature\'s Way Soil');
  const cta = textFile(`Shop direct: natureswaysoil.com${product.funnelUrl || ''}`);

  if (image) {
    const filter = [
      `[0:v]scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=0x244f31[base]`,
      `[base]drawtext=textfile='${ff(headline)}':fontcolor=white:fontsize=34:box=1:boxcolor=black@0.45:boxborderw=14:x=32:y=48[one]`,
      `[one]drawtext=textfile='${ff(subhead)}':fontcolor=white:fontsize=24:box=1:boxcolor=black@0.35:boxborderw=10:x=32:y=h-170[two]`,
      `[two]drawtext=textfile='${ff(cta)}':fontcolor=white:fontsize=24:box=1:boxcolor=black@0.45:boxborderw=10:x=32:y=h-95[vout]`
    ].join(';');
    run('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-loop', '1', '-t', String(DURATION), '-i', image, '-filter_complex', filter, '-map', '[vout]', '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '28', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-movflags', '+faststart', mp4]);
  } else {
    const filter = [
      `color=c=0x244f31:s=${W}x${H}:d=${DURATION}[base]`,
      `[base]drawtext=textfile='${ff(headline)}':fontcolor=white:fontsize=34:box=1:boxcolor=black@0.45:boxborderw=14:x=32:y=220[one]`,
      `[one]drawtext=textfile='${ff(subhead)}':fontcolor=white:fontsize=24:box=1:boxcolor=black@0.35:boxborderw=10:x=32:y=h-170[two]`,
      `[two]drawtext=textfile='${ff(cta)}':fontcolor=white:fontsize=24:box=1:boxcolor=black@0.45:boxborderw=10:x=32:y=h-95[vout]`
    ].join(';');
    run('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', `color=c=0x244f31:s=${W}x${H}:d=${DURATION}`, '-filter_complex', filter, '-map', '[vout]', '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '28', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-movflags', '+faststart', mp4]);
  }

  run('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-ss', '00:00:01', '-i', mp4, '-frames:v', '1', '-q:v', '3', jpg]);

  const probe = capture('ffprobe', ['-v', 'error', '-show_entries', 'stream=width,height,duration', '-of', 'json', mp4]);
  const metadata = probe ? JSON.parse(probe).streams?.[0] || {} : {};
  fs.writeFileSync(path.join(PLAN_DIR, `${product.id}-quality-seed-plan.json`), JSON.stringify({
    productId: product.id,
    productName: product.name,
    mode: 'fast-test-video',
    output: path.relative(PROJECT, mp4),
    poster: path.relative(PROJECT, jpg),
    sourceImage: image ? path.relative(PROJECT, image) : null,
    metadata,
    generatedAt: new Date().toISOString()
  }, null, 2));

  console.log(`[Fast Video] Ready: ${path.relative(PROJECT, mp4)}`);
}

try {
  requireTool('ffmpeg');
  requireTool('ffprobe');
  const product = productConfig(PRODUCT_ID);
  const image = pickProductImage(product);
  console.log(`[Fast Video] Generating ${product.id}: ${product.name || product.id}`);
  console.log(image ? `[Fast Video] Using image: ${path.relative(PROJECT, image)}` : '[Fast Video] No image found; using branded background.');
  buildVideo(product, image);
} catch (error) {
  console.error(`[Fast Video] Failed: ${error.message}`);
  process.exit(1);
}
