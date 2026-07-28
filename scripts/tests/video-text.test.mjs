import assert from 'node:assert/strict';
import test from 'node:test';
import { wrapVideoText } from '../lib/video-text.mjs';

test('wraps long landing-page URLs without overflowing the end card', () => {
  const wrapped = wrapVideoText(
    'Shop 32 oz or the bundle. natureswaysoil.com/dog-urine-lawn-repair',
    28,
    4
  );
  const lines = wrapped.split('\n');

  assert.ok(lines.length <= 4);
  assert.ok(lines.every((line) => line.length <= 28), wrapped);
  assert.equal(lines.join(' ').replace(/\s+/g, ''), 'Shop32ozorthebundle.natureswaysoil.com/dog-urine-lawn-repair');
});
