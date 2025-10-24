#!/bin/bash
set -e

# Amazon PPC Automation System Test Suite
# Usage: ./test-automation.sh [project-id] [region]

PROJECT_ID=${1:-"amazon-ppc-474902"}
REGION=${2:-"us-east4"}

echo "🧪 Amazon PPC Automation System Test Suite"
echo "==========================================="
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo ""

# Test 1: Check Cloud Functions
echo "1️⃣ Testing Cloud Functions..."
SYNC_URL=$(gcloud functions describe amazon-ppc-sync --region=$REGION --format="value(serviceConfig.uri)" 2>/dev/null || echo "")
MONITOR_URL=$(gcloud functions describe bigquery-cost-monitor --region=$REGION --format="value(serviceConfig.uri)" 2>/dev/null || echo "")

if [ -n "$SYNC_URL" ]; then
    echo "   ✅ Amazon sync function deployed: $SYNC_URL"
else
    echo "   ❌ Amazon sync function not found"
fi

if [ -n "$MONITOR_URL" ]; then
    echo "   ✅ Cost monitor function deployed: $MONITOR_URL"
else
    echo "   ❌ Cost monitor function not found"
fi

# Test 2: Check Scheduler Jobs
echo ""
echo "2️⃣ Testing Cloud Scheduler jobs..."
JOBS=$(gcloud scheduler jobs list --location=$REGION --format="value(name)" 2>/dev/null | wc -l)
echo "   📋 Found $JOBS scheduler job(s)"

gcloud scheduler jobs list --location=$REGION --format="table(name,schedule,state)" 2>/dev/null || echo "   ⚠️ No scheduler jobs found"

# Test 3: Check BigQuery Dataset
echo ""
echo "3️⃣ Testing BigQuery setup..."
if bq show --dataset $PROJECT_ID:amazon_ppc &>/dev/null; then
    echo "   ✅ BigQuery dataset exists: $PROJECT_ID:amazon_ppc"
    
    # Check table
    if bq show --table $PROJECT_ID:amazon_ppc.campaign_performance &>/dev/null; then
        echo "   ✅ Campaign performance table exists"
        
        # Check data freshness
        ROWS=$(bq query --use_legacy_sql=false --format=csv --max_rows=1 "SELECT COUNT(*) FROM \`$PROJECT_ID.amazon_ppc.campaign_performance\` WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)" 2>/dev/null | tail -n 1)
        echo "   📊 Recent data rows (last 7 days): $ROWS"
    else
        echo "   ❌ Campaign performance table not found"
    fi
else
    echo "   ❌ BigQuery dataset not found: $PROJECT_ID:amazon_ppc"
fi

# Test 4: Check Secrets
echo ""
echo "4️⃣ Testing Secret Manager..."
if gcloud secrets describe amazon-advertising-credentials &>/dev/null; then
    echo "   ✅ Amazon credentials secret exists"
else
    echo "   ❌ Amazon credentials secret not found"
fi

if gcloud secrets describe email-config &>/dev/null; then
    echo "   ✅ Email config secret exists"
else
    echo "   ⚠️ Email config secret not found (optional)"
fi

# Test 5: Test Function Endpoints (if available)
echo ""
echo "5️⃣ Testing function endpoints..."
if [ -n "$SYNC_URL" ]; then
    echo "   🔄 Testing sync function..."
    SYNC_RESULT=$(curl -s -w "%{http_code}" -o /dev/null -X POST "$SYNC_URL" --max-time 30 || echo "000")
    if [ "$SYNC_RESULT" = "200" ] || [ "$SYNC_RESULT" = "500" ]; then
        echo "   ✅ Sync function responding (HTTP $SYNC_RESULT)"
    else
        echo "   ❌ Sync function not responding (HTTP $SYNC_RESULT)"
    fi
fi

if [ -n "$MONITOR_URL" ]; then
    echo "   💰 Testing cost monitor function..."
    MONITOR_RESULT=$(curl -s -w "%{http_code}" -o /dev/null -X POST "$MONITOR_URL" --max-time 30 || echo "000")
    if [ "$MONITOR_RESULT" = "200" ] || [ "$MONITOR_RESULT" = "500" ]; then
        echo "   ✅ Cost monitor function responding (HTTP $MONITOR_RESULT)"
    else
        echo "   ❌ Cost monitor function not responding (HTTP $MONITOR_RESULT)"
    fi
fi

# Test 6: Check Dashboard
echo ""
echo "6️⃣ Testing dashboard..."
DASHBOARD_RESULT=$(curl -s -w "%{http_code}" -o /dev/null "https://natureswaysoil.github.io/best/" --max-time 10 || echo "000")
if [ "$DASHBOARD_RESULT" = "200" ]; then
    echo "   ✅ Dashboard accessible (HTTP $DASHBOARD_RESULT)"
else
    echo "   ❌ Dashboard not accessible (HTTP $DASHBOARD_RESULT)"
fi

# Test 7: Check BigQuery Proxy
echo ""
echo "7️⃣ Testing BigQuery proxy..."
PROXY_RESULT=$(curl -s -w "%{http_code}" -o /dev/null -X POST "https://bq-proxy-1009540130231.us-east4.run.app" \
    -H "Content-Type: application/json" \
    -d '{"query":"SELECT 1 as test","location":"US","projectId":"'$PROJECT_ID'"}' \
    --max-time 10 || echo "000")
if [ "$PROXY_RESULT" = "200" ]; then
    echo "   ✅ BigQuery proxy responding (HTTP $PROXY_RESULT)"
else
    echo "   ❌ BigQuery proxy not responding (HTTP $PROXY_RESULT)"
fi

# Summary
echo ""
echo "📋 Test Summary"
echo "==============="
echo "✅ = Pass | ❌ = Fail | ⚠️ = Warning"
echo ""
echo "🔗 Key URLs:"
[ -n "$SYNC_URL" ] && echo "   Sync Function: $SYNC_URL"
[ -n "$MONITOR_URL" ] && echo "   Monitor Function: $MONITOR_URL"
echo "   Dashboard: https://natureswaysoil.github.io/best/"
echo "   BigQuery Proxy: https://bq-proxy-1009540130231.us-east4.run.app"
echo ""
echo "📞 Troubleshooting:"
echo "   View logs: gcloud logging read 'resource.type=cloud_function' --limit=10"
echo "   Check jobs: gcloud scheduler jobs list --location=$REGION"
echo "   Test sync: gcloud scheduler jobs run amazon-ppc-sync-2h --location=$REGION"