import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: { module: 'CommonJS', moduleResolution: 'node' },
});

test('Amazon connector audit is request-only without integration credentials', async (t) => {
  const names = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SECRET_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'QUICKBOOKS_ADMIN_SECRET',
    'VERCEL_ENV',
  ];
  const saved = names.map((name) => [name, process.env[name]]);
  for (const name of names) delete process.env[name];
  t.after(() => {
    for (const [name, value] of saved) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  });

  const page = require('../../pages/quickbooks-one-time-amazon-connector-audit.tsx');
  assert.equal(page.getStaticProps, undefined);
  assert.equal(typeof page.getServerSideProps, 'function');

  for (const secret of [undefined, 'test-admin-secret']) {
    if (secret === undefined) delete process.env.QUICKBOOKS_ADMIN_SECRET;
    else process.env.QUICKBOOKS_ADMIN_SECRET = secret;
    const headers = {};
    const result = await page.getServerSideProps({
      req: { headers: secret ? { 'x-quickbooks-admin-secret': 'wrong-secret' } : {} },
      query: secret ? { secret: 'wrong-secret' } : {},
      res: { setHeader: (name, value) => { headers[name] = value; } },
    });
    assert.deepEqual(result, { notFound: true });
    assert.equal(headers['Cache-Control'], 'private, no-store');
    assert.equal(headers['X-Robots-Tag'], 'noindex, nofollow');
  }
});
