# Copilot coding agent onboarding — Nature's Way Soil • `best` repo

Purpose
-------
This file gives a compact, practical orientation so a coding agent can make safe, fast, and correct changes to the `best` repository. Trust these instructions: follow them step‑by‑step and only search the repo when an instruction is missing or contradicts reality.

High level summary
------------------
- What this repo does: a static Amazon PPC dashboard (Plotly + vanilla JS) served on GitHub Pages (`gh-pages`) and optionally deployed to Vercel. It visualizes BigQuery data via a server‑side BigQuery proxy (Cloud Run / Cloud Functions). The repo also contains tooling and a video system (importer, demo, and integration code) for product videos.
- Repo size & type: small-to-medium (~30–200 files); static web + Node.js proxy + helper scripts + optional video microservices. Languages: HTML, JavaScript, Node.js, Bash; some TypeScript tooling for video system.

Key locations (start here)
--------------------------
- Root dashboard: `index.html` (main app). Alternative dashboard: `public/dashboard/index.html`.
- Video demo & import: `public/video-demo/`, `scripts/import-videos.sh`, `docs/VIDEOS.md`.
- BigQuery proxy: `cloud-functions/bq-proxy/` (files: `index.js`, `server.js`, `env.yaml`, `deploy-run.sh`, `Dockerfile`).
- GitHub Pages branch: `gh-pages` serves the site. Default branch: `main`.
- Vercel config: `vercel.json` and `scripts/deploy-vercel.sh`.
- Useful scripts: `scripts/import-videos.sh`, `scripts/deploy-vercel.sh`, `cloud-functions/bq-proxy/deploy-run.sh`.

Quick contract for changes
--------------------------
- Inputs: small code edits, scripts, or content changes in this repo.
- Expected outputs: site still serves (locally and on GH Pages), proxy continues to return CORS headers for allowed origins, no new build errors in CI. If you change public behavior, update docs and tests where applicable.
- Error modes: CORS misconfig, referencing non‑existent BigQuery columns (e.g., `roas`), Next.js build forced by Vercel config.

Build / run / validate (always follow this sequence)
-------------------------------------------------
1) Local preview (fast, always do first)
   - Start a local static server from repo root:
     python3 -m http.server 8086 --bind 0.0.0.0
   - Open http://localhost:8086 and visit `/?resetProxy=1` to clear cached proxy URL.

2) BigQuery proxy sanity (must do before live queries)
   - Preferred: use the deployed Cloud Run proxy at `https://bq-proxy-1009540130231.us-east4.run.app` (configured by default in `index.html`).
   - To test CORS and connectivity (replace origin as needed):
     curl -i -X POST "${PROXY_URL:-https://bq-proxy-1009540130231.us-east4.run.app/}" \
       -H "Content-Type: application/json" \
       -H "Origin: https://natureswaysoil.github.io" \
       -d '{"query":"SELECT 1 AS ok","location":"US","projectId":"amazon-ppc-474902"}'
   - Expect: HTTP 200 and header `Access-Control-Allow-Origin: https://natureswaysoil.github.io` (or your origin).

3) Proxy redeploy (if you change origins or code)
   - Edit `cloud-functions/bq-proxy/env.yaml` to add origins (supports `https://*.vercel.app`).
   - Deploy with: `cd cloud-functions/bq-proxy && ./deploy-run.sh amazon-ppc-474902 us-east4`.
   - Health check: `curl -I $URL/healthz` (Cloud Run uses `server.js` health endpoint at `/healthz`). Note: previously `/healthz` returned 404 for some revisions; prefer a small POST smoke test.

4) Vercel deployment guidance (static site)
   - If using Vercel, set Framework Preset: "Other" (important). Build/Output: leave empty. Production branch: `gh-pages`.
   - A `vercel.json` exists; it is minimal and relies on default static hosting. Avoid Next.js preset — it causes build errors if no `pages`/`app` dir exists.
   - CLI alternative: use `scripts/deploy-vercel.sh` (requires `vercel` CLI and auth). Prefer GitHub import for one‑time setup.

5) Video ingestion (how to import ASIN videos)
   - Prepare a JSON array with objects {asin,parent_asin,title,price,video_path}.
   - Run `./scripts/import-videos.sh path/to/list.json` (or add `--symlink` to symlink instead of copying).
   - This writes `public/videos/<ASIN>.mp4` and `public/videos/index.json` used by `public/video-demo/index.html` to preview.

Common pitfalls & fixes (learned from prior runs)
------------------------------------------------
- CORS failures: ensure `ALLOWED_ORIGINS` in `cloud-functions/bq-proxy/env.yaml` includes the exact origin or wildcard like `https://*.vercel.app`. Redeploy proxy after change.
- Unrecognized BigQuery column (e.g., `roas`): compute ROAS with SQL: `SUM(conversion_value)/NULLIF(SUM(cost),0)`.
- Vercel Next.js build errors: set project Framework to "Other" and clear Build Command; or remove `builds` entries in `vercel.json`.
- GH Pages serving static folders: add a `.nojekyll` file in repo root to prevent Jekyll from ignoring folders starting with an underscore or certain patterns.
- Browser manual OPTIONS preflight: avoid sending a manual OPTIONS request in tests — let the browser handle preflight; previously testProxy() did a manual OPTIONS which caused failures.
- Vercel CLI device auth: device codes expire; interactive login in this dev container can be flaky. Prefer UI import or a VERCEL_TOKEN for CLI automation.

Checks to run before creating a PR
---------------------------------
1) Local server loads: open `http://localhost:8086/?resetProxy=1` and confirm no console errors.
2) Proxy call: run the curl POST smoke test above for the expected origin.
3) Run video import (if changing video related code): `./scripts/import-videos.sh samples/videos.json --symlink` and open `/public/video-demo/` locally.
4) Lint/typecheck: this repo has minimal JS linting; if you change Node code, run `npm ci` then `npm test` if tests are added.

Project layout (short map)
-------------------------
Root files (important):
- `index.html` — main dashboard app (queries BigQuery via proxy).
- `public/` — static assets and alternate dashboards (`public/dashboard/`, `public/video-demo/`, `public/videos/`).
- `cloud-functions/bq-proxy/` — server code and deploy scripts for BigQuery proxy.
- `scripts/` — helper scripts (import-videos, deploy-vercel).
- `vercel.json` — Vercel config (kept minimal).
- `docs/VIDEOS.md` — video import docs.

CI / validation
---------------
- There is no formal GitHub Actions workflow in this repo by default; CI failures seen were due to incorrect Vercel framework settings (Next.js). Your main validations are: local static serve, proxy POST, and confirming GH Pages or Vercel site loads.
- To replicate a Vercel failure locally, try `npx vercel build` in the project root — it will show the same Next.js detection errors.

Secrets & runtime notes
-----------------------
- Do NOT commit service account JSON keys. Use the proxy (Cloud Run) so browser never needs keys.
- Environment: Node 20 used in proxy Dockerfile; Cloud Run/Functions use Node 20. Local dev uses Python 3 for static serving.
- Required env vars for proxy deployment: `ALLOWED_ORIGINS` and `NODE_OPTIONS`; Cloud Run will set `GOOGLE_CLOUD_PROJECT` automatically.

When to search the repo
-----------------------
Trust this doc first. Only search when:
- A file referenced here is missing or changed.
- You need to find specific SQL used in the dashboard (search for `campaign_performance`).
- You must update proxy code: search `cloud-functions/bq-proxy/index.js` and `env.yaml`.

Next steps for the video system (`natureswaysoil/video`)
-----------------------------------------------------
The video pipeline and posting tools live in a companion repo `natureswaysoil/video`. If your task is to finish video generation and social posting, follow these non‑repo‑specific steps:
1) Clone `natureswaysoil/video` and review `video-package.json`, `video-Dockerfile`, and `src/` for adapters (`heygen-adapter`, `youtube`, `instagram`, `twitter`, `sheets`).
2) Add required secrets to Secret Manager (HeyGen, OpenAI, GCP service account, social tokens) and document them in `video-env.example`.
3) Run a dry‑run of the pipeline locally (DRY_RUN mode) to generate jobs without posting. Validate writeback to Google Sheets.
4) After validation, enable posting integrations (Buffer/Zapier or native APIs) and run in staging.

Finish and trust the doc
------------------------
Follow these instructions. Only search the repo when necessary; prefer the documented scripts and smoke tests. If anything here is out of date, update this file before proceeding and note the change in your PR summary.

— end of onboarding (concise, follow these steps first)
# Copilot Instructions for Amazon PPC Dashboard Repository

## Repository Overview

This repository contains an **Amazon PPC Dashboard** for Nature's Way Soil, a static website hosted on GitHub Pages that visualizes Amazon advertising campaign performance data from BigQuery. The project consists of a frontend dashboard and a server-side BigQuery proxy for secure data access.

**Key Details:**
- **Repository Size:** Small (~20 files, primarily HTML/JavaScript)
- **Project Type:** Static website with cloud integration
- **Languages:** HTML, JavaScript, SQL, Bash, Node.js
- **Target Runtime:** GitHub Pages (static hosting) + Google Cloud (BigQuery, Cloud Functions/Run)
- **Main Domain:** https://natureswaysoil.github.io/best/
- **Current Branch:** gh-pages (GitHub Pages deployment branch)
- **Default Branch:** main

## Build Instructions & Validation

### Prerequisites
- **Google Cloud SDK** (gcloud CLI) - Required for BigQuery setup and cloud deployment
- **Node.js 18+** - For cloud function development (package.json specifies >=18.0.0)
- **jq** - JSON processor used by validation scripts

### Core Commands (Always run in this order)

#### 1. BigQuery Setup (One-time)
```bash
# Must have gcloud installed and authenticated first
./setup-bigquery.sh
```
**Postconditions:** Creates service account key file `bigquery-service-account-key.json`
**Dependencies:** Requires gcloud authentication and project permissions

#### 2. Validate Service Account Key
```bash
cat bigquery-service-account-key.json | ./validate-key.sh
```
**Always validate keys** before using in dashboard to prevent authentication errors.

#### 3. Test BigQuery Connection
```bash
./test-bigquery.sh
```
**Prerequisites:** Service account key file must exist. **Requires bq CLI tool.**
**Expected Output:** Query results showing data accessibility confirmation

#### 4. Deploy BigQuery Proxy (Cloud Functions)
```bash
cd cloud-functions/bq-proxy
./deploy.sh amazon-ppc-474902 us-east4
```
**Alternative Cloud Run deployment:**
```bash
## Copilot Coding Agent Onboarding for: Nature's Way Soil – Amazon PPC Dashboard

This document is a concise, repo-wide guide to help a coding agent implement, validate, and ship changes with minimal exploration and failures. Trust this guide; search only if something here is incomplete or provably incorrect.

---

## What this repo is
- Purpose: A static Amazon PPC Dashboard (Plotly-based) that reads performance data from Google BigQuery via a CORS-enabled proxy. Optional Cloud Functions automate PPC data sync and optimization.
- Hosting/runtime: GitHub Pages (static site) + Google Cloud (BigQuery, Cloud Run/Functions).
- Code size: Small; ~20–40 source files.
- Languages: HTML/JS (frontend), Node.js (proxy/functions), Bash (scripts), SQL (schemas).
- Live site: https://natureswaysoil.github.io/best/
- Branches: Work in `gh-pages` (site served from here). Default branch is `main`.

Key endpoints
- BigQuery proxy (Cloud Run): https://bq-proxy-1009540130231.us-east4.run.app
- Local dashboard: http://localhost:8086

Important data facts
- BigQuery project: amazon-ppc-474902
- Dataset: amazon_ppc
- Primary table: campaign_performance
- Schema highlights: date, campaign_name, campaign_id, impressions, clicks, cost, ctr, conversions, conversion_value, acos, created_at (+ some optional extras). There is no “roas” column; compute ROAS as SUM(conversion_value)/NULLIF(SUM(cost),0).

---

## Run, build, and validate changes

Prerequisites (install once)
- Google Cloud SDK (gcloud) with an authenticated account that has access to project amazon-ppc-474902.
- BigQuery CLI (bq) – installed with gcloud.
- Node.js 20.x for Cloud Run/Functions work (node18 is deprecated; prefer node20+).
- jq for JSON handling in shell scripts.

Local run (no build step)
1) Start a static server from repo root:
     - python3 -m http.server 8086 --bind 0.0.0.0
     - Open http://localhost:8086
2) The dashboard fetches data only via the proxy; ensure CORS allows your origin when testing locally.

Proxy CORS and health checks
- Proxy allows origins configured via env var ALLOWED_ORIGINS (Cloud Run). This repo provides `cloud-functions/bq-proxy/env.yaml`.
- To redeploy with correct CORS:
    - cd cloud-functions/bq-proxy
    - Ensure env.yaml contains needed origins (e.g., https://natureswaysoil.github.io,http://localhost:8086)
    - ./deploy-run.sh amazon-ppc-474902 us-east4
- Quick tests:
    - curl -I "$PROXY_URL/healthz"
    - curl -i -X POST "$PROXY_URL/" -H "Origin: http://localhost:8086" -H "Content-Type: application/json" -d '{"query":"SELECT 1 AS ok","location":"US","projectId":"amazon-ppc-474902"}'
    - Expect HTTP 200 and Access-Control-Allow-Origin with your origin.

BigQuery setup and sanity checks
- One-time dataset bootstrap (if needed): ./setup-bigquery.sh
- Validate key format (if you ever use a JSON key locally): cat bigquery-service-account-key.json | ./validate-key.sh
- Connection test: ./test-bigquery.sh
- Manual sanity query via proxy (US location): see curl example above.

Cloud Functions (optional, for automation)
- Locations in repo:
    - Proxy (Cloud Run): cloud-functions/bq-proxy/ (Express + Dockerfile)
    - Amazon sync: automation/cloud-functions/amazon-api-sync (Node.js)
    - PPC optimizer: automation/cloud-functions/ppc-optimizer (Node.js)
- Deploy examples (Functions Gen2, Node 20 recommended if supported in environment):
    - gcloud functions deploy amazon-ppc-sync --runtime=nodejs18 --trigger-http --allow-unauthenticated --region=us-east4 --service-account=amazon-sync-sa@amazon-ppc-474902.iam.gserviceaccount.com --set-env-vars=PROJECT_ID=amazon-ppc-474902
    - gcloud functions deploy amazon-ppc-optimizer --runtime=nodejs18 --trigger-http --allow-unauthenticated --region=us-east4 --service-account=ppc-optimizer-sa@amazon-ppc-474902.iam.gserviceaccount.com --set-env-vars=PROJECT_ID=amazon-ppc-474902
    - Note: Node 18 is nearing deprecation; prefer node20 where available. If runtime errors occur, consult Cloud Functions supported runtimes.

Validation pipeline (no CI; run manually, in order)
1) Scripts executable and error-free: chmod +x *.sh and run ./verify-setup.sh when present.
2) Proxy health and CORS: healthz + POST test with Origin header (expect 200 + Access-Control-Allow-Origin).
3) BigQuery access: ./test-bigquery.sh or curl via proxy.
4) Dashboard load: http://localhost:8086; open browser devtools to confirm proxy calls succeed.

Known pitfalls (and fixes)
- CORS failures (“Failed to fetch”): Ensure proxy URL is https and ALLOWED_ORIGINS contains your origin (GitHub Pages and/or localhost:8086). Redeploy proxy after changes.
- SQL errors for “roas”: The table has no roas column. Compute ROAS as SUM(conversion_value)/NULLIF(SUM(cost),0). The dashboard already uses this fix.
- Permissions errors: Service accounts need BigQuery roles (dataViewer + jobUser at minimum). See ./setup-bigquery.sh and MANUAL-SETUP.md.
- Runtime mismatches: Node 18 is deprecated; use Node 20+ for Cloud Run (Dockerfile uses node:20-alpine). Update Functions runtime as platform allows.
- Missing assets (images/videos): Not required for dashboard operation; ignore unless working on the site’s product media sections.
- Never commit service account JSON keys.

Expected timings
- Proxy redeploy (Cloud Run): ~1–3 minutes.
- BigQuery sanity query via proxy: ~0.2–2s per query.

---

## Project layout and where to change things

Root of repo (key files)
- index.html — main dashboard app (charts, queries, UI). Update SQL here if you change schema.
- bigquery-schema.sql — canonical schema for initial dataset.
- setup-bigquery.sh, test-bigquery.sh, validate-key.sh, verify-setup.sh — setup/validation scripts.
- cloud-functions/bq-proxy/ — proxy service (index.js handler + server.js for Cloud Run, Dockerfile, deploy-run.sh, env.yaml for CORS).
- automation/cloud-functions/amazon-api-sync — optional Amazon sync function (Node.js).
- automation/cloud-functions/ppc-optimizer — optional optimization function (Node.js).
- public/ — static assets for broader site sections.

Common change targets
- Frontend queries/UX: edit index.html.
- Proxy behavior/CORS: edit cloud-functions/bq-proxy/index.js and env.yaml; redeploy with deploy-run.sh.
- Automation: edit code under automation/cloud-functions/* and redeploy via gcloud.

Checks before committing a PR
- Open http://localhost:8086 and confirm charts render without console errors.
- Run proxy POST test from above; confirm 200 and the Access-Control-Allow-Origin header for your origin.
- If you changed SQL, run a proxy query to validate (avoid referencing non-existent columns like roas).
- If you changed proxy or functions, redeploy and validate endpoints return 200.

Trust these instructions
- Prefer these steps over ad-hoc exploration. Only search the repo if a step here is missing or demonstrably wrong.

Security and reliability
- Do not check in secrets. Prefer Google Secret Manager for credentials.
- Use least-privilege IAM roles for service accounts.
- Enforce HTTPS for all external requests from the browser (proxy is HTTPS).

That’s it — follow this to minimize build/run errors and speed up successful PRs.
**Data Layer:** Google BigQuery
- **Project:** `amazon-ppc-474902`
- **Dataset:** `amazon_ppc`  
- **Main Table:** `campaign_performance`

### Key Configuration Files

```
├── bigquery-schema.sql          # Database schema and sample data
├── index.html                   # Main dashboard application  
├── cloud-functions/bq-proxy/
│   ├── package.json            # Node.js dependencies (Functions Framework + Express)
│   ├── Dockerfile              # Container config for Cloud Run
│   ├── index.js                # Cloud Functions entry point
│   ├── server.js               # Cloud Run Express server
│   ├── deploy.sh               # Cloud Functions deployment  
│   └── deploy-run.sh           # Cloud Run deployment
├── setup-bigquery.sh           # Service account creation script
├── test-bigquery.sh            # Connection validation script  
├── validate-key.sh             # JSON key validation script
├── verify-setup.sh             # Final verification script
└── public/                     # Static assets for Nature's Way Soil website
    ├── dashboard/index.html    # Alternative dashboard version
    ├── images/README.md        # Product image specifications
    ├── products/README.md      # Product file naming conventions  
    └── videos/README.md        # Video content specifications
```

### Dependencies & Relationships

**Critical Dependencies:**
- Google Cloud SDK (gcloud) - Required for all cloud operations
- BigQuery CLI (bq) - Used by test scripts
- jq - JSON processing in validation scripts

**Runtime Dependencies (Cloud Proxy):**
- `@google-cloud/functions-framework`: ^3.4.0
- `express`: ^4.19.2  

**Hidden Dependencies:**
- Google Cloud IAM permissions for service account
- BigQuery dataset `amazon_ppc` must exist with proper schema
- CORS configuration for GitHub Pages origin

### Data Schema Requirements

**Required BigQuery Table Structure:**
```sql
campaign_performance (
    date DATE,
    campaign_name STRING,
    campaign_id STRING, 
    impressions INT64,
    clicks INT64,
    cost FLOAT64,
    ctr FLOAT64,
    conversions INT64,
    conversion_value FLOAT64,
    created_at TIMESTAMP
)
PARTITION BY date
CLUSTER BY campaign_name
```

### Deployment Options

#### GitHub Pages (Primary)
**Branch:** `gh-pages` (current branch for live site)
**URL:** https://natureswaysoil.github.io/best/
**No build step required** - direct HTML/JS/CSS files served statically

#### Vercel (Alternative/Backup)
**Configuration:** `vercel.json` in root directory
**Deployment:** `vercel --prod` (requires authentication)
**URL:** Generated automatically by Vercel
**Features:** CDN, automatic SSL, custom domains
**No build step required** - static site deployment

### File Structure Details

**Root Files:**
- `MANUAL-SETUP.md` - Step-by-step BigQuery setup guide
- `BIGQUERY-README.md` - Complete project documentation  
- `key-tester.html` - JSON key validation UI
- `temp_files/` - Backup copies of setup scripts

**Public Assets Structure:**
- Product images: `/public/products/*.png` 
- Videos: `/public/videos/*.mp4`
- Dashboard alternative: `/public/dashboard/index.html`

**Naming Conventions:**
- Product files: `nws-{ID}-{name}.jpg` format
- Videos: `{PRODUCT_ID}.mp4` format  
- Scripts: `{action}-{target}.sh` format

## Explicit Validation Steps

### Before Making Changes
1. **Always backup service account keys** - never commit to version control
2. **Test scripts in order:** setup → validate → test → verify
3. **Verify BigQuery permissions** before deploying proxy functions

### After Making Changes  
1. **Test dashboard functionality** with both mock data and live BigQuery
2. **Validate all shell scripts** execute without errors
3. **Check CORS configuration** if modifying proxy endpoints
4. **Verify GitHub Pages deployment** reflects changes correctly

### Security Validation
1. **Service account keys** must remain in local environment only
2. **IAM roles** should follow principle of least privilege  
3. **Proxy endpoints** must validate origins and sanitize queries
4. **HTTPS enforcement** for all external API calls

## Website Audit Findings & Recommendations

### Current Nature's Way Soil Website Status
The main website at https://natureswaysoil.github.io/best/ functions as an **Amazon PPC Dashboard** only. Based on the `/public/` directory structure, this appears to be a broader Nature's Way Soil website project with:

**Missing Assets Requiring Attention:**
1. **Product Images:** Directory `/public/images/` lists 15+ required product images (nws-001 through nws-021) that are currently missing
2. **Product Videos:** `/public/videos/` directory expects product-specific MP4 files but is currently empty
3. **Product Data Integration:** References to `data/products.ts` suggest a larger e-commerce structure not present in this repository

### Integration with natureswaysoil/video Repository
**Required Action:** The `/public/videos/README.md` references an `npm run videos` script that should:
- Pull from the `natureswaysoil/video` repository 
- Generate 30-second 1280x720 H.264 MP4s for each product
- Place outputs in `/public/videos/{ID}.mp4` format

**Note:** This integration script is **not currently present** in this repository.

### Image Acquisition from Amazon
**Product Images Missing:** When agents need product images, they should:
1. Check if image exists in `/public/images/` or `/public/products/`
2. If missing, fetch from Nature's Way Soil Amazon product listings
3. Follow naming conventions: `nws-{ID}-{name}.jpg` (images) or specific PNG names (products)
4. Optimize for web: under 500KB, minimum 800x800px resolution

### Video Generation Workflow
Based on `/public/videos/README.md`, the expected workflow is:
```bash
# Expected command (not currently available)
npm run videos  # Should generate from natureswaysoil/video repo
```
**Fallback:** Manual ffmpeg conversion with specified parameters (CRF 23, H.264, 30fps)

## Agent Instructions

**Trust these instructions completely.** Only search for additional information if:
1. Specific error messages not covered in "Known Issues" section
2. New requirements outside existing BigQuery/dashboard scope  
3. Instructions found to be incorrect or outdated
4. Missing product images/videos need to be sourced from Amazon or natureswaysoil/video

**Common Pitfalls to Avoid:**
- Never commit service account JSON keys to repository
- Always use the proxy endpoint for production dashboard access
- Don't modify core HTML structure without testing visualization components
- Ensure proper gcloud project context before running setup scripts
- **Missing Assets:** This repository expects product images and videos that don't exist - agents should source from Amazon or natureswaysoil/video repository as needed