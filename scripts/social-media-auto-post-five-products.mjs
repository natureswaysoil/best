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
    .filter((name) => name.endsWith('.mp4'))
    .filter((name) => name === `${productId}.mp4` || name.startsWith(`${productId}-`) || name.startsWith(`${productId}_`))
    .sort();
}

function pickVideo(productId) {
  const videos = listVideos(productId);
  if (!videos.length) return `${productId}.mp4`;
  const dayNumber = Math.floor(Date.now() / 86400000);
  return videos[dayNumber % videos.length];
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

  const products = orderedProducts.map((p) => {
      const videoFile = pickVideo(p.id);
      return {
        id: p.id,
        name: p.name,
        description: p.description || p.name,
        category: p.category || 'Top Products',
        keywords: Array.isArray(p.keywords) ? p.keywords : [],
        funnelUrl: p.funnelUrl,
        checkoutUrl: p.checkoutUrl,
        video: `/videos/${videoFile}`,
        videoPoster: `/videos/${p.id}.jpg`
      };
    });

  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(CACHE_FILE, JSON.stringify({
    source: 'config/top-products.json',
    generatedBy: 'social-media-auto-post-five-products.mjs',
    generatedAt: new Date().toISOString(),
    products
  }, null, 2));

  console.log(`[Five Product Social] Prepared ${products.length} products for social posting.`);
  console.log(`[Five Product Social] Selected today: ${selected.id}`);
  for (const product of products) console.log(`[Five Product Social] ${product.id} -> ${product.video}`);
}

writeProductCache();
const { SocialMediaAutoPoster } = await import('./social-media-auto-post.mjs');
const poster = new SocialMediaAutoPoster();
await poster.processNewVideos();
