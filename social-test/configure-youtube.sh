#!/bin/bash

# Configure YouTube credentials for Cloud Run service
# This script sets up the environment variables needed for YouTube API access

set -e

PROJECT_ID="natureswaysoil-video"
REGION="us-central1"
SERVICE_NAME="social-media-test"

echo "🔐 Configuring YouTube Credentials for Cloud Run"
echo "================================================="
echo ""

# Check if we have YouTube credentials as environment variables
if [ -z "$YT_CLIENT_ID" ] || [ -z "$YT_CLIENT_SECRET" ] || [ -z "$YT_REFRESH_TOKEN" ]; then
    echo "❌ YouTube credentials not found in environment"
    echo ""
    echo "Please set the following environment variables:"
    echo "  export YT_CLIENT_ID='your-client-id'"
    echo "  export YT_CLIENT_SECRET='your-client-secret'"
    echo "  export YT_REFRESH_TOKEN='your-refresh-token'"
    echo ""
    echo "Then run this script again."
    echo ""
    echo "To get these credentials:"
    echo "1. Go to https://console.cloud.google.com/apis/credentials"
    echo "2. Create OAuth 2.0 credentials"
    echo "3. Use the OAuth playground to get a refresh token"
    exit 1
fi

echo "✅ YouTube credentials found in environment"
echo ""

# Update Cloud Run service with environment variables
echo "🚀 Updating Cloud Run service with YouTube credentials..."
gcloud run services update $SERVICE_NAME \
  --region=$REGION \
  --project=$PROJECT_ID \
  --set-env-vars="YT_CLIENT_ID=${YT_CLIENT_ID},YT_CLIENT_SECRET=${YT_CLIENT_SECRET},YT_REFRESH_TOKEN=${YT_REFRESH_TOKEN}"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ YouTube credentials configured successfully!"
    echo ""
    
    # Get service URL
    SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)')
    
    echo "📋 Service Information:"
    echo "  URL: $SERVICE_URL"
    echo ""
    echo "🎬 Test YouTube upload:"
    echo "  curl -X POST $SERVICE_URL/api/social-automation \\"
    echo "    -H 'Content-Type: application/json' \\"
    echo "    -d '{\"action\":\"live_youtube_post\",\"platform\":\"youtube\"}'"
    echo ""
else
    echo "❌ Failed to update Cloud Run service"
    exit 1
fi
