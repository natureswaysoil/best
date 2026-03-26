#!/usr/bin/env node

import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const MAX_WIDTH = 1200;
const MAX_THUMB_WIDTH = 400;
const WEBP_QUALITY = 85;

async function optimizeImage(inputPath, outputPath, maxWidth) {
  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    if (metadata.format === 'webp' && metadata.width <= maxWidth) {
      console.log(`  ✓ Skip: ${path.basename(inputPath)} (already optimized)`);
      return { skipped: true };
    }

    await image
      .resize(maxWidth, null, {
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({ quality: WEBP_QUALITY })
      .toFile(outputPath);

    const oldStat = await stat(inputPath);
    const newStat = await stat(outputPath);
    const oldSize = oldStat.size;
    const newSize = newStat.size;
    const savings = ((1 - newSize / oldSize) * 100).toFixed(1);

    console.log(`  ✓ ${path.basename(inputPath)}`);
    console.log(`    ${(oldSize / 1024 / 1024).toFixed(2)}MB → ${(newSize / 1024).toFixed(0)}KB (${savings}% reduction)`);

    return { oldSize, newSize, savings };
  } catch (error) {
    console.error(`  ✗ Error: ${path.basename(inputPath)}:`, error.message);
    return { error: true };
  }
}

async function main() {
  console.log('\n🖼️  Image Optimization Tool');
  console.log('━'.repeat(60));

  const productsDir = path.join(ROOT, 'public/images/products');
  let totalOld = 0;
  let totalNew = 0;
  let optimizedCount = 0;
  let skippedCount = 0;

  try {
    const products = await readdir(productsDir);

    for (const productId of products) {
      const productPath = path.join(productsDir, productId);
      const productStat = await stat(productPath);

      if (!productStat.isDirectory()) continue;

      console.log(`\n📁 ${productId}`);

      const files = await readdir(productPath);

      for (const file of files) {
        if (!file.match(/\.(jpg|jpeg|png)$/i)) continue;
        if (file.includes('.webp')) continue;

        const inputPath = path.join(productPath, file);
        const baseName = file.replace(/\.(jpg|jpeg|png)$/i, '');
        const outputPath = path.join(productPath, `${baseName}.webp`);

        const maxWidth = file.toLowerCase().includes('thumb') ? MAX_THUMB_WIDTH : MAX_WIDTH;
        const result = await optimizeImage(inputPath, outputPath, maxWidth);

        if (result.skipped) {
          skippedCount++;
        } else if (!result.error) {
          totalOld += result.oldSize;
          totalNew += result.newSize;
          optimizedCount++;
        }
      }
    }

    console.log('\n' + '━'.repeat(60));
    console.log('📊 Summary');
    console.log('━'.repeat(60));
    console.log(`✓ Optimized: ${optimizedCount} images`);
    console.log(`⊘ Skipped: ${skippedCount} images`);
    
    if (optimizedCount > 0) {
      console.log(`\n📉 Before: ${(totalOld / 1024 / 1024).toFixed(2)}MB`);
      console.log(`📉 After: ${(totalNew / 1024 / 1024).toFixed(2)}MB`);
      console.log(`💾 Saved: ${((totalOld - totalNew) / 1024 / 1024).toFixed(2)}MB (${((1 - totalNew / totalOld) * 100).toFixed(1)}%)`);
    }
    
    console.log('\n✅ Complete!\n');

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

main();
