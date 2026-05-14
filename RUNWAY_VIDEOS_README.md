# Runway Video Integration Guide

This document explains how to integrate the new Runway-generated videos into the Nature's Way Soil website.

## Overview

This update adds 12 product videos from Runway AI generation to replace existing videos and add new product videos.

### Video Mapping

| Parent ASIN | Product ID | Status | Title |
|-------------|------------|--------|-------|
| B0822RH5L3 | NWS_001 | UPDATE | Natural Liquid Fertilizer |
| B0D52CQNGN | NWS_002 | UPDATE | Horticultural Activated Charcoal |
| B0D6886G54 | NWS_003 | UPDATE | Organic Tomato Liquid Fertilizer |
| B0D69LNC5T | NWS_004 | UPDATE | Soil Booster and Loosener |
| B0D9HT7ND8 | NWS_016 | UPDATE | Organic Hydroponic Fertilizer |
| B0F9W7B3NL | NWS_012 | UPDATE | Liquid Bone Meal Fertilizer |
| B0DDCPYLG1 | NWS_013 | UPDATE | Enhanced Living Compost |
| B0FG38PQQX | NWS_014 | UPDATE | Dog Urine Neutralizer |
| B0DJ1JNQW4 | NWS_021 | UPDATE | Horse Safe Hay & Pasture Fertilizer |
| B0D7T3TLQP | NWS_022 | **NEW** | Orchid & African Violet Potting Mix |
| B0D7V76PLY | NWS_023 | **NEW** | Organic Orchid Fertilizer |
| B0F4NQNTSW | NWS_024 | **NEW** | Spray Pattern Indicator |

## Quick Start

### Option 1: Automated Copy (Recommended)

If you have access to the runway videos directory:

```bash
# Run the automated copy script
./scripts/copy-runway-videos.sh
```

This will:
- Copy all 12 videos from `/home/ubuntu/runway_videos/` 
- Rename them from `Parent_{ASIN}_video.mp4` to `NWS_{ID}.mp4`
- Place them in `public/videos/`

### Option 2: Node.js Script

```bash
# Run the Node.js update script
node scripts/update-runway-videos.js
```

### Option 3: Manual Copy

If scripts don't work, manually copy videos:

```bash
# Example for one product
cp /home/ubuntu/runway_videos/Parent_B0822RH5L3_video.mp4 public/videos/NWS_001.mp4
```

See the full mapping table above for all products.

## File Structure

Videos should be placed in: `/public/videos/`

Expected format:
- `NWS_001.mp4` - Main video file (required)
- `NWS_001.webm` - WebM version (optional, for better browser support)
- `NWS_001.jpg` - Video poster/thumbnail (optional)

## What's Already Done

✅ **Product data updated** - All product entries in `data/products.ts` now reference the correct video files

✅ **New products added** - Three new products (NWS_022, NWS_023, NWS_024) have been added to the catalog

✅ **Image placeholders created** - Placeholder images have been created for new products in `public/images/products/`

✅ **Scripts created** - Automated scripts are ready in `scripts/` directory

## What You Need to Do

1. **Copy the videos** - Use one of the methods above to copy videos from the runway directory

2. **Verify videos** - Check that all 12 videos are in place:
   ```bash
   ls -la public/videos/NWS_*.mp4
   ```

3. **Optional: Generate WebM versions** - For better browser compatibility:
   ```bash
   # If you have ffmpeg installed
   for file in public/videos/NWS_*.mp4; do
     ffmpeg -i "$file" -c:v libvpx-vp9 -b:v 2M "${file%.mp4}.webm"
   done
   ```

4. **Optional: Generate poster images** - Extract first frame as poster:
   ```bash
   for file in public/videos/NWS_*.mp4; do
     ffmpeg -i "$file" -ss 00:00:01 -vframes 1 "${file%.mp4}.jpg"
   done
   ```

5. **Replace product images** - Update the placeholder images for new products:
   - `public/images/products/NWS_022/main.jpg` - Orchid Mix product photo
   - `public/images/products/NWS_023/main.jpg` - Orchid Fertilizer product photo
   - `public/images/products/NWS_024/main.jpg` - Spray Indicator product photo

6. **Test the website**:
   ```bash
   npm run dev
   ```
   
   Then visit:
   - http://localhost:3000/product/NWS_001
   - http://localhost:3000/product/NWS_022 (new)
   - http://localhost:3000/product/NWS_023 (new)
   - http://localhost:3000/product/NWS_024 (new)

## Source Video Locations

The source videos from Runway should be at:
```
/home/ubuntu/runway_videos/Parent_B0822RH5L3_video.mp4
/home/ubuntu/runway_videos/Parent_B0D52CQNGN_video.mp4
/home/ubuntu/runway_videos/Parent_B0D6886G54_video.mp4
/home/ubuntu/runway_videos/Parent_B0D69LNC5T_video.mp4
/home/ubuntu/runway_videos/Parent_B0D7T3TLQP_video.mp4
/home/ubuntu/runway_videos/Parent_B0D7V76PLY_video.mp4
/home/ubuntu/runway_videos/Parent_B0D9HT7ND8_video.mp4
/home/ubuntu/runway_videos/Parent_B0FG38PQQX_video.mp4
/home/ubuntu/runway_videos/Parent_B0DDCPYLG1_video.mp4
/home/ubuntu/runway_videos/Parent_B0DJ1JNQW4_video.mp4
/home/ubuntu/runway_videos/Parent_B0F9W7B3NL_video.mp4
/home/ubuntu/runway_videos/Parent_B0F4NQNTSW_video.mp4
```

## Troubleshooting

### Videos not showing on website
- Check that video files exist in `public/videos/`
- Verify file names match exactly (case-sensitive)
- Check browser console for 404 errors
- Clear browser cache

### Videos too large
- Compress with ffmpeg: `ffmpeg -i input.mp4 -b:v 2M output.mp4`
- Consider using WebM format for better compression

### New products not appearing
- Run: `npm run build` to rebuild the site
- Clear Next.js cache: `rm -rf .next`
- Check that product IDs are correct in `data/products.ts`

## Product Details for New Items

### NWS_022 - Orchid & African Violet Potting Mix
- ASIN: B0D7T3TLQP
- Price: $29.99
- Category: Soil Mix
- Description: Premium coco coir-based potting mix with worm castings, activated biochar, and perlite

### NWS_023 - Organic Orchid Fertilizer
- ASIN: B0D7V76PLY  
- Price: $24.99
- Category: Fertilizer
- Description: Ready-to-use organic orchid fertilizer in 8-ounce spray bottle

### NWS_024 - Spray Pattern Indicator
- ASIN: B0F4NQNTSW
- Price: $29.99
- Category: Application Tool
- Description: Professional spray pattern indicator dye for precise application tracking

## Questions?

If you encounter issues:
1. Check that all source videos exist
2. Verify file permissions (videos should be readable)
3. Ensure video format is compatible (H.264 MP4 is best)
4. Check Next.js logs: `npm run dev` and look for errors

## Summary

- ✅ 9 existing products have updated video references
- ✅ 3 new products have been added to the catalog
- ✅ Product data structure is complete
- ⏳ Videos need to be copied from source location
- ⏳ Product images for new items should be updated from placeholders
