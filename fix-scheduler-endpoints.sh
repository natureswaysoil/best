#!/bin/bash
# Quick fix: Update existing Cloud Scheduler jobs to point at correct endpoint
# Run this on your local machine if the service is already deployed
# Usage: ./fix-scheduler-endpoints.sh

set -e

PROJECT_ID="natureswaysoil-video"
REGION="us-central1"
SERVICE_NAME="social-automation"

echo "🔧 Fixing Cloud Scheduler endpoints..."

# Get the current service URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region=${REGION} --project=${PROJECT_ID} --format="value(status.url)" 2>/dev/null)

if [ -z "$SERVICE_URL" ]; then
  echo "❌ Could not find Cloud Run service '${SERVICE_NAME}'. Is it deployed?"
  exit 1
fi

echo "📍 Service URL: ${SERVICE_URL}"

SERVICE_ACCOUNT="social-automation-scheduler@${PROJECT_ID}.iam.gserviceaccount.com"

echo "⏰ Updating morning scheduler job..."
gcloud scheduler jobs update http social-automation-morning \
  --location=${REGION} \
  --project=${PROJECT_ID} \
  --uri="${SERVICE_URL}/api/social-automation" \
  --oidc-service-account-email=${SERVICE_ACCOUNT} \
  --oidc-token-audience="${SERVICE_URL}" \
  2>/dev/null || echo "  (morning job may not exist yet - will be created on next deploy)"

echo "⏰ Updating evening scheduler job..."
gcloud scheduler jobs update http social-automation-evening \
  --location=${REGION} \
  --project=${PROJECT_ID} \
  --uri="${SERVICE_URL}/api/social-automation" \
  --oidc-service-account-email=${SERVICE_ACCOUNT} \
  --oidc-token-audience="${SERVICE_URL}" \
  2>/dev/null || echo "  (evening job may not exist yet - will be created on next deploy)"

echo ""
echo "✅ Scheduler jobs updated!"
echo ""
echo "🧪 Test the service manually:"
echo "  curl -X POST ${SERVICE_URL}/api/social-automation \\"
echo "       -H 'Content-Type: application/json' \\"
echo "       -d '{\"action\":\"test\"}'"
echo ""
echo "📋 Check health:"
echo "  curl ${SERVICE_URL}/api/health"
echo ""
echo "📊 Check status:"
echo "  curl ${SERVICE_URL}/api/status"
