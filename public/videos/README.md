# Videos Directory

This directory contains video content for the Nature's Way Soil website.

## Hero Video

- File: `website-hero.mp4`
  - Main hero video for homepage
  - Recommended duration: 30–60 seconds
  - Format: MP4 (H.264 codec)
  - Resolution: 1920x1080 (Full HD) preferred, 1280x720 minimum
  - Aspect ratio: 16:9

- Captions: `website-hero.vtt`
  - WebVTT subtitle/caption file
  - For accessibility compliance

## Product Videos

- Product detail pages support individual product videos and are now referenced by convention: `/videos/{PRODUCT_ID}.mp4`.
- We’ve set `video: '/videos/{ID}.mp4'` for each product in `data/products.ts`.
- The generator outputs 30s, 1280x720 H.264 MP4s.

### Regenerate All Product Videos

Use the generator script (pulls from product usage text):

```bash
npm run videos
```

Outputs are placed in `public/videos/{ID}.mp4`.

## Video Specifications

- Format: MP4 (H.264)
- Resolution: 1280x720 (current generator) or 1920x1080 if desired
- Frame Rate: 30 fps
- File Size: Optimize for web; under ~5–20 MB typical for short clips
- Audio: Optional; product videos default to muted playback with user controls
- Captions: Add VTT files as needed for accessibility

## UI Controls and Posters

- Product pages include Play/Pause and Mute/Unmute.
- A poster image is shown before playback using the product’s first image.

## Compression and Bitrate Tuning (Optional)

The generator uses libx264 with CRF-based encoding (CRF 23). If you need smaller files or higher quality:

- CRF: Lower = higher quality & larger size (range ~18–28). Current default: 23.
- Preset: `veryfast` → `veryslow` (slower = better compression at same quality). Default: `medium`.
- Bitrate cap: Use `-maxrate`/`-bufsize` to smooth peak bitrate.

Examples:

Shrink with higher CRF (quick):

```bash
ffmpeg -y -i public/videos/NWS_001.mp4 -c:v libx264 -preset fast -crf 26 -c:a aac -b:a 96k public/videos/NWS_001.small.mp4
```

Cap video bitrate (~800 kbps) for streaming friendliness:

```bash
ffmpeg -y -i public/videos/NWS_001.mp4 -c:v libx264 -preset medium -crf 23 -maxrate 800k -bufsize 1600k -c:a aac -b:a 96k public/videos/NWS_001.capped.mp4
```

Batch re-encode all product videos:

```bash
for f in public/videos/NWS_*.mp4; do 
  ffmpeg -y -i "$f" -c:v libx264 -preset fast -crf 26 -c:a aac -b:a 96k "${f%.mp4}.small.mp4";
done
```

Preview quality before replacing originals. If satisfied, either overwrite the original files or update `data/products.ts` to point to the new filenames.
