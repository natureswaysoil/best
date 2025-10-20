# Amazon PPC Dashboard - Complete Setup Guide
==============================================

## 🎯 Goal: Connect Live BigQuery Data to Dashboard

This guide provides all necessary commands to connect your Amazon PPC dashboard to live BigQuery data.

## 📋 Prerequisites

- Google Cloud Project: `amazon-ppc-474902`
- BigQuery API enabled
- Google Cloud SDK installed (or manual console access)

## 🚀 Step-by-Step Setup

### Step 1: Install Google Cloud SDK (if needed)

```bash
# Download and install
curl https://sdk.cloud.google.com | bash

# Restart shell
exec -l $SHELL

# Initialize
gcloud init
```

### Step 2: Authenticate and Configure

```bash
# Login to Google Cloud
gcloud auth login

# Set project
gcloud config set project amazon-ppc-474902
```

### Step 3: Create Service Account

```bash
# Create service account
gcloud iam service-accounts create amazon-ppc-dashboard \
  --description="Service account for Amazon PPC Dashboard" \
  --display-name="Amazon PPC Dashboard"
```

### Step 4: Create Service Account Key

```bash
# Create JSON key file
gcloud iam service-accounts keys create bigquery-service-account-key.json \
  --iam-account=amazon-ppc-dashboard@amazon-ppc-474902.iam.gserviceaccount.com
```

### Step 5: Grant Permissions

```bash
# Grant BigQuery Data Viewer role
gcloud projects add-iam-policy-binding amazon-ppc-474902 \
  --member="serviceAccount:amazon-ppc-dashboard@amazon-ppc-474902.iam.gserviceaccount.com" \
  --role="roles/bigquery.dataViewer"

# Grant BigQuery Job User role
gcloud projects add-iam-policy-binding amazon-ppc-474902 \
  --member="serviceAccount:amazon-ppc-dashboard@amazon-ppc-474902.iam.gserviceaccount.com" \
  --role="roles/bigquery.jobUser"
```

### Step 6: Set Up BigQuery Dataset

Go to [BigQuery Console](https://console.cloud.google.com/bigquery) and run:

```sql
-- Create dataset
CREATE SCHEMA IF NOT EXISTS `amazon-ppc-474902.amazon_ppc`
OPTIONS (
    description = 'Amazon PPC campaign performance data'
);

-- Create table
CREATE OR REPLACE TABLE `amazon-ppc-474902.amazon_ppc.campaign_performance` (
    date DATE,
    campaign_name STRING,
    campaign_id STRING,
    impressions INT64,
    clicks INT64,
    cost FLOAT64,
    ctr FLOAT64,
    conversions INT64,
    conversion_value FLOAT64,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
PARTITION BY date
CLUSTER BY campaign_name;
```

### Step 7: Load Your Data

Import your Amazon PPC data into the `campaign_performance` table. You can:

- Use BigQuery Data Transfer Service
- Upload CSV files
- Use the BigQuery API
- Run INSERT statements

**Sample data format:**
```sql
INSERT INTO `amazon-ppc-474902.amazon_ppc.campaign_performance`
(date, campaign_name, impressions, clicks, cost, ctr, conversions)
VALUES
(CURRENT_DATE(), 'Organic Fertilizer Campaign', 45000, 320, 125.50, 0.71, 12),
(CURRENT_DATE() - INTERVAL 1 DAY, 'Organic Fertilizer Campaign', 42500, 298, 118.75, 0.70, 11);
```

### Step 8: Test Connection

```bash
# Run connection test
./test-bigquery.sh
```

### Step 9: Connect Dashboard

1. Visit: https://natureswaysoil.github.io/best/
2. Copy the entire content of `bigquery-service-account-key.json`
3. Paste it into the "Service Account Key" field
4. Click "Connect to BigQuery"

## 🧪 Verification

Run the final verification:

```bash
./verify-setup.sh
```

## 📊 Expected Data Structure

Your BigQuery table should have these columns:
- `date` (DATE) - Campaign date
- `campaign_name` (STRING) - Campaign name
- `impressions` (INT64) - Number of impressions
- `clicks` (INT64) - Number of clicks
- `cost` (FLOAT64) - Campaign cost
- `ctr` (FLOAT64) - Click-through rate
- `conversions` (INT64) - Number of conversions

## 🔧 Troubleshooting

### Connection Issues
- Verify service account key is valid JSON
- Check BigQuery permissions
- Ensure dataset and table exist
- Confirm data is present in the expected format

### Permission Errors
- Grant `BigQuery Data Viewer` role
- Grant `BigQuery Job User` role
- Verify project ID is correct

### Data Issues
- Check column names match expected schema
- Verify date format is correct
- Ensure numeric fields contain valid numbers

## 📈 Dashboard Features

Once connected, your dashboard will show:
- **Live Metrics**: Total campaigns, impressions, clicks, conversion rates
- **Campaign Performance**: Bar charts showing impressions and clicks by campaign
- **Daily Trends**: Line charts showing 30-day performance trends
- **Auto-refresh**: Data updates every 5 minutes

## 🔒 Security Notes

- Keep the service account key secure
- Never commit keys to version control
- Rotate keys every 90 days
- Use minimal required permissions

## 📞 Support

If you encounter issues:
1. Check the error messages in the dashboard
2. Run `./test-bigquery.sh` for diagnostics
3. Verify all setup steps were completed
4. Check BigQuery console for data validation

---

**Dashboard URL**: https://natureswaysoil.github.io/best/
**Project**: amazon-ppc-474902
**Dataset**: amazon_ppc
**Table**: campaign_performance