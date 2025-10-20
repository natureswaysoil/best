#!/usr/bin/env node
/**
 * Generate 30-second instructional videos for each product into public/videos.
 * Approach:
 * - Parse data/products.ts to extract id, name, and usage steps
 * - Build 6-slide, 5s-per-slide 1280x720 MP4 with text overlays
 * - Slides: Intro, 3 steps, Benefits/Notes, CTA
 * - Requires ffmpeg installed
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const PROJECT = path.resolve(__dirname, '..');
const DATA_FILE = path.join(PROJECT, 'data', 'products.ts');
const OUT_DIR = path.join(PROJECT, 'public', 'videos');

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

  // Very lightweight parser for the array entries. Not a full TS parser.
  const entries = [];
  const productBlocks = ts.split(/\n\s*},\s*\n\s*{\s*id:/).map((block, idx) => {
    // Reattach 'id:' for all but first
    if (idx === 0) return block; else return '{ id:' + block;
  });

  for (const block of productBlocks) {
    const idMatch = block.match(/id:\s*'([^']+)'/);
    const nameMatch = block.match(/name:\s*'([^']+)'/);
    const usageMatch = block.match(/usage:\s*\[(.*?)\]/s);
    const categoryMatch = block.match(/category:\s*'([^']+)'/);
    if (!idMatch || !nameMatch) continue;
    const id = idMatch[1];
    const name = nameMatch[1];
    const category = categoryMatch ? categoryMatch[1] : '';
    let usage = [];
    if (usageMatch) {
      const inner = usageMatch[1];
      usage = Array.from(inner.matchAll(/'([^']+)'/g)).map(m => m[1]);
    }
    entries.push({ id, name, category, usage });
  }

  // Filter out any junk entries not having a valid ID format
  return entries.filter(e => /^NWS_\d{3}$/.test(e.id));
}

function sanitize(text) {
  // Replace characters that ffmpeg drawtext might struggle with
  return text.replace(/:/g, '\u2236');
}

function makeSlides(prod) {
  const title = prod.name;
  const steps = (prod.usage || []).slice(0, 3);
  const safeSteps = steps.map(sanitize);
  const intro = `${title}`;
  const tip = prod.category ? `${prod.category} • Pet-safe • Easy to use` : 'Pet-safe • Easy to use';
  const cta = 'Mix with water • Apply • See results\nLearn more at NaturesWaySoil.com';
  const slides = [
    intro,
    safeSteps[0] || 'Shake well before use.\nMix with water as directed.',
    safeSteps[1] || 'Apply to soil around roots\nor spray foliage as recommended.',
    safeSteps[2] || 'Repeat on schedule for best results.',
    tip,
    cta,
  ];
  return slides;
}

function buildVideoForProduct(prod) {
  const slides = makeSlides(prod);
  const tmpDir = fs.mkdtempSync(path.join(require('os').tmpdir(), `nws_${prod.id}_`));
  const fontPathCandidates = [
    '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
  ];
  const fontPath = fontPathCandidates.find(f => fs.existsSync(f));
  if (!fontPath) {
    console.warn('Warning: DejaVu Sans font not found. drawtext may fail without fontfile.');
  }

  const common = {
    size: '1280x720',
    bg: '#0d3b2a', // deep green
    fontsize: 48,
    lineSpacing: 10,
    duration: 5, // seconds per slide
  };

  // Create slide videos
  const slideFiles = [];
  slides.forEach((text, idx) => {
    const slidePath = path.join(tmpDir, `slide_${idx + 1}.mp4`);
    // Write text to file to avoid ffmpeg drawtext escaping issues
    const textFile = path.join(tmpDir, `slide_${idx + 1}.txt`);
    // Normalize line breaks, remove problematic control chars
    const safeText = String(text)
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/[\t\u0000-\u001f\u007f]/g, ' ');
    fs.writeFileSync(textFile, safeText, 'utf8');
    const drawtext = [
      `fontcolor=white:fontsize=${common.fontsize}`,
      fontPath ? `fontfile=${fontPath}` : '',
      'box=1:boxcolor=#00000088:boxborderw=20',
      'x=(w-text_w)/2',
      'y=(h-text_h)/2',
      `line_spacing=${common.lineSpacing}`,
      `expansion=none`,
      `textfile=${textFile}`,
    ].filter(Boolean).join(':');

    const cmd = [
      'ffmpeg', '-y',
      '-f', 'lavfi', '-i', `color=c=${common.bg}:s=${common.size}:d=${common.duration}`,
      '-vf', `drawtext=${drawtext}`,
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-pix_fmt', 'yuv420p', '-r', '30',
      slidePath,
    ];
    const res = spawnSync(cmd[0], cmd.slice(1), { stdio: 'inherit' });
    if (res.status !== 0) {
      throw new Error(`ffmpeg failed making slide ${idx + 1} for ${prod.id}`);
    }
    slideFiles.push(slidePath);
  });

  // Create concat list
  const listPath = path.join(tmpDir, 'slides.txt');
  fs.writeFileSync(listPath, slideFiles.map(f => `file '${f.replace(/'/g, "'\\''")}'`).join('\n'));

  const outPath = path.join(OUT_DIR, `${prod.id}.mp4`);

  // Concat and re-encode to ensure a single clean stream
  const concatCmd = [
    'ffmpeg', '-y',
    '-f', 'concat', '-safe', '0', '-i', listPath,
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-pix_fmt', 'yuv420p', '-r', '30',
    outPath,
  ];
  const cres = spawnSync(concatCmd[0], concatCmd.slice(1), { stdio: 'inherit' });
  if (cres.status !== 0) {
    throw new Error(`ffmpeg concat failed for ${prod.id}`);
  }

  // Cleanup tmp (best-effort)
  try {
    slideFiles.forEach(f => fs.unlinkSync(f));
    fs.unlinkSync(listPath);
    fs.rmdirSync(tmpDir);
  } catch {}

  return outPath;
}

function main() {
  if (!hasFfmpeg()) {
    console.error('Error: ffmpeg is not installed. Please install ffmpeg and re-run.');
    process.exit(1);
  }

  ensureDir(OUT_DIR);
  const products = loadProducts();
  if (!products.length) {
    console.error('No products found to generate videos for.');
    process.exit(1);
  }
  console.log(`Generating 30s videos for ${products.length} products...`);
  const results = [];
  for (const p of products) {
    try {
      const out = buildVideoForProduct(p);
      results.push({ id: p.id, out });
      console.log(`✔ ${p.id} -> ${path.relative(PROJECT, out)}`);
    } catch (e) {
      console.error(`✖ Failed to build video for ${p.id}:`, e.message);
    }
  }

  console.log('\nDone. Generated files:');
  results.forEach(r => console.log(`- ${r.id}: ${path.relative(PROJECT, r.out)}`));
}

main();
