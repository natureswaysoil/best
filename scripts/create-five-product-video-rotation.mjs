#!/usr/bin/env node
/**
 * Build a five-product video rotation set.
 *
 * Existing generator output:
 *   public/videos/NWS_014.mp4
 *
 * This script creates rotation-ready files:
 *   public/videos/NWS_014-v1.mp4 ... public/videos/NWS_014-v5.mp4
 *
 * It uses the existing generator so the production flow stays stable. The
 * wrapper social poster then rotates among these files when posting.
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
const VARIATIONS_PER_PRODUCT = Number(process.env.VIDEO_VARIATIONS_PER_PRODUCT || 5);

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function run(command, args, env = {}) {
  const result = spawnSync(command, args, {
    cwd: PROJECT,
    stdio: 'inherit',
    env: { ...process.env, ...env },
    timeout: Number(process.env.JOB_STEP_TIMEOUT_MS || 1800000)
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed with exit ${result.status}`);
}

function copyIfExists(from, to) {
  if (!fs.existsSync(from)) throw new Error(`Expected generated file missing: ${from}`);
  fs.copyFileSync(from, to);
}

function products() {
  const topProducts = readJson(TOP_PRODUCTS_FILE).topProducts || [];
  return topProducts
    .slice()
    .sort((a, b) => (a.priority || 999) - (b.priority || 999))
    .slice(0, 5);
}

function cleanOldRotationFiles(productId) {
  if (!fs.existsSync(VIDEOS_DIR)) return;
  for (const name of fs.readdirSync(VIDEOS_DIR)) {
    if (name.startsWith(`${productId}-v`) && /\.(mp4|jpg)$/i.test(name)) {
      fs.rmSync(path.join(VIDEOS_DIR, name), { force: true });
    }
  }
}

async function main() {
  fs.mkdirSync(VIDEOS_DIR, { recursive: true });
  const selected = products();
  if (selected.length !== 5) throw new Error(`Expected 5 top products, found ${selected.length}`);

  console.log(`[Video Rotation] Building ${VARIATIONS_PER_PRODUCT} video file(s) for each of ${selected.length} products.`);

  for (const product of selected) {
    cleanOldRotationFiles(product.id);

    for (let variation = 1; variation <= VARIATIONS_PER_PRODUCT; variation++) {
      console.log(`[Video Rotation] ${product.id} variation ${variation}/${VARIATIONS_PER_PRODUCT}`);
      run('node', ['scripts/create-quality-seed-videos.mjs'], {
        PRODUCT_ID: product.id,
        VIDEO_PRODUCT_ID: product.id,
        SOCIAL_VARIATION_HOOK: `v${variation}`,
        VIDEO_VARIATION_INDEX: String(variation)
      });

      const sourceMp4 = path.join(VIDEOS_DIR, `${product.id}.mp4`);
      const sourceJpg = path.join(VIDEOS_DIR, `${product.id}.jpg`);
      const targetMp4 = path.join(VIDEOS_DIR, `${product.id}-v${variation}.mp4`);
      const targetJpg = path.join(VIDEOS_DIR, `${product.id}-v${variation}.jpg`);

      copyIfExists(sourceMp4, targetMp4);
      if (fs.existsSync(sourceJpg)) fs.copyFileSync(sourceJpg, targetJpg);
    }
  }

  console.log('[Video Rotation] Done. Rotation files are ready in public/videos.');
}

main().catch((error) => {
  console.error(`[Video Rotation] Failed: ${error.message}`);
  process.exit(1);
});
