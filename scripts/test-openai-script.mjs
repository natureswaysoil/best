#!/usr/bin/env node
import { runSuite } from './tests/helpers/suite.mjs';
import { loadProducts, loadAsinScripts } from './tests/helpers/data.mjs';

function validateSegmentTimings(segments) {
  if (!Array.isArray(segments) || !segments.length) {
    return { ok: false, details: 'No segments defined' };
  }
  let currentStart = 0;
  for (const segment of segments) {
    if (typeof segment.start !== 'number' || typeof segment.end !== 'number') {
      return { ok: false, details: 'Segment timings must be numeric' };
    }
    if (segment.start < currentStart) {
      return { ok: false, details: `Segment starting at ${segment.start}s overlaps previous segment` };
    }
    if (segment.end <= segment.start) {
      return { ok: false, details: `Invalid timing: ${segment.start}-${segment.end}` };
    }
    currentStart = segment.end;
  }
  return { ok: true };
}

export async function runOpenAiScriptSuite(options = {}) {
  const products = loadProducts();
  const asinScripts = loadAsinScripts();

  const checks = [
    {
      name: 'Coverage for ASIN-linked products',
      task: () => {
        const withAsin = products.filter(p => p.asin);
        const missing = withAsin.filter(p => !asinScripts[p.asin]);
        if (missing.length) {
          return {
            ok: false,
            details: `Missing script templates for: ${missing.map(p => `${p.id} (${p.asin})`).join(', ')}`,
          };
        }
        return { ok: true, details: `${withAsin.length} products mapped to script templates` };
      },
    },
    {
      name: 'Segment structure',
      task: () => {
        const issues = [];
        for (const [asin, config] of Object.entries(asinScripts)) {
          const validation = validateSegmentTimings(config.segments);
          if (!validation.ok) {
            issues.push(`${asin}: ${validation.details}`);
          }
        }
        if (issues.length) {
          return { ok: false, details: issues.join(' | ') };
        }
        return { ok: true, details: 'All segments have sequential timings' };
      },
    },
    {
      name: 'Segment duration and coverage',
      task: () => {
        const problems = [];
        for (const [asin, config] of Object.entries(asinScripts)) {
          const totalDuration = config.segments.reduce((acc, seg) => acc + (seg.end - seg.start), 0);
          if (totalDuration < 28 || totalDuration > 32) {
            problems.push(`${asin}: expected ~30s total, got ${totalDuration.toFixed(1)}s`);
          }
        }
        if (problems.length) {
          return { ok: false, details: problems.join(' | ') };
        }
        return { ok: true, details: 'Segment blocks cover ~30 seconds per video' };
      },
    },
    {
      name: 'Script tone and CTA checks',
      task: () => {
        const missingCta = Object.entries(asinScripts)
          .filter(([, config]) => !config.segments.some(seg => /Nature['’]s Way Soil|natureswaysoil/i.test(seg.text)))
          .map(([asin]) => asin);
        if (missingCta.length) {
          return { ok: false, details: `CTA missing brand mention for: ${missingCta.join(', ')}` };
        }
        return { ok: true, details: 'All scripts reference Nature’s Way Soil call-to-action' };
      },
    },
  ];

  const result = await runSuite('OpenAI Script Generation Validation', checks, options);
  return result;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runOpenAiScriptSuite().then(result => {
    if (!result.ok) {
      process.exitCode = 1;
    }
  });
}
