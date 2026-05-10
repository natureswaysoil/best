#!/usr/bin/env node
/**
 * Marketing-mode entrypoint for legacy product video generation.
 *
 * This runs the fixed runner through a temporary copy and swaps the HeyGen
 * generator import to the marketing generator.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fixedRunner = path.join(__dirname, 'generate-product-videos-fixed.mjs');
const runtimeRunner = path.join(__dirname, '.generate-product-videos-marketing.runtime.mjs');

let source = fs.readFileSync(fixedRunner, 'utf8');

source = source.replace(
  /import HeyGenVideoGenerator from ['"]\.\/heygen-video-generator\.mjs['"];/,
  "import HeyGenVideoGenerator from './heygen-marketing-generator.mjs';"
);

if (!source.includes("loadSecretBackedEnv('OPENAI_API_KEY')")) {
  source = source.replace(
    /await loadSecretBackedEnv\(['"]PEXELS_API_KEY['"]\);\s*/,
    "await loadSecretBackedEnv('PEXELS_API_KEY');\nawait loadSecretBackedEnv('OPENAI_API_KEY');\n"
  );
}

fs.writeFileSync(runtimeRunner, source, 'utf8');

const result = spawnSync(process.execPath, [runtimeRunner, ...process.argv.slice(2)], {
  cwd: path.resolve(__dirname, '..'),
  stdio: 'inherit',
  env: {
    ...process.env,
    NWS_MARKETING_MODE: '1',
  },
});

try {
  if (fs.existsSync(runtimeRunner)) fs.unlinkSync(runtimeRunner);
} catch {}

process.exit(result.status ?? 1);
