#!/bin/bash

# Quick Status Checker - Run this to see what's working

PROJECT="natureswaysoil-video"

echo "🔍 Quick Platform Status Check"
echo "================================"
echo ""

# Get latest execution
echo "📋 Latest Job Execution:"
LATEST_EXEC=$(gcloud run jobs executions list --job=natureswaysoil-video-job --region=us-east1 --project=$PROJECT --limit=1 --format="value(metadata.name)" 2>/dev/null | head -1)
echo "   $LATEST_EXEC"
echo ""

# Check logs for that execution
echo "📝 Recent Posting Activity:"
echo "----------------------------"
gcloud beta logging read \
  "resource.type=cloud_run_job AND resource.labels.execution_name=$LATEST_EXEC" \
  --limit=300 \
  --format="value(textPayload)" \
  --project=$PROJECT 2>/dev/null | \
  grep -E "(Posted to|Processing Row|Posting to|upload|Error|Failed|❌|✅)" | \
  tail -30 || echo "   No activity found (may still be processing)"

echo ""
echo "================================"
echo ""
echo "💡 To see full logs, visit:"
echo "   https://console.cloud.google.com/run/jobs/executions/details/us-east1/$LATEST_EXEC?project=993533990327"
echo ""
echo "Or wait a minute and run this script again:"
echo "   ./CHECK_STATUS.sh"
