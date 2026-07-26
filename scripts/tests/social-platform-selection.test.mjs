import assert from 'node:assert/strict';
import test from 'node:test';

import { configuredPlatforms } from '../social-media-auto-post.mjs';

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
