#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT = path.resolve(__dirname, '..');
const DATA_FILE = path.join(PROJECT, 'data', 'products.ts');
const VIDEOS_DIR = path.join(PROJECT, 'public', 'videos');

function parseProductIds() {
  const ts = fs.readFileSync(DATA_FILE, 'utf8');
  const ids = Array.from(ts.matchAll(/id:\s*'([^']+)'/g)).map(m => m[1]);
  return ids.filter((id, i, arr) => arr.indexOf(id) === i);
}

function getProductVideoMap() {
  const ts = fs.readFileSync(DATA_FILE, 'utf8');
  const result = {};
  const productBlocks = ts.split(/\n\s*},\s*\n\s*{\s*id:/).map((block, idx) => (idx === 0 ? block : '{ id:' + block));
  for (const block of productBlocks) {
    const idMatch = block.match(/id:\s*'([^']+)'/);
    if (!idMatch) continue;
    const id = idMatch[1];
    const videoMatch = block.match(/video:\s*'([^']+)'/);
    result[id] = videoMatch ? videoMatch[1] : undefined;
  }
  return result;
}

function main() {
  const ids = parseProductIds();
  const videoMap = getProductVideoMap();

  let ok = true;
  const missingFiles = [];
  const missingWebm = [];
  const badDataPointers = [];

  ids.forEach(id => {
    const file = path.join(VIDEOS_DIR, `${id}.mp4`);
    const exists = fs.existsSync(file);
    if (!exists) {
      ok = false;
      missingFiles.push({ id, file });
    }
    const webm = path.join(VIDEOS_DIR, `${id}.webm`);
    const hasWebm = fs.existsSync(webm);
    if (!hasWebm) {
      missingWebm.push({ id, webm });
    }
    const videoPath = videoMap[id];
    if (videoPath !== `/videos/${id}.mp4`) {
      badDataPointers.push({ id, videoPath, expected: `/videos/${id}.mp4` });
    }
  });

  console.log(`Checked ${ids.length} products.`);
  if (missingFiles.length) {
    console.log(`\nMissing local video files (${missingFiles.length}):`);
    missingFiles.forEach(m => console.log(`- ${m.id}: ${m.file}`));
  } else {
    console.log('\nAll local video files are present.');
  }

  if (badDataPointers.length) {
    console.log(`\nProducts not pointing to local /videos/{id}.mp4 (${badDataPointers.length}):`);
    badDataPointers.forEach(b => console.log(`- ${b.id}: data has ${b.videoPath || 'undefined'} -> expected ${b.expected}`));
  } else {
    console.log('\nAll product.video entries point to local files.');
  }

  if (missingWebm.length) {
    console.log(`\nNote: Missing WebM variants (${missingWebm.length}). MP4s will still play, but WebM provides broader coverage:`);
    missingWebm.forEach(m => console.log(`- ${m.id}: ${m.webm}`));
  } else {
    console.log('\nAll WebM variants are present.');
  }

  process.exit(ok ? 0 : 1);
}

main();
