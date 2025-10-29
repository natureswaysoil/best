#!/bin/bash

# Deploy Social Media Automation with HeyGen to Google Cloud Run
# This script deploys the complete video generation and social media posting system

set -e

echo "🚀 Deploying Social Media Automation with HeyGen Integration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Configuration
PROJECT_ID="natureswaysoil-video"
REGION="us-central1"
SERVICE_NAME="social-media-automation"
IMAGE_NAME="gcr.io/${PROJECT_ID}/social-media-automation"

echo "📋 Configuration:"
echo "   Project: ${PROJECT_ID}"
echo "   Region: ${REGION}"
echo "   Service: ${SERVICE_NAME}"
echo "   Image: ${IMAGE_NAME}"
echo ""

# Check if gcloud is installed and authenticated
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud SDK not installed"
    echo "   Install from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check authentication
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -n1 &> /dev/null; then
    echo "❌ Not authenticated with Google Cloud"
    echo "   Run: gcloud auth login"
    exit 1
fi

# Set project
echo "🔧 Setting up Google Cloud project..."
gcloud config set project ${PROJECT_ID}

# Enable required APIs
echo "🔌 Enabling required APIs..."
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    secretmanager.googleapis.com \
    containerregistry.googleapis.com

# Create secrets in Secret Manager for sensitive credentials
echo "🔐 Setting up secrets in Secret Manager..."

# HeyGen API Key
if ! gcloud secrets describe heygen-api-key &> /dev/null; then
    echo "Creating HeyGen API key secret..."
    echo -n "${HEYGEN_API_KEY:-placeholder}" | gcloud secrets create heygen-api-key --data-file=-
else
    echo "HeyGen API key secret already exists"
fi

# Twitter credentials
if ! gcloud secrets describe twitter-bearer-token &> /dev/null; then
    echo "Creating Twitter Bearer Token secret..."
    echo -n "${TWITTER_BEARER_TOKEN:-placeholder}" | gcloud secrets create twitter-bearer-token --data-file=-
else
    echo "Twitter Bearer Token secret already exists"
fi

if ! gcloud secrets describe twitter-api-key &> /dev/null; then
    echo "Creating Twitter API Key secret..."
    echo -n "${TWITTER_API_KEY:-placeholder}" | gcloud secrets create twitter-api-key --data-file=-
else
    echo "Twitter API Key secret already exists"
fi

if ! gcloud secrets describe twitter-api-secret &> /dev/null; then
    echo "Creating Twitter API Secret..."
    echo -n "${TWITTER_API_SECRET:-placeholder}" | gcloud secrets create twitter-api-secret --data-file=-
else
    echo "Twitter API Secret already exists"
fi

if ! gcloud secrets describe twitter-access-token &> /dev/null; then
    echo "Creating Twitter Access Token secret..."
    echo -n "${TWITTER_ACCESS_TOKEN:-placeholder}" | gcloud secrets create twitter-access-token --data-file=-
else
    echo "Twitter Access Token secret already exists"
fi

if ! gcloud secrets describe twitter-access-secret &> /dev/null; then
    echo "Creating Twitter Access Secret..."
    echo -n "${TWITTER_ACCESS_SECRET:-placeholder}" | gcloud secrets create twitter-access-secret --data-file=-
else
    echo "Twitter Access Secret already exists"
fi

# YouTube credentials
if ! gcloud secrets describe youtube-client-id &> /dev/null; then
    echo "Creating YouTube Client ID secret..."
    echo -n "${YT_CLIENT_ID:-placeholder}" | gcloud secrets create youtube-client-id --data-file=-
else
    echo "YouTube Client ID secret already exists"
fi

if ! gcloud secrets describe youtube-client-secret &> /dev/null; then
    echo "Creating YouTube Client Secret..."
    echo -n "${YT_CLIENT_SECRET:-placeholder}" | gcloud secrets create youtube-client-secret --data-file=-
else
    echo "YouTube Client Secret secret already exists"
fi

if ! gcloud secrets describe youtube-refresh-token &> /dev/null; then
    echo "Creating YouTube Refresh Token secret..."
    echo -n "${YT_REFRESH_TOKEN:-placeholder}" | gcloud secrets create youtube-refresh-token --data-file=-
else
    echo "YouTube Refresh Token secret already exists"
fi

# Build and deploy
echo "🏗️ Building and deploying with Cloud Build..."
gcloud builds submit --config=cloudbuild-social.yaml --timeout=20m

if [ $? -ne 0 ]; then
    echo "❌ Cloud Build failed!"
    exit 1
fi

echo "✅ Service deployed successfully!"

# Create Cloud Scheduler jobs for automation
echo "⏰ Setting up Cloud Scheduler for automation..."

# Enable Cloud Scheduler API
gcloud services enable cloudscheduler.googleapis.com

# Get service URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region=${REGION} --format="value(status.url)")

# Create service account for scheduler
echo "👤 Creating service account for scheduler..."
SERVICE_ACCOUNT="social-automation-scheduler@${PROJECT_ID}.iam.gserviceaccount.com"

if ! gcloud iam service-accounts describe ${SERVICE_ACCOUNT} &> /dev/null; then
    gcloud iam service-accounts create social-automation-scheduler \
        --display-name="Social Media Automation Scheduler"
    
    # Grant Cloud Run Invoker role
    gcloud run services add-iam-policy-binding ${SERVICE_NAME} \
        --region=${REGION} \
        --member="serviceAccount:${SERVICE_ACCOUNT}" \
        --role="roles/run.invoker"
fi

# Morning post job (6 AM UTC / 2 AM EDT)
if ! gcloud scheduler jobs describe social-automation-morning --location=${REGION} &> /dev/null; then
    echo "Creating morning posting schedule..."
    gcloud scheduler jobs create http social-automation-morning \
        --location=${REGION} \
        --schedule="0 6 * * *" \
        --time-zone="UTC" \
        --uri="${SERVICE_URL}/api/social-automation" \
        --http-method=POST \
        --oidc-service-account-email=${SERVICE_ACCOUNT} \
        --headers="Content-Type=application/json" \
        --message-body='{"action":"generate_and_post","schedule":"morning"}'
else
    echo "Morning posting schedule already exists"
fi

# Evening post job (6 PM UTC / 2 PM EDT)
if ! gcloud scheduler jobs describe social-automation-evening --location=${REGION} &> /dev/null; then
    echo "Creating evening posting schedule..."
    gcloud scheduler jobs create http social-automation-evening \
        --location=${REGION} \
        --schedule="0 18 * * *" \
        --time-zone="UTC" \
        --uri="${SERVICE_URL}/api/social-automation" \
        --http-method=POST \
        --oidc-service-account-email=${SERVICE_ACCOUNT} \
        --headers="Content-Type=application/json" \
        --message-body='{"action":"generate_and_post","schedule":"evening"}'
else
    echo "Evening posting schedule already exists"
fi

echo ""
echo "🎉 Deployment Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Service Information:"
echo "   Service URL: ${SERVICE_URL}"
echo "   Project: ${PROJECT_ID}"
echo "   Region: ${REGION}"
echo ""
echo "⏰ Automation Schedule:"
echo "   Morning posts: 6:00 AM UTC (2:00 AM EDT) daily"
echo "   Evening posts: 6:00 PM UTC (2:00 PM EDT) daily"
echo ""
echo "🔐 Secrets Configuration:"
echo "   All API keys are stored securely in Google Secret Manager"
echo "   Update secrets with: gcloud secrets versions add [SECRET_NAME] --data-file=-"
echo ""
echo "🎬 Video Generation:"
echo "   HeyGen AI videos will be generated automatically"
echo "   Fallback to FFmpeg if HeyGen unavailable"
echo ""
echo "📱 Social Media Platforms:"
echo "   ✅ Twitter: Automated tweets with video content"
echo "   ✅ YouTube: Automated video uploads"
echo "   ⚠️ Instagram: Ready (needs Facebook Business API setup)"
echo ""
echo "🛠️ Manual Operations:"
echo "   Test posting: curl -X POST ${SERVICE_URL}/api/social-automation \\
                     -H 'Content-Type: application/json' \\
                     -d '{\"action\":\"test_post\"}'"
echo ""
echo "📋 Next Steps:"
echo "1. Verify secrets are properly configured in Google Secret Manager"
echo "2. Test the service with a manual API call"
echo "3. Monitor Cloud Scheduler logs for automated posts"
echo "4. Check social media accounts for posted content"
echo ""
echo "🔗 Monitoring:"
echo "   Cloud Run logs: https://console.cloud.google.com/run/detail/${REGION}/${SERVICE_NAME}/logs"
echo "   Scheduler jobs: https://console.cloud.google.com/cloudscheduler"
echo "   Secret Manager: https://console.cloud.google.com/security/secret-manager"