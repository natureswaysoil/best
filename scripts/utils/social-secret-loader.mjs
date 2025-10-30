#!/usr/bin/env node
/**
 * Helper to lazily hydrate social automation environment variables from
 * Google Secret Manager. This is used by verification scripts and the
 * automation runner so local checks behave the same way as production.
 */

import { execSync } from 'child_process';

const SECRET_MAP = {
  INSTAGRAM_ACCESS_TOKEN: 'instagram-access-token',
  INSTAGRAM_IG_ID: 'instagram-ig-id',
  TWITTER_BEARER_TOKEN: 'twitter-bearer-token',
  TWITTER_API_KEY: 'twitter-api-key',
  TWITTER_API_SECRET: 'twitter-api-secret',
  TWITTER_ACCESS_TOKEN: 'twitter-access-token',
  TWITTER_ACCESS_TOKEN_SECRET: 'twitter-access-secret',
  TWITTER_ACCESS_SECRET: 'twitter-access-secret',
  YT_CLIENT_ID: 'youtube-client-id',
  YT_CLIENT_SECRET: 'youtube-client-secret',
  YT_REFRESH_TOKEN: 'youtube-refresh-token',
  HEYGEN_API_KEY: 'heygen-api-key'
};

let cachedResult = null;

function isGcloudAvailable() {
  try {
    execSync('gcloud --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function detectProjectId() {
  const fromEnv = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT;
  if (fromEnv) {
    return fromEnv.trim();
  }

  try {
    const value = execSync('gcloud config get-value project', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
    return value || null;
  } catch {
    return null;
  }
}

function fetchSecret(secretName, projectId) {
  try {
    const command = `gcloud secrets versions access latest --secret="${secretName}" --project="${projectId}"`;
    return execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch (error) {
    return { error };
  }
}

function missingKeys() {
  return Object.keys(SECRET_MAP).filter(key => !process.env[key]);
}

export async function ensureSocialSecretsLoaded(options = {}) {
  if (cachedResult) {
    return cachedResult;
  }

  const { silent = false } = options;
  const missing = missingKeys();

  if (missing.length === 0) {
    cachedResult = {
      projectId: process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT || null,
      loaded: [],
      missing: [],
      attempted: false
    };
    return cachedResult;
  }

  if (!isGcloudAvailable()) {
    if (!silent) {
      console.warn('[Secret Loader] gcloud CLI not available. Set credentials in the environment or install the SDK.');
    }
    cachedResult = {
      projectId: null,
      loaded: [],
      missing,
      attempted: false,
      error: 'gcloud-not-found'
    };
    return cachedResult;
  }

  const projectId = options.projectId || detectProjectId();

  if (!projectId) {
    if (!silent) {
      console.warn('[Secret Loader] No Google Cloud project configured. Set GOOGLE_CLOUD_PROJECT or run "gcloud config set project".');
    }
    cachedResult = {
      projectId: null,
      loaded: [],
      missing,
      attempted: false,
      error: 'project-not-configured'
    };
    return cachedResult;
  }

  const loaded = [];
  const stillMissing = new Set(missing);
  const failures = {};

  for (const key of missing) {
    const secretName = SECRET_MAP[key];
    const result = fetchSecret(secretName, projectId);

    if (result && typeof result === 'string') {
      process.env[key] = result;
      loaded.push(key);
      stillMissing.delete(key);
    } else if (result?.error) {
      failures[key] = result.error;
    }
  }

  cachedResult = {
    projectId,
    loaded,
    missing: Array.from(stillMissing),
    attempted: true,
    failures
  };

  if (!silent) {
    if (loaded.length > 0) {
      console.log(`[Secret Loader] Loaded ${loaded.length} secret${loaded.length === 1 ? '' : 's'} from Google Secret Manager (${projectId}).`);
    }
    if (cachedResult.missing.length > 0) {
      console.warn(`[Secret Loader] Missing secrets: ${cachedResult.missing.join(', ')}`);
    }
  }

  return cachedResult;
}

export function getSocialSecretStatus() {
  return {
    required: Object.keys(SECRET_MAP),
    present: Object.keys(SECRET_MAP).filter(key => Boolean(process.env[key])),
    missing: missingKeys(),
    projectId: process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT || null
  };
}
