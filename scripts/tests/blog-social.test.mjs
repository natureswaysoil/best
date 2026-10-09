import test from 'node:test';
import assert from 'node:assert/strict';
import { collectScriptText, findClaimViolations } from '../blog-social/claims.mjs';
import { blogUrl, pickProductForPost, videoIdForPost } from '../blog-social/lib.mjs';
import { validateScriptShape, withLinks } from '../blog-social/script-writer.mjs';

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
