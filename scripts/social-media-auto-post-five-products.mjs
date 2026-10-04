#!/usr/bin/env node
/**
 * Force social posting to use the same top-product list as video generation.
 * Selects one current top product per day and posts its generated rotation.
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

function listRotationVideos(productId) {
  if (!fs.existsSync(VIDEOS_DIR)) return [];
  const prefix = `${productId}-v`;
  return fs.readdirSync(VIDEOS_DIR)
    .filter((name) => name.startsWith(prefix) && name.endsWith('.mp4'))
    .filter((name) => /^NWS_\d{3}-v\d+\.mp4$/.test(name))
    .sort();
}

function pickVideo(productId, dayNumber) {
  const videos = listRotationVideos(productId);
  if (!videos.length) return `${productId}.mp4`;
  return videos[dayNumber % videos.length];
}

function promoteSelectedVideo(productId, videoFile) {
  const source = path.join(VIDEOS_DIR, videoFile);
  const canonical = path.join(VIDEOS_DIR, `${productId}.mp4`);
  if (!fs.existsSync(source)) {
    throw new Error(`Selected video is missing: ${source}`);
  }
  if (source !== canonical) fs.copyFileSync(source, canonical);
}

function prepareScheduledProduct() {
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
  const videoFile = pickVideo(selected.id, dayNumber);
  promoteSelectedVideo(selected.id, videoFile);

  process.env.PRODUCT_ID = selected.id;
  process.env.SOCIAL_TOP5_LOCK = '1';

  const product = {
    id: selected.id,
    name: selected.name,
    description: selected.description || selected.name,
    category: selected.category || 'Top Products',
    keywords: Array.isArray(selected.keywords) ? selected.keywords : [],
    funnelUrl: selected.funnelUrl,
    checkoutUrl: selected.checkoutUrl,
    video: `/videos/${selected.id}.mp4`,
    videoPoster: `/videos/${selected.id}.jpg`
  };

  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(CACHE_FILE, JSON.stringify({
    source: 'config/top-products.json',
    generatedBy: 'social-media-auto-post-five-products.mjs',
    generatedAt: new Date().toISOString(),
    products: [product]
  }, null, 2));

  console.log(`[Five Product Social] Selected today: ${selected.id}`);
  console.log(`[Five Product Social] Promoted ${videoFile} -> ${selected.id}.mp4`);
  return selected;
}

prepareScheduledProduct();
const { SocialMediaAutoPoster } = await import('./social-media-auto-post.mjs');
const poster = new SocialMediaAutoPoster();
await poster.processNewVideos();
