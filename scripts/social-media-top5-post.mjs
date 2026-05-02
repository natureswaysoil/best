#!/usr/bin/env node

/**
 * Top 5 Social Posting Controller
 *
 * Modes:
 *   POST_MODE=single PRODUCT_ID=NWS_014 node scripts/social-media-top5-post.mjs
 *   POST_MODE=top5 node scripts/social-media-top5-post.mjs
 *   POST_MODE=next node scripts/social-media-top5-post.mjs
 *
 * Selects a top product and a rotating script variation, then delegates to the
 * existing social-media-auto-post.mjs script with product + variation env vars.
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
const STATE_FILE = path.join(PROJECT, 'social-top5-rotation-state.json');

function loadTopProducts() {
  const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  return [...config.topProducts].sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999));
}

function loadVariations() {
  if (!fs.existsSync(VARIATIONS_FILE)) return {};
  return JSON.parse(fs.readFileSync(VARIATIONS_FILE, 'utf8'));
}

function loadState() {
  if (!fs.existsSync(STATE_FILE)) {
    return { lastIndex: -1, lastVariationByProduct: {}, history: [] };
  }

  try {
    const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    return {
      lastIndex: state.lastIndex ?? -1,
      lastVariationByProduct: state.lastVariationByProduct ?? {},
      history: state.history ?? [],
    };
  } catch {
    return { lastIndex: -1, lastVariationByProduct: {}, history: [] };
  }
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function pickVariation(product, state, variationsConfig) {
  const productVariations = variationsConfig[product.id]?.variations ?? [];

  if (productVariations.length === 0) {
    return null;
  }

  const lastVariation = state.lastVariationByProduct?.[product.id] ?? -1;
  const nextVariation = (lastVariation + 1) % productVariations.length;
  state.lastVariationByProduct = {
    ...(state.lastVariationByProduct ?? {}),
    [product.id]: nextVariation,
  };

  return {
    index: nextVariation,
    ...productVariations[nextVariation],
  };
}

function postProduct(product, state, variationsConfig) {
  const variation = pickVariation(product, state, variationsConfig);

  console.log(`Posting top product ${product.id}: ${product.name}`);
  console.log(`Funnel: ${product.funnelUrl}`);
  console.log(`Checkout: ${product.checkoutUrl}`);

  if (variation) {
    console.log(`Variation ${variation.index + 1}: ${variation.angle} — ${variation.hook}`);
  } else {
    console.log('No script variation found; using default social caption generator.');
  }

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

  if (result.status !== 0) {
    throw new Error(`Posting failed for ${product.id}`);
  }

  state.history = [
    ...(state.history || []),
    {
      productId: product.id,
      variationIndex: variation?.index ?? null,
      variationAngle: variation?.angle ?? null,
      hook: variation?.hook ?? null,
      postedAt: new Date().toISOString(),
      mode: process.env.POST_MODE || 'next',
    },
  ].slice(-100);
}

const mode = (process.env.POST_MODE || 'next').toLowerCase();
const productId = process.env.PRODUCT_ID;
const topProducts = loadTopProducts();
const variationsConfig = loadVariations();
const state = loadState();

if (mode === 'single') {
  const product = topProducts.find((item) => item.id === productId);
  if (!product) {
    throw new Error(`PRODUCT_ID ${productId} is not in config/top-products.json`);
  }
  postProduct(product, state, variationsConfig);
  saveState(state);
} else if (mode === 'top5') {
  for (const product of topProducts) {
    postProduct(product, state, variationsConfig);
  }
  saveState(state);
} else if (mode === 'next') {
  const nextIndex = ((state.lastIndex ?? -1) + 1) % topProducts.length;
  const product = topProducts[nextIndex];
  postProduct(product, state, variationsConfig);

  state.lastIndex = nextIndex;
  saveState(state);
} else {
  throw new Error(`Unsupported POST_MODE ${mode}. Use single, top5, or next.`);
}
