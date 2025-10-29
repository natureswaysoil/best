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

function loadProducts() {
  const ts = fs.readFileSync(DATA_FILE, 'utf8');
  const entries = [];
  const productBlocks = ts.split(/\n\s*},\s*\n\s*{\s*id:/).map((block, idx) => (idx === 0 ? block : '{ id:' + block));
  for (const block of productBlocks) {
    const idMatch = block.match(/id:\s*'([^']+)'/);
    const nameMatch = block.match(/name:\s*'([^']+)'/);
    const usageMatch = block.match(/usage:\s*\[(.*?)\]/s);
    const asinMatch = block.match(/asin:\s*'([^']+)'/);
    const categoryMatch = block.match(/category:\s*'([^']+)'/);
    if (!idMatch || !nameMatch) continue;
    const id = idMatch[1];
    const name = nameMatch[1];
    const category = categoryMatch ? categoryMatch[1] : '';
    const asin = asinMatch ? asinMatch[1] : undefined;
    let usage = [];
    if (usageMatch) {
      const inner = usageMatch[1];
      usage = Array.from(inner.matchAll(/'([^']+)'/g)).map(m => m[1]);
    }
    entries.push({ id, name, category, usage, asin });
  }
  return entries.filter(e => /^NWS_\d{3}$/.test(e.id));
}

function sanitize(text) {
  return text.replace(/:/g, '\u2236');
}

function makeSegments(prod, asinMap) {
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
  return [
    { start: 0, end: 5, text: intro },
    { start: 5, end: 10, text: safeSteps[0] || 'Shake well before use.\nMix with water as directed.' },
    { start: 10, end: 15, text: safeSteps[1] || 'Apply to soil around roots\nor spray foliage as recommended.' },
    { start: 15, end: 20, text: safeSteps[2] || 'Repeat on schedule for best results.' },
    { start: 20, end: 25, text: tip },
    { start: 25, end: 30, text: cta },
  ];
}

function buildVideoForProduct(prod, asinMap, cfg) {
  const segments = makeSegments(prod, asinMap);
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
    '-frames:v','1','-q:v','3', outPosterJpg
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

  const products = loadProducts();
  if (!products.length) {
    console.error('❌ No products found to generate videos for.');
    process.exit(1);
  }

  console.log(`📝 Found ${products.length} products to process`);

  // Check for HeyGen API key
  const heygenApiKey = process.env.HEYGEN_API_KEY;
  
  if (!heygenApiKey || heygenApiKey === 'your_heygen_api_key') {
    console.log('⚠️  HeyGen API key not found, falling back to FFmpeg generation');
    await generateWithFFmpeg(products);
    return;
  }

  try {
    // Initialize HeyGen generator
    const generator = new HeyGenVideoGenerator(heygenApiKey);
    console.log('✅ HeyGen API connected successfully');

    ensureDir(OUT_DIR);
    const results = [];

    for (const product of products) {
      try {
        console.log(`\n🎥 Generating AI video for: ${product.name}`);
        
        const result = await generator.generateProductVideo(product, OUT_DIR);
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

    console.log(`\n🎯 Generated ${results.length}/${products.length} videos successfully`);

  } catch (error) {
    console.error(`❌ HeyGen generation failed: ${error.message}`);
    console.log('🔄 Falling back to FFmpeg generation...');
    await generateWithFFmpeg(products);
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
