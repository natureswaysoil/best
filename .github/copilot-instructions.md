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
cd cloud-functions/bq-proxy  
./deploy-run.sh amazon-ppc-474902 us-east4
```

#### 5. Final Verification
```bash
./verify-setup.sh
```

### Known Issues & Workarounds

**Issue:** Scripts fail if `gcloud` not installed
- **Workaround:** Install Google Cloud SDK first, or follow manual setup in `MANUAL-SETUP.md`
- **Error Message:** "gcloud CLI is not installed"

**Issue:** BigQuery permission errors  
- **Required Roles:** `roles/bigquery.dataViewer` and `roles/bigquery.jobUser`
- **Service Account:** `amazon-ppc-dashboard@amazon-ppc-474902.iam.gserviceaccount.com`

**Issue:** CORS errors when using direct BigQuery API
- **Solution:** Always use the deployed proxy endpoint for production

**Issue:** Cloud Function deployment requires specific Node.js version
- **Required:** Node.js 20 (specified in Dockerfile: `node:20-alpine`)

### Validation Pipeline

**No automated CI/CD exists.** Manual validation steps:

1. **Script Validation:** All `.sh` scripts are executable and have proper error handling
2. **JSON Validation:** `validate-key.sh` uses `jq` to verify service account key format  
3. **BigQuery Connectivity:** `test-bigquery.sh` runs sample queries to verify data access
4. **Proxy Health:** Manual testing via curl after cloud deployment

### Time Requirements
- **BigQuery Setup:** 2-5 minutes (depends on gcloud authentication)
- **Cloud Function Deploy:** 1-3 minutes
- **Full Verification:** Under 5 minutes total

## Project Architecture & Layout

### Core Architecture Components

**Frontend:** Static HTML dashboard (`index.html`) with client-side JavaScript
- Uses Plotly.js for data visualization 
- Supports both direct BigQuery API and proxy endpoints
- No build process - pure static files

**Backend:** Optional BigQuery proxy (Cloud Functions or Cloud Run)
- **Location:** `cloud-functions/bq-proxy/`
- **Purpose:** Server-side BigQuery queries with CORS handling
- **Technology:** Node.js with Express framework

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

### GitHub Pages Deployment

**Branch:** `gh-pages` (current branch for live site)
**URL:** https://natureswaysoil.github.io/best/
**No build step required** - direct HTML/JS/CSS files served statically

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