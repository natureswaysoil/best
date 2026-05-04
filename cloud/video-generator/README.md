# Google Cloud video + social poster

This Cloud Run Job renders the top five seed-style product videos, optionally saves the generated assets to Cloud Storage, and then runs the existing social media automation.

## Why this runs in Google Cloud

Video rendering uses FFmpeg and can take longer than a normal web build. Vercel should serve the website. Google Cloud Run Jobs should generate videos and handle social posting.

## What the job runs

The container command is:

```bash
npm run video:social
```

That runs this sequence:

1. Load configured runtime settings from Google Secret Manager.
2. Generate all five quality seed-style product videos.
3. Optionally copy generated MP4, JPG, and JSON plan files to Cloud Storage.
4. Run the existing social media auto-poster.

## Generated files

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

## Google Secret Manager

The job loads platform credentials and posting settings by name from Google Secret Manager. The Cloud Run Job service account needs permission to access those secret versions.

```bash
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
  --role="roles/secretmanager.secretAccessor"
```

You can add extra secret names at deploy time with:

```bash
--set-env-vars GOOGLE_SECRET_NAMES="EXTRA_NAME_ONE,EXTRA_NAME_TWO"
```

## Cloud Storage output

Set a bucket and prefix to persist finished output files:

```bash
VIDEO_OUTPUT_BUCKET="natureswaysoil-videos"
VIDEO_OUTPUT_PREFIX="seed-videos"
```

The job service account needs storage write access:

```bash
gcloud storage buckets add-iam-policy-binding "gs://natureswaysoil-videos" \
  --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
  --role="roles/storage.objectAdmin"
```

## Best quality setup

For better video quality, provide either a Pexels key in Secret Manager or your own b-roll clips in the repo:

```text
public/broll/NWS_014/
public/broll/NWS_011/
public/broll/NWS_013/
public/broll/NWS_021/
public/broll/NWS_018/
public/broll/shared/
```

## Build and deploy

```bash
export PROJECT_ID="YOUR_GOOGLE_CLOUD_PROJECT_ID"
export REGION="us-east1"
export IMAGE="gcr.io/$PROJECT_ID/nws-video-generator:latest"
export SERVICE_ACCOUNT_EMAIL="YOUR_CLOUD_RUN_JOB_SERVICE_ACCOUNT"

gcloud builds submit \
  --tag "$IMAGE" \
  --file cloud/video-generator/Dockerfile \
  .

gcloud run jobs deploy nws-video-generator \
  --image "$IMAGE" \
  --region "$REGION" \
  --service-account "$SERVICE_ACCOUNT_EMAIL" \
  --tasks 1 \
  --max-retries 0 \
  --cpu 2 \
  --memory 4Gi \
  --task-timeout 1800 \
  --set-env-vars FFMPEG_TIMEOUT_MS=900000,JOB_STEP_TIMEOUT_MS=1800000,VIDEO_OUTPUT_BUCKET=natureswaysoil-videos,VIDEO_OUTPUT_PREFIX=seed-videos,NEXT_PUBLIC_SITE_URL=https://www.natureswaysoil.com
```

Run it:

```bash
gcloud run jobs execute nws-video-generator \
  --region "$REGION" \
  --wait
```

## Testing switches

Skip social posting while testing:

```bash
--set-env-vars SKIP_SOCIAL_POSTING=1
```

Force image-only Instagram fallback:

```bash
--set-env-vars SOCIAL_FORCE_IMAGE_ONLY=1
```

## Important note

Instagram Reels require a publicly accessible video URL. If `/videos/{PRODUCT_ID}.mp4` is not yet public on the website, YouTube and X/Twitter native uploads may still work from the job filesystem, but Instagram may require the finished MP4 files to be available through the website or a public Cloud Storage URL.
