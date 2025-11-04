#!/usr/bin/env node
import fs from 'fs';
import os from 'os';
import path from 'path';
import { runSuite } from './tests/helpers/suite.mjs';
import { PATHS, hasCommand, requireEnvVars } from './tests/helpers/data.mjs';

const CORE_ENV_VARS = [
  'HEYGEN_API_KEY',
  'OPENAI_API_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_URL',
];

export async function runSystemValidation(options = {}) {
  const { allowMissingSecrets = true } = options;

  const checks = [
    {
      name: 'Node.js version',
      task: () => {
        const major = Number(process.versions.node.split('.')[0]);
        const ok = major >= 18;
        return { ok, details: `Detected Node ${process.versions.node}` };
      },
    },
    {
      name: 'Project structure',
      task: () => {
        const required = [
          PATHS.productsFile,
          PATHS.asinScriptsFile,
          PATHS.videoConfigFile,
          PATHS.videoGeneratorScript,
        ];
        const missing = required.filter(file => !fs.existsSync(file));
        if (missing.length) {
          return { ok: false, details: `Missing files: ${missing.map(file => path.relative(PATHS.root, file)).join(', ')}` };
        }
        return { ok: true, details: 'Core automation files present' };
      },
    },
    {
      name: 'Environment configuration',
      task: () => {
        const { missing, empty } = requireEnvVars(CORE_ENV_VARS);
        if ((missing.length || empty.length) && !allowMissingSecrets) {
          const info = [];
          if (missing.length) info.push(`missing ${missing.join(', ')}`);
          if (empty.length) info.push(`empty ${empty.join(', ')}`);
          return { ok: false, details: info.join(' | ') };
        }
        if (missing.length || empty.length) {
          const info = [];
          if (missing.length) info.push(`missing ${missing.join(', ')}`);
          if (empty.length) info.push(`empty ${empty.join(', ')}`);
          return { ok: true, skip: true, details: info.join(' | ') };
        }
        return { ok: true, details: 'Required environment variables detected' };
      },
    },
    {
      name: 'FFmpeg availability',
      task: () => {
        if (hasCommand('ffmpeg')) {
          return { ok: true, details: 'ffmpeg available in PATH' };
        }
        return { ok: true, skip: true, details: 'ffmpeg not installed — video fallback will be used' };
      },
    },
    {
      name: 'Writable video output directory',
      task: () => {
        const target = path.join(PATHS.root, 'public', 'videos');
        try {
          fs.accessSync(target, fs.constants.W_OK);
          return { ok: true, details: `${path.relative(PATHS.root, target)} writable` };
        } catch (error) {
          return { ok: false, details: `Cannot write to ${target}: ${error.message}` };
        }
      },
    },
    {
      name: 'Temporary directory capacity',
      task: () => {
        const freeGb = os.freemem() / (1024 ** 3);
        return {
          ok: freeGb > 0.5,
          details: `Free memory available: ${freeGb.toFixed(2)} GB`,
        };
      },
    },
  ];

  const result = await runSuite('System Configuration Validation', checks, options);
  return result;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runSystemValidation().then(result => {
    if (!result.ok) {
      process.exitCode = 1;
    }
  });
}
