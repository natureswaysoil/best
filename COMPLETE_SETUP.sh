#!/bin/bash

# Complete Social Media Token Refresh & Posting System

PROJECT="natureswaysoil-video"

echo "🎯 Social Media Posting - Complete Action Plan"
echo "================================================"
echo ""

echo "📊 Current Status (from credential tests):"
echo "  ✅ YouTube: WORKING (refresh token valid, 7 videos posted)"
echo "  ❌ Twitter: INVALID (needs OAuth regeneration)"
echo "  ❌ Pinterest: INVALID (needs new access token)"
echo "  ❌ Instagram: INVALID (token expired/unparseable)"
echo ""

echo "🔧 Required Actions:"
echo ""
echo "1️⃣  TWITTER (@JamesJones90703)"
echo "   → https://developer.twitter.com/en/portal/dashboard"
echo "   → Regenerate: API Key, API Secret, Access Token/Secret, Bearer Token"
echo ""

echo "2️⃣  PINTEREST"
echo "   → https://developers.pinterest.com/apps/"
echo "   → Generate new token with: pins:read, pins:write, boards:read, boards:write"
echo ""

echo "3️⃣  INSTAGRAM"
echo "   → https://developers.facebook.com/tools/explorer/"
echo "   → Get User Access Token → Exchange for long-lived (60 days)"
echo ""

echo "================================================"
echo ""

read -p "Have you obtained the new credentials? (y/n): " READY

if [ "$READY" != "y" ]; then
    echo ""
    echo "Please get the credentials first, then run this script again."
    echo "Or use the interactive updater:"
    echo "  ./UPDATE_TOKENS.sh"
    exit 0
fi

echo ""
echo "📝 Let's update the secrets..."
echo ""

# Twitter
echo "=== TWITTER ==="
read -p "Twitter API Key: " TW_API_KEY
read -p "Twitter API Secret: " TW_API_SECRET
read -p "Twitter Access Token: " TW_ACCESS_TOKEN
read -p "Twitter Access Secret: " TW_ACCESS_SECRET
read -p "Twitter Bearer Token: " TW_BEARER

echo ""
echo "Updating Twitter secrets..."
echo -n "$TW_API_KEY" | gcloud secrets versions add TWITTER_API_KEY --data-file=- --project=$PROJECT
echo -n "$TW_API_SECRET" | gcloud secrets versions add TWITTER_API_SECRET --data-file=- --project=$PROJECT
echo -n "$TW_ACCESS_TOKEN" | gcloud secrets versions add TWITTER_ACCESS_TOKEN --data-file=- --project=$PROJECT
echo -n "$TW_ACCESS_SECRET" | gcloud secrets versions add TWITTER_ACCESS_SECRET --data-file=- --project=$PROJECT
echo -n "$TW_BEARER" | gcloud secrets versions add TWITTER_BEARER_TOKEN --data-file=- --project=$PROJECT
echo "✅ Twitter updated"

# Pinterest
echo ""
echo "=== PINTEREST ==="
read -p "Pinterest Access Token: " PIN_TOKEN

echo "Updating Pinterest secret..."
echo -n "$PIN_TOKEN" | gcloud secrets versions add PINTEREST_ACCESS_TOKEN --data-file=- --project=$PROJECT
echo "✅ Pinterest updated"

# Instagram
echo ""
echo "=== INSTAGRAM ==="
read -p "Instagram Long-Lived Token: " IG_TOKEN

echo "Updating Instagram secret..."
echo -n "$IG_TOKEN" | gcloud secrets versions add INSTAGRAM_ACCESS_TOKEN --data-file=- --project=$PROJECT
echo "✅ Instagram updated"

echo ""
echo "================================================"
echo "✅ All tokens updated!"
echo "================================================"
echo ""

echo "🧪 Testing credentials..."
cd /workspaces/best/automation/video-system/upstream
node quick-check.js

echo ""
echo "================================================"
echo ""
read -p "Run a test job now? (y/n): " RUN_JOB

if [ "$RUN_JOB" = "y" ]; then
    echo ""
    echo "🚀 Executing test job..."
    gcloud run jobs execute natureswaysoil-video-job \
        --region=us-east1 \
        --project=$PROJECT
    
    echo ""
    echo "Job started! Monitor at:"
    echo "https://console.cloud.google.com/run/jobs?project=$PROJECT"
fi

echo ""
echo "✨ Done! Your social media posting system is ready."
echo ""
echo "📅 Scheduled runs: 9 AM and 6 PM Eastern (6 videos/day)"
echo "🎬 Throttling: 3 videos per run, 20 seconds between uploads"
echo ""
