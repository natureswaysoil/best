import assert from 'node:assert/strict';
import test from 'node:test';

import { postAutoProductWithFallback } from '../social-media-top5-post.mjs';

test('auto mode retries another product when one candidate fails', () => {
  const attempts = [];
  const products = [{ id: 'NWS_001' }, { id: 'NWS_002' }];
  const state = {};
  const variationsConfig = {};
  const performance = {};

  const posted = postAutoProductWithFallback(products, state, variationsConfig, performance, {
    pick: (candidates) => candidates[0],
    post: (product) => {
      attempts.push(product.id);
      if (product.id === 'NWS_001') throw new Error('Video failed publish QA');
    },
    log: () => {},
    warn: () => {},
  });

  assert.equal(posted.id, 'NWS_002');
  assert.deepEqual(attempts, ['NWS_001', 'NWS_002']);
});

test('auto mode surfaces failure after all candidates fail', () => {
  const products = [{ id: 'NWS_001' }, { id: 'NWS_002' }];
  const result = () =>
    postAutoProductWithFallback(products, {}, {}, {}, {
      pick: (candidates) => candidates[0],
      post: () => {
        throw new Error('Video failed publish QA');
      },
      log: () => {},
      warn: () => {},
    });

  assert.throws(result, /Auto posting failed for all eligible products\./);
  assert.throws(result, /NWS_001: Video failed publish QA/);
  assert.throws(result, /NWS_002: Video failed publish QA/);
});
