#!/bin/bash
set -e

# Cloud Scheduler Setup for Amazon PPC Data Sync
# Usage: ./setup-scheduler.sh [project-id] [region] [function-url]

PROJECT_ID=${1:-"amazon-ppc-474902"}
REGION=${2:-"us-east4"}
FUNCTION_URL=${3:-""}

if [ -z "$FUNCTION_URL" ]; then
    # Get function URL automatically
    FUNCTION_URL=$(gcloud functions describe amazon-ppc-sync --region=$REGION --format="value(serviceConfig.uri)")
fi

if [ -z "$FUNCTION_URL" ]; then
    echo "❌ Could not determine function URL. Please provide as third argument."
    exit 1
fi

echo "⏰ Setting up Cloud Scheduler for Amazon PPC Sync"
echo "=================================================="
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo "Function URL: $FUNCTION_URL"
echo ""

# Set project
gcloud config set project $PROJECT_ID

# Enable Cloud Scheduler API
echo "🔌 Enabling Cloud Scheduler API..."
gcloud services enable cloudscheduler.googleapis.com

# Create scheduler job to run every 2 hours
echo "⏱️ Creating scheduler job (every 2 hours)..."
gcloud scheduler jobs create http amazon-ppc-sync-2h \
    --location=$REGION \
    --schedule="0 */2 * * *" \
    --uri="$FUNCTION_URL" \
    --http-method=POST \
    --headers="Content-Type=application/json" \
    --message-body='{}' \
    --time-zone="America/New_York" \
    --description="Amazon PPC data sync - runs every 2 hours" \
    --attempt-deadline=540s \
    --max-retry-attempts=3 \
    --min-backoff-duration=60s \
    --max-backoff-duration=300s \
    --max-doublings=3 || echo "Job may already exist"

# Create additional job for daily full sync at midnight
echo "🌙 Creating daily full sync job..."
gcloud scheduler jobs create http amazon-ppc-daily-sync \
    --location=$REGION \
    --schedule="0 0 * * *" \
    --uri="$FUNCTION_URL" \
    --http-method=POST \
    --headers="Content-Type=application/json" \
    --message-body='{"fullSync": true}' \
    --time-zone="America/New_York" \
    --description="Amazon PPC daily full sync - runs at midnight" \
    --attempt-deadline=540s \
    --max-retry-attempts=5 \
    --min-backoff-duration=120s \
    --max-backoff-duration=600s \
    --max-doublings=4 || echo "Job may already exist"

echo ""
echo "🎉 Scheduler Setup Complete!"
echo "============================="
echo "📋 Created Jobs:"
echo "1. amazon-ppc-sync-2h - Every 2 hours (0 */2 * * *)"
echo "2. amazon-ppc-daily-sync - Daily at midnight (0 0 * * *)"
echo ""
echo "🔍 View jobs:"
echo "gcloud scheduler jobs list --location=$REGION"
echo ""
echo "▶️ Test run:"
echo "gcloud scheduler jobs run amazon-ppc-sync-2h --location=$REGION"