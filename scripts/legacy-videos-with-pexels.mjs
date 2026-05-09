#!/usr/bin/env node
/**
 * Entry point for legacy product videos with Pexels b-roll.
 *
 * If a specific VIDEO_PRODUCT_ID / --product is requested but the Google
 * Sheets cache does not contain that product, this temporarily disables the
 * cache so the underlying generator can fall back to data/products.ts.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const sheetCache = path.join(projectRoot, 'content', 'video-scripts', 'sheet-products.json');
const runner = path.join(__dirname, 'generate-product-videos-fixed.mjs');

function readArgValue(...names) {
  for (const name of names) {
    const eqArg = process.argv.find((arg) => arg.startsWith(`${name}=`));
    if (eqArg) return eqArg.slice(name.length + 1).trim();
    const idx = process.argv.indexOf(name);
    if (idx >= 0 && process.argv[idx + 1]) return String(process.argv[idx + 1]).trim();
  }
  return null;
}

function cacheContainsTarget(targetId) {
  if (!targetId || !fs.existsSync(sheetCache)) return true;
  try {
    const data = JSON.parse(fs.readFileSync(sheetCache, 'utf8'));
    const products = Array.isArray(data.products) ? data.products : [];
    return products.some((p) => p && (p.id === targetId || p.ID === targetId));
  } catch {
    return true;
  }
}

const targetId = readArgValue('--product', '--product-id') || process.env.VIDEO_PRODUCT_ID || null;
let tempCache = null;

try {
  if (targetId && fs.existsSync(sheetCache) && !cacheContainsTarget(targetId)) {
    tempCache = `${sheetCache}.disabled-${Date.now()}`;
    console.log(`Cache does not contain ${targetId}; temporarily using data/products.ts fallback.`);
    fs.renameSync(sheetCache, tempCache);
  }

  const result = spawnSync(process.execPath, [runner, ...process.argv.slice(2)], {
    cwd: projectRoot,
    stdio: 'inherit',
    env: process.env,
  });

  process.exitCode = result.status ?? 1;
} finally {
  if (tempCache && fs.existsSync(tempCache)) {
    try {
      fs.renameSync(tempCache, sheetCache);
    } catch (error) {
      console.warn(`Could not restore sheet cache: ${error.message}`);
    }
  }
}
