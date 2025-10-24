#!/bin/bash
set -e

# Complete Amazon PPC Optimization System Deployment
# Usage: ./deploy-complete-system.sh [project-id] [region] [email]

PROJECT_ID=${1:-"amazon-ppc-474902"}
REGION=${2:-"us-east4"}
ALERT_EMAIL=${3:-"natureswaysoil@gmail.com"}

echo "🚀 Complete Amazon PPC Optimization System Deployment"
echo "====================================================="
echo "Project ID: $PROJECT_ID"
echo "Region: $REGION" 
echo "Alert Email: $ALERT_EMAIL"
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
gcloud config set project $PROJECT_ID

# Enable all required APIs
echo "🔌 Enabling required APIs..."
gcloud services enable cloudfunctions.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable bigquery.googleapis.com
gcloud services enable cloudscheduler.googleapis.com
gcloud services enable monitoring.googleapis.com
gcloud services enable logging.googleapis.com

# Create service accounts
echo "🔐 Creating service accounts..."

# Amazon sync service account
AMAZON_SA="amazon-sync-sa@$PROJECT_ID.iam.gserviceaccount.com"
if ! gcloud iam service-accounts describe $AMAZON_SA &> /dev/null; then
    gcloud iam service-accounts create amazon-sync-sa \
        --display-name="Amazon PPC Sync Service Account"
fi

# Cost monitor service account  
MONITOR_SA="cost-monitor-sa@$PROJECT_ID.iam.gserviceaccount.com"
if ! gcloud iam service-accounts describe $MONITOR_SA &> /dev/null; then
    gcloud iam service-accounts create cost-monitor-sa \
        --display-name="BigQuery Cost Monitor Service Account"
fi

# PPC optimizer service account
OPTIMIZER_SA="ppc-optimizer-sa@$PROJECT_ID.iam.gserviceaccount.com"
if ! gcloud iam service-accounts describe $OPTIMIZER_SA &> /dev/null; then
    gcloud iam service-accounts create ppc-optimizer-sa \
        --display-name="PPC Optimizer Service Account"
fi

# Grant permissions
echo "🛡️ Granting permissions..."

# Amazon sync permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$AMAZON_SA" \
    --role="roles/bigquery.dataEditor"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$AMAZON_SA" \
    --role="roles/bigquery.jobUser"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$AMAZON_SA" \
    --role="roles/secretmanager.secretAccessor"

# Cost monitor permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$MONITOR_SA" \
    --role="roles/bigquery.metadataViewer"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$MONITOR_SA" \
    --role="roles/bigquery.resourceViewer" 

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$MONITOR_SA" \
    --role="roles/monitoring.metricWriter"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$MONITOR_SA" \
    --role="roles/secretmanager.secretAccessor"

# PPC optimizer permissions (needs write access to modify campaigns)
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$OPTIMIZER_SA" \
    --role="roles/bigquery.dataEditor"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$OPTIMIZER_SA" \
    --role="roles/bigquery.jobUser"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$OPTIMIZER_SA" \
    --role="roles/secretmanager.secretAccessor"

# Create enhanced BigQuery schema
echo "🗄️ Setting up enhanced BigQuery schema..."
bq query --use_legacy_sql=false --project_id=$PROJECT_ID < optimization-schema.sql || echo "Schema setup completed with warnings"

# Deploy Amazon PPC Sync Function
echo "📊 Deploying Amazon PPC Sync function..."
cd automation/cloud-functions/amazon-api-sync

gcloud functions deploy amazon-ppc-sync \
    --gen2 \
    --runtime=nodejs18 \
    --region=$REGION \
    --source=. \
    --entry-point=syncAmazonData \
    --trigger=http \
    --service-account=$AMAZON_SA \
    --memory=1GB \
    --timeout=540s \
    --max-instances=3 \
    --env-vars-file=env.yaml \
    --allow-unauthenticated

SYNC_URL=$(gcloud functions describe amazon-ppc-sync --region=$REGION --format="value(serviceConfig.uri)")

cd ../../..

# Deploy Cost Monitor Function
echo "💰 Deploying Cost Monitor function..."
cd automation/cloud-functions/cost-monitor

gcloud functions deploy bigquery-cost-monitor \
    --gen2 \
    --runtime=nodejs18 \
    --region=$REGION \
    --source=. \
    --entry-point=monitorCosts \
    --trigger=http \
    --service-account=$MONITOR_SA \
    --memory=512MB \
    --timeout=300s \
    --max-instances=2 \
    --allow-unauthenticated

MONITOR_URL=$(gcloud functions describe bigquery-cost-monitor --region=$REGION --format="value(serviceConfig.uri)")

cd ../../..

# Deploy PPC Optimizer Function
echo "🎯 Deploying PPC Optimizer function..."
cd automation/cloud-functions/ppc-optimizer

gcloud functions deploy amazon-ppc-optimizer \
    --gen2 \
    --runtime=nodejs18 \
    --region=$REGION \
    --source=. \
    --entry-point=optimizePPC \
    --trigger=http \
    --service-account=$OPTIMIZER_SA \
    --memory=2GB \
    --timeout=540s \
    --max-instances=2 \
    --allow-unauthenticated

OPTIMIZER_URL=$(gcloud functions describe amazon-ppc-optimizer --region=$REGION --format="value(serviceConfig.uri)")

cd ../../..

# Set up Cloud Scheduler jobs
echo "⏰ Setting up Cloud Scheduler jobs..."

# Amazon sync every 2 hours
gcloud scheduler jobs create http amazon-ppc-sync-2h \
    --location=$REGION \
    --schedule="0 */2 * * *" \
    --uri="$SYNC_URL" \
    --http-method=POST \
    --headers="Content-Type=application/json" \
    --message-body='{}' \
    --time-zone="America/New_York" \
    --description="Amazon PPC data sync - every 2 hours" \
    --attempt-deadline=540s \
    --max-retry-attempts=3 || echo "Sync job may already exist"

# PPC optimization every 6 hours
gcloud scheduler jobs create http amazon-ppc-optimizer-6h \
    --location=$REGION \
    --schedule="0 */6 * * *" \
    --uri="$OPTIMIZER_URL" \
    --http-method=POST \
    --headers="Content-Type=application/json" \
    --message-body='{}' \
    --time-zone="America/New_York" \
    --description="PPC optimization - every 6 hours" \
    --attempt-deadline=540s \
    --max-retry-attempts=2 || echo "Optimizer job may already exist"

# Daily full sync at midnight
gcloud scheduler jobs create http amazon-ppc-daily-sync \
    --location=$REGION \
    --schedule="0 0 * * *" \
    --uri="$SYNC_URL" \
    --http-method=POST \
    --headers="Content-Type=application/json" \
    --message-body='{"fullSync": true}' \
    --time-zone="America/New_York" \
    --description="Amazon PPC daily full sync at midnight" \
    --attempt-deadline=540s \
    --max-retry-attempts=5 || echo "Daily sync job may already exist"

# Cost monitoring every 12 hours
gcloud scheduler jobs create http bigquery-cost-monitor-12h \
    --location=$REGION \
    --schedule="0 */12 * * *" \
    --uri="$MONITOR_URL" \
    --http-method=POST \
    --headers="Content-Type=application/json" \
    --message-body='{}' \
    --time-zone="America/New_York" \
    --description="BigQuery cost monitoring - every 12 hours" \
    --attempt-deadline=300s \
    --max-retry-attempts=2 || echo "Cost monitor job may already exist"

# Create secrets (templates) if they don't exist
echo "🔑 Ensuring secrets exist..."

# Amazon credentials template
if ! gcloud secrets describe amazon-advertising-credentials &> /dev/null; then
    echo '{"client_id":"YOUR_CLIENT_ID","client_secret":"YOUR_CLIENT_SECRET","refresh_token":"YOUR_REFRESH_TOKEN","profile_id":"YOUR_PROFILE_ID"}' | \
    gcloud secrets create amazon-advertising-credentials --data-file=-
    echo "⚠️ Please update amazon-advertising-credentials secret with real values"
else
    echo "✅ Amazon credentials secret already exists"
fi

# Email configuration template (optional)
if ! gcloud secrets describe email-config &> /dev/null; then
    echo '{"user":"your-email@gmail.com","password":"your-app-password"}' | \
    gcloud secrets create email-config --data-file=-
    echo "⚠️ Please update email-config secret for cost alerts (optional)"
else
    echo "✅ Email config secret already exists"
fi

echo ""
echo "🎉 Complete PPC Optimization System Deployed!"
echo "=============================================="
echo ""
echo "🔗 Function URLs:"
echo "📊 Amazon PPC Sync: $SYNC_URL"
echo "💰 Cost Monitor: $MONITOR_URL"
echo "🎯 PPC Optimizer: $OPTIMIZER_URL"
echo ""
echo "⏰ Scheduled Jobs:"
echo "• amazon-ppc-sync-2h - Every 2 hours (0 */2 * * *)"
echo "• amazon-ppc-optimizer-6h - Every 6 hours (0 */6 * * *)"
echo "• amazon-ppc-daily-sync - Daily at midnight (0 0 * * *)"
echo "• bigquery-cost-monitor-12h - Every 12 hours (0 */12 * * *)"
echo ""
echo "🎯 PPC Optimization Features:"
echo "✅ Auto-pause campaigns over 45% ACOS"
echo "✅ Auto-start campaigns under 45% ACOS"
echo "✅ Intelligent bid optimization (±15%)"
echo "✅ Keyword discovery from search terms"
echo "✅ Negative keyword automation"
echo "✅ Budget reallocation based on ROAS"
echo "✅ Dayparting optimization"
echo "✅ Cost monitoring with alerts"
echo ""
echo "🧪 Test Functions:"
echo "curl -X POST \"$SYNC_URL\""
echo "curl -X POST \"$OPTIMIZER_URL\""
echo "curl -X POST \"$MONITOR_URL\""
echo ""
echo "📊 Dashboard:"
echo "https://natureswaysoil.github.io/best/"
echo ""
echo "📈 Monitor System:"
echo "gcloud scheduler jobs list --location=$REGION"
echo "gcloud logging read \"resource.type=cloud_function\" --limit=20"