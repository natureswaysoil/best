#!/usr/bin/env node

/**
 * Top 5 Social Posting Controller
 *
 * Modes:
 *   POST_MODE=single PRODUCT_ID=NWS_014 node scripts/social-media-top5-post.mjs
 *   POST_MODE=top5 node scripts/social-media-top5-post.mjs
 *   POST_MODE=next node scripts/social-media-top5-post.mjs
 *
 * This controller selects from config/top-products.json, then delegates to the
 * existing social-media-auto-post.mjs script with PRODUCT_ID set.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT = path.resolve(__dirname, '..');
const CONFIG_FILE = path.join(PROJECT, 'config', 'top-products.json');
const STATE_FILE = path.join(PROJECT, 'social-top5-rotation-state.json');

function loadTopProducts() {
  const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  return [...config.topProducts].sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999));
}

function loadState() {
  if (!fs.existsSync(STATE_FILE)) {
    return { lastIndex: -1, history: [] };
  }

  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch {
    return { lastIndex: -1, history: [] };
  }
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function postProduct(product) {
  console.log(`Posting top product ${product.id}: ${product.name}`);
  console.log(`Funnel: ${product.funnelUrl}`);
  console.log(`Checkout: ${product.checkoutUrl}`);

  const result = spawnSync('node', ['scripts/social-media-auto-post.mjs'], {
    cwd: PROJECT,
    stdio: 'inherit',
    env: {
      ...process.env,
      PRODUCT_ID: product.id,
      PRODUCT_FUNNEL_URL: product.funnelUrl,
      PRODUCT_CHECKOUT_URL: product.checkoutUrl,
      SOCIAL_TOP5_LOCK: '1',
    },
  });

  if (result.status !== 0) {
    throw new Error(`Posting failed for ${product.id}`);
  }
}

const mode = (process.env.POST_MODE || 'next').toLowerCase();
const productId = process.env.PRODUCT_ID;
const topProducts = loadTopProducts();

if (mode === 'single') {
  const product = topProducts.find((item) => item.id === productId);
  if (!product) {
    throw new Error(`PRODUCT_ID ${productId} is not in config/top-products.json`);
  }
  postProduct(product);
} else if (mode === 'top5') {
  for (const product of topProducts) {
    postProduct(product);
  }
} else if (mode === 'next') {
  const state = loadState();
  const nextIndex = ((state.lastIndex ?? -1) + 1) % topProducts.length;
  const product = topProducts[nextIndex];
  postProduct(product);

  state.lastIndex = nextIndex;
  state.history = [
    ...(state.history || []),
    { productId: product.id, postedAt: new Date().toISOString(), mode },
  ].slice(-100);
  saveState(state);
} else {
  throw new Error(`Unsupported POST_MODE ${mode}. Use single, top5, or next.`);
}
