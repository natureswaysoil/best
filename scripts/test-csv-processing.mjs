#!/usr/bin/env node
import path from 'path';
import fs from 'fs';
import { runSuite } from './tests/helpers/suite.mjs';
import { PATHS, loadProducts, loadAsinScripts, listVideoAssets } from './tests/helpers/data.mjs';

export async function runCsvProcessingSuite(options = {}) {
  const context = {};

  const checks = [
    {
      name: 'Product dataset available',
      task: () => {
        const exists = fs.existsSync(PATHS.productsFile);
        return { ok: exists, details: exists ? `Located ${path.relative(PATHS.root, PATHS.productsFile)}` : 'Missing data/products.ts' };
      },
    },
    {
      name: 'Parse product records',
      task: () => {
        context.products = loadProducts();
        return { ok: context.products.length > 0, details: `Loaded ${context.products.length} products` };
      },
    },
    {
      name: 'Validate product identifiers',
      task: () => {
        const ids = context.products.map(p => p.id);
        const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
        const invalid = ids.filter(id => !/^NWS_\d{3}$/.test(id));
        if (duplicates.length || invalid.length) {
          const issues = [];
          if (duplicates.length) issues.push(`duplicate IDs: ${[...new Set(duplicates)].join(', ')}`);
          if (invalid.length) issues.push(`invalid format: ${invalid.join(', ')}`);
          return { ok: false, details: issues.join(' | ') };
        }
        return { ok: true, details: 'IDs are unique and follow NWS_### pattern' };
      },
    },
    {
      name: 'Usage instructions well-formed',
      task: () => {
        const problematic = context.products
          .filter(p => Array.isArray(p.usage))
          .filter(p => p.usage.some(step => typeof step !== 'string' || !step.trim() || step.length > 240));
        if (problematic.length) {
          return {
            ok: false,
            details: `Products with invalid usage instructions: ${problematic.map(p => p.id).join(', ')}`,
          };
        }
        return { ok: true, details: 'Usage instructions trimmed and under 240 characters' };
      },
    },
    {
      name: 'ASIN mapping coverage',
      task: () => {
        const asinScripts = loadAsinScripts();
        context.asinScripts = asinScripts;
        const missing = context.products
          .filter(p => p.asin)
          .filter(p => !asinScripts[p.asin]);
        if (missing.length) {
          return {
            ok: false,
            details: `Missing ASIN script entries for: ${missing.map(p => `${p.id} (${p.asin})`).join(', ')}`,
          };
        }
        return { ok: true, details: `Scripts available for ${Object.keys(asinScripts).length} ASINs` };
      },
    },
    {
      name: 'Video asset availability',
      task: () => {
        const assets = listVideoAssets();
        const missingAssets = context.products
          .map(p => ({
            id: p.id,
            assets: assets.map.get(p.id) || { mp4: false, webm: false, poster: false },
          }))
          .filter(entry => !entry.assets.mp4 || !entry.assets.poster);
        if (missingAssets.length) {
          const summary = missingAssets
            .map(entry => `${entry.id} (${['mp4', 'poster', 'webm'].filter(type => !entry.assets[type]).join('/') || 'ok'})`)
            .join(', ');
          return {
            ok: false,
            details: `Products missing assets: ${summary}`,
          };
        }
        const mp4Count = [...assets.map.values()].filter(v => v.mp4).length;
        return { ok: true, details: `Video assets present for ${mp4Count} products` };
      },
    },
  ];

  const result = await runSuite('CSV Processing Validation', checks, options);
  return result;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runCsvProcessingSuite().then(result => {
    if (!result.ok) {
      process.exitCode = 1;
    }
  });
}
