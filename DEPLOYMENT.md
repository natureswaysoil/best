# Deployment Automation

This repository is configured for **Vercel hosting** with automated deployments via GitHub Actions.

## Current Hosting Platform (Detected)

The following files indicate Vercel is the primary hosting platform:

- `vercel.json` exists at the repo root
- `package.json` includes `@vercel/analytics`
- Next.js app structure (`next build` / `next start`) aligns with Vercel workflows

## Deployment Workflows Added

### 1) Production Deploy (`.github/workflows/deploy-production.yml`)

Triggers:
- Pushes to `main`
- Manual trigger (`workflow_dispatch`)

What it does:
1. Installs dependencies with `npm ci`
2. Runs `npm run type-check`
3. Runs `npm run build`
4. Pulls Vercel production environment config
5. Builds Vercel artifacts
6. Deploys prebuilt output to Vercel production
7. Writes deployment URL to GitHub Actions summary

### 2) Pull Request Preview Deploy (`.github/workflows/deploy-preview.yml`)

Triggers:
- Pull requests targeting `main` (opened, synchronize, reopened, ready_for_review)

What it does:
1. Installs dependencies with `npm ci`
2. Runs `npm run type-check`
3. Runs `npm run build`
4. Builds and deploys a Vercel preview deployment
5. Posts/updates preview URL as a PR comment
6. Handles forked PRs gracefully (build checks run, deploy skipped because secrets are unavailable)

## Required GitHub Repository Secrets

Add these in **GitHub → Settings → Secrets and variables → Actions**:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

How to get values:
- `VERCEL_TOKEN`: Create at https://vercel.com/account/tokens
- `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`: Available in your Vercel project settings, or from `.vercel/project.json` after linking the project locally

## Verification Checklist

- [ ] Secrets are configured in GitHub Actions
- [ ] `main` branch is protected as needed
- [ ] A test PR shows a preview URL comment
- [ ] Merge to `main` triggers production deployment

## Operational Notes

- Deployment status is visible directly in the **Actions** tab.
- Production workflow uses concurrency control to avoid overlapping deploys.
- Preview workflow updates one persistent PR comment instead of posting duplicates.
