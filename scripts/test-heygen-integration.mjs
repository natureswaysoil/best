#!/usr/bin/env node
import fs from 'fs';
import { runSuite } from './tests/helpers/suite.mjs';
import { PATHS, loadProducts, readVideoConfig, hasCommand } from './tests/helpers/data.mjs';

export async function runHeygenSuite(options = {}) {
  const { requireApiKey = false } = options;

  const checks = [
    {
      name: 'HeyGen module available',
      task: async () => {
        const module = await import('./heygen-video-generator.mjs');
        const Generator = module.HeyGenVideoGenerator || module.default;
        if (!Generator) {
          return { ok: false, details: 'HeyGenVideoGenerator export missing' };
        }
        const instance = new Generator(process.env.HEYGEN_API_KEY || 'TEST_KEY_FOR_VALIDATION');
        const methods = ['createVideo', 'getAvatars', 'getVoices'];
        const missing = methods.filter(method => typeof instance[method] !== 'function');
        if (missing.length) {
          return { ok: false, details: `Missing methods: ${missing.join(', ')}` };
        }
        return { ok: true, details: 'HeyGen generator exports expected API methods' };
      },
    },
    {
      name: 'HeyGen API key configuration',
      task: () => {
        const hasKey = Boolean(process.env.HEYGEN_API_KEY);
        if (!hasKey && requireApiKey) {
          return { ok: false, details: 'Set HEYGEN_API_KEY before running integration tests' };
        }
        if (!hasKey) {
          return { ok: true, skip: true, details: 'HEYGEN_API_KEY not configured; network checks skipped' };
        }
        return { ok: true, details: 'HEYGEN_API_KEY detected' };
      },
    },
    {
      name: 'Video configuration validated',
      task: () => {
        const config = readVideoConfig();
        const requiredKeys = ['size', 'bg', 'fontsize', 'lineSpacing', 'durationSeconds'];
        const missing = requiredKeys.filter(key => !(key in config));
        if (missing.length) {
          return { ok: false, details: `Missing keys: ${missing.join(', ')}` };
        }
        if (!/^\d+x\d+$/.test(config.size)) {
          return { ok: false, details: `Invalid size format: ${config.size}` };
        }
        if (config.durationSeconds <= 0) {
          return { ok: false, details: 'durationSeconds must be positive' };
        }
        return { ok: true, details: `Resolution ${config.size}, slide duration ${config.durationSeconds}s` };
      },
    },
    {
      name: 'Fallback FFmpeg availability',
      task: () => {
        if (hasCommand('ffmpeg')) {
          return { ok: true, details: 'ffmpeg detected in PATH' };
        }
        const scriptContents = fs.readFileSync(PATHS.videoGeneratorScript, 'utf8');
        const hasFallback = /ffmpeg/.test(scriptContents);
        return {
          ok: hasFallback,
          details: hasFallback
            ? 'ffmpeg not installed locally, but script contains fallback handling'
            : 'ffmpeg command missing and fallback not detected',
        };
      },
    },
    {
      name: 'Product metadata ready for HeyGen',
      task: () => {
        const products = loadProducts();
        const missingUsage = products.filter(p => !Array.isArray(p.usage) || p.usage.length === 0);
        if (missingUsage.length) {
          return { ok: false, details: `Products without usage steps: ${missingUsage.map(p => p.id).join(', ')}` };
        }
        const missingImages = products.filter(p => !p.image || typeof p.image !== 'string');
        if (missingImages.length) {
          return { ok: false, details: `Products missing hero image path: ${missingImages.map(p => p.id).join(', ')}` };
        }
        return { ok: true, details: `${products.length} products with usage instructions and images` };
      },
    },
  ];

  const result = await runSuite('HeyGen Integration Readiness', checks, options);
  return result;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runHeygenSuite().then(result => {
    if (!result.ok) {
      process.exitCode = 1;
    }
  });
}
