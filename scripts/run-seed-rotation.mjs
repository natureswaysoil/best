#!/usr/bin/env node

import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT = path.resolve(__dirname, '..');

function run(args, env = process.env) {
  const result = spawnSync('node', args, {
    cwd: PROJECT,
    stdio: 'inherit',
    env,
    timeout: Number(process.env.JOB_STEP_TIMEOUT_MS || 1800000)
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`node ${args.join(' ')} failed with exit ${result.status}`);
}

try {
  console.log('[Seed Rotation Entry] Build/upload phase...');
  run(['scripts/cloud-video-social-job.mjs'], { ...process.env, SKIP_SOCIAL_POSTING: '1' });
  console.log('[Seed Rotation Entry] Rotation post phase...');
  run(['scripts/social-seed-rotation-runner.mjs']);
  console.log('[Seed Rotation Entry] Complete.');
} catch (error) {
  console.error(`[Seed Rotation Entry] Failed: ${error.message}`);
  process.exit(1);
}
