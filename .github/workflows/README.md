# GitHub Actions Workflows

This directory contains automated workflows for the Nature's Way Soil project.

## Workflows

### 1. Build Product Videos (`build-videos.yml`)

Automatically generates 30-second product videos for all products.

**Triggers:**
- Manual dispatch via GitHub Actions UI
- Scheduled: Weekdays at 7 AM UTC (Monday-Friday)

**Features:**
- **Dual Mode Operation**: Works with or without Google Cloud Platform credentials
- **Automatic Fallback**: Uses FFmpeg when HeyGen AI is unavailable
- **Flexible Configuration**: Adapts to available resources

#### Running Modes

##### Full Mode (with GCP credentials)
When `GCP_SA_KEY` secret is configured:
- ✅ Authenticates with Google Cloud
- ✅ Retrieves HeyGen API key from Secret Manager
- ✅ Accesses Google Sheets for ASIN data
- ✅ Generates professional AI avatar videos using HeyGen
- ✅ High-quality talking head videos with branded content

##### Fallback Mode (without GCP credentials)
When `GCP_SA_KEY` secret is not available:
- ✅ Uses FFmpeg for video generation
- ✅ Creates placeholder ASIN data
- ✅ Generates professional-looking videos with text overlays
- ✅ No external API dependencies required
- ⚠️  Videos won't have AI avatars (text-based instead)

#### Setup Instructions

##### Option A: Full Setup (Recommended)

1. **Create Google Cloud Service Account**
   ```bash
   gcloud iam service-accounts create video-automation \
     --display-name="Video Automation Service Account"
   ```

2. **Grant Required Permissions**
   ```bash
   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member="serviceAccount:video-automation@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/secretmanager.secretAccessor"
   ```

3. **Create and Download Service Account Key**
   ```bash
   gcloud iam service-accounts keys create gcp-key.json \
     --iam-account=video-automation@YOUR_PROJECT_ID.iam.gserviceaccount.com
   ```

4. **Add Secrets to GitHub**
   - Go to your repository Settings → Secrets and variables → Actions
   - Add `GCP_SA_KEY`: Base64-encoded service account key JSON
     ```bash
     cat gcp-key.json | base64 -w 0
     ```
   - Add `GCP_PROJECT_ID`: Your Google Cloud project ID

5. **Store HeyGen API Key in Secret Manager**
   ```bash
   echo -n "your-heygen-api-key" | gcloud secrets create HEYGEN_API_KEY --data-file=-
   ```

##### Option B: Fallback Setup (No GCP required)

No setup needed! The workflow will automatically:
- Install FFmpeg
- Use local video generation
- Create videos with text overlays

Just trigger the workflow and it will work out of the box.

#### Manual Trigger

```bash
# Using GitHub CLI
gh workflow run build-videos.yml

# Or via GitHub web interface:
# Actions → Build Product Videos → Run workflow
```

#### Monitoring

Check workflow status:
```bash
gh run list --workflow=build-videos.yml
gh run view <run-id>
```

### 2. Auto-Generate Blog Content (`auto-generate-blog.yml`)

Automatically generates blog articles and content.

**Triggers:**
- Scheduled: Every 2 days at 9 AM UTC
- Manual dispatch with force option

**Features:**
- Automated content generation
- Git integration for automatic commits
- Build verification after content generation
- Smart change detection (only commits when new content is generated)

## Common Tasks

### View All Workflows
```bash
gh workflow list
```

### View Recent Runs
```bash
gh run list
```

### Trigger a Workflow
```bash
gh workflow run <workflow-name>
```

### View Workflow Logs
```bash
gh run view <run-id> --log
```

## Troubleshooting

### Build Videos Workflow

**Issue: Workflow fails with "Missing GCP_SA_KEY secret"**
- **Cause**: This error occurred in older versions of the workflow
- **Solution**: Update to the latest version - the workflow now works without GCP credentials using FFmpeg fallback

**Issue: Videos generated but no AI avatars**
- **Cause**: Running in fallback mode without HeyGen
- **Solution**: Set up GCP credentials and HeyGen API key (see Full Setup above)

**Issue: FFmpeg not found**
- **Cause**: Should not occur - FFmpeg is automatically installed in fallback mode
- **Solution**: Verify the workflow includes the "Install FFmpeg (fallback mode)" step

### Blog Generation Workflow

**Issue: No blog posts generated**
- **Check**: Review workflow logs for errors
- **Verify**: Node.js dependencies are installed correctly
- **Try**: Manual trigger with `force_generate` option

## Security Notes

- **Never commit service account keys to the repository**
- Store all sensitive credentials in GitHub Secrets
- Use Secret Manager for production API keys
- Service accounts should have minimal required permissions
- Regularly rotate service account keys

## Support

For issues or questions:
1. Check workflow logs in GitHub Actions
2. Review this README for common solutions
3. Consult the main project documentation
4. Open an issue in the repository

## Recent Updates

### November 2025
- ✅ Made `GCP_SA_KEY` optional in build-videos workflow
- ✅ Added automatic FFmpeg fallback mode
- ✅ Improved error messages and status reporting
- ✅ Added dual-mode operation support
