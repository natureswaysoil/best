import test from 'node:test';
import assert from 'node:assert/strict';
import childProcess from 'node:child_process';
import { syncBuiltinESMExports } from 'node:module';
import { refreshPinterestAccessToken } from '../pinterest-oauth2.mjs';

const credentials = () => ({
  PINTEREST_CLIENT_ID: 'test-client',
  PINTEREST_CLIENT_SECRET: 'test-secret',
  PINTEREST_REFRESH_TOKEN: 'test-refresh',
});

test('Pinterest refresh updates credentials and persists rotation through stdin', async (t) => {
  const env = { ...credentials(), GOOGLE_CLOUD_PROJECT: 'test-project' };
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, 'https://api.pinterest.com/v5/oauth/token');
    assert.equal(options.method, 'POST');
    assert.equal(options.body.get('grant_type'), 'refresh_token');
    assert.equal(options.body.get('refresh_token'), 'test-refresh');
    assert.equal(options.headers.Authorization, `Basic ${Buffer.from('test-client:test-secret').toString('base64')}`);
    return { ok: true, json: async () => ({ access_token: 'test-access', refresh_token: 'test-rotated' }) };
  });
  const writes = [];
  const spawn = t.mock.method(childProcess, 'spawnSync', (command, args, options) => {
    assert.equal(command, 'gcloud');
    assert.equal(args.includes('test-access') || args.includes('test-rotated'), false);
    writes.push({ args, input: options.input });
    return { status: 0, stdout: '', stderr: '' };
  });
  syncBuiltinESMExports();
  try {
    assert.equal(await refreshPinterestAccessToken(env), 'test-access');
    assert.equal(env.PINTEREST_REFRESH_TOKEN, 'test-rotated');
    assert.equal(env.PINTEREST_ACCESS_TOKEN, 'test-access');
    assert.deepEqual(writes, [
      { args: ['secrets', 'versions', 'add', 'PINTEREST_REFRESH_TOKEN', '--project', 'test-project', '--data-file=-'], input: 'test-rotated' },
      { args: ['secrets', 'versions', 'add', 'PINTEREST_ACCESS_TOKEN', '--project', 'test-project', '--data-file=-'], input: 'test-access' },
    ]);
  } finally {
    spawn.mock.restore();
    syncBuiltinESMExports();
  }
});

test('Pinterest refresh falls back to backup tokens and preserves unrotated tokens', async (t) => {
  const env = { ...credentials(), PINTEREST_BACKUP_REFRESH_TOKEN: 'test-backup' };
  const attempts = [];
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    attempts.push(options.body.get('refresh_token'));
    return attempts.length === 1
      ? { ok: false, status: 400 }
      : { ok: true, json: async () => ({ access_token: 'test-access' }) };
  });
  await refreshPinterestAccessToken(env);
  assert.deepEqual(attempts, ['test-refresh', 'test-backup']);
  assert.equal(env.PINTEREST_BACKUP_REFRESH_TOKEN, 'test-backup');
  assert.equal(env.PINTEREST_ACCESS_TOKEN, 'test-access');
});

test('Pinterest refresh failures remain failures without exposing response bodies', async (t) => {
  const fetch = t.mock.method(globalThis, 'fetch', async () => ({ ok: false, status: 401 }));
  await assert.rejects(refreshPinterestAccessToken({}), /configure PINTEREST_CLIENT_ID/);
  assert.equal(fetch.mock.callCount(), 0);
  await assert.rejects(refreshPinterestAccessToken(credentials()), /reauthorize/);
  fetch.mock.mockImplementation(async () => ({ ok: false, status: 503 }));
  await assert.rejects(refreshPinterestAccessToken(credentials()), /HTTP 503/);
  fetch.mock.mockImplementation(async () => ({ ok: true, json: async () => ({}) }));
  await assert.rejects(refreshPinterestAccessToken(credentials()), /no access token/);
});

test('Pinterest refresh fails if rotated tokens cannot be persisted', async (t) => {
  const env = { ...credentials(), GOOGLE_CLOUD_PROJECT: 'test-project' };
  t.mock.method(globalThis, 'fetch', async () => ({
    ok: true, json: async () => ({ access_token: 'test-access', refresh_token: 'test-rotated' }),
  }));
  const spawn = t.mock.method(childProcess, 'spawnSync', () => ({ status: 1, stderr: 'Permission denied' }));
  syncBuiltinESMExports();
  try {
    await assert.rejects(refreshPinterestAccessToken(env), /secret version write permissions/);
    assert.equal(env.PINTEREST_REFRESH_TOKEN, 'test-refresh');
    assert.equal(env.PINTEREST_ACCESS_TOKEN, undefined);
  } finally {
    spawn.mock.restore();
    syncBuiltinESMExports();
  }
});
