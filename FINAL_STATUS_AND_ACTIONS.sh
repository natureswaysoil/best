#!/bin/bash

# Final Status and Action Completion Script

PROJECT="natureswaysoil-video"
REGION="us-east1"

echo "🎯 Social Media Posting System - Final Status & Actions"
echo "========================================================"
echo ""

# Get latest execution
LATEST_EXEC=$(gcloud run jobs executions list \
  --job=natureswaysoil-video-job \
  --region=$REGION \
  --project=$PROJECT \
  --limit=1 \
  --format="value(metadata.name)" 2>/dev/null | head -1)

if [ -z "$LATEST_EXEC" ]; then
    echo "❌ No executions found"
    echo ""
    echo "Start a job with:"
    echo "  gcloud run jobs execute natureswaysoil-video-job --region=$REGION --project=$PROJECT"
    exit 1
fi

echo "📋 Latest Execution: $LATEST_EXEC"
echo ""

# Check if logs are available yet
echo "🔍 Checking for logs..."
cd /workspaces/best/automation/video-system/upstream
node monitor-job.js

echo ""
echo "========================================================"
echo ""

# Credential status from previous tests
echo "📊 Credential Status (from pre-flight tests):"
echo ""
echo "  ✅ YouTube:    WORKING"
echo "  ❌ Twitter:    NEEDS REGENERATION"
echo "  ❌ Pinterest:  NEEDS NEW TOKEN"
echo "  ❌ Instagram:  NEEDS REFRESH"
echo ""

echo "========================================================"
echo ""
echo "🔧 Next Steps to Complete Setup:"
echo ""
echo "Option 1: Interactive Token Update"
echo "  ./UPDATE_TOKENS.sh"
echo ""
echo "Option 2: Complete Guided Setup"
echo "  ./COMPLETE_SETUP.sh"
echo ""
echo "Option 3: Manual Token Update"
echo "  See: REFRESH_INSTRUCTIONS.md"
echo ""
echo "========================================================"
echo ""

# Check if job is still running
EXEC_STATUS=$(curl -s "https://run.googleapis.com/v1/namespaces/993533990327/executions/$LATEST_EXEC" \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" 2>/dev/null | \
  jq -r '.status.conditions[0].status // "Unknown"' 2>/dev/null)

if [ "$EXEC_STATUS" = "Unknown" ] || [ -z "$EXEC_STATUS" ]; then
    echo "⏳ Job Status: Still running or starting up"
    echo ""
    echo "Wait 2-3 minutes, then check logs with:"
    echo "  ./CHECK_STATUS.sh"
    echo ""
    echo "Or monitor in console:"
    echo "  https://console.cloud.google.com/run/jobs/executions/details/$REGION/$LATEST_EXEC?project=993533990327"
elif [ "$EXEC_STATUS" = "True" ]; then
    echo "✅ Job Status: COMPLETED"
    echo ""
    echo "Check what posted successfully above ☝️"
elif [ "$EXEC_STATUS" = "False" ]; then
    echo "❌ Job Status: FAILED"
    echo ""
    echo "Likely due to invalid credentials. Update tokens and try again."
fi

echo ""
echo "========================================================"
echo ""
echo "📈 System Configuration:"
echo "  • Max videos per run: 3"
echo "  • Upload delay: 20 seconds"
echo "  • Schedule: 9 AM & 6 PM ET (6 videos/day max)"
echo "  • Video source: Google Sheets → HeyGen → Social Media"
echo ""
echo "🎬 Ready to post to: YouTube, Twitter, Pinterest, Instagram"
echo "   (once credentials are refreshed)"
echo ""
