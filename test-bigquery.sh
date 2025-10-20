#!/bin/bash

# Test BigQuery Connection Script
# This script tests the BigQuery connection using the service account key

echo "🧪 Testing BigQuery Connection for Amazon PPC Dashboard"
echo "======================================================="

PROJECT_ID="amazon-ppc-474902"
DATASET_ID="amazon_ppc"
KEY_FILE="bigquery-service-account-key.json"

# Check if key file exists
if [ ! -f "$KEY_FILE" ]; then
    echo "❌ Service account key file not found: $KEY_FILE"
    echo "Please run ./setup-bigquery.sh first to create the key"
    exit 1
fi

echo "🔍 Testing BigQuery connection..."

# Test query to check if we can access the data
bq query \
    --project_id=$PROJECT_ID \
    --service_account_json_key_file=$KEY_FILE \
    --use_legacy_sql=false \
    "
    SELECT
        COUNT(*) as total_records,
        COUNT(DISTINCT campaign_name) as unique_campaigns,
        MIN(date) as earliest_date,
        MAX(date) as latest_date
    FROM \`$PROJECT_ID.$DATASET_ID.campaign_performance\`
    WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
    " 2>/dev/null

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ BigQuery connection successful!"
    echo "📊 Data is accessible and ready for the dashboard"
    echo ""
    echo "🌐 Dashboard URL: https://natureswaysoil.github.io/best/"
    echo "🔑 Copy the service account key JSON to the dashboard configuration"
else
    echo ""
    echo "❌ BigQuery connection failed"
    echo "🔍 Troubleshooting steps:"
    echo "1. Verify the service account key is valid"
    echo "2. Check that the dataset '$DATASET_ID' exists in project '$PROJECT_ID'"
    echo "3. Ensure the service account has 'BigQuery Data Viewer' permissions"
    echo "4. Verify the table 'campaign_performance' exists with the expected schema"
    echo ""
    echo "📄 Expected table schema:"
    echo "- date (DATE)"
    echo "- campaign_name (STRING)"
    echo "- impressions (INT64)"
    echo "- clicks (INT64)"
    echo "- cost (FLOAT64)"
    echo "- ctr (FLOAT64)"
    echo "- conversions (INT64)"
fi