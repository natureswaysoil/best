#!/usr/bin/env node
/**
 * Generate 30-second AI presenter videos for each product using HeyGen.
 * - Professional AI avatars present product benefits and usage instructions
 * - High-quality talking head videos with branded backgrounds
 * - Outputs MP4 optimized for web and social media
 * - Fallback to FFmpeg generation if HeyGen is unavailable
 */
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { spawnSync, execSync } from 'child_process';
import HeyGenVideoGenerator from './heygen-video-generator.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT = path.resolve(__dirname, '..');
const DATA_FILE = path.join(PROJECT, 'data', 'products.ts');
const OUT_DIR = path.join(PROJECT, 'public', 'videos');
const ASIN_SCRIPTS = path.join(PROJECT, 'content', 'video-scripts', 'asin-scripts.json');
const VIDEO_CONFIG = path.join(PROJECT, 'content', 'video-scripts', 'video-config.json');
const SHEET_CACHE = path.join(PROJECT, 'content', 'video-scripts', 'sheet-products.json');
const VIDEO_SCRIPTS_DIR = path.join(PROJECT, 'content', 'video-scripts');

const FORCE_REGENERATE = process.argv.includes('--force') || process.env.VIDEO_FORCE_REGENERATE === '1';
const LOCK_SCRIPT_MODE = process.argv.includes('--lock-script') || process.env.VIDEO_LOCK_SCRIPT === '1';

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

function getPublicBaseUrl() {
  const raw = process.env.VIDEO_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://natureswaysoil.com';
  return raw.endsWith('/') ? raw.slice(0, -1) : raw;
}

function toPublicAssetUrl(assetPath) {
  if (!assetPath || typeof assetPath !== 'string') return null;
  if (/^https?:\/\//i.test(assetPath)) return assetPath;
  const normalized = assetPath.startsWith('/') ? assetPath : `/${assetPath}`;
  return `${getPublicBaseUrl()}${normalized}`;
}

function parseDelimitedList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item) => String(item || '').trim()).filter(Boolean);
  return String(value)
    .split(/[|,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function resolveLikelyAmazonImageUrl(asin) {
  if (!asin) return null;
  return `https://m.media-amazon.com/images/P/${asin}.01._SCLZZZZZZZ_.jpg`;
}

function getPrimaryProductImage(product) {
  if (product?.image) return product.image;
  if (Array.isArray(product?.brollImages) && product.brollImages.length > 0) {
    return product.brollImages[0];
  }
  return resolveLikelyAmazonImageUrl(product?.asin);
}

async function checkHeyGenReachability(apiKey, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch('https://api.heygen.com/v2/avatars', {
      method: 'GET',
      headers: {
        'X-Api-Key': apiKey,
      },
      signal: controller.signal,
    });

    if (response.ok) {
      return { ok: true };
    }

    const body = await response.text().catch(() => '');
    return {
      ok: false,
      status: response.status,
      message: body || `HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      ok: false,
      message: error.name === 'AbortError'
        ? `timeout after ${timeoutMs}ms`
        : (error.message || 'unknown network error'),
    };
  } finally {
    clearTimeout(timer);
  }
}

function getHeyGenPreflightTimeoutMs() {
  const raw = process.env.HEYGEN_PREFLIGHT_TIMEOUT_MS;
  const parsed = Number(raw);
  if (Number.isFinite(parsed) && parsed >= 1000) return parsed;
  return 8000;
}

function shouldSkipHeyGenPreflight() {
  return process.env.HEYGEN_SKIP_PREFLIGHT === '1';
}

function isHeyGenPreflightStrict() {
  return process.env.HEYGEN_PREFLIGHT_STRICT === '1';
}

function hasFfmpeg() {
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

/**
 * Load products from Google Sheets cache if available, otherwise fall back to products.ts.
 *
 * To pull fresh data from a Google Sheet, run:
 *   node scripts/asin-from-sheet.mjs <SPREADSHEET_ID> <SHEET_GID> content/video-scripts/sheet-products.json
 * Or set GOOGLE_SHEET_ID (and optionally GOOGLE_SHEET_GID) in .env.local and run:
 *   npm run sheet:sync
 */
function loadProducts() {
  // 1. Try Google Sheets cache first
  if (fs.existsSync(SHEET_CACHE)) {
    try {
      const sheetData = JSON.parse(fs.readFileSync(SHEET_CACHE, 'utf8'));
      if (Array.isArray(sheetData.products) && sheetData.products.length > 0) {
        console.log(`📊 Using Google Sheets data (${sheetData.products.length} products) from ${SHEET_CACHE}`);
        console.log(`   Source: ${sheetData._source || 'unknown'}`);
        console.log(`   Generated: ${sheetData._generated || 'unknown'}`);
        // Map sheet products to the expected shape
        return sheetData.products.map((p) => {
          const brollImages = parseDelimitedList(p.brollImages || p.broll_images || p.b_roll_images || p.broll || p.b_roll);
          return {
            id: p.id || (p.asin ? `ASIN_${p.asin}` : null),
            name: p.name || p.asin,
            category: p.category || 'General',
            usage: parseDelimitedList(p.usage || p.instructions),
            asin: p.asin || null,
            image: p.image || null,
            description: p.description || '',
            videoScript: p.videoScript || null,
            keywords: parseDelimitedList(p.keywords),
            brollImages,
          };
        }).filter((p) => p.id && p.name);
      }
    } catch (e) {
      console.warn(`⚠️  Failed to read sheet cache (${SHEET_CACHE}): ${e.message}`);
      console.warn('   Falling back to products.ts...');
    }
  }

  // 2. Fall back to hard-coded products.ts
  console.log('📦 Loading products from data/products.ts');
  const ts = fs.readFileSync(DATA_FILE, 'utf8');
  const entries = [];
  const productBlocks = ts.split(/\n\s*},\s*\n\s*{\s*id:/).map((block, idx) => (idx === 0 ? block : '{ id:' + block));
  for (const block of productBlocks) {
    const idMatch = block.match(/id:\s*'([^']+)'/);
    const nameMatch = block.match(/name:\s*'([^']+)'/);
    const usageMatch = block.match(/usage:\s*\[(.*?)\]/s);
    const keywordsMatch = block.match(/keywords:\s*\[(.*?)\]/s);
    const imagesMatch = block.match(/images:\s*\[(.*?)\]/s);
    const asinMatch = block.match(/asin:\s*'([^']+)'/);
    const categoryMatch = block.match(/category:\s*'([^']+)'/);
    const imageMatch = block.match(/image:\s*'([^']+)'/);
    const descMatch = block.match(/description:\s*'([^']+)'/);
    if (!idMatch || !nameMatch) continue;
    const id = idMatch[1];
    const name = nameMatch[1];
    const category = categoryMatch ? categoryMatch[1] : '';
    const asin = asinMatch ? asinMatch[1] : undefined;
    const image = imageMatch ? imageMatch[1] : null;
    const description = descMatch ? descMatch[1] : '';
    let usage = [];
    if (usageMatch) {
      const inner = usageMatch[1];
      usage = Array.from(inner.matchAll(/'([^']+)'/g)).map((m) => m[1]);
    }

    let keywords = [];
    if (keywordsMatch) {
      const inner = keywordsMatch[1];
      keywords = Array.from(inner.matchAll(/'([^']+)'/g)).map((m) => m[1]);
    }

    let brollImages = [];
    if (imagesMatch) {
      const inner = imagesMatch[1];
      brollImages = Array.from(inner.matchAll(/'([^']+)'/g)).map((m) => m[1]);
    }

    entries.push({ id, name, category, usage, keywords, asin, image, brollImages, description });
  }
  return entries.filter(e => /^NWS_\d{3}$/.test(e.id));
}

function sanitize(text) {
  return text.replace(/:/g, '\u2236');
}

function getLatestStyleFile() {
  try {
    const entries = fs
      .readdirSync(VIDEO_SCRIPTS_DIR)
      .filter((f) => f.endsWith('.md') && f !== 'README.md')
      .map((f) => {
        const full = path.join(VIDEO_SCRIPTS_DIR, f);
        return { full, mtime: fs.statSync(full).mtimeMs };
      })
      .sort((a, b) => b.mtime - a.mtime);

    return entries.length > 0 ? entries[0].full : null;
  } catch {
    return null;
  }
}

function loadStyleReference() {
  if (LOCK_SCRIPT_MODE) {
    return { path: null, cues: [] };
  }

  const configuredPath = process.env.VIDEO_STYLE_REFERENCE_FILE;
  const stylePath = configuredPath || getLatestStyleFile();
  if (!stylePath || !fs.existsSync(stylePath)) {
    return { path: null, cues: [] };
  }

  try {
    const text = fs.readFileSync(stylePath, 'utf8');
    const cueMatches = Array.from(text.matchAll(/Voiceover:\s*"([^"]+)"/g)).map((m) => m[1]);
    return { path: stylePath, cues: cueMatches.slice(0, 4) };
  } catch {
    return { path: null, cues: [] };
  }
}

function warnRootLevelMp4Ignored() {
  try {
    const rootMp4s = fs
      .readdirSync(PROJECT)
      .filter((name) => /\.mp4$/i.test(name));

    if (rootMp4s.length > 0) {
      console.log('🛡️  Root-level MP4 files detected and ignored by automation:');
      rootMp4s.forEach((name) => console.log(`   - ${name}`));
      console.log('   Only public/videos/{PRODUCT_ID}.mp4 is considered canonical.');
    }
  } catch {
    // Ignore root scan errors.
  }
}

function loadAsinScriptsMap() {
  try {
    if (fs.existsSync(ASIN_SCRIPTS)) {
      return JSON.parse(fs.readFileSync(ASIN_SCRIPTS, 'utf8'));
    }
  } catch (error) {
    console.warn(`⚠️  Could not load ASIN script map: ${error.message}`);
  }
  return {};
}

function buildLockedScript(product, asinMap) {
  if (product.videoScript && String(product.videoScript).trim().length > 0) {
    return String(product.videoScript).trim();
  }

  const segments = product.asin && asinMap?.[product.asin]?.segments;
  if (Array.isArray(segments) && segments.length > 0) {
    return segments
      .map((segment) => String(segment?.text || '').trim())
      .filter(Boolean)
      .join(' ');
  }

  return [
    `${product.name} is an organic, pet-safe way to improve soil health and plant performance.`,
    'Apply as directed to support stronger roots, better nutrient uptake, and more consistent growth.',
    "Nature's Way Soil helps you feed plants naturally without harsh synthetic overload.",
    'Learn more at NaturesWaySoil.com.'
  ].join(' ');
}

function isHttpUrl(value) {
  return typeof value === 'string' && /^https?:\/\//i.test(value);
}

function collectProductBrollImages(prod) {
  const candidates = new Set();
  const push = (p) => {
    if (!p || typeof p !== 'string') return;
    if (isHttpUrl(p)) {
      candidates.add(p.trim());
      return;
    }
    const normalized = p.startsWith('/') ? p.slice(1) : p;
    const local = path.join(PROJECT, 'public', normalized);
    if (fs.existsSync(local)) candidates.add(local);
  };

  if (prod.image) push(prod.image);
  if (Array.isArray(prod.images)) {
    for (const img of prod.images) push(img);
  }
  if (Array.isArray(prod.brollImages)) {
    for (const img of prod.brollImages) push(img);
  }

  const asinFallback = resolveLikelyAmazonImageUrl(prod.asin);
  if (asinFallback) push(asinFallback);

  const productImageDir = path.join(PROJECT, 'public', 'images', 'products', prod.id);
  if (fs.existsSync(productImageDir)) {
    const files = fs.readdirSync(productImageDir)
      .filter((name) => /\.(jpg|jpeg|png|webp)$/i.test(name))
      .sort((a, b) => {
        const score = (s) => {
          const lower = s.toLowerCase();
          if (lower.startsWith('main.')) return 0;
          if (lower.startsWith('original.')) return 1;
          if (lower.startsWith('thumb.')) return 2;
          return 3;
        };
        return score(a) - score(b) || a.localeCompare(b);
      });

    for (const name of files) {
      candidates.add(path.join(productImageDir, name));
    }
  }

  return Array.from(candidates).slice(0, 6);
}

function enhanceHeyGenVideoWithBroll(videoPath, prod) {
  if (!hasFfmpeg()) {
    console.log(`   ⚠️  FFmpeg not available, skipping b-roll enhancement for ${prod.id}`);
    return false;
  }

  const images = collectProductBrollImages(prod);
  if (!images.length) {
    console.log(`   ⚠️  No product images found for b-roll enhancement (${prod.id})`);
    return false;
  }

  const downloaded = [];
  const usableImages = [];
  images.forEach((img, idx) => {
    if (!isHttpUrl(img)) {
      usableImages.push(img);
      return;
    }

    const extMatch = img.match(/\.(jpe?g|png|webp)(?:\?|$)/i);
    const ext = extMatch ? extMatch[1].toLowerCase() : 'jpg';
    const downloadedPath = path.join(os.tmpdir(), `${prod.id}_broll_${idx}.${ext}`);
    const downloadRes = spawnSync('curl', ['-fsSL', '--max-time', '20', img, '-o', downloadedPath], { stdio: 'ignore' });
    if (downloadRes.status === 0 && fs.existsSync(downloadedPath) && fs.statSync(downloadedPath).size > 0) {
      downloaded.push(downloadedPath);
      usableImages.push(downloadedPath);
    }
  });

  if (!usableImages.length) {
    console.log(`   ⚠️  No downloadable b-roll images found for ${prod.id}`);
    return false;
  }

  const tempOutput = `${videoPath}.broll.mp4`;
  const imageInputs = usableImages.flatMap((img) => ['-loop', '1', '-i', img]);
  const overlays = [];
  const segmentStart = 2;
  const segmentEnd = 28;
  const segmentSpan = Math.max(3, (segmentEnd - segmentStart) / usableImages.length);

  overlays.push('[0:v]scale=1280:720,format=yuv420p[v0]');

  let lastLabel = '[v0]';
  usableImages.forEach((_, idx) => {
    const inputLabel = `[${idx + 1}:v]`;
    const scaledLabel = `[b${idx}]`;
    const outputLabel = idx === images.length - 1 ? '[vout]' : `[v${idx + 1}]`;
    const start = (segmentStart + idx * segmentSpan).toFixed(2);
    const end = (idx === images.length - 1 ? segmentEnd : (segmentStart + (idx + 1) * segmentSpan)).toFixed(2);

    overlays.push(`${inputLabel}scale=460:-2,format=rgba,colorchannelmixer=aa=0.92${scaledLabel}`);
    overlays.push(`${lastLabel}${scaledLabel}overlay=x='W-w-28':y='28':enable='between(t,${start},${end})'${outputLabel}`);
    lastLabel = outputLabel;
  });

  const args = [
    'ffmpeg', '-y',
    '-i', videoPath,
    ...imageInputs,
    '-filter_complex', overlays.join(';'),
    '-map', '[vout]',
    '-map', '0:a?',
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-crf', '21',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'copy',
    '-movflags', '+faststart',
    tempOutput,
  ];

  const res = spawnSync(args[0], args.slice(1), { stdio: 'inherit' });
  if (res.status !== 0 || !fs.existsSync(tempOutput)) {
    try {
      if (fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput);
      downloaded.forEach((f) => {
        if (fs.existsSync(f)) fs.unlinkSync(f);
      });
    } catch {}
    throw new Error(`ffmpeg b-roll enhancement failed for ${prod.id}`);
  }

  fs.renameSync(tempOutput, videoPath);
  downloaded.forEach((f) => {
    try {
      if (fs.existsSync(f)) fs.unlinkSync(f);
    } catch {}
  });
  return true;
}

function makeSegments(prod, asinMap, styleRef) {
  if (prod.asin && asinMap && asinMap[prod.asin] && asinMap[prod.asin].segments) {
    return asinMap[prod.asin].segments;
  }
  // Fallback: create default segments
  const title = prod.name;
  const steps = (prod.usage || []).slice(0, 3);
  const safeSteps = steps.map(sanitize);
  const intro = `${title}`;
  const tip = prod.category ? `${prod.category} • Pet-safe • Easy to use` : 'Pet-safe • Easy to use';
  const cta = 'Mix with water • Apply • See results\nLearn more at NaturesWaySoil.com';
  const styleCues = styleRef?.cues || [];
  const cue0 = styleCues[0] || 'Natural humic-powered feeding can outperform harsh synthetic fertilizer routines.';
  const cue1 = styleCues[1] || 'Build healthier soil biology, improve nutrient uptake, and support steadier growth.';
  const cue2 = styleCues[2] || 'Use on lawns, gardens, and trees for visible results without synthetic overload.';
  const cue3 = styleCues[3] || "Nature's Way Soil helps bring long-term life back to your soil.";

  return [
    { start: 0, end: 5, text: `${intro}\n${sanitize(cue0)}` },
    { start: 5, end: 10, text: safeSteps[0] || sanitize(cue1) },
    { start: 10, end: 15, text: safeSteps[1] || sanitize(cue2) },
    { start: 15, end: 20, text: safeSteps[2] || 'Repeat on schedule for best results.' },
    { start: 20, end: 25, text: tip },
    { start: 25, end: 30, text: `${sanitize(cue3)}\n${cta}` },
  ];
}

function buildVideoForProduct(prod, asinMap, cfg) {
  const styleRef = loadStyleReference();
  if (styleRef.path) {
    console.log(`🎬 Using style reference: ${styleRef.path}`);
  }
  const segments = makeSegments(prod, asinMap, styleRef);
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), `nws_${prod.id}_`));
  const fontPathCandidates = [
    '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
  ];
  const fontPath = fontPathCandidates.find(f => fs.existsSync(f));
  if (!fontPath) {
    console.warn('Warning: DejaVu Sans font not found. drawtext may fail without fontfile.');
  }

  const common = {
    size: (cfg && cfg.size) || '1280x720',
    bg: (cfg && cfg.bg) || '#0d3b2a',
    fontsize: (cfg && cfg.fontsize) || 48,
    lineSpacing: (cfg && cfg.lineSpacing) || 10,
    perSlide: (cfg && cfg.durationSeconds) || 5,
    fadeSeconds: (cfg && cfg.fadeSeconds) || 0.5,
  };
  const [W, H] = common.size.split('x').map(n => parseInt(n, 10));
  const totalDuration = (cfg && cfg.totalDuration) || 30;
  const selectedFont = (cfg && cfg.fontFile && fs.existsSync(cfg.fontFile)) ? cfg.fontFile : fontPath;

  // Prepare textfiles for each caption segment
  const textFiles = segments.map((seg, idx) => {
    const textFile = path.join(tmpDir, `seg_${idx + 1}.txt`);
    const safeText = String(seg.text).replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/[\t\u0000-\u001f\u007f]/g, ' ');
    fs.writeFileSync(textFile, safeText, 'utf8');
    return textFile;
  });

  const outPath = path.join(OUT_DIR, `${prod.id}.mp4`);
  const posterPathCandidate = path.join(OUT_DIR, `${prod.id}.jpg`);
  const havePoster = fs.existsSync(posterPathCandidate);

  // Build filter_complex
  const baseLabel = havePoster ? '[bgout]' : '[base]';
  const chain = [];

  if (havePoster) {
    // Input 0: color base, Input 1: poster (looped)
    chain.push(
      `[1:v]scale='iw*max(${W}/iw,${H}/ih):ih*max(${W}/iw,${H}/ih)',` +
      `zoompan=z='min(zoom+0.0008,1.12)':d=1:s=${W}x${H}:fps=30,` +
      `format=yuv420p[vbg]`,
      `[0:v][vbg]overlay=shortest=1${baseLabel}`
    );
  } else {
    // Only color base
    chain.push(`[0:v]format=yuv420p${baseLabel}`);
  }

  // Add a subtle vignette for depth
  chain.push(`${baseLabel}vignette=PI/6[v0]`);

  // Brand bug (always on)
  const brandTextFile = path.join(tmpDir, 'brand.txt');
  fs.writeFileSync(brandTextFile, "Nature's Way Soil", 'utf8');
  const brandArgs = [
    `fontcolor=white:fontsize=${Math.round(common.fontsize * 0.6)}`,
    selectedFont ? `fontfile=${selectedFont}` : '',
    // Use color@alpha (avoid # which is a comment in filter_complex_script)
    'box=1:boxcolor=black@0.40:boxborderw=12',
  `x='w-tw-24'`,
    `y=h-th-24`,
    'expansion=none',
    `textfile=${brandTextFile}`
  ].filter(Boolean).join(':');
  chain.push(`[v0]drawtext=${brandArgs}[v1]`);

  // Timed captions for each segment
  let lastLabel = '[v1]';
  segments.forEach((seg, idx) => {
    const st = seg.start;
    const et = seg.end;
    const tf = textFiles[idx];
    const yExpr = `(h*0.78)-(30*between(t,${st.toFixed(2)},${(st+0.3).toFixed(2)}))`;
    const captionArgs = [
      `fontcolor=white:fontsize=${common.fontsize}`,
      selectedFont ? `fontfile=${selectedFont}` : '',
      // Use color@alpha to avoid # comment parsing in script file
      'box=1:boxcolor=black@0.53:boxborderw=20',
  `x='(w-text_w)/2'`,
      // slight slide-up on first 0.3s of segment
      `y='${yExpr}'`,
      `line_spacing=${common.lineSpacing}`,
      'expansion=none',
      `textfile=${tf}`,
      `enable='between(t,${st.toFixed(2)},${et.toFixed(2)})'`
    ].filter(Boolean).join(':');
    const nextLabel = idx === segments.length - 1 ? '[vout]' : `[v${idx + 2}]`;
    chain.push(`${lastLabel}drawtext=${captionArgs}${nextLabel}`);
    lastLabel = nextLabel;
  });

  // Assemble ffmpeg args
  const graphFile = path.join(tmpDir, 'filtergraph.ffscript');
  fs.writeFileSync(graphFile, chain.join(';'), 'utf8');

  // For lavfi color, prefer named/rgba syntax; if cfg.bg is hex like #RRGGBB, convert to 0xRRGGBB format or named.
  const lavfiBg = common.bg.startsWith('#') ? `0x${common.bg.slice(1)}` : common.bg;
  const args = [
    'ffmpeg','-y',
    // Input 0: color base
    '-f','lavfi','-i',`color=c=${lavfiBg}:s=${common.size}:d=${totalDuration}`,
    // Input 1: poster (optional)
    ...(havePoster ? ['-loop','1','-t', String(totalDuration), '-i', posterPathCandidate] : []),
    '-filter_complex_script', graphFile,
    '-map', segments.length ? '[vout]' : (havePoster ? '[bgout]' : '[base]'),
    '-c:v','libx264','-preset','veryfast','-crf','23','-pix_fmt','yuv420p','-r','30',
    outPath
  ];

  const res = spawnSync(args[0], args.slice(1), { stdio: 'inherit' });
  if (res.status !== 0) {
    throw new Error(`ffmpeg continuous render failed for ${prod.id}`);
  }

  // Additionally output WebM (VP9) for broader browser coverage
  const outWebm = path.join(OUT_DIR, `${prod.id}.webm`);
  const webmCmd = [
    'ffmpeg','-y','-i', outPath,
    '-c:v','libvpx-vp9','-b:v','0','-crf', (cfg && cfg.vp9Crf ? String(cfg.vp9Crf) : '33'),
    '-row-mt','1','-speed', (cfg && cfg.vp9Speed ? String(cfg.vp9Speed) : '4'),
    '-pix_fmt','yuv420p','-r','30', outWebm
  ];
  const wres = spawnSync(webmCmd[0], webmCmd.slice(1), { stdio: 'inherit' });
  if (wres.status !== 0) throw new Error(`ffmpeg webm transcode failed for ${prod.id}`);

  // Generate a poster image from the first frame for thumbnails/posters (if not already present or to refresh)
  const outPosterJpg = path.join(OUT_DIR, `${prod.id}.jpg`);
  const posterCmd = [
    'ffmpeg','-y','-i', outPath,
    '-frames:v','1','-update','1','-q:v','3', outPosterJpg
  ];
  const pres = spawnSync(posterCmd[0], posterCmd.slice(1), { stdio: 'inherit' });
  if (pres.status !== 0) throw new Error(`ffmpeg poster export failed for ${prod.id}`);

  try {
    textFiles.forEach(f => fs.unlinkSync(f));
    fs.rmdirSync(tmpDir);
  } catch {}

  return { mp4: outPath, webm: outWebm, poster: outPosterJpg };
}

async function main() {
  console.log('🎬 Starting HeyGen AI Video Generation for Products');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  warnRootLevelMp4Ignored();

  const styleRef = loadStyleReference();
  if (LOCK_SCRIPT_MODE) {
    delete process.env.VIDEO_STYLE_REFERENCE_TEXT;
    console.log('🔒 Locked script mode enabled: style-reference cues are disabled');
  } else if (styleRef.path) {
    console.log(`🎬 Using style reference: ${styleRef.path}`);
    process.env.VIDEO_STYLE_REFERENCE_TEXT = styleRef.cues.join(' ');
  }

  // Auto-sync Google Sheets if GOOGLE_SHEET_ID is set and cache is missing or stale (>1 hour)
  const googleSheetId = process.env.GOOGLE_SHEET_ID;
  if (googleSheetId) {
    const cacheAge = fs.existsSync(SHEET_CACHE)
      ? Date.now() - fs.statSync(SHEET_CACHE).mtimeMs
      : Infinity;
    if (cacheAge > 60 * 60 * 1000) {
      console.log('🔄 Syncing products from Google Sheets...');
      const sheetGid = process.env.GOOGLE_SHEET_GID || '0';
      const { spawnSync: sync } = await import('child_process');
      const result = sync(
        'node',
        ['scripts/asin-from-sheet.mjs', googleSheetId, sheetGid, SHEET_CACHE],
        { cwd: PROJECT, stdio: 'inherit' }
      );
      if (result.status !== 0) {
        console.warn('⚠️  Google Sheets sync failed — using cached/fallback product data');
      }
    } else {
      console.log(`✅ Google Sheets cache is fresh (age: ${Math.round(cacheAge / 60000)}m)`);
    }
  }

  const products = loadProducts();
  if (!products.length) {
    console.error('❌ No products found to generate videos for.');
    process.exit(1);
  }

  const selectedProducts = TARGET_PRODUCT_ID
    ? products.filter((product) => product.id === TARGET_PRODUCT_ID)
    : products;

  if (!selectedProducts.length) {
    console.error(`❌ No product matched --product ${TARGET_PRODUCT_ID}`);
    process.exit(1);
  }

  console.log(`📝 Found ${selectedProducts.length} products to process`);
  if (TARGET_PRODUCT_ID) {
    console.log(`🎯 Single product mode enabled: ${TARGET_PRODUCT_ID}`);
  }
  if (FORCE_REGENERATE) {
    console.log('♻️  Force regenerate enabled; existing videos will be replaced');
  }

  // Check for HeyGen API key
  const heygenApiKey = process.env.HEYGEN_API_KEY;
  
  if (!heygenApiKey || heygenApiKey === 'your_heygen_api_key') {
    console.log('⚠️  HeyGen API key not found, falling back to FFmpeg generation');
    await generateWithFFmpeg(selectedProducts);
    return;
  }

  try {
    // Initialize HeyGen generator
    const generator = new HeyGenVideoGenerator(heygenApiKey);
    console.log('✅ HeyGen API key detected');

    if (shouldSkipHeyGenPreflight()) {
      console.log('⚠️  Skipping HeyGen preflight because HEYGEN_SKIP_PREFLIGHT=1');
    } else {
      const preflightTimeoutMs = getHeyGenPreflightTimeoutMs();
      const preflight = await checkHeyGenReachability(heygenApiKey, preflightTimeoutMs);
      if (!preflight.ok) {
        const message = `⚠️  HeyGen preflight failed: ${preflight.message}${preflight.status ? ` (status ${preflight.status})` : ''}`;
        if (isHeyGenPreflightStrict()) {
          console.error(message);
          console.log('🔄 Falling back to FFmpeg generation...');
          await generateWithFFmpeg(selectedProducts);
          return;
        }
        console.warn(`${message} — continuing with HeyGen generation attempt`);
      } else {
        console.log('✅ HeyGen preflight check passed');
      }
    }

    ensureDir(OUT_DIR);
    const results = [];
    const asinMap = loadAsinScriptsMap();

    for (const product of selectedProducts) {
      // Skip if a real product video already exists — never overwrite existing footage
      const existingVideo = path.join(OUT_DIR, `${product.id}.mp4`);
      if (!FORCE_REGENERATE && fs.existsSync(existingVideo) && fs.statSync(existingVideo).size > 100000) {
        console.log(`⏭️  Skipping ${product.id} — real video already exists (${Math.round(fs.statSync(existingVideo).size / 1024)}KB)`);
        continue;
      }

      try {
        console.log(`\n🎥 Generating AI video for: ${product.name}`);

        const productForGeneration = { ...product, videoScript: buildLockedScript(product, asinMap) };

        const keywordList = Array.isArray(product.keywords) ? product.keywords.filter(Boolean) : [];
        const descriptionText = String(product.description || '').trim();
        const primaryImage = getPrimaryProductImage(product);
        const publicProductImage = toPublicAssetUrl(primaryImage);

        if (descriptionText) {
          console.log(`   🧾 Sheet description detected (${descriptionText.length} chars)`);
        }
        if (keywordList.length) {
          console.log(`   🔑 Sheet keywords: ${keywordList.join(', ')}`);
        }
        if (publicProductImage) {
          console.log(`   🖼️  HeyGen background image: ${publicProductImage}`);
        }

        const result = await generator.generateProductVideo(productForGeneration, OUT_DIR, {
          productImage: publicProductImage,
        });

        try {
          const enhanced = enhanceHeyGenVideoWithBroll(result.videoPath, product);
          if (enhanced) {
            console.log(`   🎞️  Added b-roll/product image overlays for ${product.id}`);
          }
        } catch (enhanceError) {
          console.warn(`   ⚠️  B-roll enhancement failed for ${product.id}: ${enhanceError.message}`);
        }

        results.push(result);
        
        console.log(`✅ ${product.id} -> ${path.relative(PROJECT, result.videoPath)}`);
        console.log(`   📊 Duration: ${result.duration}s`);
        
        // Add delay between requests to be nice to the API
        await new Promise(resolve => setTimeout(resolve, 5000));
        
      } catch (error) {
        console.error(`❌ Failed to generate video for ${product.id}: ${error.message}`);
        
        // Try FFmpeg fallback for this product
        try {
          console.log(`🔄 Attempting FFmpeg fallback for ${product.id}...`);
          const fallbackResult = await generateSingleVideoWithFFmpeg(product);
          results.push(fallbackResult);
        } catch (fallbackError) {
          console.error(`❌ FFmpeg fallback also failed: ${fallbackError.message}`);
        }
      }
    }

    console.log('\n🎉 Video Generation Complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Summary:');
    
    results.forEach(result => {
      const relativePath = path.relative(PROJECT, result.videoPath || result.out?.mp4);
      console.log(`✅ ${result.productId}: ${relativePath}`);
    });

    console.log(`\n🎯 Generated ${results.length}/${selectedProducts.length} videos successfully`);

  } catch (error) {
    console.error(`❌ HeyGen generation failed: ${error.message}`);
    console.log('🔄 Falling back to FFmpeg generation...');
    await generateWithFFmpeg(selectedProducts);
  }
}

// FFmpeg fallback generation
async function generateWithFFmpeg(products) {
  console.log('🎬 Using FFmpeg for video generation...');
  
  if (!hasFfmpeg()) {
    console.error('❌ Error: FFmpeg is not installed and HeyGen is unavailable.');
    console.error('   Please either:');
    console.error('   1. Add HEYGEN_API_KEY to your environment, or');
    console.error('   2. Install FFmpeg for local generation');
    process.exit(1);
  }

  let asinMap = {};
  let cfg = {};
  
  try {
    if (fs.existsSync(ASIN_SCRIPTS)) {
      asinMap = JSON.parse(fs.readFileSync(ASIN_SCRIPTS, 'utf8'));
    }
  } catch (e) {
    console.warn('Warning: Failed to read asin-scripts.json:', e.message);
  }
  
  try {
    if (fs.existsSync(VIDEO_CONFIG)) {
      cfg = JSON.parse(fs.readFileSync(VIDEO_CONFIG, 'utf8'));
    }
  } catch (e) {
    console.warn('Warning: Failed to read video-config.json:', e.message);
  }

  ensureDir(OUT_DIR);
  const results = [];
  
  for (const product of products) {
    // Skip if a real product video already exists — never overwrite existing footage
    const existingVideo = path.join(OUT_DIR, `${product.id}.mp4`);
    if (!FORCE_REGENERATE && fs.existsSync(existingVideo) && fs.statSync(existingVideo).size > 100000) {
      console.log(`⏭️  Skipping ${product.id} — real video already exists`);
      continue;
    }
    try {
      const out = buildVideoForProduct(product, asinMap, cfg);
      results.push({ productId: product.id, out });
      console.log(`✅ FFmpeg: ${product.id} -> ${path.relative(PROJECT, out.mp4)}`);
    } catch (e) {
      console.error(`❌ FFmpeg failed for ${product.id}: ${e.message}`);
    }
  }
  
  console.log('\n📊 FFmpeg Results:');
  results.forEach(r => {
    console.log(`- ${r.productId}: ${path.relative(PROJECT, r.out.mp4)} | ${path.relative(PROJECT, r.out.webm)} | ${path.relative(PROJECT, r.out.poster)}`);
  });

  return results;
}

// Single product FFmpeg generation (for fallback)
async function generateSingleVideoWithFFmpeg(product) {
  let asinMap = {};
  let cfg = {};
  
  try {
    if (fs.existsSync(ASIN_SCRIPTS)) {
      asinMap = JSON.parse(fs.readFileSync(ASIN_SCRIPTS, 'utf8'));
    }
  } catch {
    // Ignore errors loading asin-scripts.json
  }
  
  try {
    if (fs.existsSync(VIDEO_CONFIG)) {
      cfg = JSON.parse(fs.readFileSync(VIDEO_CONFIG, 'utf8'));
    }
  } catch {
    // Ignore errors loading video-config.json
  }

  const out = buildVideoForProduct(product, asinMap, cfg);
  return { productId: product.id, videoPath: out.mp4, out };
}

main().catch(error => {
  console.error('❌ Video generation failed:', error);
  process.exit(1);
});
