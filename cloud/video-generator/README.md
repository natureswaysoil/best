# Google Cloud video generator

This folder turns the seed-style product video generator into a Google Cloud Run Job. Use it to render the top five product videos outside Vercel.

## Why this runs in Google Cloud

Video rendering uses FFmpeg and can take longer than a normal web build. Vercel should serve the website. Google Cloud Run Jobs should generate the MP4 files.

## What it generates

Running the job executes:

```bash
npm run videos
```

That creates:

```text
public/videos/NWS_014.mp4
public/videos/NWS_014.jpg
public/videos/NWS_011.mp4
public/videos/NWS_011.jpg
public/videos/NWS_013.mp4
public/videos/NWS_013.jpg
public/videos/NWS_021.mp4
public/videos/NWS_021.jpg
public/videos/NWS_018.mp4
public/videos/NWS_018.jpg
content/generated-videos/*-quality-seed-plan.json
```

## Best quality setup

For the best videos, provide at least one of these:

1. `PEXELS_API_KEY` as a Cloud Run Job environment variable.
2. Your own b-roll clips in the repo:

```text
public/broll/NWS_014/
public/broll/NWS_011/
public/broll/NWS_013/
public/broll/NWS_021/
public/broll/NWS_018/
public/broll/shared/
```

The generator uses product images, local b-roll, Pexels b-roll, and branded motion fallback scenes.

## Build and deploy

Set these first:

```bash
export PROJECT_ID="YOUR_GOOGLE_CLOUD_PROJECT_ID"
export REGION="us-east1"
export IMAGE="gcr.io/$PROJECT_ID/nws-video-generator:latest"
```

Build the container:

```bash
gcloud builds submit \
  --tag "$IMAGE" \
  --file cloud/video-generator/Dockerfile \
  .
```

Create or update the Cloud Run Job:

```bash
gcloud run jobs deploy nws-video-generator \
  --image "$IMAGE" \
  --region "$REGION" \
  --tasks 1 \
  --max-retries 0 \
  --cpu 2 \
  --memory 4Gi \
  --task-timeout 1800 \
  --set-env-vars FFMPEG_TIMEOUT_MS=900000
```

If you have a Pexels key:

```bash
gcloud run jobs update nws-video-generator \
  --region "$REGION" \
  --set-env-vars PEXELS_API_KEY="YOUR_PEXELS_API_KEY",FFMPEG_TIMEOUT_MS=900000
```

Run the job:

```bash
gcloud run jobs execute nws-video-generator \
  --region "$REGION" \
  --wait
```

## Important output note

The container writes the generated videos inside the job filesystem. For a production automation, the next step should upload finished videos to Cloud Storage or commit them back to GitHub. This PR prepares the generator to run in Google Cloud; it does not yet add the Cloud Storage upload step.
