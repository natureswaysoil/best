#!/bin/bash

# Quick Key Validation Script
# Usage: ./validate-key.sh < key.json

echo "🔍 Validating BigQuery Service Account Key"
echo "=========================================="

# Check if input is provided
if [ -t 0 ]; then
    echo "❌ No input provided. Usage:"
    echo "   cat bigquery-service-account-key.json | ./validate-key.sh"
    echo "   or"
    echo "   ./validate-key.sh < bigquery-service-account-key.json"
    exit 1
fi

# Read JSON from stdin
KEY_JSON=$(cat)

# Validate JSON format
echo "📄 Checking JSON format..."
if ! echo "$KEY_JSON" | jq . > /dev/null 2>&1; then
    echo "❌ Invalid JSON format"
    exit 1
fi

echo "✅ Valid JSON format"

# Extract key information
PROJECT_ID=$(echo "$KEY_JSON" | jq -r '.project_id // empty')
CLIENT_EMAIL=$(echo "$KEY_JSON" | jq -r '.client_email // empty')
PRIVATE_KEY_ID=$(echo "$KEY_JSON" | jq -r '.private_key_id // empty')

echo ""
echo "🔑 Key Information:"
echo "   Project ID: $PROJECT_ID"
echo "   Service Account: $CLIENT_EMAIL"
echo "   Key ID: $PRIVATE_KEY_ID"

# Validate expected values
if [ "$PROJECT_ID" != "amazon-ppc-474902" ]; then
    echo "⚠️  Warning: Project ID doesn't match expected 'amazon-ppc-474902'"
fi

if [[ "$CLIENT_EMAIL" != *"amazon-ppc-dashboard"* ]]; then
    echo "⚠️  Warning: Service account name doesn't contain 'amazon-ppc-dashboard'"
fi

echo ""
echo "✅ Key validation complete!"
echo ""
echo "🌐 Ready to use in dashboard:"
echo "   Visit: https://natureswaysoil.github.io/best/"
echo "   Paste the JSON key into the 'Service Account Key' field"
echo "   Click 'Connect to BigQuery'"