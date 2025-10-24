#!/bin/bash
set -e

# Amazon PPC Data Sync - Cloud Function Deployment
# Usage: ./deploy.sh [project-id] [region]

PROJECT_ID=${1:-"amazon-ppc-474902"}
REGION=${2:-"us-east4"}
FUNCTION_NAME="amazon-ppc-sync"

echo "🚀 Deploying Amazon PPC Data Sync Function"
echo "=========================================="
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo "Function: $FUNCTION_NAME"
echo ""

# Check prerequisites
echo "🔍 Checking prerequisites..."
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI not found. Please install Google Cloud SDK."
    exit 1
fi

if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -n 1 &> /dev/null; then
    echo "❌ Not authenticated with gcloud. Run: gcloud auth login"
    exit 1
fi

echo "✅ Prerequisites OK"

# Set project
echo "⚙️ Setting project..."
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "🔌 Enabling required APIs..."
gcloud services enable cloudfunctions.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable bigquery.googleapis.com
gcloud services enable cloudscheduler.googleapis.com

# Create service account if it doesn't exist
echo "🔐 Setting up service account..."
SERVICE_ACCOUNT="amazon-sync-sa@$PROJECT_ID.iam.gserviceaccount.com"

if ! gcloud iam service-accounts describe $SERVICE_ACCOUNT &> /dev/null; then
    gcloud iam service-accounts create amazon-sync-sa \
        --display-name="Amazon PPC Sync Service Account" \
        --description="Service account for automated Amazon PPC data sync"
fi

# Grant required permissions
echo "🛡️ Granting permissions..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/bigquery.dataEditor"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/bigquery.jobUser"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/secretmanager.secretAccessor"

# Deploy function
echo "📦 Deploying Cloud Function..."
gcloud functions deploy $FUNCTION_NAME \
    --gen2 \
    --runtime=nodejs18 \
    --region=$REGION \
    --source=. \
    --entry-point=syncAmazonData \
    --trigger-http \
    --service-account=$SERVICE_ACCOUNT \
    --memory=1GB \
    --timeout=540s \
    --max-instances=3 \
    --env-vars-file=env.yaml \
    --allow-unauthenticated

# Get function URL
FUNCTION_URL=$(gcloud functions describe $FUNCTION_NAME --region=$REGION --format="value(serviceConfig.uri)")

echo ""
echo "🎉 Deployment Complete!"
echo "======================="
echo "Function URL: $FUNCTION_URL"
echo "Service Account: $SERVICE_ACCOUNT"
echo ""
echo "📋 Next Steps:"
echo "1. Create Amazon Advertising API credentials secret:"
echo "   gcloud secrets create amazon-advertising-credentials --data-file=amazon-credentials.json"
echo ""
echo "2. Test the function:"
echo "   curl -X POST \"$FUNCTION_URL\""
echo ""
echo "3. Set up Cloud Scheduler (run: ./setup-scheduler.sh)"