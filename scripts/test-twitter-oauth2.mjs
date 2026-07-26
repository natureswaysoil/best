#!/usr/bin/env node

import { createTwitterOAuth2UserClient } from './twitter-oauth2.mjs';

try {
  const result = await createTwitterOAuth2UserClient({ hydrate: true });
  const requiredScopes = ['tweet.read', 'tweet.write', 'users.read', 'media.write', 'offline.access'];
  const missing = requiredScopes.filter((scope) => !result.scopes.includes(scope));
  if (missing.length) throw new Error(`Twitter authorization is missing scopes: ${missing.join(', ')}`);
  console.log(`[Twitter OAuth2] PASS scopes=${requiredScopes.join(',')} rotated_refresh_token=${result.rotated}`);
} catch (error) {
  console.error(`[Twitter OAuth2] FAIL ${error.message}`);
  process.exit(1);
}
