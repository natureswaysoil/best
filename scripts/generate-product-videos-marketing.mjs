#!/usr/bin/env node
/**
 * Test marketing video generation for the 5 seed products.
 * Uses config/top-products.json and forces the marketing generator
 * (5 scenes, b-roll, lower-right avatar).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot  = path.resolve(__dirname, '..');
const seedFile  = path.join(repoRoot, 'config', 'top-products.json');

if (!fs.existsSync(seedFile)) {
  console.error(`Seed file not found: ${seedFile}`);
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(seedFile, 'utf8'));
const list = raw.topProducts || raw.products || (Array.isArray(raw) ? raw : []);
const ids = list.map(p => p.id).filter(Boolean);

if (!ids.length) {
  console.error('No product IDs found in seed file.');
  process.exit(1);
}

console.log(`🌱 Marketing video test for seed products: ${ids.join(', ')}`);

const result = spawnSync(
  process.execPath,
  [path.join(__dirname, 'generate-product-videos-marketing.mjs')],
  {
    cwd: repoRoot,
    stdio: 'inherit',
    env: {
      ...process.env,
      NWS_MARKETING_MODE: '1',
      PRODUCT_IDS: ids.join(','),
      PRODUCT_ID_FILTER: ids.join(','),
      ONLY_PRODUCT_IDS: ids.join(','),
      FORCE_REGENERATE: '1',
    },
  }
);

process.exit(result.status ?? 1);
