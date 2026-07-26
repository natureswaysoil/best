#!/usr/bin/env node

import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT = path.resolve(__dirname, '..');
const SECRET_PROJECT_ID =
  process.env.SECRET_PROJECT_ID ||
  process.env.GOOGLE_CLOUD_PROJECT ||
  process.env.GCLOUD_PROJECT ||
  process.env.GCP_PROJECT ||
  process.env.PROJECT_ID;
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

function run(args, env = process.env) {
  const result = spawnSync('node', args, {
    cwd: PROJECT,
    stdio: 'inherit',
    env,
    timeout: Number(process.env.JOB_STEP_TIMEOUT_MS || 1800000)
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`node ${args.join(' ')} failed with exit ${result.status}`);
}

function capture(command, args) {
  const result = spawnSync(command, args, {
    cwd: PROJECT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: 30000
  });
  return result.status === 0 ? result.stdout.trim() : '';
}

async function metadataAccessToken() {
  try {
    const response = await fetch(
      'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token',
      { headers: { 'Metadata-Flavor': 'Google' }, signal: AbortSignal.timeout(5000) }
    );
    if (!response.ok) return '';
    const payload = await response.json();
    return payload.access_token || '';
  } catch {
    return '';
  }
}

async function accessSecret(secretName, accessToken) {
  if (accessToken && SECRET_PROJECT_ID) {
    try {
      const resource = `projects/${SECRET_PROJECT_ID}/secrets/${secretName}/versions/latest`;
      const response = await fetch(
        `https://secretmanager.googleapis.com/v1/${resource}:access`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          signal: AbortSignal.timeout(10000)
        }
      );
      if (response.ok) {
        const payload = await response.json();
        return Buffer.from(payload.payload?.data || '', 'base64').toString('utf8').trim();
      }
    } catch {
      // Local development can still use the gcloud CLI fallback below.
    }
  }

  return capture('gcloud', [
    'secrets', 'versions', 'access', 'latest',
    '--secret', secretName,
    '--project', SECRET_PROJECT_ID
  ]);
}

function secretNames() {
  const extra = String(process.env.GOOGLE_SECRET_NAMES || '')
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean);
  return [...new Set([...SECRET_NAMES, ...extra])];
}

async function hydrateSecrets() {
  if (!SECRET_PROJECT_ID) {
    console.log('[Seed Rotation Entry] No Google Cloud project id found. Using existing env only.');
    return;
  }

  const accessToken = await metadataAccessToken();
  let loaded = 0;
  for (const name of secretNames()) {
    if (process.env[name]) continue;
    const value = await accessSecret(name, accessToken);
    if (value) {
      process.env[name] = value;
      loaded += 1;
    }
  }
  console.log(`[Seed Rotation Entry] Loaded ${loaded} Google Secret Manager value(s).`);
}

try {
  await hydrateSecrets();
  console.log('[Seed Rotation Entry] Build/upload phase...');
  run(['scripts/cloud-video-social-job.mjs'], { ...process.env, SKIP_SOCIAL_POSTING: '1' });
  if (process.env.SKIP_ROTATION_POSTING === '1') {
    console.log('[Seed Rotation Entry] SKIP_ROTATION_POSTING=1. Skipping rotation post phase.');
  } else {
    console.log('[Seed Rotation Entry] Rotation post phase...');
    run(['scripts/social-seed-rotation-runner.mjs'], process.env);
  }
  console.log('[Seed Rotation Entry] Complete.');
} catch (error) {
  console.error(`[Seed Rotation Entry] Failed: ${error.message}`);
  process.exit(1);
}
