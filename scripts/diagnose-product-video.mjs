#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT = path.resolve(__dirname, '..');
const PRODUCT_ID = process.env.PRODUCT_ID || process.env.VIDEO_PRODUCT_ID || process.argv[2] || 'NWS_014';
const TOP_PRODUCTS_FILE = path.join(PROJECT, 'config', 'top-products.json');
const VIDEOS_DIR = path.join(PROJECT, 'public', 'videos');
const PLAN_DIR = path.join(PROJECT, 'content', 'generated-videos');

function readJson(file, fallback = {}) {
  try { return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : fallback; }
  catch { return fallback; }
}

function listRecursive(dir, re, limit = 500) {
  const found = [];
  if (!fs.existsSync(dir)) return found;
  const stack = [dir];
  while (stack.length && found.length < limit) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (re.test(full)) found.push(full);
    }
  }
  return found;
}

function rel(file) {
  return path.relative(PROJECT, file).replace(/\\/g, '/');
}

function findProduct(productId) {
  const products = readJson(TOP_PRODUCTS_FILE, { topProducts: [] }).topProducts || [];
  return products.find((p) => p.id === productId);
}

function productImages(product) {
  const roots = [
    path.join(PROJECT, 'public', 'images', 'products', product.id),
    path.join(PROJECT, 'public', 'products', product.id),
    path.join(PROJECT, 'public', 'images'),
    path.join(PROJECT, 'public')
  ];
  const seen = new Set();
  const files = [];
  for (const root of roots) {
    for (const file of listRecursive(root, /\.(png|jpe?g|webp)$/i)) {
      const lower = file.toLowerCase();
      const matched = lower.includes(product.id.toLowerCase()) || (product.keywords || []).some((k) => lower.includes(String(k).toLowerCase()));
      if (matched && !seen.has(file)) {
        seen.add(file);
        files.push(file);
      }
    }
  }
  return files;
}

function localBroll(product) {
  const roots = [
    path.join(PROJECT, 'public', 'broll', product.id),
    path.join(PROJECT, 'public', 'broll', 'shared'),
    path.join(PROJECT, 'public', 'videos', 'broll', product.id),
    path.join(PROJECT, 'public', 'videos', 'broll', 'shared')
  ];
  const seen = new Set();
  const files = [];
  for (const root of roots) {
    for (const file of listRecursive(root, /\.(mp4|mov|m4v|webm)$/i)) {
      if (!seen.has(file)) {
        seen.add(file);
        files.push(file);
      }
    }
  }
  return files;
}

function videoExists(name) {
  const file = path.join(VIDEOS_DIR, name);
  return fs.existsSync(file) && fs.statSync(file).size > 1000;
}

function main() {
  const product = findProduct(PRODUCT_ID);
  if (!product) {
    console.error(`❌ ${PRODUCT_ID} is not in config/top-products.json`);
    process.exit(1);
  }

  const pexelsReady = Boolean(process.env.PEXELS_API_KEY || process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT || process.env.PROJECT_ID);
  const heygenReady = Boolean(process.env.HEYGEN_API_KEY || process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT || process.env.PROJECT_ID);
  const images = productImages(product);
  const broll = localBroll(product);
  const planFile = path.join(PLAN_DIR, `${product.id}-quality-seed-plan.json`);
  const plan = readJson(planFile, null);

  console.log(`\nVideo diagnostic for ${product.id} - ${product.name || product.productName || ''}`);
  console.log('='.repeat(72));
  console.log(`Pexels available: ${pexelsReady ? 'YES' : 'NO - set PEXELS_API_KEY or Google Cloud project secret access'}`);
  console.log(`HeyGen available: ${heygenReady ? 'YES' : 'NO - set HEYGEN_API_KEY or Google Cloud project secret access'}`);
  console.log(`Product images found: ${images.length}`);
  images.slice(0, 8).forEach((file) => console.log(`  - ${rel(file)}`));
  console.log(`Local b-roll clips found: ${broll.length}`);
  broll.slice(0, 8).forEach((file) => console.log(`  - ${rel(file)}`));
  console.log(`Seed background exists: ${videoExists(`${product.id}.mp4`) ? 'YES' : 'NO'}`);
  console.log(`HeyGen avatar exists: ${videoExists(`${product.id}-heygen-avatar.mp4`) ? 'YES' : 'NO'}`);
  console.log(`Final avatar overlay exists: ${videoExists(`${product.id}-final-pexels-avatar.mp4`) ? 'YES' : 'NO'}`);

  const brollScenes = (product.scenes || []).filter((scene) => !scene.product && !scene.endCard && scene.query);
  console.log(`Configured b-roll scenes: ${brollScenes.length}`);
  brollScenes.forEach((scene, i) => console.log(`  ${i + 1}. ${scene.query}`));

  if (plan?.sceneAudit) {
    console.log('\nLast render scene audit:');
    plan.sceneAudit.forEach((scene) => {
      console.log(`  Scene ${scene.scene}: ${scene.type}${scene.source ? ` - ${scene.source}` : ''}${scene.query ? ` - ${scene.query}` : ''}`);
    });
  } else {
    console.log('\nNo render audit found yet. Run PRODUCT_ID=' + product.id + ' npm run seed:video first.');
  }

  console.log('\nMost likely causes if you see green background + scrolling text:');
  if (!pexelsReady && broll.length === 0) console.log('  ❌ No Pexels access and no local b-roll, so the script must use motion fallback.');
  if (images.length === 0) console.log('  ❌ No matching product image found, so product cards use fallback.');
  if (!videoExists(`${product.id}-heygen-avatar.mp4`)) console.log('  ❌ No HeyGen avatar video exists yet. The seed video script alone does not create an avatar.');
  if (!videoExists(`${product.id}-final-pexels-avatar.mp4`)) console.log('  ❌ Final overlay video has not been composed yet.');

  console.log('\nCorrect complete workflow:');
  console.log(`  PRODUCT_ID=${product.id} npm run seed:video`);
  console.log(`  PRODUCT_ID=${product.id} node scripts/create-heygen-seed-avatar-videos.mjs`);
  console.log(`  PRODUCT_ID=${product.id} node scripts/compose-pexels-avatar-videos.mjs`);
  console.log('');
}

main();
