# Hero Video Replacement Guide

This guide explains how to replace the hero video on the Nature's Way Soil website.

## Current Setup

The hero video is configured to use the local video file located at:
```
/public/videos/website-hero.mp4
```

The video is referenced via an environment variable in the `.env.local` file:
```
NEXT_PUBLIC_HERO_VIDEO_URL=/videos/website-hero.mp4
```

## Video Specifications

The current hero video has the following specifications:
- **Resolution**: 1920x1080 (Full HD)
- **Duration**: 85 seconds
- **Format**: MP4 (H.264 codec recommended)
- **File Size**: ~40MB

## How to Replace the Hero Video

### Method 1: Replace the Existing File (Recommended)

1. **Prepare your new video**:
   - Format: MP4 (H.264 codec)
   - Recommended resolution: 1920x1080 or higher
   - Recommended duration: 30-90 seconds
   - Keep file size reasonable (under 50MB for faster loading)

2. **Replace the file**:
   ```bash
   # Backup the old video (optional)
   cp public/videos/website-hero.mp4 public/videos/website-hero-backup.mp4
   
   # Copy your new video
   cp /path/to/your/new-video.mp4 public/videos/website-hero.mp4
   ```

3. **Test locally**:
   ```bash
   npm run dev
   ```
   Open http://localhost:3000 and verify the new video plays correctly.

4. **Optional: Create WebM version** (for better browser compatibility):
   ```bash
   ffmpeg -i public/videos/website-hero.mp4 -c:v libvpx-vp9 -crf 30 -b:v 0 public/videos/website-hero.webm
   ```

### Method 2: Use a Different Video File

1. **Add your new video** to the `public/videos/` directory:
   ```bash
   cp /path/to/your/new-video.mp4 public/videos/my-new-hero.mp4
   ```

2. **Update the .env.local file**:
   ```
   NEXT_PUBLIC_HERO_VIDEO_URL=/videos/my-new-hero.mp4
   ```

3. **Restart the development server**:
   ```bash
   npm run dev
   ```

### Method 3: Use a CDN-Hosted Video

1. **Upload your video** to a CDN or video hosting service (e.g., Cloudflare, AWS S3, Vimeo)

2. **Update the .env.local file** with the full URL:
   ```
   NEXT_PUBLIC_HERO_VIDEO_URL=https://your-cdn.com/path/to/video.mp4
   ```

3. **Restart the development server**:
   ```bash
   npm run dev
   ```

## Video Optimization Tips

### Compress Video for Web

To optimize your video for web delivery:

```bash
# Using FFmpeg to create a web-optimized MP4
ffmpeg -i input-video.mp4 \
  -c:v libx264 \
  -preset slow \
  -crf 23 \
  -vf scale=1920:1080 \
  -c:a aac \
  -b:a 128k \
  -movflags +faststart \
  public/videos/website-hero.mp4
```

Options explained:
- `-c:v libx264`: Use H.264 codec for wide compatibility
- `-preset slow`: Better compression (slower encoding)
- `-crf 23`: Constant rate factor (18-28, lower = better quality)
- `-vf scale=1920:1080`: Scale to Full HD
- `-movflags +faststart`: Enable progressive loading

### Create Multiple Formats (Future Enhancement)

For best browser compatibility, you can provide both MP4 and WebM formats:

```bash
# Create MP4
ffmpeg -i input.mp4 -c:v libx264 -crf 23 public/videos/website-hero.mp4

# Create WebM
ffmpeg -i input.mp4 -c:v libvpx-vp9 -crf 30 public/videos/website-hero.webm
```

**Note**: The current implementation uses a single video source via the `NEXT_PUBLIC_HERO_VIDEO_URL` environment variable. To support multiple formats, you would need to modify `components/HeroVideo.tsx` to use multiple `<source>` elements:

```jsx
<video>
  <source src="/videos/website-hero.webm" type="video/webm" />
  <source src="/videos/website-hero.mp4" type="video/mp4" />
</video>
```

This is a suggested future enhancement for improved browser compatibility.

## Adding Video Captions (Optional)

1. **Create a VTT caption file** (`public/videos/website-hero.vtt`):
   ```
   WEBVTT

   00:00:00.000 --> 00:00:05.000
   A lush, thriving forest with diverse flora

   00:00:05.000 --> 00:00:10.000
   Natural soil enrichment in action
   ```

2. The caption file is already referenced in the `HeroVideo` component

## Troubleshooting

### Video Not Playing
- Check that the video file exists in `public/videos/`
- Verify the `.env.local` file has the correct path
- Check browser console for errors
- Ensure video format is compatible (MP4/H.264 recommended)

### Video Loads Slowly
- Reduce file size by compressing the video
- Use a CDN for faster delivery
- Ensure `-movflags +faststart` is set for progressive loading

### Autoplay Not Working
- Autoplay requires the video to be muted
- Some browsers block autoplay even when muted
- The component handles this automatically

## Current Configuration

The system is currently configured as follows:

- **Video Location**: `/public/videos/website-hero.mp4`
- **Environment Variable**: `NEXT_PUBLIC_HERO_VIDEO_URL=/videos/website-hero.mp4`
- **Component**: `components/HeroVideo.tsx`
- **Video Properties**: Autoplay, Loop, Muted, Playsinline
- **Size**: 40MB
- **Resolution**: 1920x1080
- **Duration**: 85 seconds

## File Locations

```
project-root/
├── .env.local                    # Environment configuration (not in git)
├── .env.local.example            # Example environment file
├── components/HeroVideo.tsx      # Hero video component
└── public/videos/
    ├── website-hero.mp4          # Current hero video
    ├── website-hero.webm         # WebM version
    └── website-hero.vtt          # Caption file (optional)
```

## Production Deployment

When deploying to production (Vercel), set the environment variable in your deployment platform:

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add: `NEXT_PUBLIC_HERO_VIDEO_URL=/videos/website-hero.mp4`
4. Redeploy your application

## Questions?

If you have questions or issues replacing the hero video, please refer to:
- Project README.md
- Contact the development team
