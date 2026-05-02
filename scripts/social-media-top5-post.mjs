#!/usr/bin/env node

/**
 * Top 5 Social Posting Controller
 *
 * Modes:
 *   POST_MODE=single PRODUCT_ID=NWS_014 node scripts/social-media-top5-post.mjs
 *   POST_MODE=top5 node scripts/social-media-top5-post.mjs
 *   POST_MODE=next node scripts/social-media-top5-post.mjs
 *   POST_MODE=auto node scripts/social-media-top5-post.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT = path.resolve(__dirname, '..');
const CONFIG_FILE = path.join(PROJECT, 'config', 'top-products.json');
const VARIATIONS_FILE = path.join(PROJECT, 'content', 'social-script-variations', 'top5-video-scripts.json');
const PERFORMANCE_FILE = path.join(PROJECT, 'config', 'social-performance.json');
const STATE_FILE = path.join(PROJECT, 'social-top5-rotation-state.json');

function readJson(file, fallback = {}) {
  try {
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    console.warn(`Could not read ${file}: ${error.message}`);
  }
  return fallback;
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function loadTopProducts() {
  const config = readJson(CONFIG_FILE, { topProducts: [] });
  return [...config.topProducts].sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999));
}

function loadVariations() {
  return readJson(VARIATIONS_FILE, {});
}

function loadPerformance() {
  return readJson(PERFORMANCE_FILE, { defaultWeight: 3, weights: {} });
}

function pickWeightedProduct(products, performance) {
  const weights = performance.weights || {};
  const defaultWeight = Number(performance.defaultWeight || 3);
  const pool = [];

  for (const product of products) {
    const weight = Math.max(1, Number(weights[product.id] ?? defaultWeight));
    for (let i = 0; i < weight; i++) pool.push(product);
  }

  return pool[Math.floor(Math.random() * pool.length)] || products[0];
}

function loadState() {
  const state = readJson(STATE_FILE, { lastIndex: -1, lastVariationByProduct: {}, history: [] });
  return {
    lastIndex: state.lastIndex ?? -1,
    lastVariationByProduct: state.lastVariationByProduct ?? {},
    history: state.history ?? [],
  };
}

function saveState(state) {
  writeJson(STATE_FILE, state);
}

function pickVariation(product, state, variationsConfig) {
  const productVariations = variationsConfig[product.id]?.variations ?? [];

  if (productVariations.length === 0) return null;

  const lastVariation = state.lastVariationByProduct?.[product.id] ?? -1;
  const nextVariation = (lastVariation + 1) % productVariations.length;
  state.lastVariationByProduct = {
    ...(state.lastVariationByProduct ?? {}),
    [product.id]: nextVariation,
  };

  return { index: nextVariation, ...productVariations[nextVariation] };
}

function postProduct(product, state, variationsConfig) {
  const variation = pickVariation(product, state, variationsConfig);

  console.log(`Posting top product ${product.id}: ${product.name}`);
  console.log(`Funnel: ${product.funnelUrl}`);
  console.log(`Checkout: ${product.checkoutUrl}`);

  if (variation) console.log(`Variation ${variation.index + 1}: ${variation.angle} — ${variation.hook}`);
  else console.log('No script variation found; using default social caption generator.');

  const result = spawnSync('node', ['scripts/social-media-auto-post.mjs'], {
    cwd: PROJECT,
    stdio: 'inherit',
    env: {
      ...process.env,
      PRODUCT_ID: product.id,
      PRODUCT_FUNNEL_URL: product.funnelUrl,
      PRODUCT_CHECKOUT_URL: product.checkoutUrl,
      SOCIAL_TOP5_LOCK: '1',
      SOCIAL_VARIATION_INDEX: variation ? String(variation.index) : '',
      SOCIAL_VARIATION_ANGLE: variation?.angle ?? '',
      SOCIAL_VARIATION_HOOK: variation?.hook ?? '',
      SOCIAL_VARIATION_CAPTION: variation?.caption ?? '',
      SOCIAL_VARIATION_VOICEOVER: variation?.voiceover ?? '',
      SOCIAL_VARIATION_SCENES: variation ? JSON.stringify(variation.scenes ?? []) : '',
    },
  });

  if (result.status !== 0) throw new Error(`Posting failed for ${product.id}`);

  state.history = [
    ...(state.history || []),
    {
      productId: product.id,
      variationIndex: variation?.index ?? null,
      variationAngle: variation?.angle ?? null,
      hook: variation?.hook ?? null,
      postedAt: new Date().toISOString(),
      mode: process.env.POST_MODE || 'auto',
    },
  ].slice(-100);
}

const mode = (process.env.POST_MODE || 'auto').toLowerCase();
const productId = process.env.PRODUCT_ID;
const topProducts = loadTopProducts();
const variationsConfig = loadVariations();
const state = loadState();

if (mode === 'single') {
  const product = topProducts.find((item) => item.id === productId);
  if (!product) throw new Error(`PRODUCT_ID ${productId} is not in config/top-products.json`);
  postProduct(product, state, variationsConfig);
  saveState(state);
} else if (mode === 'top5') {
  for (const product of topProducts) postProduct(product, state, variationsConfig);
  saveState(state);
} else if (mode === 'next') {
  const nextIndex = ((state.lastIndex ?? -1) + 1) % topProducts.length;
  const product = topProducts[nextIndex];
  postProduct(product, state, variationsConfig);
  state.lastIndex = nextIndex;
  saveState(state);
} else if (mode === 'auto') {
  const performance = loadPerformance();
  const product = pickWeightedProduct(topProducts, performance);
  console.log(`🎯 Auto-selected weighted product: ${product.id}`);
  postProduct(product, state, variationsConfig);
  saveState(state);
} else {
  throw new Error(`Unsupported POST_MODE ${mode}. Use single, top5, next, or auto.`);
}
