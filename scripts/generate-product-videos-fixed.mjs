#!/usr/bin/env node
/**
 * Runtime patch wrapper for scripts/generate-product-videos.mjs.
 *
 * Fixes FFmpeg b-roll enhancement and upgrades the enhancement layer to use
 * moving Pexels video clips instead of static product image overlays.
 *
 * Required for Pexels mode:
 *   PEXELS_API_KEY=your_pexels_key
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sourcePath = path.join(__dirname, 'generate-product-videos.mjs');
const runtimePath = path.join(__dirname, '.generate-product-videos.runtime.mjs');

let source = fs.readFileSync(sourcePath, 'utf8');

const pexelsEnhancer = String.raw`function enhanceHeyGenVideoWithBroll(videoPath, prod) {
  console.log([96m[1m` + '`   🎥 Pexels b-roll enhancement active for ${prod.id}`' + `[0m);

  if (!hasFfmpeg()) {
    console.log(` + '`   ⚠️  FFmpeg not available, skipping Pexels b-roll enhancement for ${prod.id}`' + `);
    return false;
  }

  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    console.log(` + '`   ⚠️  PEXELS_API_KEY not set, skipping Pexels b-roll for ${prod.id}`' + `);
    return false;
  }

  const safeSlug = (value) => String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'broll';

  const text = [prod.name, prod.category, prod.description, ...(Array.isArray(prod.keywords) ? prod.keywords : [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const querySet = new Set();
  const add = (q) => {
    if (q && typeof q === 'string') querySet.add(q.trim());
  };

  if (/dog|urine|yellow spot|pet/.test(text)) {
    add('green lawn dog backyard');
    add('repairing lawn grass close up');
    add('healthy backyard grass');
  } else if (/hay|pasture|forage|horse|livestock|farm/.test(text)) {
    add('green pasture field');
    add('tractor spraying field');
    add('cattle grazing green pasture');
  } else if (/tomato|vegetable|transplant/.test(text)) {
    add('tomato plants garden close up');
    add('vegetable garden watering plants');
    add('healthy tomato plant greenhouse');
  } else if (/orchid|african violet|indoor|houseplant|potting/.test(text)) {
    add('indoor houseplant care');
    add('orchid flowers close up');
    add('potting plants indoor');
  } else if (/hydroponic|aquaponic|greenhouse/.test(text)) {
    add('hydroponic greenhouse plants');
    add('greenhouse vegetable plants');
    add('water growing plants hydroponics');
  } else if (/fruit|tree|apple|peach|citrus|bloom/.test(text)) {
    add('fruit tree orchard');
    add('watering fruit tree roots');
    add('apple tree blossoms');
  } else if (/compost|biochar|worm|soil/.test(text)) {
    add('rich garden soil close up');
    add('gardener adding compost to soil');
    add('healthy garden plants soil');
  } else if (/kelp|seaweed|humic|fulvic/.test(text)) {
    add('lush green garden plants');
    add('watering plants garden close up');
    add('healthy plant roots soil');
  }

  if (Array.isArray(prod.keywords)) {
    for (const kw of prod.keywords.slice(0, 3)) add(`${kw} garden plants`);
  }

  add('healthy garden plants sunlight');
  add('green lawn garden plants');

  const queries = Array.from(querySet).slice(0, Number(process.env.PEXELS_BROLL_QUERY_LIMIT || 5));
  const maxClips = Math.max(1, Number(process.env.PEXELS_BROLL_CLIP_COUNT || 3));
  const downloaded = [];

  for (const query of queries) {
    if (downloaded.length >= maxClips) break;

    const searchUrl = `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&orientation=landscape&per_page=8`;
    const search = spawnSync('curl', ['-fsSL', '--max-time', '25', '-H', `Authorization: ${apiKey}`, searchUrl], {
      encoding: 'utf8',
      maxBuffer: 12 * 1024 * 1024,
    });

    if (search.status !== 0 || !search.stdout) {
      console.log(`   ⚠️  Pexels search failed for "${query}"`);
      continue;
    }

    let data;
    try {
      data = JSON.parse(search.stdout);
    } catch {
      console.log(`   ⚠️  Could not parse Pexels response for "${query}"`);
      continue;
    }

    const videos = Array.isArray(data?.videos) ? data.videos : [];
    const files = videos.flatMap((video) => Array.isArray(video.video_files) ? video.video_files : []);
    const selected =
      files.find((file) => file?.link && file.quality === 'hd' && Number(file.width || 0) >= 1280) ||
      files.find((file) => file?.link && file.quality === 'sd') ||
      files.find((file) => file?.link);

    if (!selected?.link) {
      console.log(`   ⚠️  No Pexels clip found for "${query}"`);
      continue;
    }

    const clipPath = path.join(os.tmpdir(), `${prod.id}_pexels_${downloaded.length}_${safeSlug(query)}.mp4`);
    const download = spawnSync('curl', ['-fsSL', '--max-time', '75', selected.link, '-o', clipPath], { stdio: 'ignore' });

    if (download.status === 0 && fs.existsSync(clipPath) && fs.statSync(clipPath).size > 0) {
      downloaded.push({ path: clipPath, query });
      console.log(`   ✅ Pexels b-roll clip ${downloaded.length}: ${query}`);
    }
  }

  if (!downloaded.length) {
    console.log(`   ⚠️  No usable Pexels b-roll clips found for ${prod.id}`);
    return false;
  }

  const tempOutput = `${videoPath}.pexels-broll.mp4`;
  const videoInputs = downloaded.flatMap((clip) => ['-stream_loop', '-1', '-i', clip.path]);
  const overlays = [];
  const segmentStart = Number(process.env.PEXELS_BROLL_START_SECONDS || 2);
  const segmentEnd = Number(process.env.PEXELS_BROLL_END_SECONDS || 28);
  const segmentSpan = Math.max(3, (segmentEnd - segmentStart) / downloaded.length);

  overlays.push('[0:v]scale=1280:720,format=yuv420p[v0]');

  let lastLabel = '[v0]';
  downloaded.forEach((clip, idx) => {
    const inputLabel = `[${idx + 1}:v]`;
    const scaledLabel = `[b${idx}]`;
    const outputLabel = idx === downloaded.length - 1 ? '[vout]' : `[v${idx + 1}]`;
    const start = (segmentStart + idx * segmentSpan).toFixed(2);
    const end = (idx === downloaded.length - 1 ? segmentEnd : (segmentStart + (idx + 1) * segmentSpan)).toFixed(2);

    overlays.push(`${inputLabel}scale=460:258:force_original_aspect_ratio=increase,crop=460:258,setsar=1,format=rgba,colorchannelmixer=aa=0.92,setpts=PTS-STARTPTS${scaledLabel}`);
    overlays.push(`${lastLabel}${scaledLabel}overlay=x='W-w-28':y='28':enable='between(t,${start},${end})'${outputLabel}`);
    lastLabel = outputLabel;
  });

  const args = [
    'ffmpeg', '-y',
    '-i', videoPath,
    ...videoInputs,
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
      downloaded.forEach((clip) => {
        if (fs.existsSync(clip.path)) fs.unlinkSync(clip.path);
      });
    } catch {}
    throw new Error(`ffmpeg Pexels b-roll enhancement failed for ${prod.id}`);
  }

  fs.renameSync(tempOutput, videoPath);
  downloaded.forEach((clip) => {
    try {
      if (fs.existsSync(clip.path)) fs.unlinkSync(clip.path);
    } catch {}
  });

  return true;
}
`;

const originalEnhancerPattern = /function enhanceHeyGenVideoWithBroll\(videoPath, prod\) \{[\s\S]*?\n\}\n\nfunction makeSegments/;
if (!originalEnhancerPattern.test(source)) {
  console.warn('⚠️  Could not find b-roll enhancer function; running original script unchanged.');
} else {
  source = source.replace(originalEnhancerPattern, `${pexelsEnhancer}\nfunction makeSegments`);
}

fs.writeFileSync(runtimePath, source, 'utf8');

const result = spawnSync(process.execPath, [runtimePath, ...process.argv.slice(2)], {
  cwd: path.resolve(__dirname, '..'),
  stdio: 'inherit',
  env: {
    ...process.env,
    NWS_FFMPEG_BROLL_PATCHED: '1',
    NWS_PEXELS_BROLL: '1',
  },
});

try {
  if (fs.existsSync(runtimePath)) fs.unlinkSync(runtimePath);
} catch {}

process.exit(result.status ?? 1);
