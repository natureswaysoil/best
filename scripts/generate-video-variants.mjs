#!/usr/bin/env node
/**
 * Generate 3 video variants per product for A/B testing.
 *
 * Variants:
 * A = TikTok/Reels/Shorts problem hook
 * B = Demo/proof/education
 * C = Amazon listing/product-page format
 *
 * This script creates metadata and scripts first. Rendering can then consume these
 * records to create variant-specific videos.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadProductsFromGoogleSheetCsv } from './google-sheet-products-loader.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT = path.resolve(__dirname, '..');
const SHEET_CACHE = path.join(PROJECT, 'content', 'video-scripts', 'sheet-products.json');
const VARIANT_DIR = path.join(PROJECT, 'content', 'video-variants');
const VARIANT_FILE = path.join(VARIANT_DIR, 'variants.json');
const PERFORMANCE_DIR = path.join(PROJECT, 'content', 'performance');
const PERFORMANCE_FILE = path.join(PERFORMANCE_DIR, 'video-performance.json');
const DATA_FILE = path.join(PROJECT, 'data', 'products.ts');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

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
const FORCE = process.argv.includes('--force') || process.env.VIDEO_VARIANTS_FORCE === '1';

function normalizeWhitespace(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function truncate(value, maxLen) {
  const text = normalizeWhitespace(value);
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen - 1).trimEnd()}…`;
}

function parseDelimitedList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item) => String(item || '').trim()).filter(Boolean);
  return String(value).split(/[|,\n]/).map((item) => item.trim()).filter(Boolean);
}

function loadFallbackProducts() {
  const ts = fs.readFileSync(DATA_FILE, 'utf8');
  const products = [];
  const productBlocks = ts.split(/\n\s*},\s*\n\s*{\s*id:/).map((block, idx) => (idx === 0 ? block : '{ id:' + block));

  for (const block of productBlocks) {
    const idMatch = block.match(/id:\s*'([^']+)'/);
    const nameMatch = block.match(/name:\s*'([^']+)'/);
    const categoryMatch = block.match(/category:\s*'([^']+)'/);
    const descMatch = block.match(/description:\s*'([^']+)'/);
    const usageMatch = block.match(/usage:\s*\[(.*?)\]/s);
    const asinMatch = block.match(/asin:\s*'([^']+)'/);
    const imageMatch = block.match(/image:\s*'([^']+)'/);

    if (!idMatch || !nameMatch) continue;

    let usage = [];
    if (usageMatch) usage = Array.from(usageMatch[1].matchAll(/'([^']+)'/g)).map((m) => m[1]);

    products.push({
      id: idMatch[1],
      name: nameMatch[1],
      category: categoryMatch ? categoryMatch[1] : 'General',
      description: descMatch ? descMatch[1] : '',
      usage,
      asin: asinMatch ? asinMatch[1] : null,
      image: imageMatch ? imageMatch[1] : null,
      keywords: [],
      brollImages: [],
    });
  }

  return products.filter((p) => /^NWS_\d{3}$/.test(p.id));
}

async function loadProducts() {
  if (process.env.GOOGLE_SHEET_CSV_URL) {
    console.log('🌐 Loading products from GOOGLE_SHEET_CSV_URL');
    const products = await loadProductsFromGoogleSheetCsv(process.env.GOOGLE_SHEET_CSV_URL, SHEET_CACHE);
    if (products.length) {
      console.log(`📊 Found ${products.length} products from Google Sheet`);
      return products;
    }
  }

  if (fs.existsSync(SHEET_CACHE)) {
    const sheetData = JSON.parse(fs.readFileSync(SHEET_CACHE, 'utf8'));
    if (Array.isArray(sheetData.products) && sheetData.products.length) {
      console.log(`📊 Using cached Google Sheet products (${sheetData.products.length})`);
      return sheetData.products;
    }
  }

  console.log('📦 Loading products from data/products.ts');
  return loadFallbackProducts();
}

function categoryProblem(product) {
  const category = String(product.category || '').toLowerCase();
  const name = String(product.name || '').toLowerCase();
  const text = `${category} ${name}`;

  if (text.includes('dog') || text.includes('urine') || text.includes('pet')) {
    return {
      problem: 'yellow dog urine spots',
      hook: 'Dog urine spots are not just a grass problem — they start in the soil.',
      promise: 'support lawn recovery at the soil level without using a green dye',
      visual: 'yellow lawn spot, dog-safe backyard, product application, greener regrowth',
    };
  }

  if (text.includes('compost') || text.includes('biochar') || text.includes('soil')) {
    return {
      problem: 'tired, compacted soil',
      hook: 'If your plants look weak, the problem may be tired soil — not bad plants.',
      promise: 'improve soil structure, root contact, and moisture holding power',
      visual: 'dark compost, roots, raised bed, healthy vegetables, soil close-up',
    };
  }

  if (text.includes('kelp') || text.includes('humic') || text.includes('fertilizer') || text.includes('lawn')) {
    return {
      problem: 'thin or slow-growing lawns and plants',
      hook: 'If your lawn is not responding, it may need soil support — not just more fertilizer.',
      promise: 'support stronger roots, better nutrient uptake, and steady green growth',
      visual: 'lush lawn, watering can, roots, bottle close-up, healthy garden',
    };
  }

  return {
    problem: 'weak plant growth',
    hook: 'Healthier plants start with healthier soil.',
    promise: 'feed the soil so plants can perform naturally',
    visual: 'organic garden, healthy soil, green plants, bottle application',
  };
}

function buildAmazonTitle(product) {
  return truncate(`${product.name} | How to Use | Nature's Way Soil`, 95);
}

function buildVariants(product) {
  const insight = categoryProblem(product);
  const usage = Array.isArray(product.usage) && product.usage[0]
    ? product.usage[0]
    : 'Mix with water and apply evenly as directed on the label.';
  const shortName = truncate(product.name, 56);
  const productUrl = `https://www.natureswaysoil.com/product/${product.id}`;

  return [
    {
      productId: product.id,
      variant: 'A',
      format: 'tiktok_hook',
      outputName: `${product.id}_A_tiktok.mp4`,
      targetPlatforms: ['tiktok', 'instagram_reels', 'youtube_shorts', 'facebook_reels'],
      hook: insight.hook,
      firstTwoSeconds: insight.hook,
      script: `${insight.hook} ${shortName} is made to ${insight.promise}. Apply it as part of your regular lawn and soil care routine. ${usage} Feed the soil first, and the grass or plants have a better chance to bounce back naturally. Visit Nature's Way Soil to learn more.`,
      visualDirection: `Fast opening text over ${insight.visual}. Keep the avatar small or off to the side. Show product bottle and application moment early.`,
      caption: `${insight.hook} ${shortName} helps ${insight.promise}. Shop: ${productUrl}`,
      hashtags: ['#lawncare', '#gardening', '#soilhealth', '#organicgardening', '#natureswaysoil'],
      cta: productUrl,
    },
    {
      productId: product.id,
      variant: 'B',
      format: 'demo_proof',
      outputName: `${product.id}_B_demo.mp4`,
      targetPlatforms: ['instagram_reels', 'facebook', 'youtube_shorts'],
      hook: `Here is a simple way to deal with ${insight.problem}.`,
      firstTwoSeconds: `Stop guessing with ${insight.problem}.`,
      script: `Here is a simple way to deal with ${insight.problem}. Start with the soil, not just the surface. ${shortName} helps ${insight.promise}. ${usage} Use it consistently during active growth and give the soil time to respond. Nature's Way Soil is built for people who want natural, practical lawn and garden care.`,
      visualDirection: `Demonstration style. Show before/problem image, product close-up, mixing or application, then healthier soil/lawn/garden visual.`,
      caption: `A simple soil-first routine for ${insight.problem}. ${shortName}. Learn more: ${productUrl}`,
      hashtags: ['#lawncaretips', '#gardenroutine', '#soilfirst', '#organicsoil', '#natureswaysoil'],
      cta: productUrl,
    },
    {
      productId: product.id,
      variant: 'C',
      format: 'amazon_listing',
      outputName: `${product.id}_C_amazon.mp4`,
      targetPlatforms: ['amazon_listing', 'youtube', 'facebook'],
      hook: `${shortName} from Nature's Way Soil.`,
      firstTwoSeconds: `${shortName}`,
      script: `${shortName} from Nature's Way Soil is designed for practical lawn, garden, and soil care. It helps ${insight.promise}. ${usage} Use according to the label directions and repeat as needed during the growing season. For best results, pair good watering habits with regular soil care. Nature's Way Soil: naturally stronger soil starts here.`,
      visualDirection: `Amazon-safe product listing format. Clean product close-up, benefit callouts, usage cue, no exaggerated guaranteed claims, no competitor mention, no discount language.`,
      caption: `${buildAmazonTitle(product)}. Learn more: ${productUrl}`,
      hashtags: [],
      cta: productUrl,
      amazon: {
        title: buildAmazonTitle(product),
        safeClaims: [
          'Supports soil health',
          'Helps root performance',
          'Easy to apply as directed',
          'For lawn and garden care',
        ],
        avoidClaims: [
          'guaranteed results',
          'kills pests',
          'cures disease',
          'instant repair',
        ],
      },
    },
  ];
}

function loadJsonFile(file, fallback) {
  try {
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {}
  return fallback;
}

function initPerformanceRecord(variant) {
  return {
    productId: variant.productId,
    variant: variant.variant,
    format: variant.format,
    outputName: variant.outputName,
    hook: variant.hook,
    createdAt: new Date().toISOString(),
    status: 'planned',
    posted: {
      youtube: null,
      facebook: null,
      instagram: null,
      tiktok: null,
      amazon: null,
    },
    metrics: {
      views: 0,
      plays: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      clicks: 0,
      ordersAttributed: 0,
      revenueAttributed: 0,
    },
  };
}

async function main() {
  ensureDir(VARIANT_DIR);
  ensureDir(PERFORMANCE_DIR);

  const products = await loadProducts();
  const selected = TARGET_PRODUCT_ID
    ? products.filter((product) => product.id === TARGET_PRODUCT_ID)
    : products;

  if (!selected.length) {
    console.error(`❌ No products matched${TARGET_PRODUCT_ID ? ` ${TARGET_PRODUCT_ID}` : ''}`);
    process.exit(1);
  }

  const existingVariants = loadJsonFile(VARIANT_FILE, { generatedAt: null, variants: [] });
  const existingPerformance = loadJsonFile(PERFORMANCE_FILE, { generatedAt: null, records: [] });

  const variantKey = (v) => `${v.productId}:${v.variant}`;
  const variantMap = new Map((existingVariants.variants || []).map((v) => [variantKey(v), v]));
  const performanceMap = new Map((existingPerformance.records || []).map((r) => [variantKey(r), r]));

  let created = 0;
  let skipped = 0;

  for (const product of selected) {
    const variants = buildVariants(product);
    for (const variant of variants) {
      const key = variantKey(variant);
      if (!FORCE && variantMap.has(key)) {
        skipped += 1;
        continue;
      }

      variantMap.set(key, {
        ...variant,
        productName: product.name,
        category: product.category || 'General',
        asin: product.asin || null,
        image: product.image || null,
        brollImages: parseDelimitedList(product.brollImages),
        generatedAt: new Date().toISOString(),
      });

      if (!performanceMap.has(key) || FORCE) {
        performanceMap.set(key, initPerformanceRecord(variant));
      }

      created += 1;
    }
  }

  const finalVariants = Array.from(variantMap.values()).sort((a, b) => `${a.productId}${a.variant}`.localeCompare(`${b.productId}${b.variant}`));
  const finalPerformance = Array.from(performanceMap.values()).sort((a, b) => `${a.productId}${a.variant}`.localeCompare(`${b.productId}${b.variant}`));

  fs.writeFileSync(VARIANT_FILE, JSON.stringify({
    generatedAt: new Date().toISOString(),
    count: finalVariants.length,
    variants: finalVariants,
  }, null, 2));

  fs.writeFileSync(PERFORMANCE_FILE, JSON.stringify({
    generatedAt: new Date().toISOString(),
    count: finalPerformance.length,
    records: finalPerformance,
  }, null, 2));

  console.log('✅ Video variant plan generated');
  console.log(`   Products processed: ${selected.length}`);
  console.log(`   Variants created/updated: ${created}`);
  console.log(`   Variants skipped: ${skipped}`);
  console.log(`   Variant file: ${path.relative(PROJECT, VARIANT_FILE)}`);
  console.log(`   Performance file: ${path.relative(PROJECT, PERFORMANCE_FILE)}`);
}

main().catch((error) => {
  console.error(`❌ ${error.message}`);
  process.exit(1);
});
