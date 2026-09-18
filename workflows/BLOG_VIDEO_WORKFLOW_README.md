# 🌱 Blog + Video Combo Workflow

**A unified content creation and distribution pipeline for Nature's Way Soil**

## Overview

The Blog + Video Combo Workflow orchestrates the complete journey from product description to published blog post and distributed social media video:

```
Product Input
    ↓
Blog Post Generation (OpenAI) → Published to Website
    ↓
Video Script Generation (OpenAI) → HeyGen Video Creation
    ↓
Multi-Platform Distribution (Instagram, Twitter, YouTube, Pinterest, Facebook)
    ↓
Google Sheets Tracking (Campaign Management)
```

## Features

✨ **Fully Automated**
- Single API call triggers entire workflow
- No manual intervention needed
- Handles errors gracefully

🎬 **Content Generation**
- AI-powered blog posts (SEO-optimized, conversion-focused)
- AI video scripts (platform-optimized)
- HeyGen avatar video creation

📱 **Multi-Platform Distribution**
- Instagram Reels
- Twitter / X
- YouTube Shorts
- Pinterest Pins
- Facebook Videos

📊 **Tracking & Analytics**
- Google Sheets integration for campaign tracking
- Audit logging
- Platform-specific post IDs and URLs

## Installation

### Prerequisites

- Node.js 20.9+
- TypeScript 5+
- Environment variables configured (see below)

### Setup

```bash
# Clone repos (if not already done)
git clone https://github.com/natureswaysoil/best.git
cd best

# Install dependencies
npm install

# Copy workflow file
cp workflows/blog-video-combo-workflow.ts src/workflows/

# Configure environment
cp .env.local.example .env.local
# Edit .env.local with your credentials
```

## Environment Configuration

### 🔐 Google Secret Manager (Recommended)

All credentials are **automatically loaded from Google Secret Manager** when the workflow runs. The following secrets should be configured in your GCP project (`natureswaysoil-video`):

**Required secrets:**
- `OPENAI_API_KEY` — OpenAI API key for blog + video script generation
- `HEYGEN_API_KEY` — HeyGen API key for video creation

**Social platform secrets (optional, omit to skip platform):**
- `TWITTER_API_KEY`, `TWITTER_API_SECRET`, `TWITTER_ACCESS_TOKEN`, `TWITTER_ACCESS_TOKEN_SECRET`, `TWITTER_BEARER_TOKEN`
- `INSTAGRAM_ACCESS_TOKEN`, `INSTAGRAM_USER_ID`
- `YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET`, `YOUTUBE_REFRESH_TOKEN`
- `PINTEREST_ACCESS_TOKEN`
- `FACEBOOK_ACCESS_TOKEN`

**Google Sheets tracking (optional):**
- `GS_SERVICE_ACCOUNT_EMAIL`
- `GS_SERVICE_ACCOUNT_KEY`

**Google Cloud authentication:**
Set one of these environment variables to authenticate:
- `GOOGLE_APPLICATION_CREDENTIALS` — path to service account JSON
- `GOOGLE_SERVICE_ACCOUNT_JSON` — inline service account JSON
- Or run in GCP environment (Cloud Run, Cloud Functions, GKE)

The workflow automatically loads all secrets at startup — no manual configuration needed in production.

### Local Development (Fallback)

For local testing without GCP, add credentials to `.env.local`:

```env
# OpenAI (for blog + video script generation)
OPENAI_API_KEY=sk_test_your_key_here

# HeyGen (for video creation)
HEYGEN_API_KEY=your_heygen_key_here

# Social Platforms (optional - leave blank to skip platform)
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_secret
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_SECRET=your_access_secret
TWITTER_BEARER_TOKEN=your_bearer_token

INSTAGRAM_ACCESS_TOKEN=your_instagram_token
INSTAGRAM_USER_ID=your_instagram_user_id

YOUTUBE_CLIENT_ID=your_youtube_client_id
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret
YOUTUBE_REFRESH_TOKEN=your_refresh_token

PINTEREST_ACCESS_TOKEN=your_pinterest_token

# Google Sheets (optional, for tracking)
GS_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GS_SERVICE_ACCOUNT_KEY=your_service_account_key

# Supabase (optional, for campaign tracking)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
```

## Usage

### Basic Example

```typescript
import { runBlogVideoComboWorkflow } from './workflows/blog-video-combo-workflow';

const result = await runBlogVideoComboWorkflow({
  productName: 'Liquid Biochar Soil Conditioner',
  productDescription: 'A concentrated liquid biochar solution that improves soil water retention, enhances microbial activity, and restores compacted soil structure.',
  productCategory: 'Soil Amendments',
  productId: 'NWS_BIOCHAR_LIQ',
  enablePlatforms: ['instagram', 'twitter', 'youtube', 'pinterest'],
  dryRun: false,
});

console.log(result);
```

### Dry Run (Preview Without Publishing)

```typescript
const result = await runBlogVideoComboWorkflow({
  productName: 'Example Product',
  productDescription: 'Product description here',
  dryRun: true, // ← Preview only, no actual publishing
});
```

### With Google Sheets Tracking

```typescript
const result = await runBlogVideoComboWorkflow({
  productName: 'Example Product',
  productDescription: 'Product description',
  googleSheetUrl: 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit',
});
```

### CLI Usage

```bash
# Run with default example
npm run workflow:blog-video

# Run with custom input (via environment)
PRODUCT_NAME="Your Product" PRODUCT_DESC="Your description" npm run workflow:blog-video
```

## API Reference

### `runBlogVideoComboWorkflow(input: WorkflowInput): Promise<WorkflowOutput>`

#### Input Parameters

```typescript
interface WorkflowInput {
  // Required
  productName: string;                    // Product title
  productDescription: string;             // Detailed product description

  // Optional
  productCategory?: string;               // Product category (default: 'soil amendments')
  productId?: string;                     // Internal product ID
  googleSheetUrl?: string;                // Google Sheet for tracking
  enablePlatforms?: Platform[];           // Platforms to post to (default: all)
  dryRun?: boolean;                       // Preview only (default: false)
}

type Platform = 'instagram' | 'twitter' | 'youtube' | 'pinterest' | 'facebook';
```

#### Output

```typescript
interface WorkflowOutput {
  success: boolean;                       // Overall workflow success

  blogPost?: {
    slug: string;                         // URL slug
    title: string;                        // Blog title
    excerpt: string;                      // Meta description
    content: string;                      // Full blog content
    keywords: string[];                   // SEO keywords
    internalLinks: string[];              // Related product links
    publishedAt: string;                  // ISO timestamp
  };

  video?: {
    videoId: string;                      // HeyGen video ID
    videoUrl: string;                     // CDN video URL
    scriptContent: string;                // Generated script
    duration: number;                     // Video duration (seconds)
  };

  socialPosts?: {
    [platform: string]: {
      posted: boolean;
      postId?: string;                    // Platform post ID
      url?: string;                       // Platform post URL
      error?: string;
    }
  };

  tracking?: {
    sheetUpdated: boolean;
    rowId?: string;
  };

  summary: string;                        // Human-readable summary
  timestamp: string;                      // Workflow start time
}
```

## Workflow Stages

### 1️⃣ Blog Post Generation

- Uses OpenAI GPT-4o-mini
- Generates SEO-optimized, conversion-focused content (1500-2000 words)
- Includes internal links to related products
- Creates URL-friendly slug
- Extracts 5-8 relevant keywords

**Output files:** Blog post data added to `data/blog.ts`

### 2️⃣ Video Script Generation

- Uses OpenAI GPT-4o-mini
- Creates 15-30 second platform-optimized script
- Includes scene descriptions, voiceover, visual text
- Formatted for Reels, Shorts, TikTok

**Output:** Script string ready for HeyGen

### 3️⃣ Video Creation

- Uses HeyGen API
- Generates AI avatar video from script
- Returns video ID and CDN URL

**Output:** MP4 video ready for distribution

### 4️⃣ Blog Publishing

- Updates `data/blog.ts` with new post
- Commits to Git repo
- Triggers Next.js rebuild

**Output:** Published at `/blog/{slug}`

### 5️⃣ Social Distribution

- Posts video to enabled platforms
- Customizes caption per platform
- Includes product links and hashtags

**Output:** Platform-specific post URLs

### 6️⃣ Google Sheets Tracking

- Appends row to campaign sheet
- Includes blog URL, video URL, post URLs
- Logs timestamp and platform status

**Output:** Campaign row in Google Sheet

## Error Handling

The workflow includes robust error handling:

- **Retries** on rate limits and server errors (OpenAI: up to 5 attempts)
- **Timeouts** to prevent hanging requests (120 seconds)
- **Graceful degradation** if platforms are unavailable
- **Detailed logging** of all operations

### Common Issues

**Issue:** `OPENAI_API_KEY not configured`
- Solution: Add `OPENAI_API_KEY` to `.env.local`

**Issue:** `HEYGEN_API_KEY not configured`
- Solution: Add `HEYGEN_API_KEY` to `.env.local`

**Issue:** Social platform posts fail silently
- Solution: Check platform-specific credentials in `.env.local`
- Use `dryRun: true` to test configuration

## Performance

- **Blog generation:** 10-15 seconds
- **Video script:** 5-10 seconds
- **Video creation:** 30-60 seconds (HeyGen processing time)
- **Social posting:** 2-5 seconds per platform
- **Total end-to-end:** ~2 minutes

## Scaling

For high-volume campaigns:

1. **Batch processing** via Google Sheets
2. **Scheduled runs** using node-cron
3. **Rate limiting** to avoid API throttling
4. **Idempotency** via Supabase locks

See `src/scheduler.ts` in the `video` repo for scheduling examples.

## Integration with Existing Systems

This workflow integrates with:

- **`best` repo** — blog publishing, website integration
- **`video` repo** — social posting, platform adapters
- **Google Sheets** — campaign management
- **OpenAI** — content generation
- **HeyGen** — video creation
- **Social APIs** — distribution

## Troubleshooting

### Test the workflow

```bash
# Dry run (no publishing)
npm run workflow:blog-video -- --dry-run

# Check configuration
npm run validate

# View logs
tail -f auto-blog-generation.log
```

### Debug mode

```bash
DEBUG=nws:* npm run workflow:blog-video
```

## Future Enhancements

- [ ] Multi-language support
- [ ] Advanced A/B testing
- [ ] Platform-specific optimizations
- [ ] Analytics dashboard
- [ ] Webhook support for external triggers
- [ ] Custom templates per product category

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review logs in `auto-blog-generation.log`
3. Contact: support@natureswaysoil.com

---

**Last updated:** September 2026
**Maintainer:** Nature's Way Soil Engineering
