## Purpose

These short instructions help an AI coding agent become productive quickly in this repository.
Focus on the concrete patterns, files, and commands you can rely on — not generic advice.

# Pinterest Token Management Commands

## Automatic Token Refresh System
Revenue Protection: Pinterest generates 20-35 monthly sales

### Package.json Commands
- `npm run pinterest:health` - Full health check with revenue impact assessment
- `npm run pinterest:status` - Quick API status check  
- `npm run pinterest:refresh` - Standard token refresh
- `npm run pinterest:smart-refresh` - Smart refresh with backup token rotation
- `npm run pinterest:fix` - Comprehensive fix attempt with fallback tokens

### Token Management Features
- **Multi-layer Backup System**: Primary, backup, and tertiary refresh tokens
- **Smart Recovery**: Automatic fallback to backup tokens if primary fails
- **Revenue Impact Messaging**: Clear communication of 20-35 monthly sales risk
- **Health Monitoring**: Regular API health checks with actionable recommendations
- **Automatic Retry Logic**: Built-in retry mechanisms with exponential backoff

### Critical Operations
1. **Token Refresh Failure**: System automatically tries backup tokens
2. **API Outage Detection**: Health checks identify issues before revenue impact
3. **Revenue Stream Protection**: Clear messaging about financial impact of failures
4. **Emergency Recovery**: Multiple fallback layers prevent complete automation failure

### Environment Variables Required
- `PINTEREST_ACCESS_TOKEN` - Current active token
- `PINTEREST_REFRESH_TOKEN` - Primary refresh token  
- `PINTEREST_BACKUP_REFRESH_TOKEN` - Secondary refresh token
- `PINTEREST_TERTIARY_REFRESH_TOKEN` - Emergency backup token
- `PINTEREST_CLIENT_ID` - App client ID
- `PINTEREST_CLIENT_SECRET` - App client secret

### Usage Examples
```bash
# Daily health monitoring
npm run pinterest:health

# Emergency token refresh
npm run pinterest:fix

# Quick status during issues
npm run pinterest:status
```

## Big picture (why/how)

- This is a **hybrid Next.js 14 TypeScript website + Social Media Automation System** with Tailwind CSS for styling.
- Primary stacks/roles:
  - Frontend UI: `pages/`, `components/` (React + TypeScript + Tailwind)
  - Product data: `data/products.ts` (source of truth for demo product content)
  - Server/API: Next.js API routes in `pages/api/` (checkout, webhooks, debugging endpoints)
  - Integrations: Supabase (see `lib/supabase.ts`), Stripe (API routes + `config/paymentLinks.ts`), and Resend (`lib/resend.ts`).
  - **Social Media Automation**: Complete multi-platform posting system (`scripts/social-media-auto-post.mjs`) with Pinterest active, Instagram/Twitter/YouTube ready
  - Background/tools: scripts under `scripts/` for video generation, social media posting, and analytics.

## Key developer workflows (commands you can run)

### Core Next.js Development
- Install: `npm install`
- Dev server: `npm run dev` → Next.js local hot-reload (use this for most UI changes)
- Build: `npm run build` and run production locally with `npm run start`
- Lint: `npm run lint` and Type-check: `npm run type-check`

### Product/Video Management
- Generate videos: `npm run videos` (runs `scripts/generate-product-videos.mjs`)
- Check videos: `npm run check:videos` (runs `scripts/check-videos.mjs`)

### Social Media Automation
- Setup social media: `npm run social:setup` (runs `scripts/setup-social-media.mjs`)
- Test social posting: `npm run social:test` (runs `scripts/test-social-media.mjs`)
- Manual posting: `./scripts/social-media-auto-post.mjs` (Instagram/Twitter/YouTube automation)
- **Pinterest is active and generating revenue** - other platforms ready for API credentials
- **Twitter and YouTube credentials are deployed** - automation is LIVE on Google Cloud Run
- **Twitter OAuth 1.0a working** - successfully posting tweets to @JamesJones90703

### Pinterest Token Management (Revenue-Critical)
- **Pinterest Health Check**: `npm run pinterest:health` - Quick status check for revenue stream
- **Token Testing**: `npm run pinterest:test` - Full diagnostic of Pinterest integration
- **Quick Fix Guide**: `npm run pinterest:fix` - Step-by-step token refresh instructions
- **Auto-posting**: `npm run pinterest:post` - Manual Pinterest posting
- **Smart Auto-Refresh**: `npm run pinterest:smart-refresh` - Automatic token recovery with backup system
- **Update Token**: `npm run pinterest:update-token "NEW_TOKEN"` - Quick token update command
- **Revenue Impact**: Pinterest generates 20-35 monthly sales - token refresh is critical
- **Token Type**: App-based tokens with automatic refresh system and backup token rotation

### Platform-specific automation scripts (manual execution):
- `./test-all-social-media.sh` - Test complete automation system
- `./deploy-social-automation-with-creds.sh` - Deploy to Google Cloud Run with existing credentials
- `./setup-all-social-media.sh` - Get detailed setup instructions for all platforms

When editing API routes, test them locally via the Next dev server; inspect server console output for errors.

## Environment and secrets (what matters)

### Core Application
- Client-accessible Supabase keys: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Server-only Supabase key: `SUPABASE_SERVICE_ROLE_KEY` — use only in server-side code. See `lib/supabase.ts` and `getServiceSupabase()`.
- Hero video and site metadata examples are referenced in `README.md` (`NEXT_PUBLIC_HERO_VIDEO_URL`, `NEXT_PUBLIC_SITE_NAME`, etc.).

### Social Media API Keys (scripts/social-media-auto-post.mjs)
- **Pinterest**: Active with account ID 549769519654, generating 20-35 monthly sales (TOKEN REQUIRES MANUAL REFRESH)
- **Instagram**: `INSTAGRAM_ACCESS_TOKEN`, `INSTAGRAM_IG_ID` (Facebook Business API required)
- **Twitter**: `TWITTER_BEARER_TOKEN` (Available in Google Secret Manager - ready for deployment)
- **YouTube**: `YT_CLIENT_ID`, `YT_CLIENT_SECRET`, `YT_REFRESH_TOKEN` (Available in Google Secret Manager - WORKING and posting videos)

### Cloud Infrastructure (Google Cloud)
- Cloud Run jobs for automation: `cloudbuild.yaml` and `video-job.yaml`
- Secret Manager integration for secure API key storage
- BigQuery proxy: `cloud-functions/bq-proxy/` for analytics

Never commit real service-role keys or `.env.local` to the repo.

## Project-specific conventions & patterns

- Supabase usage:
  - `lib/supabase.ts` exports `supabase` (client) for browser/edge use and `getServiceSupabase()` for server/service-role operations. Use `getServiceSupabase()` only in server-side contexts (API routes, jobs).
  - Extended with social media schema: `supabase-social-media-schema.sql` adds social auth tables and platform integration
- Orders schema nuance:
  - `lib/supabase.ts` `OrderItem` defines item price as `price` (not `unit_price`) — follow this naming when reading/writing DB.
- Product data and assets:
  - Canonical, local product sample data lives in `data/products.ts` (useful for local dev & tests).
  - Static assets (images/videos) live under `public/images/` and `public/videos/` — video generation scripts read/write here.
  - **All 12 products have 30-second videos** generated automatically
- Social media automation patterns:
  - Content generation: `scripts/social-media-auto-post.mjs` creates platform-specific posts from product data
  - Duplicate prevention: `social-posted-content.json` tracks posted content to avoid reposts
  - Multi-platform strategy: Pinterest (active), Instagram (ready for credentials), Twitter/YouTube (DEPLOYED and LIVE)
  - Google Cloud deployment: Social automation runs as Cloud Run jobs twice daily with full multi-platform credentials
- Video tooling:
  - Video generation and checks are node scripts in `scripts/`. They are invoked with `npm run videos` and `npm run check:videos`.
  - These scripts are ESM (`.mjs`) — run under Node >=16+ (project `package.json` targets modern Node via Next 14).
- UI/components:
  - High-level wrapper `components/Layout.tsx` composes `Header`, `Footer`, `ChatWidget`, and `ExitIntentPopup`; keep cross-cutting UI changes here.
  - Product pages follow Next dynamic route `pages/product/[id].tsx` and rely on `data/products.ts` + media in `public/`.

## Integration points to inspect when making changes

- Stripe: `pages/api/create-checkout-session.ts` and `pages/api/webhooks/stripe.ts` (verify event handling and idempotency)
- Emails: `lib/resend.ts` and `pages/api/send-followup-email.ts` (Resend integration)
- Supabase: `lib/supabase.ts`, `pages/api/debug-supabase.ts`, and `pages/api/test-supabase.ts` (examples of server vs client usage)
- Social Media Automation: `scripts/social-media-auto-post.mjs` (main automation engine), `lib/social-auth.ts` (OAuth integration)
- Cloud infrastructure: `cloud-functions/bq-proxy/` is separate from Next app; review `cloud-functions/bq-proxy/index.js` if working on analytics or BigQuery proxying.
- **Pinterest API**: Active integration generates 20-35 monthly sales, uses promoted pins campaigns
- **Content Generation**: `scripts/generate-social-content.mjs` creates platform-specific posts from product data

## Small, actionable rules for the agent

1. Prefer editing or adding files under `pages/` and `components/` for UI changes; run `npm run dev` to verify.
2. When adding or changing DB access, decide: client-safe (use `supabase`) or server-only (use `getServiceSupabase()` and `SUPABASE_SERVICE_ROLE_KEY`).
3. When changing payments/checkout, update `config/paymentLinks.ts` and test the API routes locally using the Next dev server and webhook simulation.
4. When working with assets (images/videos), use `public/` paths and update `README.md` notes if adding new canonical files (hero video, product videos).
5. For background/video automation, run `npm run videos` locally; read the top of the script to see required env or filesystem expectations before invoking.
6. **Social media changes**: Test locally first with `./test-all-social-media.sh`, then deploy to Cloud Run with `./deploy-social-automation-with-creds.sh`
7. **Pinterest is revenue-generating**: Be extra careful with Pinterest automation changes as it actively brings in 20-35 monthly sales
8. **Twitter OAuth**: Twitter posting requires OAuth 1.0a (not Bearer token) - all credentials are deployed to Cloud Run and script is FIXED and WORKING
- **YouTube uploads**: YouTube has posted automatically before (2 videos found) and current script is now FIXED and WORKING - successfully posting videos

## Useful files to open first (quick map)

- `package.json` — scripts, deps
- `README.md` — project overview and env examples
- `lib/supabase.ts` — supabase client + service role usage
- `data/products.ts` — sample product data
- `pages/api/` — server endpoints (checkout, stripe webhooks, debug)
- `scripts/` — video generation and checks

## Final note

This file is intentionally short and practical. If you want I can extend it with specific examples (small code snippets showing correct supabase calls, a checklist for adding a new product, or a test harness for API routes). Please tell me which areas need more detail.
