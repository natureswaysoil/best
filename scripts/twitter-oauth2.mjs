import { spawnSync } from 'child_process';
import { TwitterApi } from 'twitter-api-v2';

const GCLOUD = process.platform === 'win32' ? 'gcloud.cmd' : 'gcloud';

function secretProjectId(env = process.env) {
  return env.SECRET_PROJECT_ID ||
    env.GOOGLE_CLOUD_PROJECT ||
    env.GCLOUD_PROJECT ||
    env.GCP_PROJECT ||
    env.PROJECT_ID ||
    'natureswaysoil-video';
}

export function hasTwitterOAuth2User(env = process.env) {
  return Boolean(
    env.TWITTER_CLIENT_ID?.trim() &&
    env.TWITTER_CLIENT_SECRET?.trim() &&
    env.TWITTER_REFRESH_TOKEN?.trim()
  );
}

export function loadTwitterOAuth2Secrets(env = process.env) {
  const names = ['TWITTER_CLIENT_ID', 'TWITTER_CLIENT_SECRET', 'TWITTER_REFRESH_TOKEN'];
  const project = secretProjectId(env);

  for (const name of names) {
    if (env[name]?.trim()) continue;
    const result = spawnSync(GCLOUD, [
      'secrets', 'versions', 'access', 'latest',
      '--secret', name,
      '--project', project
    ], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 45000, shell: process.platform === 'win32' });
    if (result.status === 0 && result.stdout.trim()) env[name] = result.stdout.trim();
  }
}

function persistRotatedRefreshToken(token, env = process.env) {
  const result = spawnSync(GCLOUD, [
    'secrets', 'versions', 'add', 'TWITTER_REFRESH_TOKEN',
    '--project', secretProjectId(env),
    '--data-file=-'
  ], {
    input: token,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    timeout: 45000,
    shell: process.platform === 'win32'
  });

  if (result.status !== 0) {
    throw new Error(`Could not persist rotated Twitter refresh token: ${result.stderr.trim() || 'gcloud failed'}`);
  }
}

export async function createTwitterOAuth2UserClient({ hydrate = false } = {}) {
  if (hydrate) loadTwitterOAuth2Secrets(process.env);
  if (!hasTwitterOAuth2User(process.env)) {
    throw new Error('Twitter OAuth 2.0 credentials missing: need TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET, TWITTER_REFRESH_TOKEN');
  }

  const previousRefreshToken = process.env.TWITTER_REFRESH_TOKEN.trim();
  const oauthClient = new TwitterApi({
    clientId: process.env.TWITTER_CLIENT_ID.trim(),
    clientSecret: process.env.TWITTER_CLIENT_SECRET.trim()
  });
  const refreshed = await oauthClient.refreshOAuth2Token(previousRefreshToken);

  if (refreshed.refreshToken && refreshed.refreshToken !== previousRefreshToken) {
    persistRotatedRefreshToken(refreshed.refreshToken, process.env);
    process.env.TWITTER_REFRESH_TOKEN = refreshed.refreshToken;
  }

  return {
    client: refreshed.client.readWrite,
    scopes: refreshed.scope || [],
    rotated: Boolean(refreshed.refreshToken && refreshed.refreshToken !== previousRefreshToken)
  };
}
