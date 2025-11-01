#!/bin/bash

# Quick deploy script for test service

set -e

PROJECT_ID="natureswaysoil-video"
REGION="us-central1"
SERVICE_NAME="social-media-test"

echo "🚀 Deploying Social Media Test Service"
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo "Service: $SERVICE_NAME"
echo ""

# Deploy to Cloud Run
gcloud run deploy $SERVICE_NAME \
  --source=. \
  --region=$REGION \
  --allow-unauthenticated \
  --project=$PROJECT_ID \
  --platform=managed

# Get service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)')

echo ""
echo "✅ Service deployed!"
echo "URL: $SERVICE_URL"
echo ""
echo "Test it:"
echo "curl -X POST $SERVICE_URL/api/social-automation \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"action\":\"test_post\",\"platform\":\"twitter\"}'"
