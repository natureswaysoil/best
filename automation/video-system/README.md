# Video System Integration (Submodule)

This repo now includes the upstream video generation system as a Git submodule at:

- Path: `automation/video-system/upstream`
- Source: https://github.com/natureswaysoil/video

We keep the upstream history intact and sync updates via standard submodule workflows.

## What this adds
- Generate product videos from prompts/templates (HeyGen + OpenAI)
- Google Sheets-driven content and writeback
- Hooks for scheduling and (optionally) posting via Buffer/Zapier

## Quick start
1) Initialize and install dependencies for the upstream module:
   - From repo root:
     - `git submodule update --init --recursive`
     - `cd automation/video-system/upstream`
     - `npm ci`
2) Configure secrets (see below), then test a dry run:
   - From repo root: `./scripts/dry-run-video.sh`

## Secrets and configuration
Use Google Secret Manager in project `amazon-ppc-474902` (approved) for production. For local dev, you can export env vars temporarily.

Required secrets (production names in Secret Manager):
- `HEYGEN_API_KEY`: HeyGen API key
- `OPENAI_API_KEY`: OpenAI API key
- `GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON`: Service Account JSON with Sheets/Drive access
- Optional if using native posting (we prefer Zapier+Buffer here):
  - `BUFFER_ACCESS_TOKEN` (if posting directly)

Provision secrets (interactive):
- `./scripts/setup-secrets.sh` (uses env vars you export for one-time upload)

## Hybrid logic (planned)
We will prefer existing static videos when available, and only call HeyGen to generate a new video when a product asset is missing.
- Static source: `public/videos/` (MP4/WEBM/JPG)
- Fallback: Generate via upstream system (HeyGen/OpenAI)

CLI glue: a small wrapper will enumerate products, check for `public/videos/{ID}.mp4`, and either emit the static URL or invoke upstream generation. This will feed the “Video URL” back to the Sheet for Zapier.

## Zapier + Buffer
Recommended flow (no Buffer keys needed in this repo):
- Trigger: New (or Updated) Row in Google Sheets
- Action: Buffer — Add to Buffer
- Map the “Media/Video URL” to the column the pipeline writes (e.g., `Video URL`)
- Add caption/hashtags from columns

## Deploying to GCP (production)
- We will wire a Cloud Run Job that runs on a schedule via Cloud Scheduler.
- Job environment pulls secrets from Secret Manager.
- Use the upstream deploy scripts or `scripts/deploy-gcp.sh` (wrapper to be added).

## Submodule maintenance
- Pull latest upstream changes:
  - `cd automation/video-system/upstream && git fetch && git checkout main && git pull`
  - `cd - && git add automation/video-system/upstream && git commit -m "chore(video): bump submodule to latest"`

---
If you prefer a full code copy (no submodule), let me know and I can vendor selected directories and remove the submodule.
