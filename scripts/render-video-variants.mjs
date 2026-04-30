#!/usr/bin/env node
/**
 * Render planned video variants from content/video-variants/variants.json.
 *
 * Usage:
 *   node scripts/render-video-variants.mjs --product NWS_001
 *   node scripts/render-video-variants.mjs --product NWS_001 --variant A
 *   node scripts/render-video-variants.mjs --limit 3
 *   node scripts/render-video-variants.mjs --force
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import HeyGenVideoGenerator from './heygen-video-generator.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT = path.resolve(__dirname, '..');
const VARIANT_FILE = path.join(PROJECT, 'content', 'video-variants', 'variants.json');
const PERFORMANCE_FILE = path.join(PROJECT, 'content', 'performance', 'video-performance.json');
const OUT_DIR = path.join(PROJECT, 'public', 'videos');

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
const TARGET_VARIANT = readArgValue('--variant') || process.env.VIDEO_VARIANT || null;
const LIMIT = Number(readArgValue('--limit') || process.env.VIDEO_VARIANT_LIMIT || 0);
const FORCE = process.argv.includes('--force') || process.env.VIDEO_VARIANTS_FORCE === '1';

function loadJson(file, fallback) {
  try {
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {}
  return fallback;
}

function saveJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function toPublicAssetUrl(assetPath) {
  if (!assetPath || typeof assetPath !== 'string') return null;
  if (/^https?:\/\//i.test(assetPath)) return assetPath;
  const base = (process.env.VIDEO_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://natureswaysoil.com').replace(/\/$/, '');
  const normalized = assetPath.startsWith('/') ? assetPath : `/${assetPath}`;
  return `${base}${normalized}`;
}

function getVariantImage(variant) {
  if (variant.image) return toPublicAssetUrl(variant.image);
  if (Array.isArray(variant.brollImages) && variant.brollImages.length > 0) return toPublicAssetUrl(variant.brollImages[0]);
  return `${(process.env.VIDEO_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://natureswaysoil.com').replace(/\/$/, '')}/images/products/${variant.productId}/main.jpg`;
}

function formatTitle(variant) {
  const suffix = {
    A: 'TikTok Hook',
    B: 'Demo',
    C: 'Amazon Listing',
  }[variant.variant] || `Variant ${variant.variant}`;
  return `${variant.productName || variant.productId} - ${suffix}`;
}

function buildProductPayload(variant) {
  return {
    id: `${variant.productId}_${variant.variant}`,
    name: variant.productName || variant.productId,
    category: variant.category || 'General',
    asin: variant.asin || null,
    image: variant.image || null,
    brollImages: variant.brollImages || [],
    description: variant.hook || variant.caption || '',
    videoScript: variant.script,
    heygenAvatarId: variant.heygenAvatarId || null,
    heygenVoiceId: variant.heygenVoiceId || null,
    keywords: variant.hashtags || [],
  };
}

function updatePerformance(variant, patch) {
  const perf = loadJson(PERFORMANCE_FILE, { generatedAt: null, count: 0, records: [] });
  const key = `${variant.productId}:${variant.variant}`;
  const records = Array.isArray(perf.records) ? perf.records : [];
  let record = records.find((item) => `${item.productId}:${item.variant}` === key);

  if (!record) {
    record = {
      productId: variant.productId,
      variant: variant.variant,
      format: variant.format,
      outputName: variant.outputName,
      hook: variant.hook,
      createdAt: new Date().toISOString(),
      posted: {},
      metrics: {},
    };
    records.push(record);
  }

  Object.assign(record, patch, { updatedAt: new Date().toISOString() });
  perf.records = records;
  perf.count = records.length;
  perf.generatedAt = new Date().toISOString();
  saveJson(PERFORMANCE_FILE, perf);
}

async function main() {
  if (!fs.existsSync(VARIANT_FILE)) {
    console.error('❌ Missing content/video-variants/variants.json. Run node scripts/generate-video-variants.mjs first.');
    process.exit(1);
  }

  if (!process.env.HEYGEN_API_KEY) {
    console.error('❌ HEYGEN_API_KEY not set. Load it from Google Secret Manager first.');
    process.exit(1);
  }

  const data = loadJson(VARIANT_FILE, { variants: [] });
  let variants = Array.isArray(data.variants) ? data.variants : [];

  if (TARGET_PRODUCT_ID) variants = variants.filter((variant) => variant.productId === TARGET_PRODUCT_ID);
  if (TARGET_VARIANT) variants = variants.filter((variant) => String(variant.variant).toUpperCase() === String(TARGET_VARIANT).toUpperCase());
  if (LIMIT > 0) variants = variants.slice(0, LIMIT);

  if (!variants.length) {
    console.error('❌ No variants matched the requested filters.');
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const generator = new HeyGenVideoGenerator(process.env.HEYGEN_API_KEY);

  console.log(`🎬 Rendering ${variants.length} video variant(s)`);

  for (const variant of variants) {
    const outPath = path.join(OUT_DIR, variant.outputName);
    if (fs.existsSync(outPath) && !FORCE) {
      console.log(`⏭️  Skipping existing ${variant.outputName}`);
      updatePerformance(variant, { status: 'rendered', videoPath: `public/videos/${variant.outputName}` });
      continue;
    }

    console.log(`\n🎥 Rendering ${variant.productId} variant ${variant.variant} (${variant.format})`);
    console.log(`   Hook: ${variant.hook}`);

    const productPayload = buildProductPayload(variant);
    const productImage = getVariantImage(variant);

    const result = await generator.generateProductVideo(productPayload, OUT_DIR, {
      productImage,
      background: '#0d3b2a',
    });

    const generatedPath = result.videoPath;
    if (!fs.existsSync(generatedPath)) {
      throw new Error(`Expected generated video missing: ${generatedPath}`);
    }

    fs.renameSync(generatedPath, outPath);
    updatePerformance(variant, {
      status: 'rendered',
      videoPath: `public/videos/${variant.outputName}`,
      heygenVideoUrl: result.videoUrl || null,
      duration: result.duration || null,
      renderedAt: new Date().toISOString(),
    });

    console.log(`✅ ${variant.outputName}`);
  }

  console.log('\n🎉 Variant rendering complete');
}

main().catch((error) => {
  console.error(`❌ ${error.message}`);
  process.exit(1);
});
