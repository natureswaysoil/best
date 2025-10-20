#!/bin/bash

# Test BigQuery Connection Script
# This script tests the BigQuery connection using the service account key

echo "🧪 Testing BigQuery Connection for Amazon PPC Dashboard"
echo "======================================================="

PROJECT_ID="amazon-ppc-474902"
DATASET_ID="amazon_ppc"
TABLE_NAME="campaign_performance"
KEY_FILE="bigquery-service-account-key.json"

# Check if key file exists
if [ ! -f "$KEY_FILE" ]; then
    echo "❌ Service account key file not found: $KEY_FILE"
    echo ""
    echo "📝 Please complete the manual setup first:"
    echo "   1. Follow the instructions in MANUAL-SETUP.md"
    echo "   2. Create the service account and download the key file"
    echo "   3. Save it as: $KEY_FILE"
    exit 1
fi

echo "🔍 Checking service account key..."
# Validate JSON format
if ! jq . "$KEY_FILE" > /dev/null 2>&1; then
    echo "❌ Invalid JSON in key file"
    exit 1
fi

echo "🔐 Testing BigQuery authentication..."

# Test basic authentication and project access
echo "Testing project access..."
bq ls --project_id=$PROJECT_ID --service_account_json_key_file=$KEY_FILE > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Cannot access project $PROJECT_ID"
    echo "   - Verify the service account has access to the project"
    echo "   - Check that the key file is valid"
    exit 1
fi

echo "✅ Project access confirmed"

# Test dataset access
echo "Testing dataset access..."
bq ls --project_id=$PROJECT_ID --service_account_json_key_file=$KEY_FILE $DATASET_ID > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Cannot access dataset $DATASET_ID"
    echo "   - Verify the dataset exists"
    echo "   - Check service account permissions"
    exit 1
fi

echo "✅ Dataset access confirmed"

# Test table access and data
echo "Testing table and data access..."
RESULT=$(bq query \
    --project_id=$PROJECT_ID \
    --service_account_json_key_file=$KEY_FILE \
    --use_legacy_sql=false \
    --format=csv \
    "
    SELECT
        COUNT(*) as total_records,
        COUNT(DISTINCT campaign_name) as unique_campaigns,
        MIN(date) as earliest_date,
        MAX(date) as latest_date,
        SUM(impressions) as total_impressions,
        SUM(clicks) as total_clicks,
        SUM(conversions) as total_conversions
    FROM \`$PROJECT_ID.$DATASET_ID.$TABLE_NAME\`
    WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
    " 2>/dev/null | tail -n 1)

if [ $? -ne 0 ] || [ -z "$RESULT" ]; then
    echo "❌ Cannot query table $TABLE_NAME"
    echo "   - Verify the table exists"
    echo "   - Check table permissions"
    echo "   - Ensure data exists in the expected format"
    exit 1
fi

# Parse results
IFS=',' read -r total_records unique_campaigns earliest_date latest_date total_impressions total_clicks total_conversions <<< "$RESULT"

echo "✅ Table access confirmed"
echo ""
echo "📊 Data Summary:"
echo "   Total Records: $total_records"
echo "   Unique Campaigns: $unique_campaigns"
echo "   Date Range: $earliest_date to $latest_date"
echo "   Total Impressions: $total_impressions"
echo "   Total Clicks: $total_clicks"
echo "   Total Conversions: $total_conversions"

# Calculate conversion rate
if [ "$total_clicks" -gt 0 ] 2>/dev/null; then
    conversion_rate=$(echo "scale=2; ($total_conversions * 100) / $total_clicks" | bc 2>/dev/null || echo "0")
    echo "   Conversion Rate: $conversion_rate%"
fi

echo ""
echo "🎉 BigQuery connection test PASSED!"
echo "==================================="
echo ""
echo "🌐 Ready to connect dashboard:"
echo "   Visit: https://natureswaysoil.github.io/best/"
echo "   Paste the service account key JSON into the dashboard"
echo "   Click 'Connect to BigQuery'"
echo ""
echo "📈 Dashboard will display:"
echo "   - Live campaign performance metrics"
echo "   - Daily trends charts"
echo "   - Real-time data updates"