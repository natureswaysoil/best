#!/bin/bash
# Pre-deployment verification script for Social Media Automation

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Pre-Deployment Verification${NC}"
echo "=================================="

# Check if running in correct directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json not found. Are you in the correct directory?${NC}"
    exit 1
fi

# Check Google Cloud authentication
echo -e "\n${YELLOW}Checking Google Cloud authentication...${NC}"
if gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
    ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format="value(account)")
    echo -e "${GREEN}✅ Authenticated as: $ACCOUNT${NC}"
else
    echo -e "${RED}❌ Not authenticated with Google Cloud${NC}"
    echo "Run: gcloud auth login"
    exit 1
fi

# Check project configuration
echo -e "\n${YELLOW}Checking Google Cloud project...${NC}"
PROJECT_ID=$(gcloud config get-value project 2>/dev/null || echo "")
if [ -n "$PROJECT_ID" ]; then
    echo -e "${GREEN}✅ Project set: $PROJECT_ID${NC}"
else
    echo -e "${RED}❌ No project set${NC}"
    echo "Run: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

# Check required APIs
echo -e "\n${YELLOW}Checking required Google Cloud APIs...${NC}"
REQUIRED_APIS=(
    "run.googleapis.com"
    "cloudbuild.googleapis.com"
    "secretmanager.googleapis.com"
    "cloudscheduler.googleapis.com"
)

for api in "${REQUIRED_APIS[@]}"; do
    if gcloud services list --enabled --filter="name:$api" --format="value(name)" | grep -q "$api"; then
        echo -e "${GREEN}✅ $api enabled${NC}"
    else
        echo -e "${RED}❌ $api not enabled${NC}"
        echo "Run: gcloud services enable $api"
        exit 1
    fi
done

# Check environment variables
echo -e "\n${YELLOW}Checking environment variables...${NC}"
ENV_FILE=".env.local"
REQUIRED_VARS=(
    "HEYGEN_API_KEY"
    "TWITTER_BEARER_TOKEN"
    "TWITTER_API_KEY"
    "TWITTER_API_SECRET"
    "TWITTER_ACCESS_TOKEN"
    "TWITTER_ACCESS_TOKEN_SECRET"
    "YT_CLIENT_ID"
    "YT_CLIENT_SECRET"
    "YT_REFRESH_TOKEN"
)

if [ -f "$ENV_FILE" ]; then
    echo -e "${GREEN}✅ .env.local file found${NC}"
    
    # Source the file
    set -a
    source "$ENV_FILE"
    set +a
    
    for var in "${REQUIRED_VARS[@]}"; do
        if [ -n "${!var}" ]; then
            echo -e "${GREEN}✅ $var is set${NC}"
        else
            echo -e "${YELLOW}⚠️ $var is not set${NC}"
        fi
    done
else
    echo -e "${YELLOW}⚠️ .env.local file not found${NC}"
    echo "Create .env.local with required environment variables"
fi

# Check required files
echo -e "\n${YELLOW}Checking required deployment files...${NC}"
REQUIRED_FILES=(
    "deploy-social-automation.sh"
    "cloudbuild-social.yaml"
    "Dockerfile.social-automation"
    "server-social-automation.mjs"
    "scripts/social-media-auto-post.mjs"
    "scripts/heygen-video-generator.mjs"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file exists${NC}"
    else
        echo -e "${RED}❌ $file missing${NC}"
        exit 1
    fi
done

# Check npm dependencies
echo -e "\n${YELLOW}Checking npm dependencies...${NC}"
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ node_modules exists${NC}"
else
    echo -e "${YELLOW}⚠️ node_modules not found${NC}"
    echo "Run: npm install"
fi

# Test HeyGen integration (if API key available)
if [ -n "$HEYGEN_API_KEY" ]; then
    echo -e "\n${YELLOW}Testing HeyGen integration...${NC}"
    if npm run heygen:test >/dev/null 2>&1; then
        echo -e "${GREEN}✅ HeyGen API connection successful${NC}"
    else
        echo -e "${YELLOW}⚠️ HeyGen API test failed (check API key)${NC}"
    fi
fi

# Check deployment script permissions
echo -e "\n${YELLOW}Checking deployment script permissions...${NC}"
if [ -x "deploy-social-automation.sh" ]; then
    echo -e "${GREEN}✅ deploy-social-automation.sh is executable${NC}"
else
    echo -e "${YELLOW}⚠️ deploy-social-automation.sh is not executable${NC}"
    echo "Run: chmod +x deploy-social-automation.sh"
fi

# Summary
echo -e "\n${BLUE}📋 Verification Summary${NC}"
echo "========================"

# Count warnings and errors from the checks above
if [ -f "$ENV_FILE" ] && [ -n "$HEYGEN_API_KEY" ] && [ -n "$TWITTER_BEARER_TOKEN" ] && [ -n "$YT_CLIENT_ID" ]; then
    echo -e "${GREEN}🎉 All critical checks passed!${NC}"
    echo -e "${GREEN}Ready for deployment.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Run: ./deploy-social-automation.sh"
    echo "2. Test: ./test-social-automation-service.sh"
    echo "3. Monitor: Check Cloud Run logs"
else
    echo -e "${YELLOW}⚠️ Some environment variables are missing${NC}"
    echo "Review the warnings above and set missing variables in .env.local"
    echo ""
    echo "Deployment will still work, but affected features may not function:"
    echo "- Missing HEYGEN_API_KEY: Video generation will use FFmpeg fallback"
    echo "- Missing Twitter keys: Twitter posting will be disabled"
    echo "- Missing YouTube keys: YouTube uploads will be disabled"
fi

echo ""
echo "For help, see: DEPLOYMENT_GUIDE.md"