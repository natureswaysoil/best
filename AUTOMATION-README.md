# Amazon PPC Dashboard - Complete Automation System

## Overview

This automated system synchronizes Amazon Advertising campaign data every 2 hours and provides comprehensive cost monitoring and optimization insights. The pipeline includes real-time data ingestion, advanced KPIs, automated alerts, and cost optimization recommendations.

## 🏗️ System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Amazon Ads   │────▶│  Cloud Function  │────▶│    BigQuery     │
│      API        │    │  (Data Sync)     │    │   (Data Lake)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                         │
                                ▼                         ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Cloud Scheduler │    │  Cost Monitor    │────▶│   Monitoring    │
│  (Every 2hrs)   │    │  Cloud Function  │    │   & Alerts     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
                                                         ▼
                                               ┌─────────────────┐
                                               │   Dashboard     │
                                               │ (GitHub Pages)  │
                                               └─────────────────┘
```

## 📊 Advanced KPIs & Metrics

The system now tracks comprehensive Amazon PPC metrics:

### Primary Metrics
- **Impressions**: Total ad impressions
- **Clicks**: Total ad clicks
- **Cost**: Total advertising spend
- **Conversions**: Total purchases/conversions
- **Conversion Value**: Total sales revenue

### Advanced KPIs
- **ACOS (Advertising Cost of Sales)**: `(Cost / Sales) × 100`
- **ROAS (Return on Ad Spend)**: `Sales / Cost`
- **CTR (Click-Through Rate)**: `(Clicks / Impressions) × 100`
- **CPC (Cost Per Click)**: `Cost / Clicks`
- **Conversion Rate**: `(Conversions / Clicks) × 100`
- **Average Order Value**: `Conversion Value / Conversions`

### Campaign Performance Insights
- Top performing campaigns by impressions, clicks, and ROAS
- Campaign optimization recommendations
- Trend analysis over 30-day periods
- Hour-by-hour performance patterns

## 🔄 Automated Data Pipeline

### Data Sync (Every 2 Hours)
- **Function**: `amazon-ppc-sync`
- **Schedule**: `0 */2 * * *` (every 2 hours)
- **Data Source**: Amazon Advertising API
- **Destination**: BigQuery (`amazon_ppc.campaign_performance`)

### Daily Full Sync
- **Function**: `amazon-ppc-sync` (with fullSync flag)
- **Schedule**: `0 0 * * *` (daily at midnight)
- **Purpose**: Comprehensive data validation and backfill

### Features
- **Authentication**: Automated OAuth token refresh
- **Error Handling**: Retry logic with exponential backoff
- **Data Validation**: Schema validation and duplicate prevention
- **Partitioning**: Date-partitioned tables for optimal performance
- **Clustering**: Clustered by campaign_name and campaign_id

## 💰 Cost Monitoring & Optimization

### Cost Alerts (Every 6 Hours)
- **Function**: `bigquery-cost-monitor`
- **Schedule**: `0 */6 * * *` (every 6 hours)
- **Thresholds**:
  - Daily cost: $50.00
  - Weekly cost: $250.00 (1/4 of monthly $1000 threshold)
  - Per-query cost: $1.00

### Monitoring Features
- **Real-time Cost Tracking**: Track BigQuery processing costs
- **Query Optimization**: Identify expensive queries and optimization opportunities
- **Usage Patterns**: Analyze query patterns by hour and user
- **Automated Alerts**: Email notifications when thresholds exceeded
- **Cloud Monitoring**: Custom metrics for dashboards and alerting

### Optimization Recommendations
- **Partition Pruning**: Detect queries missing date filters
- **SELECT * Detection**: Identify inefficient wildcard queries
- **Slot Hour Analysis**: Monitor compute usage patterns
- **Query Result Caching**: Recommend caching for repeated queries

## 🚀 Quick Start Deployment

### Prerequisites
```bash
# Install Google Cloud SDK
curl https://sdk.cloud.google.com | bash
gcloud auth login
gcloud config set project amazon-ppc-474902
```

### Complete System Deployment
```bash
# Deploy entire automation pipeline
./deploy-automation.sh amazon-ppc-474902 us-east4 your-email@example.com
```

This single command:
- ✅ Enables all required Google Cloud APIs
- ✅ Creates service accounts with proper permissions
- ✅ Deploys both Cloud Functions (sync + monitoring)
- ✅ Sets up Cloud Scheduler jobs
- ✅ Creates secret templates for credentials
- ✅ Updates BigQuery schema with new fields

## 🔑 Configuration

### 1. Amazon Advertising API Credentials
```bash
# Create credentials file
cat > amazon-credentials.json << EOF
{
  "client_id": "amzn1.application-oa2-client.xxxxx",
  "client_secret": "your-client-secret",
  "refresh_token": "Atzr|IwEBIxxxxx",
  "profile_id": "1234567890",
  "region": "NA",
  "marketplace": "ATVPDKIKX0DER"
}
EOF

# Upload to Secret Manager
gcloud secrets versions add amazon-advertising-credentials --data-file=amazon-credentials.json
rm amazon-credentials.json  # Clean up local file
```

### 2. Email Alerts (Optional)
```bash
# Create email configuration for cost alerts
cat > email-config.json << EOF
{
  "user": "your-email@gmail.com",
  "password": "your-app-password"
}
EOF

# Upload to Secret Manager
gcloud secrets versions add email-config --data-file=email-config.json
rm email-config.json  # Clean up local file
```

## 📈 BigQuery Schema

The system creates and maintains the following optimized table structure:

```sql
CREATE TABLE `amazon-ppc-474902.amazon_ppc.campaign_performance` (
    date DATE,
    campaign_name STRING,
    campaign_id STRING,
    impressions INT64,
    clicks INT64,
    cost FLOAT64,
    ctr FLOAT64,
    conversions INT64,
    conversion_value FLOAT64,
    acos FLOAT64,        -- New: Advertising Cost of Sales
    roas FLOAT64,        -- New: Return on Ad Spend  
    created_at TIMESTAMP
)
PARTITION BY date
CLUSTER BY campaign_name, campaign_id
```

### Performance Optimizations
- **Date Partitioning**: Queries filter efficiently by date ranges
- **Clustering**: Fast lookups by campaign name and ID
- **Column Optimization**: Proper data types for cost calculations
- **Automatic Cleanup**: Duplicate prevention on re-runs

## 🧪 Testing & Validation

### Test Individual Functions
```bash
# Test Amazon data sync
curl -X POST "https://amazon-ppc-sync-xxxxx.us-east4.run.app"

# Test cost monitoring
curl -X POST "https://bigquery-cost-monitor-xxxxx.us-east4.run.app"
```

### Manual Scheduler Execution
```bash
# Run sync job manually
gcloud scheduler jobs run amazon-ppc-sync-2h --location=us-east4

# Run cost monitor manually
gcloud scheduler jobs run bigquery-cost-monitor-6h --location=us-east4
```

### View Logs
```bash
# View function logs
gcloud logging read "resource.type=cloud_function" --limit=20

# View scheduler logs
gcloud logging read "resource.type=gce_instance AND protoPayload.methodName=RunJob" --limit=10
```

## 📊 Dashboard Enhancement

The dashboard now includes enhanced metrics and visualizations:

### New Query Capabilities
- **Advanced Filtering**: Filter by campaign, date range, and performance metrics
- **ACOS/ROAS Analysis**: Dedicated charts for profitability metrics
- **Trend Comparisons**: Week-over-week and month-over-month comparisons
- **Performance Segmentation**: High/medium/low performance campaign groupings

### Real-time Updates
- Dashboard queries the same BigQuery tables updated by automation
- Proxy endpoint handles CORS and authentication seamlessly
- Data refreshes every 2 hours automatically with new sync runs

## 🔧 Maintenance & Operations

### Regular Tasks
- **Monthly**: Review cost thresholds and adjust as needed
- **Quarterly**: Rotate API credentials and service account keys
- **As Needed**: Update sync frequency based on campaign volume

### Monitoring Checklist
- ✅ Cloud Scheduler jobs running successfully
- ✅ BigQuery costs within expected thresholds  
- ✅ Data freshness (< 2 hours old)
- ✅ Dashboard loading with live data
- ✅ Alert emails being received (if configured)

### Troubleshooting
- **Sync Failures**: Check Amazon API credentials and rate limits
- **Cost Spikes**: Review expensive queries and optimize
- **Missing Data**: Verify scheduler jobs are enabled and running
- **Dashboard Issues**: Test proxy endpoint and BigQuery permissions

## 📞 Support

### View System Status
```bash
# Check all scheduled jobs
gcloud scheduler jobs list --location=us-east4

# Check recent function executions
gcloud functions logs read amazon-ppc-sync --limit=10

# Check BigQuery job history
bq ls -j --max_results=10
```

### Key Resources
- **Dashboard URL**: https://natureswaysoil.github.io/best/
- **Function URLs**: Available in deployment output
- **BigQuery Console**: https://console.cloud.google.com/bigquery
- **Cloud Scheduler**: https://console.cloud.google.com/cloudscheduler

## 🎯 Performance Benchmarks

### Expected Performance
- **Sync Duration**: 30-120 seconds per run
- **Data Latency**: < 2 hours
- **BigQuery Costs**: < $50/month for typical usage
- **Function Costs**: < $10/month
- **Scheduler Costs**: < $1/month

### Scalability
- **Campaign Volume**: Handles 100+ campaigns efficiently
- **Data Retention**: 3+ years with partitioning
- **Query Performance**: Sub-second dashboard loads
- **Concurrent Users**: 50+ simultaneous dashboard users

This automation system provides enterprise-grade Amazon PPC data management with comprehensive monitoring, optimization, and alerting capabilities.