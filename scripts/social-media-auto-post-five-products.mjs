#!/usr/bin/env node
/**
 * Force social posting to use the same 5-product list as video generation.
 * Also disables Twitter/X for this run.
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

function disableTwitter() {
  for (const key of Object.keys(process.env)) {
    if (key.startsWith('TWITTER_')) delete process.env[key];
  }
  process.env.DISABLE_TWITTER_POSTING = '1';
  console.log('[Five Product Social] Twitter/X disabled for this run.');
}

function writeProductCache() {
  const topProducts = readJson(TOP_PRODUCTS_FILE).topProducts || [];
  const products = topProducts
    .slice()
    .sort((a, b) => (a.priority || 999) - (b.priority || 999))
    .slice(0, 5)
    .map((p) => {
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

  if (products.length !== 5) {
    throw new Error(`Expected 5 top products but found ${products.length}`);
  }

  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(CACHE_FILE, JSON.stringify({
    source: 'config/top-products.json',
    generatedBy: 'social-media-auto-post-five-products.mjs',
    generatedAt: new Date().toISOString(),
    products
  }, null, 2));

  console.log(`[Five Product Social] Prepared ${products.length} products for social posting.`);
  for (const product of products) console.log(`[Five Product Social] ${product.id} -> ${product.video}`);
}

disableTwitter();
writeProductCache();
await import('./social-media-auto-post.mjs');
