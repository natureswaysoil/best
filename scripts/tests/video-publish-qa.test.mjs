import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { assessSampledFrames, assessVideoProbe, validateVideoForPublishing } from '../lib/video-publish-qa.mjs';
import { buildForcedSocialContent } from '../social-caption-overrides.mjs';

test('rejects the low-resolution fallback video that reached YouTube', () => {
  const result = assessVideoProbe({
    fileSize: 280_000,
    format: { duration: '30.14' },
    streams: [
      { codec_type: 'video', codec_name: 'h264', width: 640, height: 360 },
      { codec_type: 'audio', codec_name: 'aac' }
    ]
  });

  assert.equal(result.ok, false);
  assert.match(result.failures.join(' '), /resolution/);
  assert.match(result.failures.join(' '), /file is only/);
});

test('accepts a production vertical video with audio', () => {
  const result = assessVideoProbe({
    fileSize: 4_000_000,
    format: { duration: '29.8' },
    streams: [
      { codec_type: 'video', codec_name: 'h264', width: 1080, height: 1920 },
      { codec_type: 'audio', codec_name: 'aac' }
    ]
  });

  assert.equal(result.ok, true);
});

test('rejects sustained flat green placeholder frames', () => {
  const grid = 16;
  const frame = Buffer.alloc(grid * grid * 3);
  for (let i = 0; i < frame.length; i += 3) {
    frame[i] = 0;
    frame[i + 1] = 255;
    frame[i + 2] = 0;
  }
  const result = assessSampledFrames(Buffer.concat(Array.from({ length: 20 }, () => frame)), { grid });
  assert.equal(result.ok, false);
  assert.equal(result.greenFrames, 20);
});

test('accepts varied non-placeholder frames', () => {
  const grid = 16;
  const frames = [];
  for (let f = 0; f < 20; f++) {
    const frame = Buffer.alloc(grid * grid * 3);
    for (let i = 0; i < frame.length; i += 3) {
      frame[i] = (i + f * 7) % 256;
      frame[i + 1] = (i * 3 + f * 11) % 256;
      frame[i + 2] = (i * 5 + f * 13) % 256;
    }
    frames.push(frame);
  }
  assert.equal(assessSampledFrames(Buffer.concat(frames), { grid }).ok, true);
});

test('reports a missing ffprobe executable instead of an empty inspection error', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'video-qa-'));
  const video = path.join(dir, 'video.mp4');
  fs.writeFileSync(video, 'not-a-video');

  assert.throws(
    () => validateVideoForPublishing(video, { ffprobe: 'definitely-missing-ffprobe' }),
    /could not start.*ENOENT/i,
  );
});

test('does not prefix the website onto an absolute checkout URL', () => {
  const previous = {
    hook: process.env.SOCIAL_VARIATION_HOOK,
    caption: process.env.SOCIAL_VARIATION_CAPTION,
    checkout: process.env.PRODUCT_CHECKOUT_URL
  };
  process.env.SOCIAL_VARIATION_HOOK = 'Dog spots got you down?';
  process.env.SOCIAL_VARIATION_CAPTION = 'Repair yellow spots at the soil level.';
  process.env.PRODUCT_CHECKOUT_URL = 'https://www.amazon.com/dp/B0FG38YYJ5';
  try {
    const content = buildForcedSocialContent({
      product: { id: 'NWS_014', name: 'Dog Urine Neutralizer' },
      platform: 'youtube',
      baseUrl: 'https://www.natureswaysoil.com'
    });
    assert.match(content.description, /Quick checkout:\nhttps:\/\/www\.amazon\.com\/dp\/B0FG38YYJ5/);
    assert.doesNotMatch(content.description, /natureswaysoil\.comhttps/);
  } finally {
    if (previous.hook === undefined) delete process.env.SOCIAL_VARIATION_HOOK;
    else process.env.SOCIAL_VARIATION_HOOK = previous.hook;
    if (previous.caption === undefined) delete process.env.SOCIAL_VARIATION_CAPTION;
    else process.env.SOCIAL_VARIATION_CAPTION = previous.caption;
    if (previous.checkout === undefined) delete process.env.PRODUCT_CHECKOUT_URL;
    else process.env.PRODUCT_CHECKOUT_URL = previous.checkout;
  }
});
