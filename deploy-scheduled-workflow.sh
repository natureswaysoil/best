#!/bin/bash
set -e

# Blog + Video Combo Workflow - Deployment Script
# Deploys to Cloud Run and sets up Cloud Scheduler for 9am and 6pm daily runs

PROJECT_ID="natureswaysoil-video"
REGION="us-central1"
SERVICE_NAME="blog-video-workflow"
TIMEZONE="America/New_York"  # Change if needed

echo "=================================================="
echo "Blog + Video Workflow - Scheduled Deployment"
echo "=================================================="
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo "Schedule: 9:00 AM and 6:00 PM daily ($TIMEZONE)"
echo "=================================================="
echo ""

# Step 1: Build and deploy to Cloud Run
echo "📦 Step 1: Building and deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --source . \
  --project=$PROJECT_ID \
  --region=$REGION \
  --platform=managed \
  --no-allow-unauthenticated \
  --memory=1Gi \
  --cpu=1 \
  --timeout=600 \
  --max-instances=1 \
  --set-env-vars="NODE_ENV=production"

echo ""
echo "✅ Cloud Run service deployed"
echo ""

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
  --project=$PROJECT_ID \
  --region=$REGION \
  --format='value(status.url)')

echo "Service URL: $SERVICE_URL"
echo ""

# Step 2: Create service account for Cloud Scheduler (if not exists)
echo "🔐 Step 2: Setting up service account..."
SA_NAME="blog-video-scheduler"
SA_EMAIL="$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com"

# Check if service account exists
if gcloud iam service-accounts describe $SA_EMAIL --project=$PROJECT_ID >/dev/null 2>&1; then
  echo "Service account already exists: $SA_EMAIL"
else
  echo "Creating service account: $SA_EMAIL"
  gcloud iam service-accounts create $SA_NAME \
    --project=$PROJECT_ID \
    --display-name="Blog Video Workflow Scheduler"
fi

# Grant Cloud Run Invoker role
echo "Granting Cloud Run Invoker role..."
gcloud run services add-iam-policy-binding $SERVICE_NAME \
  --project=$PROJECT_ID \
  --region=$REGION \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/run.invoker" \
  --quiet

echo ""
echo "✅ Service account configured"
echo ""

# Step 3: Create Cloud Scheduler jobs
echo "⏰ Step 3: Creating Cloud Scheduler jobs..."

# Job 1: 9:00 AM daily
JOB_NAME_AM="blog-video-workflow-9am"
echo "Creating job: $JOB_NAME_AM (9:00 AM daily)"

gcloud scheduler jobs delete $JOB_NAME_AM \
  --project=$PROJECT_ID \
  --location=$REGION \
  --quiet 2>/dev/null || echo "Job doesn't exist yet"

gcloud scheduler jobs create http $JOB_NAME_AM \
  --project=$PROJECT_ID \
  --location=$REGION \
  --schedule="0 9 * * *" \
  --time-zone="$TIMEZONE" \
  --uri="$SERVICE_URL" \
  --http-method=POST \
  --oidc-service-account-email=$SA_EMAIL \
  --oidc-token-audience=$SERVICE_URL \
  --headers="Content-Type=application/json" \
  --message-body='{"trigger":"scheduled","time":"9am"}' \
  --attempt-deadline=600s

echo "✅ Morning job created (9:00 AM)"
echo ""

# Job 2: 6:00 PM daily
JOB_NAME_PM="blog-video-workflow-6pm"
echo "Creating job: $JOB_NAME_PM (6:00 PM daily)"

gcloud scheduler jobs delete $JOB_NAME_PM \
  --project=$PROJECT_ID \
  --location=$REGION \
  --quiet 2>/dev/null || echo "Job doesn't exist yet"

gcloud scheduler jobs create http $JOB_NAME_PM \
  --project=$PROJECT_ID \
  --location=$REGION \
  --schedule="0 18 * * *" \
  --time-zone="$TIMEZONE" \
  --uri="$SERVICE_URL" \
  --http-method=POST \
  --oidc-service-account-email=$SA_EMAIL \
  --oidc-token-audience=$SERVICE_URL \
  --headers="Content-Type=application/json" \
  --message-body='{"trigger":"scheduled","time":"6pm"}' \
  --attempt-deadline=600s

echo "✅ Evening job created (6:00 PM)"
echo ""

echo "=================================================="
echo "✅ DEPLOYMENT COMPLETE"
echo "=================================================="
echo ""
echo "📅 Scheduled runs:"
echo "   • 9:00 AM daily (Eastern Time)"
echo "   • 6:00 PM daily (Eastern Time)"
echo ""
echo "🔍 Monitor jobs:"
echo "   gcloud scheduler jobs list --project=$PROJECT_ID --location=$REGION"
echo ""
echo "▶️  Test now:"
echo "   gcloud scheduler jobs run $JOB_NAME_AM --project=$PROJECT_ID --location=$REGION"
echo ""
echo "📊 View logs:"
echo "   gcloud logging read \"resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME\" --project=$PROJECT_ID --limit=50 --format=json"
echo ""
echo "🌐 Cloud Console:"
echo "   Scheduler: https://console.cloud.google.com/cloudscheduler?project=$PROJECT_ID"
echo "   Cloud Run: https://console.cloud.google.com/run/detail/$REGION/$SERVICE_NAME?project=$PROJECT_ID"
echo ""
