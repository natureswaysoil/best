WaveSpeedai Video Script Runner - Nature's Way Soil

Overview
--------
This folder contains short video scripts for product marketing. Each file is named with the product ID and a short slug (e.g., `NWS_002-activated-charcoal.md`). Use these scripts as the basis for creating short 15-30s product videos in WaveSpeedai or any video generation tool.

Recommended Render Settings (WaveSpeedai)
----------------------------------------
- Aspect Ratio: 16:9 (1920x1080)
- Duration: 15-30 seconds (script indicates suggested length)
- Voiceover: Friendly, natural voice. US English preferred.
- Music: Light, upbeat acoustic or ambient track at low volume
- Transitions: Smooth dissolve or slide.
- Text overlays: Short, large sans-serif, centered.

How to use
----------
1. Open WaveSpeedai (or your video tool) and create a new project.
2. Copy the script content from the relevant `.md` file into the "script" or "scene" panels.
3. For each scene, supply visuals (stock footage or product B-roll):
   - Close-up shots of product, pouring, application, roots, lush plant growth.
4. Use the VO script lines for automatic TTS or record a human voiceover.
5. Keep each scene short (2-6 seconds) and follow the script timing.
6. Export as MP4 and upload to your site or host in your CDN.

Batch processing tips
---------------------
- Export scripts to a CSV with columns: product_id, title, script_text, target_duration.
- Use WaveSpeedai's batch API or bulk upload to create multiple projects with the same style.

After rendering
---------------
1. Upload the MP4 to your CDN (or Vercel public folder) and note the file URL.
2. Update `data/products.ts` for the product's `video` field to point to the MP4 URL.
3. Redeploy your site.

If you want, I can:
- Generate TTS voiceover audio files for each script (local generation with TTS tools) for you to upload.
- Create a CSV to batch import into WaveSpeedai if you have API access.

Contact
-------
If you run into issues rendering or want me to prepare the CSV or TTS files, tell me which option you prefer and I’ll prepare the artifacts.