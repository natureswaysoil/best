# BigQuery Setup Guide for Amazon PPC Dashboard
# ================================================

echo "🔧 MANUAL SETUP: BigQuery Service Account for Amazon PPC Dashboard"
echo "=================================================================="

# STEP 1: Install Google Cloud SDK (if not already installed)
echo "1. Install Google Cloud SDK:"
echo "   - Download from: https://cloud.google.com/sdk/docs/install"
echo "   - Or use: curl https://sdk.cloud.google.com | bash"
echo "   - Restart terminal and run: gcloud init"

# STEP 2: Authenticate and set project
echo ""
echo "2. Authenticate and set project:"
echo "   gcloud auth login"
echo "   gcloud config set project amazon-ppc-474902"

# STEP 3: Create service account
echo ""
echo "3. Create service account:"
echo "   gcloud iam service-accounts create amazon-ppc-dashboard \\"
echo "     --description='Service account for Amazon PPC Dashboard' \\"
echo "     --display-name='Amazon PPC Dashboard'"

# STEP 4: Create service account key
echo ""
echo "4. Create service account key:"
echo "   gcloud iam service-accounts keys create bigquery-service-account-key.json \\"
echo "     --iam-account=amazon-ppc-dashboard@amazon-ppc-474902.iam.gserviceaccount.com"

# STEP 5: Grant permissions
echo ""
echo "5. Grant BigQuery permissions:"
echo "   gcloud projects add-iam-policy-binding amazon-ppc-474902 \\"
echo "     --member='serviceAccount:amazon-ppc-dashboard@amazon-ppc-474902.iam.gserviceaccount.com' \\"
echo "     --role='roles/bigquery.dataViewer'"

echo "   gcloud projects add-iam-policy-binding amazon-ppc-474902 \\"
echo "     --member='serviceAccount:amazon-ppc-dashboard@amazon-ppc-474902.iam.gserviceaccount.com' \\"
echo "     --role='roles/bigquery.jobUser'"

# STEP 6: Set up BigQuery data
echo ""
echo "6. Set up BigQuery dataset and table:"
echo "   - Go to BigQuery Console: https://console.cloud.google.com/bigquery"
echo "   - Select project: amazon-ppc-474902"
echo "   - Create dataset: amazon_ppc"
echo "   - Run the SQL from bigquery-schema.sql to create tables and insert sample data"

# STEP 7: Test connection
echo ""
echo "7. Test the connection:"
echo "   bq query --project_id=amazon-ppc-474902 \\"
echo "     'SELECT COUNT(*) as total_records FROM \`amazon-ppc-474902.amazon_ppc.campaign_performance\`'"

# STEP 8: Connect dashboard
echo ""
echo "8. Connect the dashboard:"
echo "   - Visit: https://natureswaysoil.github.io/best/"
echo "   - Copy the entire content of bigquery-service-account-key.json"
echo "   - Paste it into the 'Service Account Key' field"
echo "   - Click 'Connect to BigQuery'"

echo ""
echo "✅ MANUAL SETUP COMPLETE!"
echo "========================"
echo ""
echo "📄 After running these commands, your dashboard will have:"
echo "   - Service account key file: bigquery-service-account-key.json"
echo "   - BigQuery dataset: amazon_ppc"
echo "   - Sample campaign data for testing"
echo "   - Live dashboard connection ready"