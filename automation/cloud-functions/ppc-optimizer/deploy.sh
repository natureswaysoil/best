#!/bin/bash
set -e

# PPC Optimizer Deployment Script
# Usage: ./deploy.sh [project-id] [region]

PROJECT_ID=${1:-"amazon-ppc-474902"}
REGION=${2:-"us-east4"}
FUNCTION_NAME="amazon-ppc-optimizer"

echo "🎯 Deploying Amazon PPC Optimizer Function"
echo "==========================================="
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo "Function: $FUNCTION_NAME"
echo ""

# Set project
gcloud config set project $PROJECT_ID

# Enable required APIs (if not already enabled)
gcloud services enable cloudfunctions.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable bigquery.googleapis.com

# Create service account for optimizer if it doesn't exist
SERVICE_ACCOUNT="ppc-optimizer-sa@$PROJECT_ID.iam.gserviceaccount.com"

if ! gcloud iam service-accounts describe $SERVICE_ACCOUNT &> /dev/null; then
    gcloud iam service-accounts create ppc-optimizer-sa \
        --display-name="PPC Optimizer Service Account" \
        --description="Service account for automated PPC optimization"
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

# Deploy optimizer function
echo "📦 Deploying PPC Optimizer function..."
gcloud functions deploy $FUNCTION_NAME \
    --gen2 \
    --runtime=nodejs18 \
    --region=$REGION \
    --source=. \
    --entry-point=optimizePPC \
    --trigger=http \
    --service-account=$SERVICE_ACCOUNT \
    --memory=2GB \
    --timeout=540s \
    --max-instances=2 \
    --allow-unauthenticated

# Get function URL
FUNCTION_URL=$(gcloud functions describe $FUNCTION_NAME --region=$REGION --format="value(serviceConfig.uri)")

echo ""
echo "🎉 PPC Optimizer Deployed Successfully!"
echo "======================================"
echo "Function URL: $FUNCTION_URL"
echo ""
echo "📋 Optimization Features:"
echo "✅ Auto-pause campaigns over 45% ACOS"
echo "✅ Auto-start campaigns under 45% ACOS" 
echo "✅ Intelligent bid optimization (±15%)"
echo "✅ Keyword discovery from search terms"
echo "✅ Negative keyword automation"
echo "✅ Budget reallocation based on ROAS"
echo "✅ Dayparting optimization"
echo ""
echo "🧪 Test the optimizer:"
echo "curl -X POST \"$FUNCTION_URL\""
echo ""
echo "⏰ Set up scheduler (run every 6 hours):"
echo "gcloud scheduler jobs create http ppc-optimizer-6h \\"
echo "    --location=$REGION \\"
echo "    --schedule=\"0 */6 * * *\" \\"
echo "    --uri=\"$FUNCTION_URL\" \\"
echo "    --http-method=POST \\"
echo "    --headers=\"Content-Type=application/json\" \\"
echo "    --message-body='{}' \\"
echo "    --time-zone=\"America/New_York\" \\"
echo "    --description=\"PPC optimization - every 6 hours\" \\"
echo "    --attempt-deadline=540s \\"
echo "    --max-retry-attempts=2"