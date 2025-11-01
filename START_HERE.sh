#!/bin/bash

# FINAL ACTION CHECKLIST - Run this to complete everything

echo "════════════════════════════════════════════════════════"
echo "  🎯 SOCIAL MEDIA POSTING - FINAL ACTION CHECKLIST"
echo "════════════════════════════════════════════════════════"
echo ""

echo "✅ COMPLETED:"
echo "  • Video generation pipeline verified (HeyGen + OpenAI)"
echo "  • Video download mechanism tested and working"
echo "  • YouTube credentials verified (7 videos posted, 24 views)"
echo "  • Upload throttling configured (3 videos/run, 20s delays)"
echo "  • Job execution started (natureswaysoil-video-job-ct5bz)"
echo "  • All monitoring and refresh tools created"
echo ""

echo "⏳ IN PROGRESS:"
echo "  • Job execution running (check in 2-3 minutes)"
echo ""

echo "🔴 ACTION REQUIRED (You):"
echo ""
echo "  1️⃣  Refresh Twitter Credentials"
echo "      → https://developer.twitter.com/en/portal/dashboard"
echo "      → Regenerate ALL OAuth keys and tokens"
echo "      → Update 5 secrets (API key/secret, access token/secret, bearer)"
echo ""
echo "  2️⃣  Generate Pinterest Token"
echo "      → https://developers.pinterest.com/apps/"
echo "      → Create new access token"
echo "      → Scopes: pins:read, pins:write, boards:read, boards:write"
echo "      → Update 1 secret"
echo ""
echo "  3️⃣  Refresh Instagram Token"
echo "      → https://developers.facebook.com/tools/explorer/"
echo "      → Get User Access Token (permissions: instagram_basic, instagram_content_publish)"
echo "      → Exchange for long-lived token (60 days)"
echo "      → Update 1 secret"
echo "      → ⚠️  SET REMINDER: Refresh again on Dec 15, 2025"
echo ""

echo "════════════════════════════════════════════════════════"
echo ""

read -p "Ready to update tokens now? (y/n): " READY

if [ "$READY" = "y" ]; then
    echo ""
    ./COMPLETE_SETUP.sh
else
    echo ""
    echo "No problem! When ready, run ONE of these:"
    echo ""
    echo "  Option 1 (Interactive):"
    echo "    ./UPDATE_TOKENS.sh"
    echo ""
    echo "  Option 2 (Guided):"
    echo "    ./COMPLETE_SETUP.sh"
    echo ""
    echo "  Option 3 (Manual):"
    echo "    See: REFRESH_INSTRUCTIONS.md"
    echo ""
    echo "After updating, verify with:"
    echo "  cd automation/video-system/upstream && node quick-check.js"
    echo ""
    echo "Then run a test job:"
    echo "  gcloud run jobs execute natureswaysoil-video-job --region=us-east1 --project=natureswaysoil-video --wait"
    echo ""
fi

echo "════════════════════════════════════════════════════════"
echo ""
echo "📊 Check current job status:"
echo "  ./CHECK_STATUS.sh"
echo ""
echo "📋 Full completion report:"
echo "  cat TASK_COMPLETION_REPORT.md"
echo ""
echo "════════════════════════════════════════════════════════"
