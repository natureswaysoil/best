#!/usr/bin/env bash
set -euo pipefail

# Connect the dashboard to live BigQuery data in minutes.
# Usage:
#   ./scripts/connect-live.sh <PROJECT_ID> <SERVICE_ACCOUNT_EMAIL> [REGION]
# Example:
#   ./scripts/connect-live.sh amazon-ppc-474902 id-amazon-ppc-dashboard@amazon-ppc-474902.iam.gserviceaccount.com us-east4

PROJECT_ID=${1:-}
SERVICE_ACCOUNT=${2:-}
REGION=${3:-us-east4}

if [[ -z "$PROJECT_ID" || -z "$SERVICE_ACCOUNT" ]]; then
  echo "Usage: $0 <PROJECT_ID> <SERVICE_ACCOUNT_EMAIL> [REGION]" >&2
  exit 1
fi

command -v gcloud >/dev/null 2>&1 || { echo >&2 "gcloud is required but not installed. See https://cloud.google.com/sdk/docs/install"; exit 127; }

echo "Setting gcloud project: $PROJECT_ID"
gcloud config set project "$PROJECT_ID" >/dev/null

echo "Enabling required APIs (BigQuery, Cloud Functions)"
gcloud services enable bigquery.googleapis.com cloudfunctions.googleapis.com >/dev/null

echo "Granting IAM roles to $SERVICE_ACCOUNT"
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/bigquery.jobUser" >/dev/null
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/bigquery.dataViewer" >/dev/null

echo "Deploying Cloud Function proxy in $REGION using $SERVICE_ACCOUNT"
( cd cloud-functions/bq-proxy && \
  gcloud functions deploy bq-proxy \
    --entry-point=query \
    --runtime=nodejs20 \
    --trigger-http \
    --allow-unauthenticated \
    --region="$REGION" \
    --service-account="$SERVICE_ACCOUNT" \
    --set-env-vars=NODE_OPTIONS=--enable-source-maps )

URL=$(gcloud functions describe bq-proxy --region="$REGION" --format='value(httpsTrigger.url)')

echo "\nSuccess. Function URL: $URL"
echo "\nOpen the dashboard (auto-connect):"
echo "  https://natureswaysoil.github.io/best/?proxy=$URL&location=$REGION"
echo "\nIf your dataset is in a different location, change the location param accordingly."
