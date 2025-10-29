#!/bin/bash
# Test Social Media Automation Cloud Run Service

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Testing Social Media Automation Service${NC}"
echo "============================================="

# Get service URL
SERVICE_URL=$(gcloud run services describe social-automation --region=us-central1 --format="value(status.url)" 2>/dev/null || echo "")

if [ -z "$SERVICE_URL" ]; then
    echo -e "${RED}❌ Service not found or not deployed${NC}"
    echo "Run ./deploy-social-automation.sh first"
    exit 1
fi

echo -e "${BLUE}Service URL: ${SERVICE_URL}${NC}"

# Test health endpoint
echo -e "\n${YELLOW}Testing health endpoint...${NC}"
health_response=$(curl -s "${SERVICE_URL}/api/health" || echo "FAILED")

if [[ $health_response == *"healthy"* ]]; then
    echo -e "${GREEN}✅ Health check passed${NC}"
else
    echo -e "${RED}❌ Health check failed${NC}"
    echo "Response: $health_response"
fi

# Test status endpoint
echo -e "\n${YELLOW}Testing status endpoint...${NC}"
status_response=$(curl -s "${SERVICE_URL}/api/status" || echo "FAILED")

if [[ $status_response == *"operational"* ]]; then
    echo -e "${GREEN}✅ Status check passed${NC}"
    echo "Response: $status_response" | jq '.' 2>/dev/null || echo "$status_response"
else
    echo -e "${RED}❌ Status check failed${NC}"
    echo "Response: $status_response"
fi

# Test HeyGen integration
echo -e "\n${YELLOW}Testing HeyGen integration...${NC}"
heygen_response=$(curl -s -X POST "${SERVICE_URL}/api/heygen/test" -H "Content-Type: application/json" || echo "FAILED")

if [[ $heygen_response == *"success"* ]]; then
    echo -e "${GREEN}✅ HeyGen test passed${NC}"
else
    echo -e "${YELLOW}⚠️ HeyGen test (expected if no API key)${NC}"
    echo "Response: $heygen_response" | jq '.' 2>/dev/null || echo "$heygen_response"
fi

# Test manual posting trigger (dry run)
echo -e "\n${YELLOW}Testing manual posting endpoint (this will trigger actual posting!)...${NC}"
read -p "Do you want to test manual posting? This will create actual social media posts. (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Triggering manual post..."
    manual_response=$(curl -s -X POST "${SERVICE_URL}/api/post/manual" -H "Content-Type: application/json" || echo "FAILED")
    
    if [[ $manual_response == *"success"* ]]; then
        echo -e "${GREEN}✅ Manual posting triggered successfully${NC}"
        echo "Response: $manual_response" | jq '.' 2>/dev/null || echo "$manual_response"
    else
        echo -e "${RED}❌ Manual posting failed${NC}"
        echo "Response: $manual_response"
    fi
else
    echo "Skipped manual posting test"
fi

echo -e "\n${BLUE}🎉 Service testing complete!${NC}"
echo -e "Service is accessible at: ${SERVICE_URL}"
echo ""
echo "Available endpoints:"
echo "  GET  ${SERVICE_URL}/api/health"
echo "  GET  ${SERVICE_URL}/api/status"
echo "  POST ${SERVICE_URL}/api/post/manual"
echo "  POST ${SERVICE_URL}/api/post/scheduled"
echo "  POST ${SERVICE_URL}/api/videos/generate"
echo "  POST ${SERVICE_URL}/api/heygen/test"
echo "  GET  ${SERVICE_URL}/api/logs"