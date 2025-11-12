#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { runSuite } from './tests/helpers/suite.mjs';
import { PATHS, loadProducts, requireEnvVars } from './tests/helpers/data.mjs';

const PLATFORM_ENV_VARS = {
  instagram: ['INSTAGRAM_ACCESS_TOKEN', 'INSTAGRAM_IG_ID'],
  twitter: ['TWITTER_BEARER_TOKEN'],
  pinterest: ['PINTEREST_ACCESS_TOKEN', 'PINTEREST_BOARD_ID'],
  youtube: ['YT_CLIENT_ID', 'YT_CLIENT_SECRET', 'YT_REFRESH_TOKEN'],
};

function inspectAutomationScript() {
  const scriptPath = path.join(PATHS.root, 'server-social-automation.mjs');
  if (!fs.existsSync(scriptPath)) {
    return { ok: false, details: 'server-social-automation.mjs missing' };
  }
  const contents = fs.readFileSync(scriptPath, 'utf8');
  const endpoints = ['api/health', 'api/status', 'api/post/manual', 'api/post/scheduled'];
  const missing = endpoints.filter(endpoint => !contents.includes(endpoint));
  if (missing.length) {
    return { ok: false, details: `Endpoints missing: ${missing.join(', ')}` };
  }
  return { ok: true, details: 'Automation service exposes core endpoints' };
}

export async function runPlatformSuite(options = {}) {
  const { allowMissingEnv = false } = options;
  const products = loadProducts();

  const checks = [
    {
      name: 'Automation server endpoints present',
      task: () => inspectAutomationScript(),
    },
    {
      name: 'Video metadata ready for social posts',
      task: () => {
        const missingPosters = products.filter(p => !p.videoPoster);
        if (missingPosters.length) {
          return { ok: false, details: `Products missing poster art: ${missingPosters.map(p => p.id).join(', ')}` };
        }
        const missingVideos = products.filter(p => !p.video);
        if (missingVideos.length) {
          return { ok: false, details: `Products missing MP4 reference: ${missingVideos.map(p => p.id).join(', ')}` };
        }
        return { ok: true, details: `${products.length} products ready for distribution` };
      },
    },
    {
      name: 'Environment variable readiness',
      task: () => {
        const issues = [];
        for (const [platform, vars] of Object.entries(PLATFORM_ENV_VARS)) {
          const { missing, empty } = requireEnvVars(vars);
          if (missing.length || empty.length) {
            const parts = [];
            if (missing.length) parts.push(`missing ${missing.join(', ')}`);
            if (empty.length) parts.push(`empty ${empty.join(', ')}`);
            issues.push(`${platform}: ${parts.join(' & ')}`);
          }
        }
        if (issues.length) {
          if (allowMissingEnv) {
            return { ok: true, skip: true, details: issues.join(' | ') };
          }
          return { ok: false, details: issues.join(' | ') };
        }
        return { ok: true, details: 'All platform credentials detected in environment' };
      },
    },
    {
      name: 'Manual posting script present',
      task: () => {
        const manualScript = path.join(PATHS.root, 'scripts', 'manual-social-post.mjs');
        const exists = fs.existsSync(manualScript);
        return { ok: exists, details: exists ? 'manual-social-post.mjs ready for manual fallback' : 'Missing manual social post script' };
      },
    },
  ];

  const result = await runSuite('Social Platform Posting Validation', checks, options);
  return result;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runPlatformSuite().then(result => {
    if (!result.ok) {
      process.exitCode = 1;
    }
  });
}
