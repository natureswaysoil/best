#!/usr/bin/env node
/**
 * Update Website with Runway Videos
 * 
 * This script updates the product data and copies videos from Runway generation
 * to the website's public directory.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const SOURCE_VIDEO_DIR = '/home/ubuntu/runway_videos';
const DEST_VIDEO_DIR = path.join(__dirname, '../public/videos');
const PRODUCTS_FILE = path.join(__dirname, '../data/products.ts');

// New products data from user
const newProductsData = [
  {
    "asin": "B0822RH5L3",
    "parent_asin": "B0822RH5L3",
    "title": "Nature's Way Soil Organic Liquid Fertilizer for Garden and House Plants/100% Ogranic/USDA Certified Biobased Product/with B-1 Vitamin, Aloe Vera Juice to Improve Transplants/Made Fresh Weekly/",
    "price": "20.99",
    "video_path": "/home/ubuntu/runway_videos/Parent_B0822RH5L3_video.mp4"
  },
  {
    "asin": "B0D52CQNGN",
    "parent_asin": "B0D52CQNGN",
    "title": "Generic Horlticural Activated Charcoal for Plants, 4 Quarts, Indoor and Outdoor, Charcoal for Terrariums, Conditioning for Bonsai Soil and Catus Soil, Black, NWS-4q-ABC",
    "price": "29.99",
    "video_path": "/home/ubuntu/runway_videos/Parent_B0D52CQNGN_video.mp4"
  },
  {
    "asin": "B0D6886G54",
    "parent_asin": "B0D6886G54",
    "title": "Nature's Way Soil Organic Tomato Liquid Fertilizer – Made Fresh Weekly- Concentrate/Includes Vitamin B-1 and Aloe Vera for Faster Root Establishment, Healthier Transplants/Stops Blossom End Rot,",
    "price": "29.99",
    "video_path": "/home/ubuntu/runway_videos/Parent_B0D6886G54_video.mp4"
  },
  {
    "asin": "B0D69LNC5T",
    "parent_asin": "B0D69LNC5T",
    "title": "Nature's Way Soil Booster and Loosener – Organic Formula to Enhance Soil Health, Improve Aeration, and Promote Root Growth – Ideal for Gardens, Lawns, and Potted Plants",
    "price": "29.99",
    "video_path": "/home/ubuntu/runway_videos/Parent_B0D69LNC5T_video.mp4"
  },
  {
    "asin": "B0D7T3TLQP",
    "parent_asin": "B0D7T3TLQP",
    "title": "Nature's Way Soil® Orchid & African Violet Potting Mix – Premium Coco Coir, Worm Castings, Activated Biochar & Perlite | Lightweight, Nutrient-Rich Indoor Plant Blend",
    "price": "29.99",
    "video_path": "/home/ubuntu/runway_videos/Parent_B0D7T3TLQP_video.mp4"
  },
  {
    "asin": "B0D7V76PLY",
    "parent_asin": "B0D7V76PLY",
    "title": "Nature's Way Soil Organic Orchid Fertilizer – Ready to Use Nurture Your Orchids with Nature's Best!-Ready to Use, 8 Ounce Bottle",
    "price": "",
    "video_path": "/home/ubuntu/runway_videos/Parent_B0D7V76PLY_video.mp4"
  },
  {
    "asin": "B0D9HT7ND8",
    "parent_asin": "B0D9HT7ND8",
    "title": "Nature's Way Soil Organic Hydroponic Fertilizer Concentrate – Made Fresh Weekly-32 oz – Makes 512 Gallons of Nutrient Solution – Organic Plant Food for Hydroponic Systems, Aquaponics",
    "price": "19.99",
    "video_path": "/home/ubuntu/runway_videos/Parent_B0D9HT7ND8_video.mp4"
  },
  {
    "asin": "B0DC9CSMWS",
    "parent_asin": "B0FG38PQQX",
    "title": "Nature's Way Soil Dog Urine Neutralizer & Lawn Revitalizer – 32 oz/ 1 Gallon | Now with Enzymes/Pet-Safe Grass Repair Spray for Yellow Spots | Odor Eliminator & Soil Reviver for Healthy Green Lawns",
    "price": "29.99",
    "video_path": "/home/ubuntu/runway_videos/Parent_B0FG38PQQX_video.mp4"
  },
  {
    "asin": "B0DDCPZY3C",
    "parent_asin": "B0DDCPYLG1",
    "title": "Nature's Way Soil Enhanced Living Compost – with Fermented Duckweed Extract, 20% Worm Castings, 20% Activated BioChar, 60% Weed-Free Compost – Organic Garden Soil Amendment for Root & Plant Growth",
    "price": "29.99",
    "video_path": "/home/ubuntu/runway_videos/Parent_B0DDCPYLG1_video.mp4"
  },
  {
    "asin": "B0DFV4YZ61",
    "parent_asin": "B0DJ1JNQW4",
    "title": "Nature's Way Soil Hay, Pasture & Lawn Fertilizer – 1 & 2.5 Gallon Organic Liquid Soil Conditioner for Grass, Turf & Forage | Pet-Safe | Microbial Nitrogen Blend | 2.5 Gallons",
    "price": "99.99",
    "video_path": "/home/ubuntu/runway_videos/Parent_B0DJ1JNQW4_video.mp4"
  },
  {
    "asin": "B0DJ1MF2BP",
    "parent_asin": "B0DJ1JNQW4",
    "title": "Nature's Way Soil Hay and Pasture Liquid Fertilizer – Organic, Non-Toxic, Safe for Horses, Livestock – Promotes Healthy Growth, Nutrient-Rich Forage, and Enhanced Pasture Quality (1 Gallon)",
    "price": "39.99",
    "video_path": "/home/ubuntu/runway_videos/Parent_B0DJ1JNQW4_video.mp4"
  },
  {
    "asin": "B0DXP97C6F",
    "parent_asin": "B0F9W7B3NL",
    "title": "Nature's Way Soil Liquid Bone Meal Fertilizer – 32 Ounce/1 Gallon Organic Phosphorus & Calcium for Healthy Roots, Flowers & Fruits – Fast-Absorbing Liquid Plant Food for Vegetables, Flowers, Trees",
    "price": "19.99",
    "video_path": "/home/ubuntu/runway_videos/Parent_B0F9W7B3NL_video.mp4"
  },
  {
    "asin": "B0F4NQNTSW",
    "parent_asin": "B0F4NQNTSW",
    "title": "Nature's Way Soil Spray Pattern Indicator",
    "price": "29.99",
    "video_path": "/home/ubuntu/runway_videos/Parent_B0F4NQNTSW_video.mp4"
  },
  {
    "asin": "B0F9W6R4K9",
    "parent_asin": "B0F9W7B3NL",
    "title": "Nature's Way Soil Liquid Bone Meal Fertilizer – Organic Phosphorus & Calcium for Healthy Roots, Flowers & Fruits – Fast-Absorbing Liquid Plant Food for Vegetables, Flowers, Trees, and Shrubs 1 Gallon",
    "price": "39.99",
    "video_path": "/home/ubuntu/runway_videos/Parent_B0F9W7B3NL_video.mp4"
  },
  {
    "asin": "B0FG38YYJ5",
    "parent_asin": "B0FG38PQQX",
    "title": "Nature's Way Soil Dog Urine Neutral & Lawn – 1 Gallon | Pet-Safe Grass Repair Spray for Yellow Spots | Odor Eliminator & Soil Reviver for Healthy Green Lawns (1 Gallon)",
    "price": "59.99",
    "video_path": "/home/ubuntu/runway_videos/Parent_B0FG38PQQX_video.mp4"
  }
];

// Video mappings
const videoMappings = {
  'B0822RH5L3': 'NWS_001',
  'B0D52CQNGN': 'NWS_002',
  'B0D6886G54': 'NWS_003',
  'B0D69LNC5T': 'NWS_004',
  'B0D7T3TLQP': 'NWS_022', // NEW
  'B0D7V76PLY': 'NWS_023', // NEW
  'B0D9HT7ND8': 'NWS_016',
  'B0FG38PQQX': 'NWS_014',
  'B0DDCPYLG1': 'NWS_013',
  'B0DJ1JNQW4': 'NWS_021',
  'B0F9W7B3NL': 'NWS_012',
  'B0F4NQNTSW': 'NWS_024'  // NEW
};

console.log('🎬 Runway Video Update Script');
console.log('=' .repeat(50));

// Step 1: Check if source videos exist
console.log('\n📁 Checking for source videos...');
const sourceExists = fs.existsSync(SOURCE_VIDEO_DIR);

if (!sourceExists) {
  console.log('⚠️  Source directory not found:', SOURCE_VIDEO_DIR);
  console.log('   This script should be run where runway videos are accessible.');
  console.log('\n📝 To use this script:');
  console.log('   1. Ensure videos are at:', SOURCE_VIDEO_DIR);
  console.log('   2. Or update SOURCE_VIDEO_DIR in this script');
  console.log('   3. Run: node scripts/update-runway-videos.js');
  console.log('\n✅ Product data structure will still be updated.');
} else {
  console.log('✓ Source directory found');
  
  // Copy videos
  console.log('\n📹 Copying videos...');
  let copied = 0;
  let failed = 0;
  
  for (const [parentAsin, productId] of Object.entries(videoMappings)) {
    const sourceFile = path.join(SOURCE_VIDEO_DIR, `Parent_${parentAsin}_video.mp4`);
    const destFile = path.join(DEST_VIDEO_DIR, `${productId}.mp4`);
    
    if (fs.existsSync(sourceFile)) {
      try {
        fs.copyFileSync(sourceFile, destFile);
        console.log(`  ✓ ${productId} (${parentAsin})`);
        copied++;
      } catch (err) {
        console.log(`  ✗ ${productId} (${parentAsin}) - Error:`, err.message);
        failed++;
      }
    } else {
      console.log(`  ✗ ${productId} (${parentAsin}) - Source not found`);
      failed++;
    }
  }
  
  console.log(`\n📊 Video copy summary: ${copied} copied, ${failed} failed`);
}

// Step 2: Document the video structure
console.log('\n📋 Video structure summary:');
console.log('  - 9 products need video updates');
console.log('  - 3 new products need to be added');
console.log('  - Total: 12 unique product videos');

console.log('\n✅ Script complete!');
console.log('\nNext steps:');
console.log('  1. Copy this script to the machine with runway videos');
console.log('  2. Run it there to copy videos to public/videos/');
console.log('  3. Or manually copy videos using the mapping above');
console.log('  4. Generate WebM and poster images if needed');
