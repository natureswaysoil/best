# Video Automation Testing Guide

This guide explains how to validate the Nature's Way Soil video automation pipeline end-to-end. The suite covers data integrity, script generation templates, HeyGen configuration, and social platform automation.

## Prerequisites

- Node.js 18 or newer
- Project dependencies installed (`npm install`)
- Optional: API credentials for HeyGen, OpenAI, and social platforms
- Optional: FFmpeg installed locally (used for offline video rendering)

## Test Overview

| Command | Duration | Cost | Description |
| --- | --- | --- | --- |
| `npm run validate` | < 5s | Free | Confirms Node.js version, filesystem layout, and optional env variables |
| `npm run test:csv` | < 10s | Free | Parses product data and ensures video assets exist |
| `npm run test:openai` | < 10s | Free | Checks segment templates and CTA coverage |
| `npm run test:heygen` | < 10s | Free | Verifies HeyGen generator exports and fallbacks |
| `npm run test:platforms` | < 10s | Free | Validates automation server endpoints and credential coverage |
| `npm run test:all` | < 30s | Free | Runs CSV, OpenAI, and HeyGen checks sequentially |
| `npm run test:e2e:dry` | < 1m | Free | Executes every suite but tolerates missing credentials |
| `npm run test:e2e` | 1-2m | API usage | Full verification, requires valid credentials |

## Running Tests

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run quick validation**
   ```bash
   npm run validate
   npm run test:all
   ```

3. **Run full dry-run**
   ```bash
   npm run test:e2e:dry
   ```

4. **Run production-grade verification** (requires credentials)
   ```bash
   export HEYGEN_API_KEY=sk-...
   export TWITTER_BEARER_TOKEN=...
   export YT_CLIENT_ID=...
   export YT_CLIENT_SECRET=...
   export YT_REFRESH_TOKEN=...
   export INSTAGRAM_ACCESS_TOKEN=...
   export INSTAGRAM_IG_ID=...
   export PINTEREST_ACCESS_TOKEN=...
   export PINTEREST_BOARD_ID=...

   npm run test:e2e
   ```

## Interpreting Output

Each script prints one line per check with an emoji indicating status:

- ✅ **Pass** – Requirement satisfied.
- ❌ **Fail** – Immediate attention required.
- ⚠️ **Skip/Warning** – Optional or missing credential; review details.

At the end of every suite a summary shows counts and total duration. A non-zero exit code indicates a failure (useful for CI).

## Troubleshooting

| Issue | Suggested Fix |
| --- | --- |
| `Missing data/products.ts` | Pull latest repository changes or restore the file from version control. |
| `Products missing poster art` | Regenerate media with `npm run videos` or provide poster images inside `public/videos`. |
| `HEYGEN_API_KEY not configured` | Create an API key in HeyGen dashboard and export it before running the tests. |
| `Cannot write to public/videos` | Adjust filesystem permissions or run tests with appropriate access rights. |
| `Environment variables missing for platforms` | Populate `.env.local` or export the required variables before running `npm run test:platforms` or `npm run test:e2e`. |

## Continuous Integration

The fast suite (`npm run test:all`) is designed for CI. It completes quickly, requires no credentials, and verifies the essential data contracts. For staging or pre-production pipelines, run `npm run test:e2e:dry` to exercise every check without incurring API costs.

## Next Steps

- Use `SYSTEM_VERIFICATION_REPORT.md` for detailed audit results from the most recent run.
- Review `TEST_IMPLEMENTATION_SUMMARY.md` to understand how the suites are structured.
- Consult `COMPLETION_SUMMARY.md` for a checklist of outstanding tasks before production deployment.
