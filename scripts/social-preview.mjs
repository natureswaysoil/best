#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT = path.resolve(__dirname, '..');
const TOP_PRODUCTS = JSON.parse(fs.readFileSync(path.join(PROJECT, 'config', 'top-products.json'), 'utf8')).topProducts;
const VARIATIONS = JSON.parse(fs.readFileSync(path.join(PROJECT, 'content', 'social-script-variations', 'top5-video-scripts.json'), 'utf8'));
const OUT_DIR = path.join(PROJECT, 'social-preview');
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.natureswaysoil.com';

fs.mkdirSync(OUT_DIR, { recursive: true });

const requestedId = process.env.PRODUCT_ID || TOP_PRODUCTS[0]?.id;
const product = TOP_PRODUCTS.find((item) => item.id === requestedId) || TOP_PRODUCTS[0];
const variationList = VARIATIONS[product.id]?.variations || [];
const variationIndex = Number(process.env.SOCIAL_VARIATION_INDEX || 0) % Math.max(variationList.length, 1);
const variation = variationList[variationIndex] || null;
const videoPath = path.join(PROJECT, 'public', 'videos', `${product.id}.mp4`);
const publicVideoUrl = `${BASE_URL}/videos/${product.id}.mp4`;
const funnelUrl = `${BASE_URL}${product.funnelUrl}`;

const preview = {
  generatedAt: new Date().toISOString(),
  product,
  variationIndex,
  variation,
  video: {
    localPath: `public/videos/${product.id}.mp4`,
    existsInRepo: fs.existsSync(videoPath),
    publicUrl: publicVideoUrl,
  },
  destinations: {
    instagram: Boolean(process.env.INSTAGRAM_ACCESS_TOKEN && process.env.INSTAGRAM_IG_ID),
    facebook: Boolean(process.env.FACEBOOK_PAGE_ID && (process.env.FACEBOOK_PAGE_ACCESS_TOKEN || process.env.FACEBOOK_ACCESS_TOKEN)),
    youtube: Boolean(process.env.YT_CLIENT_ID && process.env.YT_CLIENT_SECRET && process.env.YT_REFRESH_TOKEN),
    twitter: Boolean(process.env.TWITTER_API_KEY && process.env.TWITTER_ACCESS_TOKEN),
    pinterest: Boolean(process.env.PINTEREST_ACCESS_TOKEN && process.env.PINTEREST_BOARD_ID),
  },
  caption: variation
    ? `${variation.hook}\n\n${variation.caption}\n\nShop direct and save 15% on your first order: ${funnelUrl}`
    : `Shop ${product.name}: ${funnelUrl}`,
};

fs.writeFileSync(path.join(OUT_DIR, 'post-preview.json'), JSON.stringify(preview, null, 2));
fs.writeFileSync(path.join(OUT_DIR, 'caption.txt'), preview.caption);
fs.writeFileSync(path.join(OUT_DIR, 'where-it-posts.txt'), Object.entries(preview.destinations).map(([name, enabled]) => `${name}: ${enabled ? 'enabled' : 'not configured'}`).join('\n'));

if (fs.existsSync(videoPath)) {
  fs.copyFileSync(videoPath, path.join(OUT_DIR, `${product.id}.mp4`));
}

console.log('Social preview generated:');
console.log(JSON.stringify(preview, null, 2));
