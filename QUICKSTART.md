# 🚀 Quick Start - Runway Video Integration

## What Was Done ✅

Your website structure has been fully prepared for the Runway videos:

1. ✅ **3 new products added** to the catalog (NWS_022, NWS_023, NWS_024)
2. ✅ **Product data updated** - all 15 products configured with video references
3. ✅ **Scripts created** - automated tools for video management
4. ✅ **Documentation complete** - comprehensive guides included
5. ✅ **Structure ready** - all directories and files in place

## What You Need to Do 🎯

### Step 1: Copy the Runway Videos

The actual Runway-generated videos need to be copied from `/home/ubuntu/runway_videos/` to the website.

**Option A - Automated (Recommended):**
```bash
./scripts/copy-runway-videos.sh
```

**Option B - Manual Copy:**
```bash
# For the 3 new products:
cp /home/ubuntu/runway_videos/Parent_B0D7T3TLQP_video.mp4 public/videos/NWS_022.mp4
cp /home/ubuntu/runway_videos/Parent_B0D7V76PLY_video.mp4 public/videos/NWS_023.mp4
cp /home/ubuntu/runway_videos/Parent_B0F4NQNTSW_video.mp4 public/videos/NWS_024.mp4
```

### Step 2: Verify Video Status
```bash
./scripts/check-video-status.sh
```

You should see all 12 videos showing ✅

### Step 3: Update Product Images (Optional)

Replace placeholder images with actual product photos:
```bash
# Update these files with actual product photography:
public/images/products/NWS_022/main.jpg  # Orchid Mix photo
public/images/products/NWS_023/main.jpg  # Orchid Fertilizer photo
public/images/products/NWS_024/main.jpg  # Spray Indicator photo
```

### Step 4: Test Locally
```bash
npm run dev
```

Visit:
- http://localhost:3000/shop (should show 15 products)
- http://localhost:3000/product/NWS_022 (new Orchid Mix)
- http://localhost:3000/product/NWS_023 (new Orchid Fertilizer)
- http://localhost:3000/product/NWS_024 (new Spray Indicator)

### Step 5: Deploy
```bash
npm run build
# Then deploy using your normal process
```

## 📊 Current Status

**Products**: 15 total (12 existing + 3 new)
- ✅ NWS_001 through NWS_021 (existing products)
- ✅ NWS_022 (NEW - Orchid Mix)
- ✅ NWS_023 (NEW - Orchid Fertilizer)
- ✅ NWS_024 (NEW - Spray Indicator)

**Videos**: 
- ✅ 9 existing videos ready
- ⚠️ 3 new videos using placeholders (need Runway videos)

## 📚 Documentation

- **`RUNWAY_VIDEOS_README.md`** - Complete integration guide
- **`RUNWAY_INTEGRATION_SUMMARY.md`** - Detailed summary of changes
- **This file** - Quick start instructions

## 🔍 Verification

To check everything is working:
```bash
# Check video status
./scripts/check-video-status.sh

# Verify product count
grep "id: 'NWS_" data/products.ts | wc -l
# Should output: 15

# List all product videos
ls -1 public/videos/NWS_*.mp4
# Should show 15 video files
```

## ❓ Need Help?

- Videos not showing? Check `RUNWAY_VIDEOS_README.md` troubleshooting section
- Script issues? All scripts have error messages and suggestions
- Product data questions? See `data/products.ts` with complete structure

## 🎉 That's It!

Once you copy the 3 Runway videos for the new products, everything will be complete and ready to deploy!

---
**Quick Status Check**: Run `./scripts/check-video-status.sh` anytime
