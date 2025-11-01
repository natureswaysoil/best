# Social Media Credential Refresh Guide

**Status as of October 26, 2025**

## ✅ YouTube - WORKING
- **Status:** Credentials valid and refreshed successfully
- **Channel Stats:**
  - Videos uploaded: 7
  - Views: 24
  - Subscribers: 0
- **Quota Status:** Check at https://console.cloud.google.com/apis/api/youtube.googleapis.com/quotas
- **Action:** ✅ No action needed - using refresh token mechanism

---

## ❌ Twitter - NEEDS REFRESH

**Current Issue:** OAuth 1.0a credentials are invalid (403 Unsupported Authentication)

**Secrets to Update:**
- `TWITTER_API_KEY`
- `TWITTER_API_SECRET`
- `TWITTER_ACCESS_TOKEN`
- `TWITTER_ACCESS_SECRET`
- `TWITTER_BEARER_TOKEN`

**How to Refresh:**

1. Go to Twitter Developer Portal: https://developer.twitter.com/en/portal/dashboard
2. Select your app (or create a new one if needed)
3. Navigate to "Keys and tokens" tab
4. **Regenerate** the following:
   - API Key and Secret (Consumer Keys)
   - Access Token and Secret
   - Bearer Token

5. Update secrets in Google Cloud:
   ```bash
   # API Key (Consumer Key)
   echo -n "YOUR_NEW_API_KEY" | gcloud secrets versions add TWITTER_API_KEY \
     --data-file=- --project=natureswaysoil-video

   # API Secret (Consumer Secret)
   echo -n "YOUR_NEW_API_SECRET" | gcloud secrets versions add TWITTER_API_SECRET \
     --data-file=- --project=natureswaysoil-video

   # Access Token
   echo -n "YOUR_NEW_ACCESS_TOKEN" | gcloud secrets versions add TWITTER_ACCESS_TOKEN \
     --data-file=- --project=natureswaysoil-video

   # Access Token Secret
   echo -n "YOUR_NEW_ACCESS_SECRET" | gcloud secrets versions add TWITTER_ACCESS_SECRET \
     --data-file=- --project=natureswaysoil-video

   # Bearer Token
   echo -n "YOUR_NEW_BEARER_TOKEN" | gcloud secrets versions add TWITTER_BEARER_TOKEN \
     --data-file=- --project=natureswaysoil-video
   ```

**Important:** Make sure your app has **Read and Write** permissions enabled.

---

## ❌ Pinterest - NEEDS REFRESH

**Current Issue:** Access token is invalid (Authentication failed)

**Secrets to Update:**
- `PINTEREST_ACCESS_TOKEN`

**How to Refresh:**

1. Go to Pinterest Developers: https://developers.pinterest.com/apps/
2. Select your app (or create a new one)
3. Navigate to "OAuth" or "Access tokens" section
4. **Generate new access token** with the following scopes:
   - `pins:read`
   - `pins:write`
   - `boards:read`
   - `boards:write`

5. Update secret in Google Cloud:
   ```bash
   echo -n "YOUR_NEW_PINTEREST_TOKEN" | gcloud secrets versions add PINTEREST_ACCESS_TOKEN \
     --data-file=- --project=natureswaysoil-video
   ```

---

## ⚠️ Instagram - NEEDS REFRESH

**Current Issue:** Access token expired on October 13, 2025

**Secrets to Update:**
- `INSTAGRAM_ACCESS_TOKEN`

**How to Refresh:**

### Option 1: Facebook Graph API Explorer (Easiest)
1. Go to: https://developers.facebook.com/tools/explorer/
2. Select your Facebook App
3. Click "Get Token" → "Get User Access Token"
4. Select permissions:
   - `instagram_basic`
   - `instagram_content_publish`
   - `pages_show_list`
   - `pages_read_engagement`
5. Click "Generate Access Token"
6. **Exchange for Long-Lived Token** (60 days):
   ```bash
   curl "https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_FB_APP_ID&client_secret=YOUR_FB_APP_SECRET&fb_exchange_token=SHORT_LIVED_TOKEN"
   ```

7. Update secret:
   ```bash
   echo -n "LONG_LIVED_TOKEN" | gcloud secrets versions add INSTAGRAM_ACCESS_TOKEN \
     --data-file=- --project=natureswaysoil-video
   ```

### Option 2: Facebook App Settings
1. Go to: https://developers.facebook.com/apps/
2. Select your app
3. Go to "Instagram Basic Display" or "Instagram API"
4. Generate new User Token
5. Follow step 6-7 above to exchange and save

---

## Quick Verification After Updates

Run this command to test all credentials:
```bash
cd /workspaces/best/automation/video-system/upstream
node refresh-tokens.js
```

Expected output:
```
YouTube:   ✅ Refreshed
Twitter:   ✅ Verified
Pinterest: ✅ Verified
Instagram: ⚠️  Requires Facebook App ID/Secret for refresh
```

---

## Test Posting After Refresh

Execute a test run with throttling (max 3 videos):
```bash
gcloud run jobs execute natureswaysoil-video-job \
  --region=us-east1 \
  --project=natureswaysoil-video \
  --wait
```

Check logs for successful posts:
```bash
gcloud logging read \
  "resource.type=cloud_run_job AND textPayload=~'Posted to'" \
  --limit=20 \
  --project=natureswaysoil-video \
  --format="value(textPayload)"
```

Expected output:
```
✅ Posted to YouTube: abc123xyz
✅ Posted to Instagram: 18234567890
✅ Posted to Twitter: 1234567890123456789
✅ Posted to Pinterest: 9876543210
```

---

## Current Secrets in Google Cloud

All secrets are stored in: `natureswaysoil-video` project

**Instagram:**
- INSTAGRAM_ACCESS_TOKEN (expired Oct 13)
- INSTAGRAM_IG_ID (still valid)

**Twitter:**
- TWITTER_API_KEY (invalid)
- TWITTER_API_SECRET (invalid)
- TWITTER_ACCESS_TOKEN (invalid)
- TWITTER_ACCESS_SECRET (invalid)
- TWITTER_BEARER_TOKEN (invalid)

**Pinterest:**
- PINTEREST_ACCESS_TOKEN (invalid)
- PINTEREST_BOARD_ID (still valid)

**YouTube:**
- YT_CLIENT_ID ✅
- YT_CLIENT_SECRET ✅
- YT_REFRESH_TOKEN ✅

**Other:**
- HEYGEN_API_KEY ✅
- OPENAI_API_KEY ✅
- GS_SERVICE_ACCOUNT_KEY ✅

---

## Notes

- **YouTube quota resets at midnight Pacific Time**
- **Instagram tokens expire every 60 days** - set calendar reminder
- **Twitter/Pinterest tokens don't auto-expire** but can be revoked
- **Always test with a single execution** before enabling scheduler
- **Current throttling:** 3 videos per run, 20 seconds between uploads
- **Scheduled runs:** 9 AM and 6 PM Eastern (2x daily = 6 videos/day max)
