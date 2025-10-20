#!/bin/bash

# BigQuery Service Account Setup Script for Amazon PPC Dashboard
# This script helps create and configure a service account for BigQuery access

echo "🔧 Setting up BigQuery Service Account for Amazon PPC Dashboard"
echo "================================================================"

PROJECT_ID="amazon-ppc-474902"
SERVICE_ACCOUNT_NAME="amazon-ppc-dashboard"
SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
KEY_FILE="bigquery-service-account-key.json"

echo "📋 Configuration:"
echo "   Project ID: $PROJECT_ID"
echo "   Service Account: $SERVICE_ACCOUNT_EMAIL"
echo "   Key File: $KEY_FILE"
echo ""

# Check if gcloud is available
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI is not installed. Please install Google Cloud SDK first:"
    echo "   https://cloud.google.com/sdk/docs/install"
    echo ""
    echo "📝 Manual Setup Instructions:"
    echo "1. Go to Google Cloud Console: https://console.cloud.google.com/"
    echo "2. Select project: $PROJECT_ID"
    echo "3. Go to IAM & Admin > Service Accounts"
    echo "4. Create service account: $SERVICE_ACCOUNT_NAME"
    echo "5. Grant role: BigQuery Data Viewer"
    echo "6. Create JSON key and download it"
    echo "7. Copy the JSON content to the dashboard configuration"
    exit 1
fi

echo "🔍 Checking current gcloud configuration..."
CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null)

if [ "$CURRENT_PROJECT" != "$PROJECT_ID" ]; then
    echo "🔄 Setting gcloud project to $PROJECT_ID..."
    gcloud config set project $PROJECT_ID
fi

echo "🔐 Checking if service account exists..."
if gcloud iam service-accounts describe $SERVICE_ACCOUNT_EMAIL &> /dev/null; then
    echo "✅ Service account already exists"
else
    echo "📝 Creating service account..."
    gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
        --description="Service account for Amazon PPC Dashboard" \
        --display-name="Amazon PPC Dashboard"
fi

echo "🔑 Creating service account key..."
gcloud iam service-accounts keys create $KEY_FILE \
    --iam-account=$SERVICE_ACCOUNT_EMAIL

echo "🔒 Setting IAM permissions..."
echo "Granting BigQuery Data Viewer role..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
    --role="roles/bigquery.dataViewer"

echo "Granting BigQuery Job User role..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
    --role="roles/bigquery.jobUser"

echo ""
echo "✅ Setup Complete!"
echo "=================="
echo ""
echo "📄 Service Account Key created: $KEY_FILE"
echo ""
echo "🔐 Key Content (copy this to dashboard):"
echo "----------------------------------------"
cat $KEY_FILE
echo "----------------------------------------"
echo ""
echo "🌐 Next Steps:"
echo "1. Copy the JSON key content above"
echo "2. Go to the dashboard: https://natureswaysoil.github.io/best/"
echo "3. Paste the key in the 'Service Account Key' field"
echo "4. Click 'Connect to BigQuery'"
echo ""
echo "🛡️ Security Note:"
echo "- Keep the key file secure and never commit it to version control"
echo "- The key provides read-only access to BigQuery data"
echo ""
echo "📊 Expected BigQuery Dataset Structure:"
echo "- Project: $PROJECT_ID"
echo "- Dataset: amazon_ppc"
echo "- Table: campaign_performance"
echo "- Columns: date, campaign_name, impressions, clicks, cost, ctr, conversions"