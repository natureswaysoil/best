#!/bin/bash
set -e

# Cloud Scheduler Setup for PPC Optimizer
# Usage: ./setup-scheduler.sh [project-id] [region] [function-url]
# - project-id: GCP Project ID (default: amazon-ppc-474902)
# - region: Cloud Functions region (default: us-east4)
# - function-url: Optional; if omitted, script will auto-discover the function URL

PROJECT_ID=${1:-"amazon-ppc-474902"}
REGION=${2:-"us-east4"}
FUNCTION_URL=${3:-""}
JOB_NAME=${JOB_NAME:-"ppc-optimizer-2h"}
TIME_ZONE=${TIME_ZONE:-"America/New_York"}
SCHEDULE_CRON=${SCHEDULE_CRON:-"0 */2 * * *"} # every 2 hours

if [ -z "$FUNCTION_URL" ]; then
  echo "🔍 Discovering optimizer function URL..."
  FUNCTION_URL=$(gcloud functions describe amazon-ppc-optimizer --region=$REGION --format="value(serviceConfig.uri)" || true)
fi

if [ -z "$FUNCTION_URL" ]; then
  echo "❌ Could not determine function URL. Provide it as the 3rd arg or deploy the function first."
  exit 1
fi

echo "⏰ Setting up Cloud Scheduler for PPC Optimizer"
echo "=============================================="
echo "Project:     $PROJECT_ID"
echo "Region:      $REGION"
echo "Function URL: $FUNCTION_URL"
echo "Job Name:    $JOB_NAME"
echo "Schedule:    $SCHEDULE_CRON ($TIME_ZONE)"
echo ""

# Set project
gcloud config set project $PROJECT_ID

# Enable Cloud Scheduler API
echo "🔌 Enabling Cloud Scheduler API..."
gcloud services enable cloudscheduler.googleapis.com

# Create or update the scheduler job (idempotent)
echo "⏱️ Creating scheduler job (every 2 hours)..."
if gcloud scheduler jobs describe $JOB_NAME --location=$REGION >/dev/null 2>&1; then
  echo "✏️ Job exists; updating…"
  gcloud scheduler jobs update http $JOB_NAME \
    --location=$REGION \
    --schedule="$SCHEDULE_CRON" \
    --uri="$FUNCTION_URL" \
    --http-method=POST \
    --headers="Content-Type=application/json" \
    --message-body='{}' \
    --time-zone="$TIME_ZONE" \
    --attempt-deadline=540s \
    --max-retry-attempts=3 \
    --min-backoff-duration=60s \
    --max-backoff-duration=300s \
    --max-doublings=3
else
  gcloud scheduler jobs create http $JOB_NAME \
    --location=$REGION \
    --schedule="$SCHEDULE_CRON" \
    --uri="$FUNCTION_URL" \
    --http-method=POST \
    --headers="Content-Type=application/json" \
    --message-body='{}' \
    --time-zone="$TIME_ZONE" \
    --description="Run PPC optimizer every 2 hours" \
    --attempt-deadline=540s \
    --max-retry-attempts=3 \
    --min-backoff-duration=60s \
    --max-backoff-duration=300s \
    --max-doublings=3
fi

echo ""
echo "🎉 Scheduler configured!"
echo "➡️  View jobs: gcloud scheduler jobs list --location=$REGION"
echo "▶️  Run now:  gcloud scheduler jobs run $JOB_NAME --location=$REGION"
