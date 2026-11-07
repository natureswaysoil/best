import { capture, secretProjectId } from './blog-social/lib.mjs';

export const PINTEREST_REFRESH_SECRET_NAMES = [
  'PINTEREST_CLIENT_ID', 'PINTEREST_CLIENT_SECRET', 'PINTEREST_REFRESH_TOKEN',
  'PINTEREST_BACKUP_REFRESH_TOKEN', 'PINTEREST_TERTIARY_REFRESH_TOKEN',
];

export async function refreshPinterestAccessToken(env = process.env) {
  const refreshNames = PINTEREST_REFRESH_SECRET_NAMES.slice(2).filter(name => env[name]?.trim());
  if (!env.PINTEREST_CLIENT_ID?.trim() || !env.PINTEREST_CLIENT_SECRET?.trim() || !refreshNames.length) {
    throw new Error('Pinterest authentication expired: configure PINTEREST_CLIENT_ID, PINTEREST_CLIENT_SECRET and PINTEREST_REFRESH_TOKEN, or reauthorize the app.');
  }

  for (const name of refreshNames) {
    const previousToken = env[name].trim();
    const response = await fetch('https://api.pinterest.com/v5/oauth/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${env.PINTEREST_CLIENT_ID.trim()}:${env.PINTEREST_CLIENT_SECRET.trim()}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: previousToken }),
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) {
      if (response.status === 400 || response.status === 401) continue;
      throw new Error(`Pinterest token refresh failed: HTTP ${response.status}`);
    }

    const tokens = await response.json();
    if (!tokens.access_token?.trim()) throw new Error('Pinterest token refresh returned no access token');
    const updates = { PINTEREST_ACCESS_TOKEN: tokens.access_token };
    if (tokens.refresh_token && tokens.refresh_token !== previousToken) updates[name] = tokens.refresh_token;

    const project = secretProjectId(env);
    if (project) {
      // Persist a rotated refresh token first so the next runner can recover.
      for (const key of [name, 'PINTEREST_ACCESS_TOKEN'].filter(key => updates[key])) {
        const result = capture('gcloud', [
          'secrets', 'versions', 'add', key, '--project', project, '--data-file=-',
        ], { input: updates[key] });
        if (!result.ok) throw new Error(`Could not persist ${key} in Secret Manager; check secret version write permissions.`);
      }
    }
    Object.assign(env, updates);
    return tokens.access_token;
  }
  throw new Error('Pinterest refresh tokens were rejected; reauthorize the app and update Pinterest secrets.');
}
