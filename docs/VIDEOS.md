# Product Videos: Import & Preview

This repo can host ASIN-based product videos under `public/videos/`. Use the helper script to import a JSON list and generate an index for preview.

## JSON format

Array of objects with at least `asin` and `video_path`:

```json
[
  {
    "asin": "B0822RH5L3",
    "parent_asin": "B0822RH5L3",
    "title": "Product title",
    "price": "20.99",
    "video_path": "/home/ubuntu/runway_videos/Parent_B0822RH5L3_video.mp4"
  }
]
```

## Import videos

```bash
# From repo root
./scripts/import-videos.sh path/to/list.json        # copy files
# or
./scripts/import-videos.sh path/to/list.json --symlink  # symlink instead of copy
```

- Videos are placed at `public/videos/<asin>.mp4`
- An index is written to `public/videos/index.json` for files that were found

If your sources are on a different machine (e.g., `/home/ubuntu` on a VM), copy them locally first or mount the directory, then run the script.

## Preview in browser

Serve the repo (or push to GitHub Pages) and open:

- `/public/video-demo/` — lists all videos found in `public/videos/index.json`

## Notes

- If you adopt a different naming scheme (e.g., by parent_asin), update the script accordingly.
- Keep files under ~25–50 MB for smoother CDN delivery.
- Do not commit proprietary or sensitive content that shouldn't be public.
