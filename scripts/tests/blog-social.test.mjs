import test from 'node:test';
import assert from 'node:assert/strict';
import childProcess from 'node:child_process';
import { readFileSync } from 'node:fs';
import { syncBuiltinESMExports } from 'node:module';
import { collectScriptText, findClaimViolations } from '../blog-social/claims.mjs';
import { blogUrl, bucketConfig, loadState, pickProductForPost, videoIdForPost } from '../blog-social/lib.mjs';
import { validateScriptShape, withLinks } from '../blog-social/script-writer.mjs';

test('render retries use the current branch and posting uses the rendered commit', () => {
  const workflow = readFileSync(new URL('../../.github/workflows/blog-to-social.yml', import.meta.url), 'utf8');
  const [render, post] = workflow.split('\n  post:\n');
  assert.match(render, /source_sha: \$\{\{ steps\.checkout\.outputs\.commit \}\}/);
  assert.match(render, /uses: actions\/checkout@v4\s+id: checkout\s+with:\s+#[^\n]*\n\s+ref: \$\{\{ github\.ref \}\}/);
  assert.match(post, /uses: actions\/checkout@v4\s+with:\s+ref: \$\{\{ needs\.render\.outputs\.source_sha \}\}/);
  assert.doesNotMatch(workflow, /ref: \$\{\{ github\.sha \}\}/);
});

test('loadState initializes only missing state and preserves read failures and saved posts', (t) => {
  const { stateUri } = bucketConfig();
  let response;
  const spawn = t.mock.method(childProcess, 'spawnSync', (command, args) => {
    assert.equal(command, 'gcloud');
    assert.deepEqual(args, ['storage', 'cat', stateUri]);
    return response;
  });
  syncBuiltinESMExports();
  try {
    for (const stderr of [
      `ERROR: (gcloud.storage.cat) The following URLs matched no objects or files:\n${stateUri}`,
      'No URLs matched',
      '404 Not Found',
    ]) {
      response = { status: 1, stdout: '', stderr };
      assert.deepEqual(loadState(), { posts: {} });
    }
    for (const stderr of ['403 Permission denied', 'Connection timed out', '503 Service Unavailable']) {
      response = { status: 1, stdout: '', stderr };
      assert.throws(() => loadState(), /Could not read/);
    }
    response = { status: 0, stdout: '{invalid json}', stderr: '' };
    assert.throws(() => loadState(), /not valid JSON/);
    const saved = { posts: { spring: { status: 'posted', platforms: { youtube: { videoId: 'confirmed' } } } } };
    response = { status: 0, stdout: JSON.stringify(saved), stderr: '' };
    assert.deepEqual(loadState(), saved);
  } finally {
    spawn.mock.restore();
    syncBuiltinESMExports();
  }
});

test('claim check flags banned phrases', () => {
  const text = 'Instantly greener grass, guaranteed! Eliminates yellow spots. 100% safe. OMRI listed.';
  const found = findClaimViolations(text).join(' | ');
  for (const word of ['Instantly', 'guaranteed', 'Eliminates', '100%', 'OMRI']) assert.match(found, new RegExp(word, 'i'));
});

test('claim check requires "when used as directed" next to safety wording', () => {
  assert.equal(findClaimViolations('It is pet-safe and easy to use.').length, 1);
  assert.deepEqual(findClaimViolations('Pet-safe when used as directed. Results build over time.'), []);
});

test('claim check passes compliant brand copy', () => {
  assert.deepEqual(findClaimViolations('Helps the soil recover over time. Not a dye. Works at the soil level.'), []);
});

test('collectScriptText includes captions and scenes', () => {
  const text = collectScriptText({ hook: 'h', scenes: [{ text: 's1' }], endCard: 'e', captions: { tiktok: 'tt' } });
  for (const part of ['h', 's1', 'e', 'tt']) assert.ok(text.includes(part));
});

test('pickProductForPost prefers the product that matches the post, with an image', () => {
  const catalog = [
    { id: 'NWS_014', name: 'Dog Urine Neutralizer', tags: ['dog-urine', 'lawn-repair'], category: 'Lawn Care', image: '/images/products/NWS_014/main.jpg' },
    { id: 'NWS_001', name: 'Liquid Lawn Soil Conditioner', tags: ['compacted-soil', 'humic-acid'], category: 'Fertilizer', image: '/images/products/NWS_001/main.jpg' },
    { id: 'NWS_022', name: 'Compacted soil miracle', tags: ['compacted-soil'], category: 'Fertilizer', image: '/images/products/NWS_022/main.jpg' },
  ];
  const post = { title: 'Fixing compacted clay soil', excerpt: 'Humic acid and aeration', tags: ['compacted soil'], category: 'Lawn' };
  // NWS_022 scores well but has no image in the repo, so it must not be chosen.
  assert.equal(pickProductForPost(post, catalog, ['NWS_014'])?.id, 'NWS_001');
  const dogPost = { title: 'Dog urine spots on the lawn', excerpt: '', tags: [], category: 'Lawn' };
  assert.equal(pickProductForPost(dogPost, catalog, [])?.id, 'NWS_014');
});

test('blog links carry UTM tags and video ids are safe', () => {
  const post = { slug: 'Fall Lawn Care: Tips & Tricks!' };
  assert.match(blogUrl({ slug: 'fall-lawn' }, 'tiktok'), /\/blog\/fall-lawn\?utm_source=tiktok&utm_medium=social&utm_campaign=blog_video&utm_content=fall-lawn$/);
  assert.equal(videoIdForPost(post), 'BLOG-fall-lawn-care-tips-tricks');
});

test('script shape validation and links', () => {
  const script = {
    hook: 'Brown spots again?',
    scenes: [1, 2, 3, 4].map((i) => ({ text: `line ${i}`, query: 'green lawn close up' })),
    endCard: 'Read the full guide',
    captions: { instagram: 'a', facebook: 'b', tiktok: 'c', twitter: 'x'.repeat(250), youtubeTitle: 'y', youtubeDescription: 'z', pinterestTitle: 'p', pinterestDescription: 'q' },
  };
  assert.deepEqual(validateScriptShape(script), []);
  assert.ok(validateScriptShape({ ...script, scenes: script.scenes.slice(0, 3) }).length);
  const linked = withLinks(script, { slug: 'x' });
  assert.equal(linked.captions.twitter.length, 200);
  assert.match(linked.links.instagram, /utm_source=instagram/);
});

test('writeScript retries once on a claim violation, then holds the post', async () => {
  const { writeScript, ClaimViolationError } = await import('../blog-social/script-writer.mjs');
  const good = {
    hook: 'Brown spots after winter?',
    scenes: [1, 2, 3, 4].map((i) => ({ text: `Soil tip ${i}`, query: 'green lawn close up' })),
    endCard: 'Read the full guide',
    captions: { instagram: 'a', facebook: 'b', tiktok: 'c', twitter: 'd', youtubeTitle: 'e', youtubeDescription: 'f', pinterestTitle: 'g', pinterestDescription: 'h' },
  };
  const bad = { ...good, hook: 'Instant green lawn, guaranteed' };
  const realFetch = globalThis.fetch;
  const savedKey = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = 'test';
  const reply = (body) => ({ ok: true, json: async () => ({ choices: [{ message: { content: JSON.stringify(body) } }] }) });
  try {
    let calls = 0;
    globalThis.fetch = async () => reply(calls++ === 0 ? bad : good);
    const script = await writeScript({ slug: 'spring', title: 't', excerpt: 'e', content: 'c' }, null);
    assert.equal(calls, 2);
    assert.equal(script.hook, good.hook);
    assert.match(script.links.tiktok, /utm_source=tiktok/);

    globalThis.fetch = async () => reply(bad);
    await assert.rejects(writeScript({ slug: 's', title: 't', excerpt: 'e', content: 'c' }, null), ClaimViolationError);
  } finally {
    globalThis.fetch = realFetch;
    if (savedKey === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = savedKey;
  }
});


test('retry selection resumes failed/partial/rendered posts before new posts', async () => {
  const { choosePost } = await import('../blog-social/lib.mjs');
  const posts = [
    { slug: 'older', publishedAt: '2026-10-08' },
    { slug: 'newer', publishedAt: '2026-10-09' },
  ];
  for (const status of ['rendered', 'partial', 'failed']) {
    assert.equal(choosePost(posts, { posts: { older: { status } } }, '', 14, Date.parse('2026-10-10')).slug, 'older');
  }
  assert.equal(choosePost(posts, { posts: { older: { status: 'posted' } } }, '', 14, Date.parse('2026-10-10')).slug, 'newer');
});

test('posting results require IDs and reject skipped/failed responses', async () => {
  const { assertPostResult } = await import('../blog-social/lib.mjs');
  for (const bad of [undefined, {}, { skipped: true, id: 'x' }, { success: false, id: 'x' }]) {
    assert.throws(() => assertPostResult(bad, 'test'));
  }
  for (const key of ['postId', 'videoId', 'tweetId', 'pinId', 'publishId']) {
    assert.equal(assertPostResult({ [key]: 'confirmed' }, 'test')[key], 'confirmed');
  }
});

test('TikTok pending status is checked without starting another upload', async () => {
  const { checkTikTokPublish } = await import('../blog-social/tiktok.mjs');
  const savedFetch = globalThis.fetch;
  const savedAttempts = process.env.TIKTOK_POLL_ATTEMPTS;
  process.env.TIKTOK_POLL_ATTEMPTS = '1';
  try {
    const paths = [];
    globalThis.fetch = async url => {
      paths.push(url);
      return { ok: true, json: async () => ({ data: { status: 'PROCESSING_UPLOAD' } }) };
    };
    const result = await checkTikTokPublish({ publishId: 'same-upload' }, 'test-token');
    assert.equal(result.pending, true);
    assert(paths.every(url => url.endsWith('/status/fetch/')));
    globalThis.fetch = async () => ({ ok: true, json: async () => ({ data: { status: 'PUBLISH_COMPLETE' } }) });
    assert.equal((await checkTikTokPublish(result, 'test-token')).pending, false);
  } finally {
    globalThis.fetch = savedFetch;
    if (savedAttempts === undefined) delete process.env.TIKTOK_POLL_ATTEMPTS; else process.env.TIKTOK_POLL_ATTEMPTS = savedAttempts;
  }
});
