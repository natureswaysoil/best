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
- **Node.js 20+** - For Cloud Run/Functions work (Node 18 is nearing deprecation)
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
cd cloud-functions/bq-proxy
./deploy-run.sh amazon-ppc-474902 us-east4
```

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
- Video CLI error “Cannot find module './heygen'”: run `npm run build` in `automation/video-system/upstream` before invoking `dist/cli.js`.
- Cloud Run Job times out: reduce per-run rows or increase timeout; check logs with `gcloud run jobs logs read natureswaysoil-video-job --region=us-east4`.
- Write-back skipped: share the Google Sheet with `video-job-sa@amazon-ppc-474902.iam.gserviceaccount.com` as Editor (for ADC), or configure `GS_SERVICE_ACCOUNT_EMAIL/KEY` envs.
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