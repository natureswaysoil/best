#!/usr/bin/env node
/**
 * Generate one smoke-test video for the first top product.
 *
 * Default product: first product in config/top-products.json.
 * Override with PRODUCT_ID=NWS_011 npm run video:one
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

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function firstTopProductId() {
  const configured = readJson(TOP_PRODUCTS_FILE).topProducts || [];
  const sorted = configured.slice().sort((a, b) => (a.priority || 999) - (b.priority || 999));
  const first = sorted[0];
  if (!first?.id) throw new Error(`No top product id found in ${TOP_PRODUCTS_FILE}`);
  return first.id;
}

function run(command, args, env = {}) {
  const result = spawnSync(command, args, {
    cwd: PROJECT,
    stdio: 'inherit',
    env: { ...process.env, ...env },
    timeout: Number(process.env.FFMPEG_TIMEOUT_MS || 600000)
  });

  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed with exit ${result.status}`);
}

function main() {
  fs.mkdirSync(VIDEOS_DIR, { recursive: true });
  const productId = process.env.PRODUCT_ID || process.env.VIDEO_PRODUCT_ID || firstTopProductId();
  console.log(`[One Video] Generating one test video for ${productId}`);
  run('node', ['scripts/create-quality-seed-videos.mjs'], {
    PRODUCT_ID: productId,
    VIDEO_PRODUCT_ID: productId,
    VIDEO_VARIATION_INDEX: '1',
    SOCIAL_VARIATION_HOOK: 'test-one'
  });
  console.log(`[One Video] Done: public/videos/${productId}.mp4`);
}

try {
  main();
} catch (error) {
  console.error(`[One Video] Failed: ${error.message}`);
  process.exit(1);
}
