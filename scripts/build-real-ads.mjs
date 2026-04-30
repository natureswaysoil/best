#!/usr/bin/env node
/**
 * Real scene-based ad builder for Nature's Way Soil.
 *
 * This avoids avatar-first videos and creates a storyboard:
 * hook -> problem visual -> product -> result/proof -> CTA.
 *
 * Secrets stay in Google Secret Manager. This script only reads env vars:
 * - GOOGLE_SHEET_CSV_URL
 * - PEXELS_API_KEY optional, for fallback stock visuals
 *
 * Usage:
 *   VIDEO_PRODUCT_ID=NWS_001 node scripts/build-real-ads.mjs
 *   VIDEO_PRODUCT_ID=NWS_001 AD_FORMAT=tiktok node scripts/build-real-ads.mjs
 *   VIDEO_PRODUCT_ID=NWS_001 AD_FORMAT=amazon node scripts/build-real-ads.mjs
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { spawnSync, execSync } from 'child_process';
import { loadProductsFromGoogleSheetCsv } from './google-sheet-products-loader.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(PROJECT, 'public', 'videos');
const SHEET_CACHE = path.join(PROJECT, 'content', 'video-scripts', 'sheet-products.json');

const PRODUCT_ID = process.env.VIDEO_PRODUCT_ID || null;
const AD_FORMAT = (process.env.AD_FORMAT || 'tiktok').toLowerCase();
const FORCE = process.argv.includes('--force') || process.env.AD_FORCE === '1';

function run(cmd, args, options = {}) {
  const res = spawnSync(cmd, args, { stdio: 'inherit', ...options });
  if (res.status !== 0) throw new Error(`${cmd} failed with exit ${res.status}`);
}

function hasFfmpeg() {
  try { execSync('ffmpeg -version', { stdio: 'ignore' }); return true; } catch { return false; }
}

function normalizeText(value) {
  return String(value || '')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u2026]/g, '...')
    .replace(/\s+/g, ' ')
    .trim();
}

function shortText(value, max = 54) {
  const text = normalizeText(value);
  if (text.length <= max) return text;
  return `${text.slice(0, max - 3).trimEnd()}...`;
}

function safeTextFile(tmpDir, name, text) {
  const file = path.join(tmpDir, `${name}.txt`);
  fs.writeFileSync(file, normalizeText(text), 'utf8');
  return file.replace(/\\/g, '/').replace(/:/g, '\\:');
}

function localPublicPath(asset) {
  if (!asset || /^https?:\/\//i.test(asset)) return null;
  const rel = asset.startsWith('/') ? asset.slice(1) : asset;
  const full = path.join(PROJECT, 'public', rel);
  return fs.existsSync(full) ? full : null;
}

async function download(url, outPath) {
  if (!url) return false;
  const res = await fetch(url);
  if (!res.ok) return false;
  const buf = Buffer.from(await res.arrayBuffer());
  if (!buf.length) return false;
  fs.writeFileSync(outPath, buf);
  return true;
}

async function resolveAsset(asset, tmpDir, fallbackName) {
  const local = localPublicPath(asset);
  if (local) return local;
  if (/^https?:\/\//i.test(String(asset || ''))) {
    const out = path.join(tmpDir, `${fallbackName}.jpg`);
    if (await download(asset, out)) return out;
  }
  return null;
}

async function getPexelsImage(query, tmpDir, name) {
  if (!process.env.PEXELS_API_KEY) return null;
  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&orientation=portrait&per_page=1`;
    const res = await fetch(url, { headers: { Authorization: process.env.PEXELS_API_KEY } });
    if (!res.ok) return null;
    const data = await res.json();
    const imageUrl = data.photos?.[0]?.src?.large2x || data.photos?.[0]?.src?.large;
    if (!imageUrl) return null;
    const out = path.join(tmpDir, `${name}.jpg`);
    if (await download(imageUrl, out)) return out;
  } catch {}
  return null;
}

function productTheme(product) {
  const text = `${product.name || ''} ${product.category || ''} ${product.description || ''}`.toLowerCase();
  if (text.includes('dog') || text.includes('urine') || text.includes('pet')) {
    return {
      problemQuery: 'yellow spots in grass dog lawn',
      resultQuery: 'healthy green backyard lawn dog',
      hook: 'Dog spots start in the soil.',
      problem: 'Yellow patches are usually a soil stress problem - not just a color problem.',
      benefit: 'Support soil recovery and healthier regrowth.',
    };
  }
  if (text.includes('compost') || text.includes('biochar') || text.includes('soil')) {
    return {
      problemQuery: 'dry compacted garden soil',
      resultQuery: 'healthy vegetable garden rich soil',
      hook: 'Weak plants usually start with tired soil.',
      problem: 'If roots struggle, plants struggle.',
      benefit: 'Build better soil structure and moisture holding power.',
    };
  }
  return {
    problemQuery: 'weak garden plants dry soil',
    resultQuery: 'healthy green garden plants',
    hook: 'Your plants may not need more fertilizer. They may need better soil.',
    problem: 'Tired soil limits roots, uptake, and growth.',
    benefit: 'Feed the soil for stronger plants.',
  };
}

function bestImages(product) {
  const images = [];
  if (product.image) images.push(product.image);
  if (Array.isArray(product.brollImages)) images.push(...product.brollImages);
  const raw = product.rawSheetRow || {};
  for (const key of Object.keys(raw)) {
    if (/image|broll|visual|photo|scene|background/i.test(key) && /^https?:\/\//i.test(String(raw[key] || ''))) images.push(raw[key]);
  }
  return Array.from(new Set(images.filter(Boolean)));
}

async function loadProducts() {
  if (!process.env.GOOGLE_SHEET_CSV_URL) throw new Error('GOOGLE_SHEET_CSV_URL is not set');
  const products = await loadProductsFromGoogleSheetCsv(process.env.GOOGLE_SHEET_CSV_URL, SHEET_CACHE);
  if (!products.length) throw new Error('No products loaded from Google Sheet');
  return products;
}

function makeSceneFromImage({ image, duration, size, textFile, out, topText = false }) {
  const [w, h] = size;
  const vf = [
    `scale=${w}:${h}:force_original_aspect_ratio=increase`,
    `crop=${w}:${h}`,
    "zoompan=z='min(zoom+0.0015,1.10)':d=90:s=" + w + 'x' + h + ':fps=30',
    'format=yuv420p',
    topText
      ? `drawbox=x=0:y=0:w=iw:h=310:color=black@0.58:t=fill,drawtext=textfile='${textFile}':fontcolor=white:fontsize=64:box=1:boxcolor=black@0.15:boxborderw=16:x=(w-text_w)/2:y=85`
      : `drawbox=x=0:y=h-260:w=iw:h=260:color=black@0.52:t=fill,drawtext=textfile='${textFile}':fontcolor=white:fontsize=48:box=1:boxcolor=black@0.15:boxborderw=14:x=(w-text_w)/2:y=h-190`,
  ].join(',');
  run('ffmpeg', ['-y', '-loop', '1', '-i', image, '-t', String(duration), '-vf', vf, '-r', '30', '-an', out]);
}

function makeTextScene({ duration, size, bg, textFile, out, fontSize = 72 }) {
  const [w, h] = size;
  const vf = `drawtext=textfile='${textFile}':fontcolor=white:fontsize=${fontSize}:box=1:boxcolor=black@0.25:boxborderw=20:x=(w-text_w)/2:y=(h-text_h)/2,format=yuv420p`;
  run('ffmpeg', ['-y', '-f', 'lavfi', '-i', `color=c=${bg}:s=${w}x${h}:d=${duration}`, '-vf', vf, '-r', '30', '-an', out]);
}

function concatScenes(sceneFiles, outPath) {
  const listPath = path.join(path.dirname(sceneFiles[0]), 'concat.txt');
  fs.writeFileSync(listPath, sceneFiles.map((file) => `file '${file.replace(/'/g, "'\\''")}'`).join('\n'));
  run('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', listPath, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', outPath]);
}

async function buildAd(product) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), `${product.id}_real_ad_`));
  const theme = productTheme(product);
  const format = AD_FORMAT === 'amazon' ? 'amazon' : 'tiktok';
  const size = format === 'amazon' ? [1280, 720] : [1080, 1920];
  const outPath = path.join(OUT_DIR, `${product.id}_REAL_${format}.mp4`);

  if (fs.existsSync(outPath) && !FORCE) {
    console.log(`⏭️  Exists: ${outPath}`);
    return outPath;
  }

  const images = bestImages(product);
  const productImage = await resolveAsset(images[0], tmpDir, 'product')
    || await getPexelsImage(theme.resultQuery, tmpDir, 'product_fallback');
  const problemImage = await resolveAsset(images[1], tmpDir, 'problem')
    || await getPexelsImage(theme.problemQuery, tmpDir, 'problem_stock')
    || productImage;
  const resultImage = await resolveAsset(images[2], tmpDir, 'result')
    || await getPexelsImage(theme.resultQuery, tmpDir, 'result_stock')
    || productImage;

  if (!productImage) throw new Error(`No usable images found for ${product.id}`);

  const hook = product.hook || theme.hook;
  const sceneFiles = [];
  const hookFile = safeTextFile(tmpDir, 'hook', shortText(hook, 62));
  const problemFile = safeTextFile(tmpDir, 'problem', shortText(theme.problem, 72));
  const productFile = safeTextFile(tmpDir, 'product', shortText(product.name, 68));
  const resultFile = safeTextFile(tmpDir, 'result', shortText(theme.benefit, 72));
  const ctaFile = safeTextFile(tmpDir, 'cta', 'NaturesWaySoil.com');

  const scene1 = path.join(tmpDir, 'scene1.mp4');
  const scene2 = path.join(tmpDir, 'scene2.mp4');
  const scene3 = path.join(tmpDir, 'scene3.mp4');
  const scene4 = path.join(tmpDir, 'scene4.mp4');
  const scene5 = path.join(tmpDir, 'scene5.mp4');

  makeTextScene({ duration: 2.2, size, bg: '0x0d3b2a', textFile: hookFile, out: scene1, fontSize: format === 'amazon' ? 48 : 72 });
  makeSceneFromImage({ image: problemImage, duration: 4, size, textFile: problemFile, out: scene2, topText: true });
  makeSceneFromImage({ image: productImage, duration: 5, size, textFile: productFile, out: scene3 });
  makeSceneFromImage({ image: resultImage, duration: 5, size, textFile: resultFile, out: scene4 });
  makeTextScene({ duration: 3, size, bg: '0x111111', textFile: ctaFile, out: scene5, fontSize: format === 'amazon' ? 44 : 66 });
  sceneFiles.push(scene1, scene2, scene3, scene4, scene5);
  concatScenes(sceneFiles, outPath);

  console.log(`✅ Built real ad: ${path.relative(PROJECT, outPath)}`);
  return outPath;
}

async function main() {
  if (!hasFfmpeg()) throw new Error('FFmpeg is required: sudo apt-get update && sudo apt-get install -y ffmpeg');
  const products = await loadProducts();
  const product = PRODUCT_ID ? products.find((p) => p.id === PRODUCT_ID) : products[0];
  if (!product) throw new Error(`Product not found: ${PRODUCT_ID}`);
  console.log(`🎬 Building real ${AD_FORMAT} ad for ${product.id}: ${product.name}`);
  await buildAd(product);
}

main().catch((error) => {
  console.error(`❌ ${error.message}`);
  process.exit(1);
});
