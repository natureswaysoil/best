#!/usr/bin/env node

/**
 * Quality seed-style vertical video generator.
 *
 * Source of truth:
 * - config/top-products.json supplies the seed list of products, scenes, CTAs,
 *   categories, keywords, and garden/farm avatar aliases.
 *
 * B-roll behavior:
 * - Hydrates PEXELS_API_KEY from Google Secret Manager when available.
 * - Uses Pexels first when PEXELS_API_KEY is available.
 * - Falls back to local b-roll, product images, then simple branded motion scenes.
 * - Enforces at least 4 non-product b-roll scenes per configured product.
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
const SECRET_PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT || process.env.PROJECT_ID;
let PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const BUILD_ALL = process.argv.includes('--all');
const TARGET_PRODUCT_ID = process.env.PRODUCT_ID || process.env.VIDEO_PRODUCT_ID || 'NWS_014';
const W = Number(process.env.VIDEO_WIDTH || 1080);
const H = Number(process.env.VIDEO_HEIGHT || 1920);
const FPS = Number(process.env.VIDEO_FPS || 30);
const FFMPEG_TIMEOUT_MS = Number(process.env.FFMPEG_TIMEOUT_MS || 900000);
const FFMPEG_PRESET = process.env.FFMPEG_PRESET || 'veryfast';

const FALLBACK_SCENES = [
  { text: 'Start with the soil.', query: 'healthy garden soil close up', seconds: 4, broll: ['soil', 'garden'] },
  { text: 'Support stronger roots.', query: 'plant roots in soil close up', seconds: 4, broll: ['roots', 'soil'] },
  { text: 'Apply during active growth.', query: 'watering garden plants', seconds: 4, broll: ['watering', 'garden'] },
  { text: 'Built for naturally stronger soil.', query: 'green garden sunlight', seconds: 4, broll: ['garden', 'plants'] },
  { text: 'Shop direct and save.', product: true, endCard: true, seconds: 4 }
];

function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }
function readJson(file, fallback = {}) {
  try { return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : fallback; }
  catch { return fallback; }
}
function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: 'inherit', timeout: FFMPEG_TIMEOUT_MS, cwd: PROJECT, ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} failed with exit ${result.status}`);
}
function capture(command, args, timeout = 30000) {
  const result = spawnSync(command, args, { cwd: PROJECT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout });
  return result.status === 0 ? result.stdout.trim() : '';
}
function requireTool(command) {
  const result = spawnSync(command, ['-version'], { stdio: 'ignore' });
  if (result.status !== 0) throw new Error(`${command} is required. Install FFmpeg before generating videos.`);
}
function hydrateSecrets() {
  if (PEXELS_API_KEY) {
    console.log('Pexels key found in environment.');
    return;
  }
  if (!SECRET_PROJECT_ID) {
    console.log('No Google Cloud project id found. Set GOOGLE_CLOUD_PROJECT, GCLOUD_PROJECT, GCP_PROJECT, or PROJECT_ID to hydrate secrets.');
    return;
  }
  const value = capture('gcloud', ['secrets', 'versions', 'access', 'latest', '--secret', 'PEXELS_API_KEY', '--project', SECRET_PROJECT_ID], 45000);
  if (value) {
    process.env.PEXELS_API_KEY = value;
    PEXELS_API_KEY = value;
    console.log('Loaded PEXELS_API_KEY from Google Secret Manager.');
  } else {
    console.log('PEXELS_API_KEY was not loaded from Google Secret Manager. Check secret name, project id, and gcloud auth.');
  }
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
function probeMedia(file) {
  if (!fs.existsSync(file) || fs.statSync(file).size < 1000) return false;
  const out = capture('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', file]);
  return /^\d+,\d+/.test(out);
}
function productSeeds() {
  const topProducts = readJson(TOP_PRODUCTS_FILE, { topProducts: [] }).topProducts || [];
  return topProducts
    .map((product) => ({
      ...product,
      productName: product.name || product.productName || product.id,
      scenes: Array.isArray(product.scenes) && product.scenes.length ? product.scenes : FALLBACK_SCENES,
      keywords: Array.isArray(product.keywords) ? product.keywords : []
    }))
    .sort((a, b) => (a.priority || 999) - (b.priority || 999));
}
function validateSeed(product) {
  const brollScenes = product.scenes.filter((scene) => !scene.product && !scene.endCard && scene.query);
  if (brollScenes.length < 4) throw new Error(`${product.id} needs at least 4 Pexels b-roll scenes in config/top-products.json; found ${brollScenes.length}.`);
}
function score(file, words = []) {
  const name = path.basename(file).toLowerCase();
  let s = 100;
  for (const word of words) if (name.includes(String(word).toLowerCase())) s -= 12;
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
  let skipped = 0;
  for (const root of roots) {
    for (const file of listRecursive(root, /\.(png|jpe?g|webp)$/i)) {
      const lower = file.toLowerCase();
      const matched = lower.includes(product.id.toLowerCase()) || product.keywords.some((k) => lower.includes(String(k).toLowerCase()));
      if (!matched || seen.has(file)) continue;
      seen.add(file);
      if (probeMedia(file)) files.push(file);
      else skipped++;
    }
  }
  if (skipped) console.log(`Skipped ${skipped} invalid image file(s) for ${product.id}.`);
  return files.sort((a, b) => score(a, product.keywords) - score(b, product.keywords));
}
function localBroll(product, scene) {
  const roots = [
    path.join(PROJECT, 'public', 'broll', product.id),
    path.join(PROJECT, 'public', 'broll', 'shared'),
    path.join(PROJECT, 'public', 'videos', 'broll', product.id),
    path.join(PROJECT, 'public', 'videos', 'broll', 'shared')
  ];
  return roots.flatMap((root) => listRecursive(root, /\.(mp4|mov|m4v|webm)$/i)).filter(probeMedia).sort((a, b) => score(a, scene.broll || []) - score(b, scene.broll || []));
}
async function pexels(query, outFile) {
  if (!PEXELS_API_KEY) return false;
  try {
    const url = new URL('https://api.pexels.com/videos/search');
    url.searchParams.set('query', query);
    url.searchParams.set('orientation', 'portrait');
    url.searchParams.set('per_page', '10');
    const response = await fetch(url, { headers: { Authorization: PEXELS_API_KEY } });
    if (!response.ok) {
      console.log(`Pexels lookup failed for "${query}" with HTTP ${response.status}.`);
      return false;
    }
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
      if (dl.status === 0 && probeMedia(outFile)) return true;
    }
  } catch (error) {
    console.log(`Pexels lookup failed for "${query}": ${error.message}`);
  }
  return false;
}
function brand(y = 110) {
  const brandFile = textFile("Nature's Way Soil", 28);
  return `drawtext=textfile='${ff(brandFile)}':fontcolor=white:fontsize=44:box=1:boxcolor=black@0.26:boxborderw=16:x=72:y=${y}`;
}
function caption(file, y = 'h-520', size = 64) {
  return `drawtext=textfile='${ff(file)}':fontcolor=white:fontsize=${size}:box=1:boxcolor=black@0.48:boxborderw=28:x=72:y=${y}:line_spacing=16`;
}
function encodeArgs(out) {
  return ['-c:v', 'libx264', '-preset', FFMPEG_PRESET, '-crf', '23', '-pix_fmt', 'yuv420p', '-r', String(FPS), out];
}
function motionScene(text, out, seconds, productName) {
  const tf = textFile(text, 25);
  const pf = textFile(productName, 24);
  const filter = [
    `${brand(110)}[branded]`,
    `[branded]drawtext=textfile='${ff(pf)}':fontcolor=white:fontsize=42:x=72:y=260:line_spacing=12[name]`,
    `[name]${caption(tf, 'h-560', 66)}[vout]`
  ].join(';');
  run('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', `color=c=0x244f31:s=${W}x${H}:d=${seconds}`, '-filter_complex', `[0:v]${filter}`, '-map', '[vout]', ...encodeArgs(out)]);
}
function productScene(image, text, out, seconds, product, endCard = false) {
  if (!image || !probeMedia(image)) return motionScene(endCard ? product.cta : text, out, seconds, product.productName);
  const tf = textFile(endCard ? product.cta : text, endCard ? 28 : 26);
  const pf = textFile(product.productName, 24);
  const filter = [
    `[1:v]scale=${endCard ? 760 : 820}:-2:force_original_aspect_ratio=decrease,format=rgba[prod]`,
    `[0:v][prod]overlay=x=(W-w)/2:y=${endCard ? 300 : 360}[withprod]`,
    `[withprod]${brand(100)}[branded]`,
    `[branded]drawtext=textfile='${ff(pf)}':fontcolor=white:fontsize=42:box=1:boxcolor=black@0.18:boxborderw=14:x=72:y=${endCard ? 1080 : 1220}:line_spacing=10[name]`,
    `[name]${caption(tf, endCard ? 'h-520' : 'h-410', endCard ? 58 : 62)}[vout]`
  ].join(';');
  run('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', `color=c=0x244f31:s=${W}x${H}:d=${seconds}`, '-loop', '1', '-t', String(seconds), '-i', image, '-filter_complex', filter, '-map', '[vout]', ...encodeArgs(out)]);
}
function imageScene(image, text, out, seconds, product) {
  if (!image || !probeMedia(image)) return motionScene(text, out, seconds, product.productName);
  const tf = textFile(text, 25);
  const filter = [
    `[0:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},format=yuv420p[bg]`,
    `[bg]${brand(110)}[branded]`,
    `[branded]${caption(tf, 'h-520', 64)}[vout]`
  ].join(';');
  run('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-loop', '1', '-t', String(seconds), '-i', image, '-filter_complex', filter, '-map', '[vout]', ...encodeArgs(out)]);
}
function brollScene(input, text, out, seconds) {
  const tf = textFile(text, 25);
  const filter = [
    `[0:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},trim=duration=${seconds},setpts=PTS-STARTPTS[bg]`,
    `[bg]${brand(110)}[branded]`,
    `[branded]${caption(tf, 'h-520', 64)}[vout]`
  ].join(';');
  run('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-stream_loop', '1', '-i', input, '-t', String(seconds), '-filter_complex', filter, '-map', '[vout]', '-an', ...encodeArgs(out)]);
}
async function build(product) {
  validateSeed(product);
  const images = productImages(product);
  if (!images.length) console.log(`No usable product images found for ${product.id}; using branded motion fallback for product cards.`);
  const work = fs.mkdtempSync(path.join(os.tmpdir(), `nws_quality_${product.id}_`));
  const scenes = [];
  const audit = [];
  console.log(`\n🎬 ${product.id}: ${product.productName}`);
  console.log(`Usable product images found: ${images.length}`);
  console.log(PEXELS_API_KEY ? 'Pexels enabled and preferred for b-roll scenes.' : 'Pexels not configured. Using local/product/motion fallback scenes.');

  for (let i = 0; i < product.scenes.length; i++) {
    const scene = product.scenes[i];
    const out = path.join(work, `scene_${i}.mp4`);
    const raw = path.join(work, `raw_${i}.mp4`);
    const seconds = Number(scene.seconds || 4);
    console.log(`Scene ${i + 1}/${product.scenes.length}: ${scene.text}`);

    if (scene.product || scene.endCard) {
      productScene(images[0], scene.text, out, seconds, product, scene.endCard);
      audit.push({ scene: i + 1, type: scene.endCard ? 'end-card' : 'product-card', source: images[0] ? path.relative(PROJECT, images[0]) : 'motion-fallback', text: scene.text });
    } else if (await pexels(scene.query, raw)) {
      brollScene(raw, scene.text, out, seconds);
      audit.push({ scene: i + 1, type: 'pexels-broll', query: scene.query, text: scene.text });
    } else {
      const local = localBroll(product, scene)[0];
      if (local) {
        brollScene(local, scene.text, out, seconds);
        audit.push({ scene: i + 1, type: 'local-broll', source: path.relative(PROJECT, local), text: scene.text });
      } else if (images.length > 1) {
        imageScene(images[i % images.length], scene.text, out, seconds, product);
        audit.push({ scene: i + 1, type: 'product-image-motion', source: path.relative(PROJECT, images[i % images.length]), text: scene.text });
      } else {
        motionScene(scene.text, out, seconds, product.productName);
        audit.push({ scene: i + 1, type: 'branded-motion-fallback', text: scene.text });
      }
    }
    scenes.push(out);
  }

  const concat = path.join(work, 'concat.txt');
  fs.writeFileSync(concat, scenes.map((file) => `file '${file.replace(/'/g, "'\\''")}'`).join('\n'));
  const mp4 = path.join(OUT_DIR, `${product.id}.mp4`);
  const jpg = path.join(OUT_DIR, `${product.id}.jpg`);
  run('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', concat, '-c:v', 'libx264', '-preset', FFMPEG_PRESET, '-crf', '23', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-movflags', '+faststart', mp4]);
  run('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-ss', '00:00:01', '-i', mp4, '-frames:v', '1', '-q:v', '3', jpg]);
  const probe = capture('ffprobe', ['-v', 'error', '-show_entries', 'stream=width,height,duration', '-of', 'json', mp4]);
  const metadata = probe ? JSON.parse(probe).streams?.[0] || {} : {};
  const plan = {
    productId: product.id,
    productName: product.productName,
    category: product.category,
    avatarAlias: product.avatar_id || product.heygenAvatarId || null,
    funnelUrl: product.funnelUrl,
    checkoutUrl: product.checkoutUrl,
    cta: product.cta,
    output: path.relative(PROJECT, mp4),
    poster: path.relative(PROJECT, jpg),
    metadata,
    productImages: images.map((x) => path.relative(PROJECT, x)),
    sceneAudit: audit,
    generatedAt: new Date().toISOString()
  };
  fs.writeFileSync(path.join(PLAN_DIR, `${product.id}-quality-seed-plan.json`), JSON.stringify(plan, null, 2));
  console.log(`✅ Ready: ${path.relative(PROJECT, mp4)}`);
}
async function main() {
  ensureDir(OUT_DIR);
  ensureDir(PLAN_DIR);
  hydrateSecrets();
  requireTool('ffmpeg');
  requireTool('ffprobe');
  const allProducts = productSeeds();
  const selected = BUILD_ALL ? allProducts : allProducts.filter((p) => p.id === TARGET_PRODUCT_ID);
  if (!selected.length) throw new Error(`No matching product for ${TARGET_PRODUCT_ID} in config/top-products.json`);
  console.log(`Building ${selected.length} quality seed-style video(s) from config/top-products.json.`);
  for (const product of selected) await build(product);
}
main().catch((error) => { console.error(`❌ Quality seed video generation failed: ${error.message}`); process.exit(1); });
