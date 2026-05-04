#!/usr/bin/env node

/**
 * Quality seed-style vertical video generator.
 * Builds 1080x1920 MP4 ads for Nature's Way Soil products.
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
const PLAN_DIR = path.join(PROJECT, 'content', 'generated-videos');
const TOP_PRODUCTS_FILE = path.join(PROJECT, 'config', 'top-products.json');
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const BUILD_ALL = process.argv.includes('--all');
const TARGET_PRODUCT_ID = process.env.PRODUCT_ID || process.env.VIDEO_PRODUCT_ID || 'NWS_014';
const W = 1080;
const H = 1920;
const FPS = 30;

function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }
function readJson(file, fallback = {}) { try { return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : fallback; } catch { return fallback; } }
function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit', timeout: Number(process.env.FFMPEG_TIMEOUT_MS || 300000) });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} failed with exit ${result.status}`);
}
function capture(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8' });
  return result.status === 0 ? result.stdout : '';
}
function requireTool(command) {
  const result = spawnSync(command, ['-version'], { stdio: 'ignore' });
  if (result.status !== 0) throw new Error(`${command} is required. Install FFmpeg before generating videos.`);
}
function clean(text) {
  return String(text || '')
    .replace(/%/g, ' percent')
    .replace(/[“”]/g, '"')
    .replace(/[’]/g, "'")
    .replace(/[—–]/g, '-')
    .replace(/[\r\t]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
function wrap(text, max = 26) {
  return clean(text).split('\n').map((line) => {
    const words = line.split(' ');
    const lines = [];
    let current = '';
    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (next.length > max && current) { lines.push(current); current = word; }
      else current = next;
    }
    if (current) lines.push(current);
    return lines.slice(0, 4).join('\n');
  }).join('\n');
}
function textFile(text, max = 26) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nws_video_text_'));
  const file = path.join(dir, 'text.txt');
  fs.writeFileSync(file, wrap(text, max), 'utf8');
  return file;
}
function ff(file) { return file.replace(/\\/g, '/').replace(/:/g, '\\:').replace(/'/g, "\\'"); }
function listRecursive(dir, re, limit = 500) {
  const found = [];
  if (!fs.existsSync(dir)) return found;
  const stack = [dir];
  while (stack.length && found.length < limit) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (re.test(full)) found.push(full);
    }
  }
  return found;
}

const SEEDS = {
  NWS_014: {
    productName: 'Dog Urine Neutralizer & Lawn Repair',
    funnelUrl: '/lawn-repair',
    keywords: ['dog', 'urine', 'neutralizer', 'lawn', 'repair'],
    cta: 'Save 15 percent on your first order.\nnatureswaysoil.com/lawn-repair',
    scenes: [
      { text: 'Your dog is not the problem.', query: 'dog walking on green lawn', seconds: 3, broll: ['dog', 'lawn'] },
      { text: 'Urine salts stress the soil.', query: 'yellow patch grass lawn', seconds: 4, broll: ['yellow', 'patch', 'grass'] },
      { text: 'Treat the soil - not just the color.', product: true, seconds: 4 },
      { text: 'Spray affected spots.', query: 'spraying lawn garden', seconds: 4, broll: ['spray', 'lawn'] },
      { text: 'Water in and support recovery.', query: 'watering grass lawn', seconds: 4, broll: ['water', 'grass'] },
      { text: 'Pet-safe. Not a dye.', product: true, seconds: 4 },
      { text: 'Shop direct and save.', product: true, endCard: true, seconds: 4 }
    ]
  },
  NWS_011: {
    productName: 'Liquid Humic & Fulvic Acid with Kelp',
    funnelUrl: '/soil-boost',
    keywords: ['humic', 'fulvic', 'kelp'],
    cta: 'Feed the soil first.\nnatureswaysoil.com/soil-boost',
    scenes: [
      { text: 'Plants need more than fertilizer.', query: 'healthy garden soil roots', seconds: 3, broll: ['garden', 'roots'] },
      { text: 'Humic and fulvic support uptake.', query: 'rich soil close up', seconds: 4, broll: ['soil'] },
      { text: 'Kelp supports root vigor.', query: 'green garden plants sunlight', seconds: 4, broll: ['plants'] },
      { text: 'For lawns, trees, gardens, and containers.', product: true, seconds: 4 },
      { text: 'Build naturally stronger soil.', query: 'watering garden plants', seconds: 4, broll: ['watering', 'garden'] },
      { text: 'Shop direct and save.', product: true, endCard: true, seconds: 4 }
    ]
  },
  NWS_013: {
    productName: 'Enhanced Living Compost with Worm Castings & Biochar',
    funnelUrl: '/living-compost',
    keywords: ['compost', 'worm', 'castings', 'biochar', 'duckweed'],
    cta: 'Upgrade your soil naturally.\nnatureswaysoil.com/living-compost',
    scenes: [
      { text: 'This is not bulk filler compost.', query: 'rich compost soil close up', seconds: 3, broll: ['compost', 'soil'] },
      { text: 'Worm castings feed soil biology.', query: 'worm castings compost soil', seconds: 4, broll: ['worm', 'castings'] },
      { text: 'Biochar helps hold water and nutrients.', query: 'biochar soil garden', seconds: 4, broll: ['biochar'] },
      { text: 'Use in beds, containers, and transplant zones.', product: true, seconds: 4 },
      { text: 'Small bag. Big soil impact.', query: 'raised bed vegetable garden', seconds: 4, broll: ['raised', 'bed'] },
      { text: 'Shop direct and save.', product: true, endCard: true, seconds: 4 }
    ]
  },
  NWS_021: {
    productName: 'Hay, Pasture & Lawn Fertilizer',
    funnelUrl: '/pasture-boost',
    keywords: ['hay', 'pasture', 'lawn', 'fertilizer'],
    cta: 'Support thicker grass growth.\nnatureswaysoil.com/pasture-boost',
    scenes: [
      { text: 'Thin pasture starts with tired soil.', query: 'green pasture grass field', seconds: 3, broll: ['pasture'] },
      { text: 'Feed grass during active growth.', query: 'hay field pasture grass', seconds: 4, broll: ['hay', 'field'] },
      { text: 'Easy liquid pasture nutrition.', product: true, seconds: 4 },
      { text: 'For hay, pasture, and lawns.', query: 'lawn grass close up', seconds: 4, broll: ['lawn', 'grass'] },
      { text: 'Built for landowners.', query: 'farm pasture landscape', seconds: 4, broll: ['farm', 'pasture'] },
      { text: 'Shop direct and save.', product: true, endCard: true, seconds: 4 }
    ]
  },
  NWS_018: {
    productName: 'Seaweed & Humic Acid Lawn Treatment',
    funnelUrl: '/soil-boost',
    keywords: ['seaweed', 'humic', 'lawn', 'kelp'],
    cta: 'Support the root zone.\nnatureswaysoil.com/soil-boost',
    scenes: [
      { text: 'Your lawn needs more than nitrogen.', query: 'lush green lawn close up', seconds: 3, broll: ['lawn'] },
      { text: 'Seaweed supports plant vigor.', query: 'seaweed kelp ocean natural', seconds: 4, broll: ['seaweed', 'kelp'] },
      { text: 'Humic acid supports nutrient movement.', query: 'healthy soil roots grass', seconds: 4, broll: ['roots', 'grass'] },
      { text: 'Feed the root zone.', product: true, seconds: 4 },
      { text: 'Use during active growth.', query: 'watering lawn grass', seconds: 4, broll: ['watering', 'lawn'] },
      { text: 'Shop direct and save.', product: true, endCard: true, seconds: 4 }
    ]
  }
};

function products() {
  const configured = readJson(TOP_PRODUCTS_FILE, { topProducts: [] }).topProducts || [];
  return Object.entries(SEEDS).map(([id, seed]) => {
    const match = configured.find((p) => p.id === id) || {};
    return { id, ...seed, ...match, productName: match.name || seed.productName };
  }).sort((a, b) => (a.priority || 999) - (b.priority || 999));
}
function score(file, words = []) {
  const name = path.basename(file).toLowerCase();
  let s = 100;
  for (const word of words) if (name.includes(word.toLowerCase())) s -= 12;
  if (name.includes('main')) s -= 35;
  if (name.includes('front')) s -= 28;
  if (name.includes('bottle') || name.includes('jug') || name.includes('bag')) s -= 20;
  if (name.includes('label')) s += 18;
  return s;
}
function productImages(product) {
  const roots = [
    path.join(PROJECT, 'public', 'images', 'products', product.id),
    path.join(PROJECT, 'public', 'products', product.id),
    path.join(PROJECT, 'public', 'images'),
    path.join(PROJECT, 'public')
  ];
  const seen = new Set();
  const files = [];
  for (const root of roots) {
    for (const file of listRecursive(root, /\.(png|jpe?g|webp)$/i)) {
      const lower = file.toLowerCase();
      const matched = lower.includes(product.id.toLowerCase()) || product.keywords.some((k) => lower.includes(k.toLowerCase()));
      if (matched && !seen.has(file)) { seen.add(file); files.push(file); }
    }
  }
  return files.sort((a, b) => score(a, product.keywords) - score(b, product.keywords));
}
function localBroll(product, scene) {
  const roots = [
    path.join(PROJECT, 'public', 'broll', product.id),
    path.join(PROJECT, 'public', 'broll', 'shared'),
    path.join(PROJECT, 'public', 'videos', 'broll', product.id),
    path.join(PROJECT, 'public', 'videos', 'broll', 'shared')
  ];
  return roots.flatMap((root) => listRecursive(root, /\.(mp4|mov|m4v|webm)$/i)).sort((a, b) => score(a, scene.broll || []) - score(b, scene.broll || []));
}
async function pexels(query, outFile) {
  if (!PEXELS_API_KEY) return false;
  try {
    const url = new URL('https://api.pexels.com/videos/search');
    url.searchParams.set('query', query);
    url.searchParams.set('orientation', 'portrait');
    url.searchParams.set('per_page', '8');
    const response = await fetch(url, { headers: { Authorization: PEXELS_API_KEY } });
    if (!response.ok) return false;
    const data = await response.json();
    for (const video of data.videos || []) {
      const files = (video.video_files || []).filter((f) => f.link && f.width && f.height).sort((a, b) => {
        const ap = a.height >= a.width ? 0 : 1;
        const bp = b.height >= b.width ? 0 : 1;
        return ap - bp || Math.abs(a.height - 1920) - Math.abs(b.height - 1920);
      });
      const pick = files[0];
      if (!pick) continue;
      const dl = spawnSync('curl', ['-L', '--fail', '--max-time', '60', pick.link, '-o', outFile], { stdio: 'ignore', timeout: 75000 });
      if (dl.status === 0 && fs.existsSync(outFile) && fs.statSync(outFile).size > 10000) return true;
    }
  } catch {}
  return false;
}
function brand(y = 110) {
  const brandFile = textFile("Nature's Way Soil", 28);
  return `drawtext=textfile='${ff(brandFile)}':fontcolor=white:fontsize=44:box=1:boxcolor=black@0.26:boxborderw=16:x=72:y=${y}`;
}
function caption(file, y = 'h-520', size = 64) { return `drawtext=textfile='${ff(file)}':fontcolor=white:fontsize=${size}:box=1:boxcolor=black@0.48:boxborderw=28:x=72:y=${y}:line_spacing=16`; }
function motionScene(text, out, seconds, productName) {
  const tf = textFile(text, 25);
  const pf = textFile(productName, 24);
  const filter = [
    `color=c=0x244f31:s=${W}x${H}:d=${seconds}[base]`,
    `[base]geq=r='36+18*sin((X+T*80)/155)':g='79+18*sin((Y+T*55)/180)':b='49+10*sin((X+Y+T*90)/220)'[motion]`,
    `[motion]${brand(110)}[branded]`,
    `[branded]drawtext=textfile='${ff(pf)}':fontcolor=white:fontsize=42:x=72:y=260:line_spacing=12[name]`,
    `[name]${caption(tf, 'h-560', 66)}[vout]`
  ].join(';');
  run('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', `color=c=0x244f31:s=${W}x${H}:d=${seconds}`, '-filter_complex', filter, '-map', '[vout]', '-c:v', 'libx264', '-preset', 'medium', '-crf', '22', '-pix_fmt', 'yuv420p', '-r', String(FPS), out]);
}
function productScene(image, text, out, seconds, product, endCard = false) {
  const tf = textFile(endCard ? product.cta : text, endCard ? 28 : 26);
  const pf = textFile(product.productName, 24);
  const filter = [
    `color=c=0x244f31:s=${W}x${H}:d=${seconds}[bg0]`,
    `[bg0]geq=r='34+10*sin((X+T*70)/180)':g='80+12*sin((Y+T*50)/150)':b='49+8*sin((X+Y+T*60)/210)'[bg]`,
    `[1:v]scale=${endCard ? 760 : 820}:-2:force_original_aspect_ratio=decrease,format=rgba[prod]`,
    `[bg][prod]overlay=x=(W-w)/2:y=${endCard ? 300 : 360}[withprod]`,
    `[withprod]${brand(100)}[branded]`,
    `[branded]drawtext=textfile='${ff(pf)}':fontcolor=white:fontsize=42:box=1:boxcolor=black@0.18:boxborderw=14:x=72:y=${endCard ? 1080 : 1220}:line_spacing=10[name]`,
    `[name]${caption(tf, endCard ? 'h-520' : 'h-410', endCard ? 58 : 62)}[vout]`
  ].join(';');
  run('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', `color=c=0x244f31:s=${W}x${H}:d=${seconds}`, '-loop', '1', '-t', String(seconds), '-i', image, '-filter_complex', filter, '-map', '[vout]', '-c:v', 'libx264', '-preset', 'medium', '-crf', '22', '-pix_fmt', 'yuv420p', '-r', String(FPS), out]);
}
function imageScene(image, text, out, seconds) {
  const tf = textFile(text, 25);
  const filter = [
    `[0:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},zoompan=z='min(zoom+0.0010,1.08)':d=${seconds * FPS}:s=${W}x${H}:fps=${FPS},format=yuv420p[bg]`,
    `[bg]${brand(110)}[branded]`,
    `[branded]${caption(tf, 'h-520', 64)}[vout]`
  ].join(';');
  run('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-loop', '1', '-t', String(seconds), '-i', image, '-filter_complex', filter, '-map', '[vout]', '-c:v', 'libx264', '-preset', 'medium', '-crf', '22', '-pix_fmt', 'yuv420p', '-r', String(FPS), out]);
}
function brollScene(input, text, out, seconds) {
  const tf = textFile(text, 25);
  const filter = [
    `[0:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},trim=duration=${seconds},setpts=PTS-STARTPTS[bg]`,
    `[bg]${brand(110)}[branded]`,
    `[branded]${caption(tf, 'h-520', 64)}[vout]`
  ].join(';');
  run('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-stream_loop', '1', '-i', input, '-t', String(seconds), '-filter_complex', filter, '-map', '[vout]', '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '22', '-pix_fmt', 'yuv420p', '-r', String(FPS), out]);
}
async function build(product) {
  const images = productImages(product);
  if (!images.length) throw new Error(`No product images found for ${product.id}. Add images under public/images/products/${product.id}/ or name files with product keywords.`);
  const work = fs.mkdtempSync(path.join(os.tmpdir(), `nws_quality_${product.id}_`));
  const scenes = [];
  const audit = [];
  console.log(`\n🎬 ${product.id}: ${product.productName}`);
  console.log(`Product images found: ${images.length}`);
  for (let i = 0; i < product.scenes.length; i++) {
    const scene = product.scenes[i];
    const out = path.join(work, `scene_${i}.mp4`);
    const raw = path.join(work, `raw_${i}.mp4`);
    console.log(`Scene ${i + 1}/${product.scenes.length}: ${scene.text}`);
    if (scene.product || scene.endCard) {
      productScene(images[0], scene.text, out, scene.seconds, product, scene.endCard);
      audit.push({ scene: i + 1, type: scene.endCard ? 'end-card' : 'product-card', source: path.relative(PROJECT, images[0]), text: scene.text });
    } else {
      const local = localBroll(product, scene)[0];
      if (local) { brollScene(local, scene.text, out, scene.seconds); audit.push({ scene: i + 1, type: 'local-broll', source: path.relative(PROJECT, local), text: scene.text }); }
      else if (await pexels(scene.query, raw)) { brollScene(raw, scene.text, out, scene.seconds); audit.push({ scene: i + 1, type: 'pexels-broll', query: scene.query, text: scene.text }); }
      else if (images.length > 1) { imageScene(images[i % images.length], scene.text, out, scene.seconds); audit.push({ scene: i + 1, type: 'product-image-motion', source: path.relative(PROJECT, images[i % images.length]), text: scene.text }); }
      else { motionScene(scene.text, out, scene.seconds, product.productName); audit.push({ scene: i + 1, type: 'branded-motion-fallback', text: scene.text }); }
    }
    scenes.push(out);
  }
  const concat = path.join(work, 'concat.txt');
  fs.writeFileSync(concat, scenes.map((file) => `file '${file.replace(/'/g, "'\\''")}'`).join('\n'));
  const mp4 = path.join(OUT_DIR, `${product.id}.mp4`);
  const jpg = path.join(OUT_DIR, `${product.id}.jpg`);
  run('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', concat, '-c:v', 'libx264', '-preset', 'medium', '-crf', '22', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-movflags', '+faststart', mp4]);
  run('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-ss', '00:00:01', '-i', mp4, '-frames:v', '1', '-q:v', '3', jpg]);
  const probe = capture('ffprobe', ['-v', 'error', '-show_entries', 'stream=width,height,duration', '-of', 'json', mp4]);
  const metadata = probe ? JSON.parse(probe).streams?.[0] || {} : {};
  const plan = { productId: product.id, productName: product.productName, funnelUrl: product.funnelUrl, checkoutUrl: product.checkoutUrl, cta: product.cta, output: path.relative(PROJECT, mp4), poster: path.relative(PROJECT, jpg), metadata, productImages: images.map((x) => path.relative(PROJECT, x)), sceneAudit: audit, generatedAt: new Date().toISOString() };
  fs.writeFileSync(path.join(PLAN_DIR, `${product.id}-quality-seed-plan.json`), JSON.stringify(plan, null, 2));
  console.log(`✅ Ready: ${path.relative(PROJECT, mp4)}`);
}
async function main() {
  ensureDir(OUT_DIR); ensureDir(PLAN_DIR); requireTool('ffmpeg'); requireTool('ffprobe');
  const selected = BUILD_ALL ? products() : products().filter((p) => p.id === TARGET_PRODUCT_ID);
  if (!selected.length) throw new Error(`No matching product for ${TARGET_PRODUCT_ID}`);
  console.log(`Building ${selected.length} quality seed-style video(s).`);
  console.log(PEXELS_API_KEY ? 'Pexels enabled.' : 'Pexels not configured. Using local b-roll/product/motion fallback scenes.');
  for (const product of selected) await build(product);
}
main().catch((error) => { console.error(`❌ Quality seed video generation failed: ${error.message}`); process.exit(1); });
