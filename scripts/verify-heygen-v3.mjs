#!/usr/bin/env node
// One-video HeyGen v3 release gate; no social publishing.
const key = process.env.HEYGEN_API_KEY;
if (!key) throw new Error('Missing GitHub Actions secret HEYGEN_API_KEY');
const base = 'https://api.heygen.com';
const headers = { 'X-Api-Key': key, 'Content-Type': 'application/json' };
async function req(method, route, body) {
  const response = await fetch(base + route, {
    method, headers, ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(45000)
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(route + ' returned HTTP ' + response.status + ': ' + (json.error?.message || json.message || 'unspecified'));
  return json.data || json;
}
const first = x => Array.isArray(x) ? x : x?.items || x?.looks || x?.voices || x?.data || [];
const user = await req('GET', '/v3/users/me');
console.log('PASS: authenticated v3 user');
const looks = await req('GET', '/v3/avatars/looks');
const voices = await req('GET', '/v3/voices');
const lookList = first(looks);
const voiceList = first(voices);
const preferredAvatar = process.env.HEYGEN_AVATAR_ID;
const preferredVoice = process.env.HEYGEN_VOICE_ID;
const avatarId = preferredAvatar || lookList[0]?.avatar_id || lookList[0]?.look_id || lookList[0]?.id;
const voiceId = preferredVoice || voiceList[0]?.voice_id || voiceList[0]?.id;
if (!avatarId || !voiceId) throw new Error('No avatar look or voice available. Set HEYGEN_AVATAR_ID and HEYGEN_VOICE_ID as Actions variables.');
console.log('PASS: v3 avatar-look and voice discovery');
const payload = {
  type: 'avatar', avatar_id: avatarId, voice_id: voiceId,
  title: 'Nature Way Soil v3 staging verification',
  script: 'Hello from Nature\'s Way Soil. This is a short test of our upgraded HeyGen video system.',
  voice_settings: { speed: 1 },
  aspect_ratio: '16:9', resolution: '720p',
  background: { value: '#0d3b2a' },
  output_format: 'mp4'
};
const created = await req('POST', '/v3/videos', payload);
const id = created.video_id || created.id;
if (!id) throw new Error('Create returned no video ID');
console.log('PASS: v3 create accepted, video ID: ' + id);
const until = Date.now() + 20*60*1000;
let url;
while (Date.now() < until) {
  await new Promise(r => setTimeout(r, 15000));
  const d = await req('GET', '/v3/videos/' + encodeURIComponent(id));
  const status = String(d.status || '').toLowerCase();
  if (['failed','error','cancelled'].includes(status)) throw new Error('Render failed: ' + (d.error?.message || d.error_message || status));
  if (['completed','success'].includes(status)) { url = d.video_url || d.url; break; }
}
if (!url) throw new Error('Render did not finish with a downloadable URL within 20 minutes');
const u = new URL(url);
if (u.protocol !== 'https:') throw new Error('Unsafe download URL');
const res = await fetch(url, {signal: AbortSignal.timeout(120000)});
if (!res.ok) throw new Error('MP4 download failed HTTP ' + res.status);
const buf = Buffer.from(await res.arrayBuffer());
if (buf.length < 10000 || buf.toString('ascii',4,8)!=='ftyp') throw new Error('Download is not a valid-size MP4');
console.log('PASS: v3 render and MP4 download (' + buf.length + ' bytes).');
console.log('RELEASE_GATE=PASS');
