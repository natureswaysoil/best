#!/usr/bin/env node

/**
 * Google Cloud video + social job.
 *
 * Pipeline:
 * 1. Hydrate environment variables from Google Secret Manager.
 * 2. Generate the top-five quality seed-style videos.
 * 3. Upload videos/posters/plans to Cloud Storage.
 * 4. Set social posting video URLs to website URLs.
 * 5. Run the existing social-media auto-poster.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT = path.resolve(__dirname, '..');
const VIDEOS_DIR = path.join(PROJECT, 'public', 'videos');
const PLANS_DIR = path.join(PROJECT, 'content', 'generated-videos');
const SECRET_PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT || process.env.PROJECT_ID;
const DEFAULT_SITE_URL = 'https://www.natureswaysoil.com';
const SECRET_NAMES = [
  'PEXELS_API_KEY',
  'NEXT_PUBLIC_SITE_URL',
  'VIDEO_OUTPUT_BUCKET',
  'VIDEO_OUTPUT_PREFIX',
  'VIDEO_PUBLIC_BASE_URL',
  'INSTAGRAM_ACCESS_TOKEN',
  'INSTAGRAM_IG_ID',
  'FACEBOOK_PAGE_ID',
  'FACEBOOK_ACCESS_TOKEN',
  'FACEBOOK_PAGE_ACCESS_TOKEN',
  'PINTEREST_ACCESS_TOKEN',
  'PINTEREST_BOARD_ID',
  'TWITTER_API_KEY',
  'TWITTER_API_SECRET',
  'TWITTER_ACCESS_TOKEN',
  'TWITTER_ACCESS_TOKEN_SECRET',
  'TWITTER_ACCESS_SECRET',
  'TWITTER_BEARER_TOKEN',
  'YT_CLIENT_ID',
  'YT_CLIENT_SECRET',
  'YT_REFRESH_TOKEN'
];

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { cwd: PROJECT, stdio: 'inherit', timeout: Number(process.env.JOB_STEP_TIMEOUT_MS || 1800000), ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed with exit ${result.status}`);
}

function capture(command, args) {
  const result = spawnSync(command, args, { cwd: PROJECT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 30000 });
  if (result.status !== 0) return '';
  return result.stdout.trim();
}

function secretNames() {
  const extra = String(process.env.GOOGLE_SECRET_NAMES || '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
  return [...new Set([...SECRET_NAMES, ...extra])];
}

function readSecret(secretName) {
  if (!SECRET_PROJECT_ID) return null;
  const resource = `projects/${SECRET_PROJECT_ID}/secrets/${secretName}/versions/latest`;
  const value = capture('gcloud', ['secrets', 'versions', 'access', 'latest', '--secret', secretName, '--project', SECRET_PROJECT_ID]);
  if (!value) {
    console.log(`[Cloud Video Job] Secret not loaded or not present: ${resource}`);
    return null;
  }
  return value;
}

function hydrateSecrets() {
  console.log('[Cloud Video Job] Loading configured secrets from Google Secret Manager...');
  if (!SECRET_PROJECT_ID) {
    console.log('[Cloud Video Job] No Google Cloud project id detected. Using existing environment variables only.');
    return;
  }
  let loaded = 0;
  for (const name of secretNames()) {
    if (process.env[name]) continue;
    const value = readSecret(name);
    if (value) {
      process.env[name] = value;
      loaded++;
    }
  }
  console.log(`[Cloud Video Job] Loaded ${loaded} secret value(s).`);
}

function setWebsiteVideoEnvironment() {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, '');
  process.env.NEXT_PUBLIC_SITE_URL = siteUrl;
  process.env.WEBSITE_BASE_URL = siteUrl;
  process.env.SOCIAL_VIDEO_BASE_URL = `${siteUrl}/videos`;
  console.log(`[Cloud Video Job] Social video URLs will use website path: ${process.env.SOCIAL_VIDEO_BASE_URL}/{PRODUCT_ID}.mp4`);
}

function uploadOutputsToCloudStorage() {
  const bucket = process.env.VIDEO_OUTPUT_BUCKET || process.env.GCS_VIDEO_BUCKET || 'natureswaysoil-videos';
  const prefix = (process.env.VIDEO_OUTPUT_PREFIX || 'seed-videos').replace(/^\/+|\/+$/g, '');
  process.env.VIDEO_OUTPUT_BUCKET = bucket;
  process.env.VIDEO_OUTPUT_PREFIX = prefix;

  const destination = `gs://${bucket}/${prefix}/`;
  console.log(`[Cloud Video Job] Uploading generated videos and plans to ${destination}`);
  const files = [];
  if (fs.existsSync(VIDEOS_DIR)) {
    for (const name of fs.readdirSync(VIDEOS_DIR)) {
      if (/\.(mp4|jpg|jpeg|png)$/i.test(name)) files.push(path.join(VIDEOS_DIR, name));
    }
  }
  if (fs.existsSync(PLANS_DIR)) {
    for (const name of fs.readdirSync(PLANS_DIR)) {
      if (/\.json$/i.test(name)) files.push(path.join(PLANS_DIR, name));
    }
  }
  if (!files.length) {
    console.log('[Cloud Video Job] No generated files found to upload.');
    return;
  }

  run('gcloud', ['storage', 'cp', '--recursive', ...files, destination]);
  run('gcloud', ['storage', 'objects', 'update', `${destination}*`, '--cache-control=public, max-age=31536000, immutable']);

  if (process.env.MAKE_GCS_VIDEOS_PUBLIC === '1') {
    run('gcloud', ['storage', 'objects', 'update', `${destination}*`, '--add-acl-grant=entity=AllUsers,role=READER']);
  }

  const publicBase = (process.env.VIDEO_PUBLIC_BASE_URL || `https://storage.googleapis.com/${bucket}/${prefix}`).replace(/\/$/, '');
  process.env.VIDEO_PUBLIC_BASE_URL = publicBase;
  process.env.NEXT_PUBLIC_VIDEO_PUBLIC_BASE_URL = publicBase;
  console.log(`[Cloud Video Job] Website /videos/* should rewrite to: ${publicBase}/*`);
}

function runSocialPoster() {
  if (process.env.SKIP_SOCIAL_POSTING === '1') {
    console.log('[Cloud Video Job] SKIP_SOCIAL_POSTING=1. Skipping social posting.');
    return;
  }
  console.log('[Cloud Video Job] Running social media auto-poster...');
  run('node', ['scripts/social-media-auto-post.mjs']);
}

function main() {
  console.log('[Cloud Video Job] Starting Nature\'s Way Soil video + social pipeline.');
  hydrateSecrets();
  setWebsiteVideoEnvironment();
  console.log('[Cloud Video Job] Generating videos...');
  run('node', ['scripts/create-quality-seed-videos.mjs', '--all']);
  uploadOutputsToCloudStorage();
  runSocialPoster();
  console.log('[Cloud Video Job] Done.');
}

try {
  main();
} catch (error) {
  console.error(`[Cloud Video Job] Failed: ${error.message}`);
  process.exit(1);
}
