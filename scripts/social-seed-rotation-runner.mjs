#!/usr/bin/env node

/**
 * Seed video social rotation runner.
 *
 * Purpose:
 * - Use config/top-products.json as the single source of truth for the 5 seed videos.
 * - Post only the next product(s) in rotation instead of dumping every product at once.
 * - Preserve the existing social-media-auto-post.mjs integrations by feeding it a temporary
 *   sheet-products cache containing only the selected product.
 * - Allow repeat rotation by clearing the selected product from social-posted-content.json
 *   before each child run. Rotation history is stored separately.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT = path.resolve(__dirname, '..');
const TOP_PRODUCTS_FILE = path.join(PROJECT, 'config', 'top-products.json');
const VIDEOS_DIR = path.join(PROJECT, 'public', 'videos');
const PLANS_DIR = path.join(PROJECT, 'content', 'generated-videos');
const SHEET_PRODUCTS_FILE = path.join(PROJECT, 'content', 'video-scripts', 'sheet-products.json');
const POSTED_SOCIAL_FILE = path.join(PROJECT, 'social-posted-content.json');
const ROTATION_STATE_FILE = path.join(PROJECT, 'content', 'generated-videos', 'social-rotation-state.json');
const DEFAULT_CATEGORIES = {
  NWS_014: 'Lawn Repair',
  NWS_011: 'Soil Booster',
  NWS_013: 'Living Compost',
  NWS_021: 'Hay Pasture Lawn',
  NWS_018: 'Lawn Treatment'
};
const DEFAULT_KEYWORDS = {
  NWS_014: ['dog urine', 'yellow spots', 'lawn repair', 'pet safe'],
  NWS_011: ['humic acid', 'fulvic acid', 'kelp', 'soil health'],
  NWS_013: ['compost', 'worm castings', 'biochar', 'duckweed'],
  NWS_021: ['hay', 'pasture', 'lawn fertilizer', 'grass growth'],
  NWS_018: ['seaweed', 'humic acid', 'lawn', 'root zone']
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(file, fallback) {
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    console.warn(`[Seed Rotation] Could not read ${path.relative(PROJECT, file)}: ${error.message}`);
    return fallback;
  }
}

function writeJson(file, value) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function normalizeUrlPart(part) {
  return String(part || '').trim() || '';
}

function loadSeedProducts() {
  const top = readJson(TOP_PRODUCTS_FILE, { topProducts: [] });
  const products = Array.isArray(top.topProducts) ? top.topProducts : [];

  return products
    .filter((product) => product && product.id && /^NWS_\d{3}$/.test(product.id))
    .sort((a, b) => (a.priority || 999) - (b.priority || 999))
    .map((product) => {
      const planFile = path.join(PLANS_DIR, `${product.id}-quality-seed-plan.json`);
      const plan = readJson(planFile, {});
      const name = product.name || plan.productName || product.id;
      const funnelUrl = normalizeUrlPart(product.funnelUrl || plan.funnelUrl || `/product/${product.id}`);
      const checkoutUrl = normalizeUrlPart(product.checkoutUrl || plan.checkoutUrl || `/checkout?productId=${product.id}&coupon=SAVE15`);
      return {
        id: product.id,
        name,
        description: `${name}. Seed-style short video for Nature's Way Soil social media rotation. Shop direct and save 15 percent.`,
        category: DEFAULT_CATEGORIES[product.id] || 'Nature\'s Way Soil',
        keywords: DEFAULT_KEYWORDS[product.id] || [],
        funnelUrl,
        checkoutUrl,
        priority: product.priority || 999,
        videoPath: path.join(VIDEOS_DIR, `${product.id}.mp4`),
        posterPath: path.join(VIDEOS_DIR, `${product.id}.jpg`)
      };
    });
}

function productsWithVideos(products) {
  const available = [];
  for (const product of products) {
    if (fs.existsSync(product.videoPath) && fs.statSync(product.videoPath).size > 1000) {
      available.push(product);
    } else {
      console.log(`[Seed Rotation] Skipping ${product.id}; missing generated video at public/videos/${product.id}.mp4`);
    }
  }
  return available;
}

function loadState() {
  const fallback = { nextIndex: 0, cycle: 0, history: [] };
  const state = readJson(ROTATION_STATE_FILE, fallback);
  return {
    nextIndex: Number.isInteger(state.nextIndex) ? state.nextIndex : 0,
    cycle: Number.isInteger(state.cycle) ? state.cycle : 0,
    history: Array.isArray(state.history) ? state.history : []
  };
}

function selectRotationProducts(products, state) {
  if (process.env.SOCIAL_POST_ALL_SEED_PRODUCTS === '1') {
    return { selected: products, nextIndex: 0, cycle: state.cycle + 1 };
  }

  const requested = Number.parseInt(process.env.SOCIAL_PRODUCTS_PER_RUN || '1', 10);
  const perRun = Math.max(1, Math.min(products.length, Number.isFinite(requested) ? requested : 1));
  const selected = [];
  let index = state.nextIndex % products.length;
  let cycle = state.cycle;

  for (let i = 0; i < perRun; i++) {
    selected.push(products[index]);
    index = (index + 1) % products.length;
    if (index === 0) cycle += 1;
  }

  return { selected, nextIndex: index, cycle };
}

function backupSheetCache() {
  if (!fs.existsSync(SHEET_PRODUCTS_FILE)) return null;
  return fs.readFileSync(SHEET_PRODUCTS_FILE, 'utf8');
}

function restoreSheetCache(original) {
  if (original === null) {
    if (fs.existsSync(SHEET_PRODUCTS_FILE)) fs.unlinkSync(SHEET_PRODUCTS_FILE);
    return;
  }
  ensureDir(path.dirname(SHEET_PRODUCTS_FILE));
  fs.writeFileSync(SHEET_PRODUCTS_FILE, original, 'utf8');
}

function writeSelectedSheetProduct(product) {
  writeJson(SHEET_PRODUCTS_FILE, {
    generatedBy: 'scripts/social-seed-rotation-runner.mjs',
    generatedAt: new Date().toISOString(),
    products: [
      {
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        keywords: product.keywords,
        funnelUrl: product.funnelUrl,
        checkoutUrl: product.checkoutUrl
      }
    ]
  });
}

function allowRepostForProduct(productId) {
  if (process.env.SOCIAL_ROTATION_ALLOW_REPOST === '0') return;
  const posted = readJson(POSTED_SOCIAL_FILE, null);
  if (!posted || typeof posted !== 'object') return;

  let changed = false;
  for (const platform of Object.keys(posted)) {
    if (posted[platform] && posted[platform][productId]) {
      delete posted[platform][productId];
      changed = true;
    }
  }

  if (changed) {
    writeJson(POSTED_SOCIAL_FILE, posted);
    console.log(`[Seed Rotation] Cleared old posted markers for ${productId} so it can repost in this rotation.`);
  }
}

function runLegacyPoster(product, cycle) {
  writeSelectedSheetProduct(product);
  allowRepostForProduct(product.id);

  const env = {
    ...process.env,
    PRODUCT_ID: product.id,
    VIDEO_PRODUCT_ID: product.id,
    SOCIAL_VARIATION_HOOK: process.env.SOCIAL_VARIATION_HOOK || `seed-rotation-${cycle}-${product.id}`
  };

  console.log(`[Seed Rotation] Posting ${product.id}: ${product.name}`);
  const result = spawnSync('node', ['scripts/social-media-auto-post.mjs'], {
    cwd: PROJECT,
    stdio: 'inherit',
    env,
    timeout: Number(process.env.SOCIAL_POST_TIMEOUT_MS || 1800000)
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`social-media-auto-post.mjs failed for ${product.id} with exit ${result.status}`);
  }
}

function saveState(previousState, rotation, selected, failures) {
  const history = [
    ...previousState.history,
    {
      ranAt: new Date().toISOString(),
      selectedProductIds: selected.map((product) => product.id),
      nextIndex: rotation.nextIndex,
      cycle: rotation.cycle,
      failures
    }
  ].slice(-100);

  writeJson(ROTATION_STATE_FILE, {
    nextIndex: rotation.nextIndex,
    cycle: rotation.cycle,
    lastRunAt: new Date().toISOString(),
    lastSelectedProductIds: selected.map((product) => product.id),
    history
  });
}

async function main() {
  const allProducts = loadSeedProducts();
  if (!allProducts.length) throw new Error('No products found in config/top-products.json');

  const readyProducts = productsWithVideos(allProducts);
  if (!readyProducts.length) {
    throw new Error('No generated seed videos found. Run: npm run seed:videos');
  }

  const state = loadState();
  const rotation = selectRotationProducts(readyProducts, state);
  const originalSheetCache = backupSheetCache();
  const failures = [];

  console.log(`[Seed Rotation] Ready products: ${readyProducts.map((p) => p.id).join(', ')}`);
  console.log(`[Seed Rotation] Selected this run: ${rotation.selected.map((p) => p.id).join(', ')}`);

  try {
    for (const product of rotation.selected) {
      try {
        runLegacyPoster(product, rotation.cycle);
      } catch (error) {
        failures.push({ productId: product.id, message: error.message });
        console.error(`[Seed Rotation] Failed for ${product.id}: ${error.message}`);
      }
    }
  } finally {
    restoreSheetCache(originalSheetCache);
    saveState(state, rotation, rotation.selected, failures);
  }

  if (failures.length) {
    throw new Error(`${failures.length} selected product(s) failed social posting.`);
  }

  console.log('[Seed Rotation] Rotation complete.');
}

main().catch((error) => {
  console.error(`[Seed Rotation] Failed: ${error.message}`);
  process.exit(1);
});
