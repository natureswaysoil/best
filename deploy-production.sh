#!/bin/bash
set -euo pipefail

# Production Deployment Script - Nature's Way Soil Complete System
# Deploys: Static Videos + Dashboard + AI Generation + Social Media Automation

echo "🚀 Nature's Way Soil - Production Deployment"
echo "=============================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="amazon-ppc-474902"
REGION="us-east4"
FUNCTION_NAME="nws-hybrid-video"
SCHEDULER_JOB="nws-video-automation"
SERVICE_ACCOUNT="amazon-sync-sa@${PROJECT_ID}.iam.gserviceaccount.com"

# Helper functions
print_step() {
    echo -e "\n${BLUE}🔄 Step $1: $2${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verify prerequisites
print_step 1 "Verifying Prerequisites"

if ! command -v gcloud &> /dev/null; then
    print_error "Google Cloud SDK not installed"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "Node.js/npm not installed"
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    print_error "Python 3 not installed"
    exit 1
fi

# Check gcloud authentication
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    print_error "Not authenticated with Google Cloud. Run: gcloud auth login"
    exit 1
fi

# Set project
print_step 2 "Setting Google Cloud Project"
gcloud config set project "$PROJECT_ID"
print_success "Project set to $PROJECT_ID"

# Build TypeScript
print_step 3 "Building TypeScript"
npm run build
print_success "TypeScript compiled successfully"

# Deploy BigQuery Proxy (Cloud Run)
print_step 4 "Deploying BigQuery Proxy"
if [ -d "cloud-functions/bq-proxy" ]; then
    cd cloud-functions/bq-proxy
    if [ -f "deploy-run.sh" ]; then
        chmod +x deploy-run.sh
        ./deploy-run.sh "$PROJECT_ID" "$REGION"
        print_success "BigQuery proxy deployed to Cloud Run"
    else
        print_warning "deploy-run.sh not found, skipping proxy deployment"
    fi
    cd ../..
else
    print_warning "BigQuery proxy directory not found"
fi

# Deploy Hybrid Video Function
print_step 5 "Deploying Hybrid Video Function"

# Create function entry point
cat > index.js << 'EOF'
const { main } = require('./lib/hybrid-cli.js');

exports.hybridVideo = async (req, res) => {
  console.log('🚀 Hybrid video function triggered');
  
  try {
    await main();
    res.status(200).json({ 
      success: true, 
      message: 'Hybrid video automation completed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Function error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
EOF

# Deploy function
echo "📦 Deploying Cloud Function..."
gcloud functions deploy "$FUNCTION_NAME" \
  --runtime=nodejs20 \
  --trigger-http \
  --allow-unauthenticated \
  --region="$REGION" \
  --service-account="$SERVICE_ACCOUNT" \
  --source=. \
  --entry-point=hybridVideo \
  --memory=1024MB \
  --timeout=900s \
  --set-env-vars="NODE_ENV=production" \
  --max-instances=10

print_success "Cloud Function deployed: $FUNCTION_NAME"

# Deploy Scheduler Job
print_step 6 "Setting up Automated Scheduling"

FUNCTION_URL="https://${REGION}-${PROJECT_ID}.cloudfunctions.net/${FUNCTION_NAME}"

# Delete existing job if it exists
if gcloud scheduler jobs describe "$SCHEDULER_JOB" --location="$REGION" &>/dev/null; then
    print_warning "Deleting existing scheduler job"
    gcloud scheduler jobs delete "$SCHEDULER_JOB" --location="$REGION" --quiet
fi

# Create new scheduler job - twice daily at 9 AM and 5 PM ET
gcloud scheduler jobs create http "$SCHEDULER_JOB" \
  --schedule='0 9,17 * * *' \
  --uri="$FUNCTION_URL" \
  --http-method=POST \
  --location="$REGION" \
  --time-zone='America/New_York' \
  --description='Nature'\''s Way Soil automated video posting - twice daily' \
  --headers='Content-Type=application/json' \
  --message-body='{"trigger":"scheduler","source":"production"}'

print_success "Scheduler job created: $SCHEDULER_JOB"

# Test deployment
print_step 7 "Testing Deployment"

echo "🧪 Testing BigQuery proxy health..."
PROXY_URL="https://bq-proxy-1009540130231.${REGION}.run.app"
if curl -s -f "${PROXY_URL}/healthz" > /dev/null; then
    print_success "BigQuery proxy is healthy"
else
    print_warning "BigQuery proxy health check failed"
fi

echo "🧪 Testing Cloud Function..."
if curl -s -f "$FUNCTION_URL" -X POST -H "Content-Type: application/json" -d '{"test":true}' > /dev/null; then
    print_success "Cloud Function is responding"
else
    print_warning "Cloud Function test failed (may be normal for first deployment)"
fi

# Deploy static assets to GitHub Pages
print_step 8 "Deploying Static Assets"

echo "📁 Checking video assets..."
if [ -d "videos" ] && [ "$(ls -A videos 2>/dev/null)" ]; then
    ASSET_COUNT=$(ls videos/*.mp4 2>/dev/null | wc -l || echo "0")
    print_success "Found $ASSET_COUNT video assets"
else
    print_warning "No video assets found in videos/ directory"
fi

echo "🌐 Static assets available at: https://natureswaysoil.github.io/best/"
echo "📊 Dashboard available at: https://natureswaysoil.github.io/best/"

# Show deployment summary
print_step 9 "Deployment Summary"

echo -e "\n${GREEN}🎉 Production Deployment Complete!${NC}"
echo "=================================================="
echo "📊 Dashboard URL: https://natureswaysoil.github.io/best/"
echo "🔗 BigQuery Proxy: $PROXY_URL"
echo "⚡ Cloud Function: $FUNCTION_URL"
echo "📅 Scheduler: Twice daily at 9 AM & 5 PM ET"
echo "🎬 Video Strategy: Hybrid (Static + AI-generated)"
echo ""
echo "📋 Management Commands:"
echo "  View logs: gcloud functions logs read $FUNCTION_NAME --region=$REGION"
echo "  Manual trigger: curl -X POST $FUNCTION_URL"
echo "  Scheduler status: gcloud scheduler jobs describe $SCHEDULER_JOB --location=$REGION"
echo ""
echo "🔧 Next Steps:"
echo "  1. Verify environment variables in Google Cloud Console"
echo "  2. Test manual function trigger"
echo "  3. Monitor first scheduled execution"
echo "  4. Check social media posting results"

# Clean up temporary files
rm -f index.js

print_success "Deployment script completed successfully!"