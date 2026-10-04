#!/usr/bin/env node
/**
 * Force social posting to use the same 5-product list as video generation.
 * Selects one current top product per run and posts its matching video rotation.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT = path.resolve(__dirname, '..');
const TOP_PRODUCTS_FILE = path.join(PROJECT, 'config', 'top-products.json');
const CACHE_DIR = path.join(PROJECT, 'content', 'video-scripts');
const CACHE_FILE = path.join(CACHE_DIR, 'sheet-products.json');
const VIDEOS_DIR = path.join(PROJECT, 'public', 'videos');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function listVideos(productId) {
  if (!fs.existsSync(VIDEOS_DIR)) return [];
  return fs.readdirSync(VIDEOS_DIR)
    .filter((name) => new RegExp(`^${productId}-v\\d+\\.mp4#!/usr/bin/env node
/**
 * Force social posting to use the same 5-product list as video generation.
 * Selects one current top product per run and posts its matching video rotation.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT = path.resolve(__dirname, '..');
const TOP_PRODUCTS_FILE = path.join(PROJECT, 'config', 'top-products.json');
const CACHE_DIR = path.join(PROJECT, 'content', 'video-scripts');
const CACHE_FILE = path.join(CACHE_DIR, 'sheet-products.json');
const VIDEOS_DIR = path.join(PROJECT, 'public', 'videos');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

).test(name))
    .sort();
}

function pickVideo(productId) {
  const videos = listVideos(productId);
  if (!videos.length) return `${productId}.mp4`;
  const dayNumber = Math.floor(Date.now() / 86400000);
  return videos[dayNumber % videos.length];
}

function promoteSelectedVideo(productId, videoFile) {
  const source = path.join(VIDEOS_DIR, videoFile);
  const canonical = path.join(VIDEOS_DIR, `${productId}.mp4`);
  if (!fs.existsSync(source)) {
    throw new Error(`Selected video is missing: ${source}`);
  }
  if (source !== canonical) fs.copyFileSync(source, canonical);
  return canonical;
}

function writeProductCache() {
  const topProducts = readJson(TOP_PRODUCTS_FILE).topProducts || [];
  const orderedProducts = topProducts
    .slice()
    .sort((a, b) => (a.priority || 999) - (b.priority || 999))
    .slice(0, 5);

  if (orderedProducts.length !== 5) {
    throw new Error(`Expected 5 top products but found ${orderedProducts.length}`);
  }

  const dayNumber = Math.floor(Date.now() / 86400000);
  const selected = orderedProducts[dayNumber % orderedProducts.length];
  process.env.PRODUCT_ID = selected.id;
  process.env.SOCIAL_TOP5_LOCK = '1';

  const videoFile = pickVideo(selected.id);
  promoteSelectedVideo(selected.id, videoFile);
  const products = [{
    id: selected.id,
    name: selected.name,
    description: selected.description || selected.name,
    category: selected.category || 'Top Products',
    keywords: Array.isArray(selected.keywords) ? selected.keywords : [],
    funnelUrl: selected.funnelUrl,
    checkoutUrl: selected.checkoutUrl,
    video: `/videos/${selected.id}.mp4`,
    videoPoster: `/videos/${selected.id}.jpg`
  }];

  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(CACHE_FILE, JSON.stringify({
    source: 'config/top-products.json',
    generatedBy: 'social-media-auto-post-five-products.mjs',
    generatedAt: new Date().toISOString(),
    products
  }, null, 2));

  console.log('[Five Product Social] Prepared one scheduled product for social posting.');
  console.log(`[Five Product Social] Selected today: ${selected.id}`);
  for (const product of products) console.log(`[Five Product Social] ${product.id} -> ${product.video}`);
}

writeProductCache();
const { SocialMediaAutoPoster } = await import('./social-media-auto-post.mjs');
const poster = new SocialMediaAutoPoster();
await poster.processNewVideos();
