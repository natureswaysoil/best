# Token Refresh Instructions

Based on credential testing, here's what needs to be done:

## Status Summary

✅ **YouTube** - Working (refresh token valid)
❌ **Twitter** - Needs regeneration  
❌ **Pinterest** - Needs new token
❌ **Instagram** - Needs refresh

## Quick Refresh Commands

### Twitter
1. Go to: https://developer.twitter.com/en/portal/dashboard
2. Regenerate all keys
3. Run:
```bash
# Replace with actual values
echo -n "YOUR_API_KEY" | gcloud secrets versions add TWITTER_API_KEY --data-file=- --project=natureswaysoil-video
echo -n "YOUR_API_SECRET" | gcloud secrets versions add TWITTER_API_SECRET --data-file=- --project=natureswaysoil-video
echo -n "YOUR_ACCESS_TOKEN" | gcloud secrets versions add TWITTER_ACCESS_TOKEN --data-file=- --project=natureswaysoil-video  
echo -n "YOUR_ACCESS_SECRET" | gcloud secrets versions add TWITTER_ACCESS_SECRET --data-file=- --project=natureswaysoil-video
echo -n "YOUR_BEARER_TOKEN" | gcloud secrets versions add TWITTER_BEARER_TOKEN --data-file=- --project=natureswaysoil-video
```

### Pinterest  
1. Go to: https://developers.pinterest.com/apps/
2. Generate new access token with scopes: pins:read, pins:write, boards:read, boards:write
3. Run:
```bash
echo -n "YOUR_PINTEREST_TOKEN" | gcloud secrets versions add PINTEREST_ACCESS_TOKEN --data-file=- --project=natureswaysoil-video
```

### Instagram
1. Go to: https://developers.facebook.com/tools/explorer/
2. Get User Access Token with permissions: instagram_basic, instagram_content_publish
3. Exchange for long-lived token and run:
```bash
echo -n "YOUR_LONG_LIVED_TOKEN" | gcloud secrets versions add INSTAGRAM_ACCESS_TOKEN --data-file=- --project=natureswaysoil-video
```

## Test After Updating

```bash
cd /workspaces/best/automation/video-system/upstream
node quick-check.js
```

Expected: All ✅ checkmarks

## Run Job

```bash
gcloud run jobs execute natureswaysoil-video-job --region=us-east1 --project=natureswaysoil-video --wait
```
