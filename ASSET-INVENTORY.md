# Nature's Way Soil Asset Inventory for Deployment

## Summary
- **Total Files**: 40 files
- **Total Size**: 6.5MB
- **Target**: Deploy to main website at https://www.natureswaysoil.com

## Asset Breakdown

### 📹 Video Assets (36 files)
Located in `/public/videos/`

#### Product Videos (11 products, 3 formats each):
- **MP4 Format**: 12 files (~200-230KB each, ~2.5MB total)
- **WebM Format**: 12 files (~280-320KB each, ~3.6MB total)  
- **Thumbnail Images**: 12 JPG files (~30-37KB each, ~400KB total)

**Product IDs**: NWS_001, NWS_002, NWS_003, NWS_004, NWS_006, NWS_011, NWS_012, NWS_013, NWS_014, NWS_016, NWS_018, NWS_021

### 🖼️ Image Assets (Missing - Documentation Only)
Located in `/public/images/` and `/public/products/`
- **Status**: Directory exists but no actual image files present
- **Expected**: 15+ product images (see README files for requirements)
- **Action Needed**: Images need to be sourced from Amazon listings

### 📊 Dashboard Assets (1 file)
Located in `/public/dashboard/`
- **Alternative Dashboard**: `index.html` (simplified version)

### 📄 Documentation (3 files)
- `images/README.md` - Image requirements specification
- `products/README.md` - Product image naming conventions
- `videos/README.md` - Video specifications and generation guide

## Deployment Requirements

### Video File Organization
Current structure: `/public/videos/NWS_XXX.{mp4,webm,jpg}`
Target structure for main website: `/videos/NWS_XXX.{mp4,webm,jpg}`

### Missing Components Requiring Action
1. **Product Images**: Need to source 15+ product images from Amazon
2. **Hero Video**: Main homepage video (referenced in videos/README.md)
3. **Captions**: VTT subtitle files for accessibility

### Deployment Targets
1. **Primary**: Main website repository (natureswaysoil.github.io)
2. **Alternative**: Direct Vercel deployment
3. **Backup**: Current dashboard location with asset links

## Size Optimization Opportunities
- WebM files are ~40% larger than MP4 equivalents
- Consider using only MP4 for broad compatibility
- Thumbnail JPGs are well-optimized at ~30-35KB each

## Recommended Deployment Strategy
1. Create deployment script to sync `/public/videos/` to main website
2. Preserve file structure for product pages integration
3. Add missing product images from Amazon sources
4. Test video playback on main website after deployment
5. Update any hardcoded asset URLs in main website code