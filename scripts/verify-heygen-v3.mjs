#!/usr/bin/env node
// Authenticate and exercise the actual shared v3 HeyGen client, without social publishing.
import { HeyGenVideoGenerator } from './heygen-video-generator.mjs';

const key = process.env.HEYGEN_API_KEY;
if (!key) throw new Error('Missing HEYGEN_API_KEY GitHub Actions secret');
const client = new HeyGenVideoGenerator(key);
const response = await client.fetchWithRetry('https://api.heygen.com/v3/users/me', {
  headers: { 'X-Api-Key': key },
}, { label: 'v3-authentication' });
if (!response.ok) throw new Error('HeyGen v3 authentication returned HTTP ' + response.status);
console.log('PASS: HeyGen v3 authentication');

const avatarId = await client.resolveAvatarId(process.env.HEYGEN_AVATAR_ID || undefined);
const voiceId = await client.resolveVoiceId(process.env.HEYGEN_VOICE_ID || undefined);
if (!avatarId || !voiceId) throw new Error('Could not resolve avatar look and voice IDs');
console.log('PASS: shared-client avatar look and voice resolution');

const created = await client.createVideo({
  script: "Hello from Nature's Way Soil. This is an unpublished verification of the upgraded HeyGen video system.",
  title: 'Nature Way Soil v3 staging verification',
  avatarId,
  voiceId,
  background: '#0d3b2a',
  productImage: process.env.HEYGEN_TEST_PRODUCT_IMAGE_URL || null,
  product: { name: "Nature's Way Soil", category: 'organic garden soil products' },
});
if (!created.videoId) throw new Error('Shared client did not return a video ID');
console.log('PASS: v3 shared-client creation, ID: ' + created.videoId);

const completed = await client.waitForCompletion(created.videoId, 20 * 60 * 1000);
const videoUrl = completed.videoUrl;
if (!videoUrl) throw new Error('Completed render has no video URL');
const url = new URL(videoUrl);
if (url.protocol !== 'https:') throw new Error('Unexpected video URL protocol');
const downloaded = await fetch(url, { signal: AbortSignal.timeout(120000) });
if (!downloaded.ok) throw new Error('Video download returned HTTP ' + downloaded.status);
const buffer = Buffer.from(await downloaded.arrayBuffer());
if (buffer.length < 10000 || buffer.toString('ascii', 4, 8) !== 'ftyp') {
  throw new Error('Video response is not a valid-size MP4');
}
console.log('PASS: shared-client v3 render and MP4 download (' + buffer.length + ' bytes)');
console.log('RELEASE_GATE=PASS');
