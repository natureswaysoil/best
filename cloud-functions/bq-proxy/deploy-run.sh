#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID=${1:-amazon-ppc-474902}
REGION=${2:-us-east4}
SERVICE=${3:-bq-proxy}

echo "Deploying $SERVICE to Cloud Run in $REGION (project: $PROJECT_ID)"
gcloud config set project "$PROJECT_ID"

gcloud run deploy "$SERVICE" \
  --source=. \
  --region="$REGION" \
  --allow-unauthenticated \
  --set-env-vars=ALLOWED_ORIGINS=https://natureswaysoil.github.io \
  --set-env-vars=NODE_OPTIONS=--enable-source-maps

URL=$(gcloud run services describe "$SERVICE" --region="$REGION" --format='value(status.url)')
echo "\nService URL: $URL"
echo "Health check: $URL/healthz"
echo "Test query:"
echo "curl -sS -X POST \"$URL\" -H 'Content-Type: application/json' -d '{"query":"SELECT 1 AS ok","location":"us-east4","projectId":"amazon-ppc-474902"}'"
