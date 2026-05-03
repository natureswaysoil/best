#!/usr/bin/env node

/**
 * HeyGen-first Conversion Video Builder
 *
 * Simple rule:
 *   HeyGen creates the main usable video.
 *   Product image is used as the HeyGen background when available.
 *   Pexels/FFmpeg enhancement can be added later, but is not required.
 *
 * Usage:
 *   PRODUCT_ID=NWS_014 node scripts/create-heygen-conversion-video.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import HeyGenVideoGenerator from './heygen-video-generator.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT = path.resolve(__dirname, '..');

const PRODUCT_ID = process.env.PRODUCT_ID || process.env.VIDEO_PRODUCT_ID || 'NWS_014';
const TOP_PRODUCTS_FILE = path.join(PROJECT, 'config', 'top-products.json');
const OUT_DIR = path.join(PROJECT, 'public', 'videos');
const GENERATED_DIR = path.join(PROJECT, 'content', 'generated-videos');
const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.natureswaysoil.com').replace(/\/$/, '');

function readJson(file, fallback = {}) {
  try {
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {}
  return fallback;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function productFromConfig(productId) {
  const topProducts = readJson(TOP_PRODUCTS_FILE, { topProducts: [] }).topProducts || [];
  return topProducts.find((p) => p.id === productId) || {
    id: productId,
    name: productId,
    funnelUrl: `/product/${productId}`,
    checkoutUrl: `/checkout?productId=${productId}&coupon=SAVE15`,
    category: 'Lawn & Garden'
  };
}

function listProductImages(productId) {
  const dirs = [
    path.join(PROJECT, 'public', 'images', 'products', productId),
    path.join(PROJECT, 'public', 'products', productId),
    path.join(PROJECT, 'public', 'images'),
  ];

  const files = [];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    for (const name of fs.readdirSync(dir)) {
      if (!/\.(png|jpe?g|webp)$/i.test(name)) continue;
      if (dir.endsWith('images') && !name.includes(productId)) continue;
      files.push(path.join(dir, name));
    }
  }

  return files.sort((a, b) => {
    const score = (file) => {
      const lower = path.basename(file).toLowerCase();
      if (lower.includes('main')) return 0;
      if (lower.includes('front')) return 1;
      if (lower.includes('bottle')) return 2;
      return 5;
    };
    return score(a) - score(b) || a.localeCompare(b);
  });
}

function toPublicImageUrl(localFile) {
  if (!localFile) return null;
  const rel = path.relative(path.join(PROJECT, 'public'), localFile).split(path.sep).join('/');
  return `${BASE_URL}/${rel}`;
}

function buildScript(product) {
  if (product.id === 'NWS_014') {
    return "Your dog is not the problem. Yellow lawn spots happen when urine salts build up and stress the soil. Nature's Way Soil Dog Urine Neutralizer helps treat affected areas at the soil level. Just spray, water in, and support real lawn recovery. It's pet-safe, and it is not a green dye. Shop direct and save fifteen percent on your first order at natureswaysoil.com/lawn-repair.";
  }

  return `${product.name} helps support stronger soil and healthier growth. Use it as part of your regular soil care routine to support roots, nutrient uptake, and long-term plant performance. Shop direct and save fifteen percent on your first order at natureswaysoil.com.`;
}

function buildProductForHeyGen(product, productImageUrl) {
  return {
    ...product,
    id: product.id,
    name: product.name,
    category: product.category || 'Lawn & Garden',
    description: product.description || '',
    image: productImageUrl,
    videoScript: buildScript(product),
  };
}

async function main() {
  ensureDir(OUT_DIR);
  ensureDir(GENERATED_DIR);

  const product = productFromConfig(PRODUCT_ID);
  const productImages = listProductImages(PRODUCT_ID);
  const primaryImage = productImages[0] || null;
  const productImageUrl = toPublicImageUrl(primaryImage);

  console.log(`🎬 Building HeyGen conversion video for ${PRODUCT_ID}`);
  console.log(`Product images found: ${productImages.length}`);
  if (primaryImage) console.log(`Using product image: ${path.relative(PROJECT, primaryImage)}`);
  if (productImageUrl) console.log(`Public image URL: ${productImageUrl}`);

  if (!process.env.HEYGEN_API_KEY) {
    throw new Error('HEYGEN_API_KEY is required. Run this in GitHub Actions or export the key locally.');
  }

  const generator = new HeyGenVideoGenerator(process.env.HEYGEN_API_KEY);
  const heygenProduct = buildProductForHeyGen(product, productImageUrl);
  const result = await generator.generateProductVideo(heygenProduct, OUT_DIR, {
    productImage: productImageUrl,
    background: '#0d3b2a',
  });

  const planFile = path.join(GENERATED_DIR, `${PRODUCT_ID}-heygen-conversion-plan.json`);
  fs.writeFileSync(planFile, JSON.stringify({
    productId: PRODUCT_ID,
    productName: product.name,
    script: heygenProduct.videoScript,
    productImage: productImageUrl,
    output: path.relative(PROJECT, result.videoPath),
    heygenVideoUrl: result.videoUrl,
    duration: result.duration,
    generatedAt: new Date().toISOString(),
  }, null, 2));

  console.log('✅ HeyGen conversion video ready');
  console.log(`MP4: ${path.relative(PROJECT, result.videoPath)}`);
  console.log(`Plan: ${path.relative(PROJECT, planFile)}`);
}

main().catch((error) => {
  console.error('❌ HeyGen conversion video failed:', error.message);
  process.exit(1);
});
