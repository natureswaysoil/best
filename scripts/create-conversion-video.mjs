#!/usr/bin/env node

/**
 * Conversion Video Builder
 *
 * Builds a clean b-roll + product-image + text-overlay vertical video in the
 * calm reference style James liked.
 *
 * Usage:
 *   PRODUCT_ID=NWS_014 node scripts/create-conversion-video.mjs
 *
 * Required for best output:
 *   - PEXELS_API_KEY for b-roll
 *   - OPENAI_API_KEY optional for future script expansion
 *   - local product image in public/images/products/{PRODUCT_ID}/
 *
 * Output:
 *   public/videos/{PRODUCT_ID}.mp4
 *   public/videos/{PRODUCT_ID}.jpg
 *   content/generated-videos/{PRODUCT_ID}-conversion-plan.json
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT = path.resolve(__dirname, '..');

const PRODUCT_ID = process.env.PRODUCT_ID || process.env.VIDEO_PRODUCT_ID || 'NWS_014';
const OUT_DIR = path.join(PROJECT, 'public', 'videos');
const GENERATED_DIR = path.join(PROJECT, 'content', 'generated-videos');
const TOP_PRODUCTS_FILE = path.join(PROJECT, 'config', 'top-products.json');
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(file, fallback = {}) {
  try {
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    console.warn(`Could not read ${file}: ${error.message}`);
  }
  return fallback;
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: 'inherit', ...options });
  if (result.status !== 0) throw new Error(`${command} failed with exit ${result.status}`);
}

function runCapture(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: 'utf8', ...options });
  if (result.status !== 0) return '';
  return result.stdout || '';
}

function productFromConfig(productId) {
  const topProducts = readJson(TOP_PRODUCTS_FILE, { topProducts: [] }).topProducts || [];
  return topProducts.find((p) => p.id === productId) || {
    id: productId,
    name: productId,
    funnelUrl: `/product/${productId}`,
    checkoutUrl: `/checkout?productId=${productId}&coupon=SAVE15`,
  };
}

function listProductImages(productId) {
  const dirs = [
    path.join(PROJECT, 'public', 'images', 'products', productId),
    path.join(PROJECT, 'public', 'products', productId),
    path.join(PROJECT, 'public', 'images'),
  ];

  const files = [];

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    for (const name of fs.readdirSync(dir)) {
      if (!/\.(png|jpe?g|webp)$/i.test(name)) continue;
      if (dir.endsWith('images') && !name.includes(productId)) continue;
      files.push(path.join(dir, name));
    }
  }

  return files.sort((a, b) => {
    const score = (file) => {
      const lower = path.basename(file).toLowerCase();
      if (lower.includes('main')) return 0;
      if (lower.includes('front')) return 1;
      if (lower.includes('bottle')) return 2;
      return 5;
    };
    return score(a) - score(b) || a.localeCompare(b);
  });
}

function buildPlan(product) {
  if (product.id === 'NWS_014') {
    return {
      productId: product.id,
      productName: product.name,
      funnelUrl: product.funnelUrl,
      checkoutUrl: product.checkoutUrl,
      voiceover: "Your dog is not the problem. Yellow lawn spots happen when urine salts build up and stress the soil. Nature's Way Soil Dog Urine Neutralizer helps treat affected areas at the soil level. Just spray, water in, and support real lawn recovery. Pet-safe. Not a dye. Shop direct and save 15% on your first order.",
      scenes: [
        { duration: 3, text: 'Your dog is not the problem.', query: 'dog walking on green lawn' },
        { duration: 4, text: 'Urine salts stress the soil.', query: 'yellow patch grass lawn' },
        { duration: 4, text: 'Treat the soil — not just the color.', type: 'product' },
        { duration: 4, text: 'Spray affected spots.', query: 'spraying lawn garden' },
        { duration: 4, text: 'Water in and let soil recover.', query: 'watering grass lawn' },
        { duration: 4, text: 'Pet-safe. Not a dye.', query: 'dog on backyard lawn' },
        { duration: 3, text: 'Save 15% on your first order.\nnatureswaysoil.com/lawn-repair', type: 'product' }
      ]
    };
  }

  return {
    productId: product.id,
    productName: product.name,
    funnelUrl: product.funnelUrl,
    checkoutUrl: product.checkoutUrl,
    voiceover: `${product.name} helps support stronger soil and healthier growth. Shop direct and save 15% on your first order.`,
    scenes: [
      { duration: 4, text: product.name, query: 'healthy garden plants' },
      { duration: 4, text: 'Support stronger soil.', query: 'rich garden soil close up' },
      { duration: 4, text: 'Easy to apply.', type: 'product' },
      { duration: 4, text: 'Grow naturally stronger.', query: 'healthy lawn garden' },
      { duration: 4, text: 'Save 15% on your first order.', type: 'product' }
    ]
  };
}

async function fetchPexelsVideo(query, outFile) {
  if (!PEXELS_API_KEY) return false;

  const url = new URL('https://api.pexels.com/videos/search');
  url.searchParams.set('query', query);
  url.searchParams.set('orientation', 'portrait');
  url.searchParams.set('per_page', '5');

  const response = await fetch(url, { headers: { Authorization: PEXELS_API_KEY } });
  if (!response.ok) {
    console.warn(`Pexels failed for ${query}: ${response.status}`);
    return false;
  }

  const data = await response.json();
  const videos = data.videos || [];

  for (const video of videos) {
    const files = (video.video_files || [])
      .filter((f) => f.link && f.width && f.height)
      .sort((a, b) => Math.abs((b.height || 0) - 1920) - Math.abs((a.height || 0) - 1920));
    const preferred = files.find((f) => f.height >= f.width) || files[0];
    if (!preferred) continue;

    const curl = spawnSync('curl', ['-L', '--fail', '--max-time', '45', preferred.link, '-o', outFile], { stdio: 'ignore' });
    if (curl.status === 0 && fs.existsSync(outFile) && fs.statSync(outFile).size > 10000) return true;
  }

  return false;
}

function createFallbackScene(text, outFile, duration, bg = '0x234f32') {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'nws_scene_'));
  const textFile = path.join(tmp, 'text.txt');
  fs.writeFileSync(textFile, text, 'utf8');

  const filter = `drawtext=textfile=${textFile}:fontcolor=white:fontsize=72:box=1:boxcolor=black@0.45:boxborderw=30:x=(w-text_w)/2:y=(h-text_h)/2:line_spacing=18`;
  run('ffmpeg', [
    '-y', '-f', 'lavfi', '-i', `color=c=${bg}:s=1080x1920:d=${duration}`,
    '-vf', filter,
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-r', '30', outFile
  ]);
}

function createProductScene(productImage, text, outFile, duration) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'nws_product_scene_'));
  const textFile = path.join(tmp, 'text.txt');
  fs.writeFileSync(textFile, text, 'utf8');

  const filter = [
    '[0:v]scale=1080:1920,setsar=1,format=yuv420p[bg]',
    '[1:v]scale=760:-2,format=rgba[prod]',
    '[bg][prod]overlay=x=(W-w)/2:y=420[withprod]',
    `[withprod]drawtext=textfile=${textFile}:fontcolor=white:fontsize=62:box=1:boxcolor=black@0.48:boxborderw=26:x=(w-text_w)/2:y=1320:line_spacing=16[vout]`
  ].join(';');

  run('ffmpeg', [
    '-y',
    '-f', 'lavfi', '-i', `color=c=0x234f32:s=1080x1920:d=${duration}`,
    '-loop', '1', '-t', String(duration), '-i', productImage,
    '-filter_complex', filter,
    '-map', '[vout]',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-r', '30', outFile
  ]);
}

function normalizeBrollScene(inputFile, text, outFile, duration) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'nws_broll_scene_'));
  const textFile = path.join(tmp, 'text.txt');
  fs.writeFileSync(textFile, text, 'utf8');

  const filter = [
    `scale=1080:1920:force_original_aspect_ratio=increase`,
    `crop=1080:1920`,
    `trim=duration=${duration}`,
    `setpts=PTS-STARTPTS`,
    `drawtext=textfile=${textFile}:fontcolor=white:fontsize=66:box=1:boxcolor=black@0.42:boxborderw=24:x=(w-text_w)/2:y=1450:line_spacing=16`
  ].join(',');

  run('ffmpeg', [
    '-y', '-i', inputFile,
    '-t', String(duration),
    '-vf', filter,
    '-an', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-r', '30', outFile
  ]);
}

async function buildScenes(plan, productImages, workDir) {
  const sceneFiles = [];
  const productImage = productImages[0] || null;

  for (let i = 0; i < plan.scenes.length; i++) {
    const scene = plan.scenes[i];
    const rawFile = path.join(workDir, `raw_${i}.mp4`);
    const sceneFile = path.join(workDir, `scene_${i}.mp4`);

    if (scene.type === 'product') {
      if (productImage) createProductScene(productImage, scene.text, sceneFile, scene.duration);
      else createFallbackScene(scene.text, sceneFile, scene.duration);
    } else {
      const gotPexels = await fetchPexelsVideo(scene.query, rawFile);
      if (gotPexels) normalizeBrollScene(rawFile, scene.text, sceneFile, scene.duration);
      else createFallbackScene(scene.text, sceneFile, scene.duration);
    }

    sceneFiles.push(sceneFile);
  }

  return sceneFiles;
}

function concatenateScenes(sceneFiles, outFile) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'nws_concat_'));
  const listFile = path.join(tmp, 'list.txt');
  fs.writeFileSync(listFile, sceneFiles.map((file) => `file '${file.replace(/'/g, "'\\''")}'`).join('\n'));

  run('ffmpeg', [
    '-y', '-f', 'concat', '-safe', '0', '-i', listFile,
    '-c', 'copy', outFile
  ]);
}

function exportPoster(videoFile, posterFile) {
  run('ffmpeg', ['-y', '-i', videoFile, '-frames:v', '1', '-q:v', '3', posterFile]);
}

function qualityGate(videoFile, productImages) {
  if (!fs.existsSync(videoFile)) throw new Error('Video missing');
  const size = fs.statSync(videoFile).size;
  if (size < 250000) throw new Error(`Video too small: ${size}`);

  const probe = runCapture('ffprobe', ['-v', 'error', '-show_entries', 'stream=width,height,duration', '-of', 'json', videoFile]);
  if (!probe) throw new Error('ffprobe failed');
  const data = JSON.parse(probe);
  const stream = data.streams?.[0] || {};
  const width = Number(stream.width || 0);
  const height = Number(stream.height || 0);
  const duration = Number(stream.duration || 0);

  if (width !== 1080 || height !== 1920) throw new Error(`Wrong size: ${width}x${height}`);
  if (duration < 18 || duration > 30) throw new Error(`Wrong duration: ${duration}`);
  if (!productImages.length) console.warn('⚠️ No actual product image found. Video used fallback product scene. Add images to public/images/products/{PRODUCT_ID}/');

  return { width, height, duration, size, productImageCount: productImages.length };
}

async function main() {
  ensureDir(OUT_DIR);
  ensureDir(GENERATED_DIR);

  const product = productFromConfig(PRODUCT_ID);
  const productImages = listProductImages(PRODUCT_ID);
  const plan = buildPlan(product);
  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), `nws_conversion_${PRODUCT_ID}_`));
  const outFile = path.join(OUT_DIR, `${PRODUCT_ID}.mp4`);
  const posterFile = path.join(OUT_DIR, `${PRODUCT_ID}.jpg`);
  const planFile = path.join(GENERATED_DIR, `${PRODUCT_ID}-conversion-plan.json`);

  console.log(`🎬 Building conversion video for ${PRODUCT_ID}`);
  console.log(`Product images found: ${productImages.length}`);
  productImages.forEach((img) => console.log(` - ${path.relative(PROJECT, img)}`));

  const scenes = await buildScenes(plan, productImages, workDir);
  concatenateScenes(scenes, outFile);
  exportPoster(outFile, posterFile);
  const gate = qualityGate(outFile, productImages);

  fs.writeFileSync(planFile, JSON.stringify({ ...plan, productImages, qualityGate: gate, generatedAt: new Date().toISOString() }, null, 2));

  console.log('✅ Conversion video ready');
  console.log(`MP4: ${path.relative(PROJECT, outFile)}`);
  console.log(`Poster: ${path.relative(PROJECT, posterFile)}`);
  console.log(`Plan: ${path.relative(PROJECT, planFile)}`);
}

main().catch((error) => {
  console.error('❌ Conversion video failed:', error.message);
  process.exit(1);
});
