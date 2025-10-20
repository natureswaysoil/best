#!/usr/bin/env bash
set -euo pipefail

# One-command deploy for BigQuery proxy Cloud Function
# Usage:
#   ./deploy.sh <PROJECT_ID> [REGION]
# Example:
#   ./deploy.sh amazon-ppc-474902 us-east4

PROJECT_ID=${1:-}
REGION=${2:-us-east4}
if [[ -z "$PROJECT_ID" ]]; then
  echo "Usage: $0 <PROJECT_ID> [REGION]" >&2
  exit 1
fi

echo "Setting project to $PROJECT_ID"
gcloud config set project "$PROJECT_ID"

echo "Deploying function bq-proxy to region $REGION"
gcloud functions deploy bq-proxy \
  --entry-point=query \
  --runtime=nodejs20 \
  --trigger-http \
  --allow-unauthenticated \
  --region="$REGION" \
  --set-env-vars=NODE_OPTIONS=--enable-source-maps

URL=$(gcloud functions describe bq-proxy --region="$REGION" --format='value(httpsTrigger.url)')

echo "\nDeployed: $URL"
echo "\nGrant the function's service account BigQuery roles if needed:"
echo "  BigQuery Job User, BigQuery Data Viewer"
echo "\nOpen the dashboard with auto-connect via URL params:"
echo "  https://natureswaysoil.github.io/best/?proxy=$URL&location=$REGION"
