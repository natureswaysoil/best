# Social Media Automation Deployment Guide

## Complete HeyGen + Twitter + YouTube Automation System

This guide will deploy a production-ready social media automation system to Google Cloud Run with HeyGen AI video generation, Twitter posting, and YouTube uploads.

## 🎯 What This Deploys

- **HeyGen AI Video Generation**: Professional avatar videos with natural voices
- **Twitter Automation**: Daily tweet posting with videos
- **YouTube Automation**: Daily video uploads with descriptions
- **Cloud Run Service**: Scalable, serverless container deployment
- **Cloud Scheduler**: Automated twice-daily posting (6 AM & 6 PM UTC)
- **Secret Manager**: Secure credential storage
- **Monitoring**: Health checks and logging

## 📋 Prerequisites

### 1. Google Cloud Setup
```bash
# Install Google Cloud SDK (if not already installed)
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Login and set project
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable cloudscheduler.googleapis.com
```

### 2. Required API Keys & Credentials

#### HeyGen API Key
1. Visit https://app.heygen.com/
2. Sign up or login
3. Go to Settings → API Keys
4. Create new API key
5. Copy the key (starts with `hg_`)

#### Twitter API Credentials
1. Visit https://developer.twitter.com/
2. Create Twitter Developer account
3. Create new app in Twitter Developer Portal
4. Generate API keys:
   - API Key (Consumer Key)
   - API Secret (Consumer Secret)
   - Bearer Token
   - Access Token
   - Access Token Secret

#### YouTube API Credentials
1. Visit https://console.cloud.google.com/
2. Create new project or select existing
3. Enable YouTube Data API v3
4. Create OAuth 2.0 credentials
5. Download client configuration
6. Run OAuth flow to get refresh token

## 🚀 Deployment Steps

### Step 1: Prepare Environment
```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/best.git
cd best

# Install dependencies
npm install
```

### Step 2: Set Environment Variables
Create `.env.local` file:
```bash
# HeyGen Configuration
HEYGEN_API_KEY=hg_your_api_key_here

# Twitter Configuration
TWITTER_BEARER_TOKEN=your_bearer_token
TWITTER_API_KEY=your_api_key
TWITTER_API_SECRET=your_api_secret
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_access_secret

# YouTube Configuration
YT_CLIENT_ID=your_client_id
YT_CLIENT_SECRET=your_client_secret
YT_REFRESH_TOKEN=your_refresh_token
```

### Step 3: Test HeyGen Integration
```bash
# Test HeyGen API connection
npm run heygen:test

# List available avatars
npm run heygen:avatars

# List available voices
npm run heygen:voices
```

### Step 4: Deploy to Google Cloud
```bash
# Make deployment script executable
chmod +x deploy-social-automation.sh

# Run deployment
./deploy-social-automation.sh
```

### Step 5: Test Deployment
```bash
# Test the deployed service
./test-social-automation-service.sh
```

## 🔧 Configuration Options

### Cloud Run Settings
- **Memory**: 2GB (configurable in cloudbuild-social.yaml)
- **CPU**: 2 vCPU
- **Timeout**: 15 minutes
- **Max Instances**: 1 (prevents concurrent posting)
- **Region**: us-central1

### Automation Schedule
- **Morning Post**: 6:00 AM UTC (configurable in deployment script)
- **Evening Post**: 6:00 PM UTC (configurable in deployment script)
- **Timezone**: UTC (change in Cloud Scheduler if needed)

### Video Generation
- **Platform**: HeyGen AI
- **Fallback**: FFmpeg (if HeyGen fails)
- **Quality**: 1080p
- **Duration**: 15-60 seconds
- **Avatar**: Customizable (see `npm run heygen:avatars`)
- **Voice**: Natural AI voices (see `npm run heygen:voices`)

## 📊 Monitoring & Management

### Service Health Check
```bash
# Check service status
curl https://your-service-url/api/health

# View detailed status
curl https://your-service-url/api/status
```

### Manual Operations
```bash
# Trigger manual post
curl -X POST https://your-service-url/api/post/manual

# Generate videos manually
curl -X POST https://your-service-url/api/videos/generate

# Test HeyGen integration
curl -X POST https://your-service-url/api/heygen/test
```

### View Logs
```bash
# View Cloud Run logs
gcloud logs read --service=social-automation --region=us-central1

# View service logs via API
curl https://your-service-url/api/logs
```

## 🔐 Security Features

- **Secret Manager**: All API keys stored securely
- **Service Account**: Dedicated service account with minimal permissions
- **Private Container**: No public registry exposure
- **HTTPS Only**: All communications encrypted
- **Access Control**: Authenticated endpoints only

## 🛠️ Troubleshooting

### Common Issues

#### 1. HeyGen API Errors
```bash
# Check API key
npm run heygen:test

# Verify account limits
# Visit HeyGen dashboard to check usage
```

#### 2. Twitter API Issues
```bash
# Verify credentials
curl -H "Authorization: Bearer $TWITTER_BEARER_TOKEN" \
  "https://api.twitter.com/2/users/me"
```

#### 3. YouTube API Issues
```bash
# Test OAuth token
curl -H "Authorization: Bearer $YT_ACCESS_TOKEN" \
  "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true"
```

#### 4. Cloud Run Deployment Failures
```bash
# Check build logs
gcloud builds list

# View specific build
gcloud builds log BUILD_ID

# Check service status
gcloud run services describe social-automation --region=us-central1
```

### Debug Commands
```bash
# Local testing
npm run social:health

# Service diagnostics
./test-social-automation-service.sh

# Check secret configuration
gcloud secrets list

# View Cloud Scheduler jobs
gcloud scheduler jobs list
```

## 📈 Scaling & Optimization

### Cost Optimization
- **HeyGen Usage**: Monitor monthly credit usage
- **Cloud Run**: Pay-per-request, minimal idle costs
- **Cloud Storage**: Automatic video cleanup after posting
- **Cloud Scheduler**: Minimal cost for scheduling

### Performance Tuning
- **Video Generation**: Adjust quality vs speed in HeyGen settings
- **Concurrent Requests**: Limit to 1 instance to prevent duplicate posts
- **Timeout Settings**: Increase if video generation takes longer
- **Memory Allocation**: Increase if processing large videos

## 🎉 Success Metrics

After successful deployment, you should see:

1. **Automated Posting**: Videos posted twice daily to Twitter and YouTube
2. **Professional Videos**: AI-generated content with avatars and voices
3. **Consistent Schedule**: Posts at exactly 6 AM and 6 PM UTC
4. **High Reliability**: Automatic retries and error handling
5. **Secure Operations**: All credentials managed via Secret Manager

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Cloud Run logs: `gcloud logs read --service=social-automation`
3. Test individual components: `npm run heygen:test`, etc.
4. Verify all environment variables are set correctly
5. Ensure all required APIs are enabled in Google Cloud Console

## 🔄 Updates & Maintenance

### Updating the Service
```bash
# Pull latest changes
git pull origin main

# Rebuild and deploy
./deploy-social-automation.sh
```

### Credential Rotation
```bash
# Update secrets in Secret Manager
gcloud secrets versions add SECRET_NAME --data-file=-

# Restart service to pick up new secrets
gcloud run services update social-automation --region=us-central1
```

### Monitoring Setup
```bash
# Set up alerting (optional)
gcloud alpha monitoring policies create --policy-from-file=alert-config.json
```

---

**🎯 Ready to Deploy? Run `./deploy-social-automation.sh` to get started!**