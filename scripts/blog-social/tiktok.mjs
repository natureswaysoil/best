// TikTok Content Posting API (direct post, FILE_UPLOAD).
// Docs: https://developers.tiktok.com/doc/content-posting-api-reference-direct-post
//
// Credentials (env or Google Secret Manager): TIKTOK_CLIENT_KEY,
// TIKTOK_CLIENT_SECRET and TIKTOK_REFRESH_TOKEN (preferred), or a short-lived
// TIKTOK_ACCESS_TOKEN. TikTok rotates refresh tokens, so a new one is written
// back to Secret Manager after each refresh.

import fs from 'fs';
import { capture, secretProjectId } from './lib.mjs';

const API = 'https://open.tiktokapis.com';
export const TIKTOK_SECRET_NAMES = ['TIKTOK_CLIENT_KEY', 'TIKTOK_CLIENT_SECRET', 'TIKTOK_REFRESH_TOKEN', 'TIKTOK_ACCESS_TOKEN'];

export function hasTikTokCredentials(env = process.env) {
  return Boolean((env.TIKTOK_CLIENT_KEY && env.TIKTOK_CLIENT_SECRET && env.TIKTOK_REFRESH_TOKEN) || env.TIKTOK_ACCESS_TOKEN);
}

async function tiktokJson(url, accessToken, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify(body || {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || (data.error && data.error.code && data.error.code !== 'ok')) {
    throw new Error(`TikTok ${new URL(url).pathname} failed: ${data.error?.code || res.status} ${data.error?.message || ''}`.trim());
  }
  return data.data || {};
}

async function accessToken(env = process.env) {
  if (!(env.TIKTOK_CLIENT_KEY && env.TIKTOK_CLIENT_SECRET && env.TIKTOK_REFRESH_TOKEN)) return env.TIKTOK_ACCESS_TOKEN;
  const res = await fetch(`${API}/v2/oauth/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_key: env.TIKTOK_CLIENT_KEY,
      client_secret: env.TIKTOK_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: env.TIKTOK_REFRESH_TOKEN,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) throw new Error(`TikTok token refresh failed: ${data.error || res.status} ${data.error_description || ''}`.trim());

  if (data.refresh_token && data.refresh_token !== env.TIKTOK_REFRESH_TOKEN) {
    env.TIKTOK_REFRESH_TOKEN = data.refresh_token;
    const project = secretProjectId(env);
    if (project) {
      const saved = capture('gcloud', ['secrets', 'versions', 'add', 'TIKTOK_REFRESH_TOKEN', '--project', project, '--data-file=-'], { input: data.refresh_token });
      if (!saved.ok) console.log(`[TikTok] Warning: could not save the rotated refresh token: ${saved.stderr.slice(0, 200)}`);
    }
  }
  return data.access_token;
}

function choosePrivacy(options) {
  const wanted = process.env.TIKTOK_PRIVACY_LEVEL || 'PUBLIC_TO_EVERYONE';
  if (options.includes(wanted)) return wanted;
  // Apps that have not passed TikTok's audit may only post privately.
  return options[0];
}

export async function postVideoToTikTok({ videoPath, caption }) {
  const token = await accessToken();
  if (!token) throw new Error('TikTok credentials not configured');

  const creator = await tiktokJson(`${API}/v2/post/publish/creator_info/query/`, token, {});
  const privacy = choosePrivacy(creator.privacy_level_options || []);
  if (!privacy) throw new Error('TikTok returned no allowed privacy levels for this account');

  const size = fs.statSync(videoPath).size;
  if (size > 64 * 1024 * 1024) throw new Error('Video is over 64 MB; chunked TikTok upload is not implemented');
  const init = await tiktokJson(`${API}/v2/post/publish/video/init/`, token, {
    post_info: {
      title: String(caption).slice(0, 2200),
      privacy_level: privacy,
      disable_comment: Boolean(creator.comment_disabled),
      disable_duet: Boolean(creator.duet_disabled),
      disable_stitch: Boolean(creator.stitch_disabled),
    },
    source_info: { source: 'FILE_UPLOAD', video_size: size, chunk_size: size, total_chunk_count: 1 },
  });

  const upload = await fetch(init.upload_url, {
    method: 'PUT',
    headers: { 'Content-Type': 'video/mp4', 'Content-Length': String(size), 'Content-Range': `bytes 0-${size - 1}/${size}` },
    body: fs.readFileSync(videoPath),
  });
  if (!upload.ok) throw new Error(`TikTok upload failed: HTTP ${upload.status}`);

  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 10000));
    const status = await tiktokJson(`${API}/v2/post/publish/status/fetch/`, token, { publish_id: init.publish_id });
    if (status.status === 'PUBLISH_COMPLETE') return { publishId: init.publish_id, privacy };
    if (status.status === 'FAILED') throw new Error(`TikTok publish failed: ${status.fail_reason || 'unknown reason'}`);
  }
  // Still processing on TikTok's side; the upload itself succeeded.
  return { publishId: init.publish_id, privacy, pending: true };
}
