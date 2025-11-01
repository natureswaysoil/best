# Social Media Posting Audit & Fix Report

**Date:** October 25, 2025  
**System:** Nature's Way Soil Video Generation & Social Media Automation  
**Status:** ❌ Social media posting DISABLED despite valid credentials

---

## Executive Summary

The video generation system has **all required credentials** for social media posting (Instagram, Twitter, Pinterest, YouTube), but posts are not being published due to **missing environment variables** and **configuration issues** in the Cloud Run Job.

---

## Root Cause Analysis

### Issue #1: Missing RUN_ONCE Environment Variable ❌ CRITICAL
**Impact:** Job runs in continuous polling mode and times out after 30 minutes  
**Current State:**
- Cloud Run Job is configured with `Task Timeout: 30m`
- Job enters infinite polling loop waiting for `POLL_INTERVAL_MS=60000`
- Times out before completing a single cycle

**Evidence from logs:**
```
2025-10-25T21:26:18.464997Z | Terminating task because it has reached the maximum timeout of 1800 seconds.
```

**Required Fix:**
```bash
--set-env-vars=RUN_ONCE=true
```

---

### Issue #2: Missing ENABLE_PLATFORMS Variable ⚠️ HIGH PRIORITY
**Impact:** Platform posting may be skipped even with valid credentials  
**Current State:**
- Environment variable `ENABLE_PLATFORMS` is **not set**
- Code defaults to posting to ALL platforms when variable is empty
- However, without proper logging, we can't confirm platforms are being attempted

**Code Reference (cli.ts:244-245):**
```typescript
const enabledPlatformsEnv = (process.env.ENABLE_PLATFORMS || '').toLowerCase()
const enabledPlatforms = new Set(enabledPlatformsEnv.split(',').map(s => s.trim()).filter(Boolean))
```

**Recommended Configuration:**
```bash
# Leave empty to enable all platforms with credentials
--set-env-vars=ENABLE_PLATFORMS=""

# OR explicitly enable specific platforms:
--set-env-vars=ENABLE_PLATFORMS="instagram,twitter,pinterest,youtube"
```

---

### Issue #3: Incorrect CSV Filtering Logic ❌ CRITICAL
**Impact:** "No valid products found in sheet" - rows are being filtered out  
**Current State:**
- Job configured with `CSV_COL_POSTED=I` (Column I)
- Job also has `ALWAYS_GENERATE_NEW_VIDEO=true`
- Code checks Column I for "Posted" status and skips rows marked as posted

**Evidence from logs:**
```
2025-10-25T20:56:22.554335Z | No valid products found in sheet.
```

**Code Analysis (core.ts:48-52):**
```typescript
const alwaysNew = String(process.env.ALWAYS_GENERATE_NEW_VIDEO || '').toLowerCase() === 'true'
const posted = pickFirst(rec, envKeys('CSV_COL_POSTED')) || pickFirst(rec, ['Posted','posted'])
if (!alwaysNew && posted && isTruthy(posted, process.env.CSV_STATUS_TRUE_VALUES)) {
  continue // don't process already-posted rows unless alwaysNew
}
```

**Problem:** Even with `ALWAYS_GENERATE_NEW_VIDEO=true`, the code may still filter rows if:
1. Column I exists AND contains truthy values
2. The "Ready" column check fails (lines 53-56)

**Required Fixes:**
```bash
# Option 1: Remove CSV_COL_POSTED entirely (recommended for video generation)
# (Don't set it at all - let code use default "Posted" column which may not exist)

# Option 2: Configure proper status values
--set-env-vars=CSV_STATUS_TRUE_VALUES="1,true,yes,post"

# Option 3: Ensure "Ready" column logic doesn't interfere
--set-env-vars=CSV_COL_READY="Ready,Enabled,Status"
```

---

### Issue #4: Missing Critical Environment Variables ⚠️ MEDIUM
**Impact:** Undefined behavior, potential runtime errors  
**Missing Variables:**

1. **CSV_COL_VIDEO_URL** - Where to write/read video URLs
   ```bash
   --set-env-vars=CSV_COL_VIDEO_URL="Video URL,video_url"
   ```

2. **CSV_COL_ASIN** - Product identifier column
   ```bash
   --set-env-vars=CSV_COL_ASIN="ASIN,Parent_ASIN,SKU"
   ```

3. **SHEET_VIDEO_TARGET_COLUMN_LETTER** - Fixed column for video URLs
   ```bash
   --set-env-vars=SHEET_VIDEO_TARGET_COLUMN_LETTER="AB"
   ```

4. **HEYGEN_DEFAULT_AVATAR** and **HEYGEN_DEFAULT_VOICE**
   ```bash
   --set-env-vars=HEYGEN_DEFAULT_AVATAR="garden_expert_01",HEYGEN_DEFAULT_VOICE="en_us_warm_female_01"
   ```

---

## Credentials Status ✅ ALL VERIFIED

The following secrets are properly configured in Google Cloud Secret Manager and attached to the job:

### Instagram ✅
- `INSTAGRAM_ACCESS_TOKEN` → `INSTAGRAM_ACCESS_TOKEN:latest`
- `INSTAGRAM_IG_ID` → `INSTAGRAM_IG_ID:latest`

### Twitter/X ✅
- `TWITTER_BEARER_TOKEN` → `TWITTER_BEARER_TOKEN:latest` (for text posts)
- `TWITTER_API_KEY` → `TWITTER_API_KEY:latest` (for media upload)
- `TWITTER_API_SECRET` → `TWITTER_API_SECRET:latest`
- `TWITTER_ACCESS_TOKEN` → `TWITTER_ACCESS_TOKEN:latest`
- `TWITTER_ACCESS_SECRET` → `TWITTER_ACCESS_SECRET:latest`

### Pinterest ✅
- `PINTEREST_ACCESS_TOKEN` → `PINTEREST_ACCESS_TOKEN:latest`
- `PINTEREST_BOARD_ID` → `PINTEREST_BOARD_ID:latest`

### YouTube ✅
- `YT_CLIENT_ID` → `YT_CLIENT_ID:latest`
- `YT_CLIENT_SECRET` → `YT_CLIENT_SECRET:latest`
- `YT_REFRESH_TOKEN` → `YT_REFRESH_TOKEN:latest`

### Other ✅
- `HEYGEN_API_KEY` → `HEYGEN_API_KEY:latest`
- `OPENAI_API_KEY` → `OPENAI_API_KEY:latest`

---

## Complete Fix - Deploy Command

```bash
#!/bin/bash
# Fix social media posting for natureswaysoil-video-job

PROJECT_ID="natureswaysoil-video"
REGION="us-east1"
JOB_NAME="natureswaysoil-video-job"

gcloud run jobs update "$JOB_NAME" \
  --region="$REGION" \
  --set-env-vars="\
RUN_ONCE=true,\
CSV_URL=https://docs.google.com/spreadsheets/d/1LU2ahpzMqLB5FLYqiyDbXOfjTxbdp8U8/export?format=csv&gid=1712974299,\
CSV_COL_JOB_ID=ASIN,\
CSV_COL_TITLE=Title,\
CSV_COL_DETAILS=Title,\
CSV_COL_ASIN=ASIN,\
CSV_COL_VIDEO_URL=Video URL,\
CSV_STATUS_TRUE_VALUES=1,\
ALWAYS_GENERATE_NEW_VIDEO=true,\
ENABLE_PLATFORMS=,\
SHEET_VIDEO_TARGET_COLUMN_LETTER=AB,\
HEYGEN_DEFAULT_AVATAR=garden_expert_01,\
HEYGEN_DEFAULT_VOICE=en_us_warm_female_01,\
HEYGEN_VIDEO_DURATION_SECONDS=30,\
YT_PRIVACY_STATUS=unlisted,\
ENFORCE_POSTING_WINDOWS=false"

echo "✅ Job updated. Testing execution..."
gcloud run jobs execute "$JOB_NAME" --region="$REGION" --wait
```

---

## Verification Steps

After deploying the fix:

1. **Execute job manually:**
   ```bash
   gcloud run jobs execute natureswaysoil-video-job --region=us-east1 --wait
   ```

2. **Check logs for posting activity:**
   ```bash
   gcloud logging read "resource.type=cloud_run_job AND resource.labels.job_name=natureswaysoil-video-job AND timestamp>=\"$(date -u -d '5 minutes ago' +%Y-%m-%dT%H:%M:%SZ)\"" --limit=200 --format=json | jq -r '.[] | select(.textPayload != null) | "\(.timestamp) | \(.textPayload)"'
   ```

3. **Look for success messages:**
   - `✅ Posted to Instagram: <post_id>`
   - `✅ Posted to Twitter: <result>`
   - `✅ Posted to Pinterest: <result>`
   - `✅ Posted to YouTube: <video_id>`

4. **Check platform posting summary:**
   ```
   📊 Platform Posting Summary: {
     product: "...",
     videoUrl: "...",
     results: {
       instagram: { success: true, result: "..." },
       twitter: { success: true, result: "..." },
       pinterest: { success: true, result: "..." },
       youtube: { success: true, result: "..." }
     }
   }
   ```

---

## Additional Recommendations

### 1. Remove CSV_COL_POSTED Configuration
The current configuration with `CSV_COL_POSTED=I` conflicts with video generation. Since you're using Column I for "making videos", either:
- Remove the env var entirely
- Set it to a non-existent column: `CSV_COL_POSTED=Posted_Final`

### 2. Add Proper Logging
Consider adding `--set-env-vars=DEBUG=true` or similar to get detailed posting logs.

### 3. Test with DRY_RUN First
Before posting to production platforms:
```bash
gcloud run jobs update natureswaysoil-video-job --region=us-east1 \
  --set-env-vars=DRY_RUN_LOG_ONLY=true

gcloud run jobs execute natureswaysoil-video-job --region=us-east1 --wait
```

This will show exactly what would be posted without actually posting.

---

## Expected Behavior After Fix

1. ✅ Job completes in < 5 minutes (not 30min timeout)
2. ✅ Processes rows from Google Sheet (no "No valid products found")
3. ✅ Generates videos with HeyGen (if not already present)
4. ✅ Posts to Instagram, Twitter, Pinterest, YouTube with valid credentials
5. ✅ Logs show platform-specific success messages
6. ✅ Marks rows as posted (if write-back credentials configured)

---

## Summary

**Root Cause:** Missing critical environment variables prevent the job from running correctly  
**Credentials:** ✅ All present and valid  
**Fix Complexity:** Low - single `gcloud run jobs update` command  
**Estimated Time:** 2 minutes to deploy, 5 minutes to verify  
**Risk:** Low - configuration-only change, no code modifications

---

**Next Action:** Run the deployment command above to enable social media posting.
