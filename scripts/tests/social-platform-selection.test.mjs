import assert from 'node:assert/strict';
import test from 'node:test';

import { SocialMediaAutoPoster, configuredPlatforms, fitTweetText, requestedPlatforms, shouldFailSocialRun } from '../social-media-auto-post.mjs';

test('returns no platforms when credentials are absent', () => {
  assert.deepEqual(configuredPlatforms({}), []);
});

test('returns only fully configured platforms', () => {
  assert.deepEqual(configuredPlatforms({
    TWITTER_API_KEY: 'key',
    TWITTER_API_SECRET: 'secret',
    TWITTER_ACCESS_TOKEN: 'token',
    TWITTER_ACCESS_SECRET: 'access-secret',
    INSTAGRAM_ACCESS_TOKEN: 'partial'
  }), ['twitter']);
});

test('ENABLE_PLATFORMS restricts configured platforms', () => {
  assert.deepEqual(configuredPlatforms({
    ENABLE_PLATFORMS: 'youtube,twitter',
    TWITTER_API_KEY: 'key',
    TWITTER_API_SECRET: 'secret',
    TWITTER_ACCESS_TOKEN: 'token',
    TWITTER_ACCESS_TOKEN_SECRET: 'access-secret',
    YT_CLIENT_ID: 'id',
    YT_CLIENT_SECRET: 'secret',
    YT_REFRESH_TOKEN: 'refresh',
    PINTEREST_ACCESS_TOKEN: 'pin',
    PINTEREST_BOARD_ID: 'board'
  }), ['twitter', 'youtube']);
});

test('TikTok-only selection does not enable other configured platforms', () => {
  const env = { ENABLE_PLATFORMS: 'tiktok', PINTEREST_ACCESS_TOKEN: 'test-pin', PINTEREST_BOARD_ID: 'test-board' };
  assert.deepEqual(requestedPlatforms(env), ['tiktok']);
  assert.deepEqual(configuredPlatforms(env), []);
});

test('unknown platform selection does not fall back to posting everywhere', () => {
  const env = { ENABLE_PLATFORMS: 'unknown', PINTEREST_ACCESS_TOKEN: 'test-pin', PINTEREST_BOARD_ID: 'test-board' };
  assert.deepEqual(requestedPlatforms(env), ['unknown']);
  assert.deepEqual(configuredPlatforms(env), []);
});

function mockPoster() {
  return Object.assign(Object.create(SocialMediaAutoPoster.prototype), {
    postedContent: { pinterest: {}, twitter: {} },
    log() {},
    savePostedContent() {},
    generateSocialContent() { return { title: 'test', text: 'test' }; },
    getImageUrl() { return 'https://example.com/test.jpg'; },
    hasLocalVideo() { return false; },
  });
}

function setEnv(t, values) {
  const previous = Object.fromEntries(Object.keys(values).map(key => [key, process.env[key]]));
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
  t.after(() => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  });
}

test('Pinterest retries an unauthorized pin once using the refreshed access token', async (t) => {
  setEnv(t, {
    PINTEREST_ACCESS_TOKEN: 'test-expired', PINTEREST_BOARD_ID: 'test-board',
    PINTEREST_CLIENT_ID: 'test-client', PINTEREST_CLIENT_SECRET: 'test-secret', PINTEREST_REFRESH_TOKEN: 'test-refresh',
    PINTEREST_API_BASE_URL: undefined, PINTEREST_TEST_MODE: undefined,
    SECRET_PROJECT_ID: undefined, GOOGLE_CLOUD_PROJECT: undefined, GCLOUD_PROJECT: undefined, GCP_PROJECT: undefined, PROJECT_ID: undefined,
  });
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push({ url, authorization: options.headers.Authorization });
    if (url.endsWith('/oauth/token')) return { ok: true, json: async () => ({ access_token: 'test-renewed' }) };
    if (calls.length === 1) return { ok: false, status: 401 };
    return { ok: true, json: async () => ({ id: 'test-pin' }) };
  });
  const poster = mockPoster();
  assert.equal((await poster.postToPinterest({ id: 'test-product', name: 'test' })).pinId, 'test-pin');
  assert.equal(calls.length, 3);
  assert.equal(calls[0].authorization, ['Bearer', 'test-expired'].join(' '));
  assert.equal(calls[2].authorization, ['Bearer', 'test-renewed'].join(' '));
  await poster.postToPinterest({ id: 'test-product', name: 'test' });
  assert.equal(calls.length, 3);

  calls.length = 0;
  t.mock.method(globalThis, 'fetch', async (url) => {
    calls.push(url);
    return url.endsWith('/oauth/token')
      ? { ok: true, json: async () => ({ access_token: 'test-renewed' }) }
      : { ok: false, status: 401, text: async () => 'Authentication failed' };
  });
  await assert.rejects(mockPoster().postToPinterest({ id: 'test-product' }), /Pinterest API error.*401/);
  assert.equal(calls.length, 3);
});

test('Pinterest does not refresh on non-authentication failures', async (t) => {
  setEnv(t, { PINTEREST_ACCESS_TOKEN: 'test-access', PINTEREST_BOARD_ID: 'test-board' });
  const fetch = t.mock.method(globalThis, 'fetch', async () => ({ ok: false, status: 429, text: async () => 'Rate limited' }));
  await assert.rejects(mockPoster().postToPinterest({ id: 'test-product' }), /429/);
  assert.equal(fetch.mock.callCount(), 1);
});

test('Twitter payment errors remain failures with actionable billing guidance', async (t) => {
  setEnv(t, {
    TWITTER_CLIENT_ID: undefined, TWITTER_CLIENT_SECRET: undefined, TWITTER_REFRESH_TOKEN: undefined,
    TWITTER_API_KEY: 'test-key', TWITTER_API_SECRET: 'test-secret',
    TWITTER_ACCESS_TOKEN: 'test-access', TWITTER_ACCESS_TOKEN_SECRET: 'test-secret',
  });
  t.mock.method(globalThis, 'fetch', async () => ({ ok: false, status: 402, text: async () => 'Payment required' }));
  const poster = mockPoster();
  poster.buildOAuth1Header = async () => 'test-authorization';
  await assert.rejects(poster.postToTwitter({ id: 'test-product' }), /HTTP 402.*credits and billing.*ENABLE_PLATFORMS/);
  assert.deepEqual(poster.postedContent.twitter, {});
});

test('long tweets retain their video URL within the 280 character limit', () => {
  const url = 'https://www.natureswaysoil.com/videos/NWS_014.mp4';
  const text = fitTweetText('x'.repeat(538), `Watch: ${url}`);
  assert.ok(text.length <= 280);
  assert.ok(text.endsWith(url));
});

test('partial platform success does not fail the product run', () => {
  assert.equal(shouldFailSocialRun(0), true);
  assert.equal(shouldFailSocialRun(1), false);
  assert.equal(shouldFailSocialRun(3), false);
});
