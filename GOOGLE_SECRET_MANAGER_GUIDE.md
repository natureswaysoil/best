# Google Secret Manager Integration Guide
## For Automated Advertising System

---

## Overview

Your API credentials are stored in Google Secret Manager. This guide shows you how to fetch them automatically for the advertising system.

---

## Quick Start

### 1. Set Your Google Cloud Project ID
```bash
export GOOGLE_CLOUD_PROJECT=your-project-id
# or
export GCP_PROJECT=your-project-id
```

### 2. Authenticate (if not already done)
```bash
gcloud auth application-default login
```

### 3. Fetch Credentials
```bash
npm run ads:fetch-secrets
```

This will:
- Connect to Google Secret Manager
- Fetch all ad platform credentials
- Write them to `.env.local`
- Ready to use with the ad system!

### 4. Generate Campaigns
```bash
npm run ads:generate
```

---

## Expected Secrets in Google Secret Manager

The system looks for these secrets:

### Google Ads
- `google-ads-developer-token`
- `google-ads-client-id`
- `google-ads-client-secret`
- `google-ads-refresh-token`
- `google-ads-customer-id`

### Meta (Facebook/Instagram)
- `meta-access-token`
- `meta-ad-account-id`

### Pinterest
- `pinterest-access-token`
- `pinterest-ad-account-id`

---

## Verify Your Secrets

### List all secrets in your project:
```bash
npm run ads:list-secrets
```

### Check a specific secret:
```bash
gcloud secrets versions access latest --secret="google-ads-developer-token"
```

---

## Troubleshooting

### "GOOGLE_CLOUD_PROJECT not set"
**Solution**: Export the environment variable:
```bash
export GOOGLE_CLOUD_PROJECT=your-actual-project-id
```

To make it permanent, add to your `~/.bashrc` or `~/.zshrc`:
```bash
echo 'export GOOGLE_CLOUD_PROJECT=your-actual-project-id' >> ~/.bashrc
source ~/.bashrc
```

### "gcloud CLI not found"
**Solution**: Install Google Cloud SDK
```bash
# macOS (Homebrew)
brew install --cask google-cloud-sdk

# Linux
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Windows
# Download from: https://cloud.google.com/sdk/docs/install
```

### "Permission denied" errors
**Solution**: Ensure you have the right IAM permissions:
1. Go to Google Cloud Console → IAM & Admin
2. Make sure your account has "Secret Manager Secret Accessor" role
3. Or run: `gcloud projects add-iam-policy-binding YOUR_PROJECT --member="user:YOUR_EMAIL" --role="roles/secretmanager.secretAccessor"`

### "Secret not found"
**Solution**: Verify the secret exists and name matches
```bash
npm run ads:list-secrets
```

If missing, create it:
```bash
echo -n "your-secret-value" | gcloud secrets create secret-name --data-file=-
```

---

## Adding New Secrets to Google Secret Manager

### Using gcloud CLI:
```bash
# Create a new secret
echo -n "your-api-key-here" | gcloud secrets create google-ads-developer-token --data-file=-

# Update an existing secret
echo -n "new-value" | gcloud secrets versions add google-ads-developer-token --data-file=-
```

### Using Google Cloud Console:
1. Go to: https://console.cloud.google.com/security/secret-manager
2. Click "CREATE SECRET"
3. Name: Use the exact name from the list above (e.g., `google-ads-developer-token`)
4. Secret value: Paste your API key
5. Click "CREATE"

---

## Security Best Practices

✅ **DO**:
- Store all sensitive credentials in Secret Manager
- Use IAM roles to control access
- Rotate secrets regularly
- Enable secret versioning

❌ **DON'T**:
- Commit `.env.local` to git (it's in `.gitignore`)
- Share secret values in chat/email
- Use same credentials across environments
- Store secrets in code

---

## CI/CD Integration

### GitHub Actions Example:
```yaml
- name: Fetch secrets from Google Secret Manager
  run: |
    echo "$GCP_SA_KEY" | base64 -d > ${HOME}/gcp-key.json
    export GOOGLE_APPLICATION_CREDENTIALS=${HOME}/gcp-key.json
    export GOOGLE_CLOUD_PROJECT=${{ secrets.GCP_PROJECT_ID }}
    npm run ads:fetch-secrets
```

### Cloud Run / Cloud Functions:
Secrets are automatically available via environment variables when configured in the deployment settings.

---

## Alternative: Environment Variables

If you prefer not to fetch secrets locally, you can still use environment variables directly:

```bash
# Set in your shell
export GOOGLE_ADS_DEVELOPER_TOKEN="your-token"
export META_ACCESS_TOKEN="your-token"
# ... etc

# Then run
npm run ads:generate
```

The scripts will use environment variables if `.env.local` doesn't have the values.

---

## Automated Refresh (Optional)

### Set up a cron job to refresh secrets daily:
```bash
crontab -e
```

Add:
```
0 0 * * * cd /path/to/your/repo && npm run ads:fetch-secrets >> /var/log/secret-refresh.log 2>&1
```

This ensures your local credentials stay in sync with Secret Manager.

---

## Support

**Google Secret Manager Documentation**:
- https://cloud.google.com/secret-manager/docs
- https://cloud.google.com/secret-manager/docs/creating-and-accessing-secrets

**Automated Ads System Documentation**:
- See `AUTOMATED_ADS_SETUP_GUIDE.md` for full ad system setup

---

## Quick Command Reference

```bash
# Fetch all secrets
npm run ads:fetch-secrets

# List available secrets
npm run ads:list-secrets

# Generate ad campaigns
npm run ads:generate

# Deploy campaigns
npm run ads:deploy

# Monitor performance
npm run ads:monitor
```

---

**Last Updated**: October 28, 2025  
**Version**: 1.0
