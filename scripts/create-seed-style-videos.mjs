#!/usr/bin/env node

/**
 * Seed-style video generator for Nature's Way Soil top products.
 *
 * Goal: generate clean vertical videos like the uploaded reference style:
 * calm b-roll/product imagery, short text overlays, simple CTA.
 *
 * Uses available assets first:
 * - public/images/products/{PRODUCT_ID}/ actual product images
 * - Pexels b-roll when PEXELS_API_KEY is available
 * - FFmpeg for assembly
 *
 * Usage:
 *   node scripts/create-seed-style-videos.mjs --all
 *   PRODUCT_ID=NWS_014 node scripts/create-seed-style-videos.mjs
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(PROJECT, 'public', 'videos');
const GENERATED_DIR = path.join(PROJECT, 'content', 'generated-videos');
const TOP_PRODUCTS_FILE = path.join(PROJECT, 'config', 'top-products.json');
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const BUILD_ALL = process.argv.includes('--all');
const TARGET_PRODUCT_ID = process.env.PRODUCT_ID || process.env.VIDEO_PRODUCT_ID || 'NWS_014';

function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }
function readJson(file, fallback = {}) { try { if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8')); } catch {} return fallback; }
function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: 'inherit', timeout: Number(process.env.FFMPEG_TIMEOUT_MS || 240000), ...options });
  if (result.error) throw result.error;
  if (result.signal) throw new Error(`${command} killed by signal ${result.signal}`);
  if (result.status !== 0) throw new Error(`${command} failed with exit ${result.status}`);
}
function runCapture(command, args) { const r = spawnSync(command, args, { encoding: 'utf8' }); return r.status === 0 ? r.stdout : ''; }
function sanitizeText(text) { return String(text || '').replace(/%/g, ' percent').replace(/[\r\t]/g, ' ').trim(); }

const PRODUCT_SEEDS = {
  NWS_014: {
    productName: 'Dog Urine Neutralizer & Lawn Repair',
    funnelUrl: '/lawn-repair',
    cta: 'Save 15 percent on your first order.\nnatureswaysoil.com/lawn-repair',
    scenes: [
      { text: 'Your dog is not the problem.', query: 'dog walking on green lawn', seconds: 3 },
      { text: 'Urine salts stress the soil.', query: 'yellow patch grass lawn', seconds: 4 },
      { text: 'Treat the soil — not just the color.', product: true, seconds: 4 },
      { text: 'Spray affected spots.', query: 'spraying lawn garden', seconds: 4 },
      { text: 'Water in and support recovery.', query: 'watering grass lawn', seconds: 4 },
      { text: 'Pet-safe. Not a dye.', product: true, seconds: 4 },
      { text: 'Save 15 percent on your first order.\nnatureswaysoil.com/lawn-repair', product: true, seconds: 3 }
    ]
  },
  NWS_011: {
    productName: 'Liquid Humic & Fulvic Acid with Kelp',
    funnelUrl: '/soil-boost',
    cta: 'Feed the soil first.\nnatureswaysoil.com/soil-boost',
    scenes: [
      { text: 'Plants need more than fertilizer.', query: 'healthy garden soil roots', seconds: 3 },
      { text: 'Humic and fulvic support uptake.', query: 'rich soil close up', seconds: 4 },
      { text: 'Kelp supports root vigor.', query: 'green garden plants sunlight', seconds: 4 },
      { text: 'Use on lawns, trees, gardens, and containers.', product: true, seconds: 4 },
      { text: 'Build naturally stronger soil.', query: 'watering garden plants', seconds: 4 },
      { text: 'Shop direct and save.', product: true, seconds: 4 }
    ]
  },
  NWS_013: {
    productName: 'Enhanced Living Compost with Worm Castings & Biochar',
    funnelUrl: '/living-compost',
    cta: 'Upgrade your soil naturally.\nnatureswaysoil.com/living-compost',
    scenes: [
      { text: 'This is not bulk filler compost.', query: 'rich compost soil close up', seconds: 3 },
      { text: 'Worm castings feed soil biology.', query: 'worm castings compost soil', seconds: 4 },
      { text: 'Biochar helps hold water and nutrients.', query: 'biochar soil garden', seconds: 4 },
      { text: 'Use in beds, containers, and transplant zones.', product: true, seconds: 4 },
      { text: 'Small bag. Big soil impact.', query: 'raised bed vegetable garden', seconds: 4 },
      { text: 'Shop direct and save.', product: true, seconds: 4 }
    ]
  },
  NWS_021: {
    productName: 'Hay, Pasture & Lawn Fertilizer',
    funnelUrl: '/pasture-boost',
    cta: 'Support thicker grass growth.\nnatureswaysoil.com/pasture-boost',
    scenes: [
      { text: 'Thin pasture starts with tired soil.', query: 'green pasture grass field', seconds: 3 },
      { text: 'Feed grass during active growth.', query: 'hay field pasture grass', seconds: 4 },
      { text: 'Easy liquid pasture nutrition.', product: true, seconds: 4 },
      { text: 'For hay, pasture, and lawns.', query: 'lawn grass close up', seconds: 4 },
      { text: 'Built for landowners.', query: 'farm pasture landscape', seconds: 4 },
      { text: 'Shop direct and save.', product: true, seconds: 4 }
    ]
  },
  NWS_018: {
    productName: 'Seaweed & Humic Acid Lawn Treatment',
    funnelUrl: '/soil-boost',
    cta: 'Support the root zone.\nnatureswaysoil.com/soil-boost',
    scenes: [
      { text: 'Your lawn needs more than nitrogen.', query: 'lush green lawn close up', seconds: 3 },
      { text: 'Seaweed supports plant vigor.', query: 'seaweed kelp ocean natural', seconds: 4 },
      { text: 'Humic acid supports nutrient movement.', query: 'healthy soil roots grass', seconds: 4 },
      { text: 'Feed the root zone.', product: true, seconds: 4 },
      { text: 'Use during active growth.', query: 'watering lawn grass', seconds: 4 },
      { text: 'Shop direct and save.', product: true, seconds: 4 }
    ]
  }
};

function loadProducts() {
  const configured = readJson(TOP_PRODUCTS_FILE, { topProducts: [] }).topProducts || [];
  return Object.entries(PRODUCT_SEEDS).map(([id, seed]) => {
    const match = configured.find((p) => p.id === id) || {};
    return { id, ...seed, ...match, productName: match.name || seed.productName, scenes: seed.scenes, cta: seed.cta };
  });
}

function listProductImages(productId) {
  const dirs = [path.join(PROJECT, 'public', 'images', 'products', productId), path.join(PROJECT, 'public', 'products', productId), path.join(PROJECT, 'public', 'images')];
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
      if (lower.includes('original')) return 3;
      return 5;
    };
    return score(a) - score(b) || a.localeCompare(b);
  });
}

async function fetchPexelsVideo(query, outFile) {
  if (!PEXELS_API_KEY) return false;
  try {
    const url = new URL('https://api.pexels.com/videos/search');
    url.searchParams.set('query', query);
    url.searchParams.set('orientation', 'portrait');
    url.searchParams.set('per_page', '4');
    const response = await fetch(url, { headers: { Authorization: PEXELS_API_KEY } });
    if (!response.ok) return false;
    const data = await response.json();
    for (const video of data.videos || []) {
      const files = (video.video_files || []).filter((f) => f.link && f.width && f.height).sort((a, b) => Math.abs((b.height || 0) - 1920) - Math.abs((a.height || 0) - 1920));
      const preferred = files.find((f) => f.height >= f.width) || files[0];
      if (!preferred) continue;
      const curl = spawnSync('curl', ['-L', '--fail', '--max-time', '45', preferred.link, '-o', outFile], { stdio: 'ignore', timeout: 60000 });
      if (curl.status === 0 && fs.existsSync(outFile) && fs.statSync(outFile).size > 10000) return true;
    }
  } catch {}
  return false;
}

function writeTextFile(text) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'nws_seed_text_'));
  const file = path.join(tmp, 'text.txt');
  fs.writeFileSync(file, sanitizeText(text), 'utf8');
  return file;
}

function imageScene(imageFile, text, outFile, seconds, productMode = false) {
  const textFile = writeTextFile(text);
  const filter = productMode
    ? [
        '[0:v]scale=1080:1920,setsar=1,format=yuv420p[bg]',
        '[1:v]scale=760:-2:force_original_aspect_ratio=decrease,format=rgba[prod]',
        '[bg][prod]overlay=x=(W-w)/2:y=330[withprod]',
        `[withprod]drawtext=textfile=${textFile}:fontcolor=white:fontsize=58:box=1:boxcolor=black@0.46:boxborderw=24:x=(w-text_w)/2:y=1320:line_spacing=14[vout]`
      ].join(';')
    : [
        `[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,zoompan=z='min(zoom+0.0012,1.10)':d=${seconds * 30}:s=1080x1920:fps=30,format=yuv420p[bg]`,
        `[bg]drawtext=textfile=${textFile}:fontcolor=white:fontsize=62:box=1:boxcolor=black@0.40:boxborderw=22:x=(w-text_w)/2:y=1450:line_spacing=14[vout]`
      ].join(';');

  const args = productMode
    ? ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', `color=c=0x244f31:s=1080x1920:d=${seconds}`, '-loop', '1', '-t', String(seconds), '-i', imageFile, '-filter_complex', filter, '-map', '[vout]', '-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p', '-r', '30', outFile]
    : ['-y', '-hide_banner', '-loglevel', 'error', '-loop', '1', '-t', String(seconds), '-i', imageFile, '-filter_complex', filter, '-map', '[vout]', '-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p', '-r', '30', outFile];
  run('ffmpeg', args);
}

function brollScene(inputFile, text, outFile, seconds) {
  const textFile = writeTextFile(text);
  const filter = `scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,trim=duration=${seconds},setpts=PTS-STARTPTS,drawtext=textfile=${textFile}:fontcolor=white:fontsize=62:box=1:boxcolor=black@0.40:boxborderw=22:x=(w-text_w)/2:y=1450:line_spacing=14`;
  run('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-i', inputFile, '-t', String(seconds), '-vf', filter, '-an', '-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p', '-r', '30', outFile]);
}

async function buildVideo(product) {
  const productImages = listProductImages(product.id);
  if (!productImages.length) throw new Error(`No product images found for ${product.id}`);

  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), `nws_seed_${product.id}_`));
  const sceneFiles = [];
  console.log(`\n🎬 ${product.id}: ${product.productName}`);
  console.log(`Images: ${productImages.length}`);

  for (let i = 0; i < product.scenes.length; i++) {
    const scene = product.scenes[i];
    const raw = path.join(workDir, `raw_${i}.mp4`);
    const out = path.join(workDir, `scene_${i}.mp4`);
    const image = productImages[i % productImages.length];
    console.log(`Scene ${i + 1}/${product.scenes.length}: ${scene.text.replace(/\n/g, ' ')}`);

    if (scene.product) {
      imageScene(productImages[0], scene.text, out, scene.seconds, true);
    } else {
      const got = await fetchPexelsVideo(scene.query, raw);
      got ? brollScene(raw, scene.text, out, scene.seconds) : imageScene(image, scene.text, out, scene.seconds, false);
    }
    sceneFiles.push(out);
  }

  const listFile = path.join(workDir, 'concat.txt');
  fs.writeFileSync(listFile, sceneFiles.map((file) => `file '${file.replace(/'/g, "'\\''")}'`).join('\n'));
  const mp4 = path.join(OUT_DIR, `${product.id}.mp4`);
  const jpg = path.join(OUT_DIR, `${product.id}.jpg`);
  run('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', listFile, '-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p', '-r', '30', '-movflags', '+faststart', mp4]);
  run('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-i', mp4, '-frames:v', '1', '-q:v', '3', jpg]);

  const probe = runCapture('ffprobe', ['-v', 'error', '-show_entries', 'stream=width,height,duration', '-of', 'json', mp4]);
  const metadata = probe ? JSON.parse(probe).streams?.[0] || {} : {};
  const plan = { productId: product.id, productName: product.productName, funnelUrl: product.funnelUrl, cta: product.cta, scenes: product.scenes, productImages, output: path.relative(PROJECT, mp4), poster: path.relative(PROJECT, jpg), metadata, generatedAt: new Date().toISOString() };
  fs.writeFileSync(path.join(GENERATED_DIR, `${product.id}-seed-style-plan.json`), JSON.stringify(plan, null, 2));
  console.log(`✅ Ready: ${path.relative(PROJECT, mp4)}`);
}

async function main() {
  ensureDir(OUT_DIR);
  ensureDir(GENERATED_DIR);
  const products = loadProducts();
  const selected = BUILD_ALL ? products : products.filter((p) => p.id === TARGET_PRODUCT_ID);
  if (!selected.length) throw new Error(`No matching product for ${TARGET_PRODUCT_ID}`);
  for (const product of selected) await buildVideo(product);
}

main().catch((error) => {
  console.error(`❌ Seed-style video generation failed: ${error.message}`);
  process.exit(1);
});
