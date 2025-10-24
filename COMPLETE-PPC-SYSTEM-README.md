# Amazon PPC Complete Optimization System

## 🎯 System Overview

This is an **enterprise-grade Amazon PPC automation system** that provides:
- **Automated campaign management** (pause/start based on ACOS)
- **Intelligent bid optimization** (±15% adjustments)
- **Keyword discovery** from high-performing search terms  
- **Negative keyword automation** to eliminate waste
- **Budget reallocation** based on ROAS performance
- **Dayparting optimization** for time-of-day bidding
- **Cost monitoring** with automated alerts
- **Real-time dashboard** with advanced KPIs

## 🚀 Quick Start Deployment

### Prerequisites
- Google Cloud SDK installed and authenticated
- Amazon Advertising API credentials
- BigQuery API enabled
- Cloud Functions and Cloud Scheduler APIs enabled

### One-Command Complete Deployment
```bash
./deploy-complete-system.sh amazon-ppc-474902 us-east4 your-email@example.com
```

This single command deploys:
- ✅ 3 Cloud Functions (sync, optimizer, cost monitor)
- ✅ 4 Cloud Scheduler jobs (every 2h, 6h, daily, 12h)
- ✅ Enhanced BigQuery schema with 8 tables
- ✅ Service accounts with proper permissions
- ✅ Secret management configuration

## 📊 System Architecture

### Core Components

1. **Data Pipeline** (`amazon-api-sync/`)
   - Fetches live Amazon Advertising API data every 2 hours
   - Transforms and loads into BigQuery with validation
   - Handles OAuth refresh and rate limiting

2. **PPC Optimizer** (`ppc-optimizer/`)
   - **Campaign Auto-Management**: Pauses campaigns >45% ACOS, starts <45%
   - **Bid Optimization**: Increases bids for profitable keywords, decreases for expensive ones
   - **Keyword Discovery**: Finds high-performing search terms to add as keywords
   - **Negative Keywords**: Automatically adds poor-performing terms as negatives
   - **Budget Reallocation**: Moves budget from poor to high-performing campaigns
   - **Dayparting**: Optimizes bids based on hourly performance patterns

3. **Cost Monitor** (`cost-monitor/`)
   - Tracks BigQuery usage and costs
   - Sends email alerts for cost spikes
   - Provides query optimization recommendations

4. **Live Dashboard** (`index.html`)
   - Real-time campaign performance metrics
   - Advanced KPIs: ACOS, ROAS, CTR, CPC, conversion rates
   - Optimization insights and manual controls
   - Interactive charts and trend analysis

### BigQuery Schema

**Core Tables:**
- `campaign_performance` - Daily campaign metrics with ACOS/ROAS
- `keyword_performance` - Keyword-level performance data
- `search_term_reports` - Search terms for keyword discovery
- `hourly_performance` - Hourly data for dayparting analysis
- `optimization_actions` - Log of all automated actions

**Master Data:**
- `keywords` - Keyword master with current bids and status
- `negative_keywords` - Negative keyword master
- `campaigns` - Campaign settings and budgets

## ⚙️ Configuration

### Amazon Advertising API Setup

1. **Get API Credentials:**
   - Login to Amazon Advertising Console
   - Navigate to API Management
   - Create new application or use existing
   - Note: `client_id`, `client_secret`, `refresh_token`, `profile_id`

2. **Store in Google Secret Manager:**
   ```bash
   # Create credentials file
   cat > amazon-credentials.json << EOF
   {
     "client_id": "amzn1.application-oa2-client.xxx",
     "client_secret": "your-secret-here",
     "refresh_token": "Atzr|IwEBIxxx...",
     "profile_id": "1234567890123456"
   }
   EOF
   
   # Store in Secret Manager
   gcloud secrets versions add amazon-advertising-credentials \
     --data-file=amazon-credentials.json
   ```

### Email Alerts Setup (Optional)
```bash
# Create email config for cost alerts
cat > email-config.json << EOF
{
  "user": "your-email@gmail.com",
  "password": "your-app-password"
}
EOF

gcloud secrets versions add email-config --data-file=email-config.json
```

## 🎯 Optimization Features

### 1. Campaign Auto-Management
- **Auto-Pause**: Campaigns with ACOS >45% (configurable)
- **Auto-Start**: Paused campaigns with ACOS <45%
- **Minimum Requirements**: 10+ clicks and 3+ days of data
- **Safety Limits**: Only acts on campaigns with sufficient data

### 2. Intelligent Bid Optimization
- **Increase Bids**: Keywords with ACOS <15% and conversions
- **Decrease Bids**: Keywords with ACOS >35%
- **Adjustment Size**: ±15% (configurable)
- **Bid Limits**: $0.10 minimum, $5.00 maximum

### 3. Keyword Discovery Engine
- **Source**: High-performing search terms from Amazon reports
- **Criteria**: 
  - 50+ impressions
  - 0.5%+ CTR
  - <30% ACOS
  - At least 1 conversion
- **Auto-Add**: Creates exact match keywords with optimal bids

### 4. Negative Keyword Automation
- **Identifies**: Search terms with:
  - 5+ clicks, no conversions
  - <0.3% CTR
  - $2+ wasted spend
- **Auto-Add**: Adds as exact match negative keywords
- **Cost Savings**: Eliminates future waste on poor terms

### 5. Budget Reallocation
- **High Performers**: Increase budget 25% for ACOS <20% & ROAS >3
- **Poor Performers**: Decrease budget 25% for ACOS >40% or ROAS <1
- **Minimum Change**: $5 threshold to avoid small adjustments

### 6. Dayparting Optimization
- **Analysis**: 14-day hourly performance review
- **Optimization**: Reduce bids for high-ACOS hours, increase for profitable hours
- **Implementation**: Via Amazon API bid adjustments by hour

## 📈 Advanced KPIs & Metrics

### Campaign Performance
- **ACOS** (Advertising Cost of Sales): Cost ÷ Revenue × 100
- **ROAS** (Return on Ad Spend): Revenue ÷ Cost  
- **CTR** (Click-Through Rate): Clicks ÷ Impressions × 100
- **CPC** (Cost Per Click): Cost ÷ Clicks
- **Conversion Rate**: Conversions ÷ Clicks × 100
- **Average Order Value**: Revenue ÷ Conversions

### Optimization Insights
- **Campaign Health**: High ACOS, profitable, needs attention counts
- **Opportunities**: Estimated savings, keywords to add, negatives needed
- **Automation Status**: Last optimization run, weekly actions count

## 🕐 Scheduling & Automation

### Cloud Scheduler Jobs

1. **amazon-ppc-sync-2h** - Every 2 hours
   - Syncs latest Amazon data
   - Updates BigQuery tables
   - Runs: `0 */2 * * *`

2. **amazon-ppc-optimizer-6h** - Every 6 hours  
   - Runs all optimization algorithms
   - Makes campaign/keyword changes
   - Runs: `0 */6 * * *`

3. **amazon-ppc-daily-sync** - Daily at midnight
   - Full data validation sync
   - Comprehensive report generation
   - Runs: `0 0 * * *`

4. **bigquery-cost-monitor-12h** - Every 12 hours
   - Monitors BigQuery costs
   - Sends alerts if thresholds exceeded
   - Runs: `0 */12 * * *`

## 💰 Cost Management

### BigQuery Cost Optimization
- **Partitioned Tables**: By date for efficient querying
- **Clustered Tables**: By campaign/keyword for fast lookups
- **Query Optimization**: Automatic detection of expensive queries
- **Cost Alerts**: Daily ($50) and weekly ($250) thresholds

### Expected Costs
- **BigQuery**: ~$20-50/month (depends on data volume)
- **Cloud Functions**: ~$10-30/month (based on execution time)
- **Cloud Scheduler**: ~$1-5/month (minimal cost)
- **Total**: $30-85/month for typical usage

## 🧪 Testing & Validation

### Automated Testing
```bash
# Test complete system
./test-automation.sh

# Test individual components
curl -X POST "https://REGION-PROJECT.cloudfunctions.net/amazon-ppc-sync"
curl -X POST "https://REGION-PROJECT.cloudfunctions.net/amazon-ppc-optimizer" 
curl -X POST "https://REGION-PROJECT.cloudfunctions.net/bigquery-cost-monitor"
```

### Manual Validation
1. **Dashboard**: Visit https://natureswaysoil.github.io/best/
2. **BigQuery**: Check data freshness in console
3. **Logs**: `gcloud logging read "resource.type=cloud_function" --limit=20`
4. **Scheduler**: `gcloud scheduler jobs list --location=us-east4`

## 📞 Troubleshooting

### Common Issues

**Authentication Errors:**
- Check Amazon credentials in Secret Manager
- Verify service account permissions
- Ensure refresh token is valid

**Data Pipeline Issues:**
- Check BigQuery dataset location (US vs us-east4)
- Verify Amazon API rate limits
- Review Cloud Function logs

**Optimization Not Running:**
- Check scheduler job status
- Verify sufficient data for decisions
- Review optimization function logs

**Dashboard Connection Errors:**
- Verify BigQuery proxy URL
- Check CORS configuration
- Test proxy endpoint directly

### Support Resources
- **Logs**: Cloud Console > Logging
- **Monitoring**: Cloud Console > Monitoring
- **BigQuery**: Console > BigQuery for data validation
- **Scheduler**: Console > Cloud Scheduler for job status

## 🔄 Maintenance

### Regular Tasks
- **Weekly**: Review optimization actions log
- **Monthly**: Analyze cost trends and adjust thresholds
- **Quarterly**: Rotate Amazon API credentials
- **As Needed**: Update optimization parameters based on performance

### Performance Monitoring
- Track optimization impact on ACOS/ROAS
- Monitor automated action success rates
- Review cost savings from negative keywords
- Analyze keyword discovery effectiveness

## 🚨 Alerts & Notifications

### Automated Alerts
- **High Costs**: BigQuery spending >$50/day
- **Optimization Failures**: Failed API calls or errors
- **Data Pipeline Issues**: Missing or delayed data
- **Campaign Issues**: Unusual ACOS spikes

### Alert Channels
- **Email**: Cost and error notifications
- **Dashboard**: Real-time status indicators
- **Logs**: Detailed error information
- **Monitoring**: Cloud Console dashboards

---

## 📋 Summary

This complete Amazon PPC optimization system provides:

✅ **Fully Automated** campaign management
✅ **Advanced KPIs** and insights dashboard  
✅ **Cost Optimization** with monitoring and alerts
✅ **Scalable Architecture** using Google Cloud
✅ **Comprehensive Testing** and validation tools
✅ **Enterprise Security** with Secret Manager
✅ **Real-time Updates** every 2 hours
✅ **Intelligent Optimization** based on performance data

The system is designed to **reduce costs** and **increase conversions** through intelligent automation while providing full transparency and control through the dashboard interface.