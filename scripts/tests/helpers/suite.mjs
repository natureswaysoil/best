import { performance } from 'perf_hooks';

function formatDuration(ms) {
  if (ms < 1000) {
    return `${ms.toFixed(0)}ms`;
  }
  const seconds = ms / 1000;
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds - minutes * 60;
  return `${minutes}m ${remainder.toFixed(0)}s`;
}

function printHeading(title) {
  const line = '━'.repeat(Math.max(title.length, 8));
  console.log(`\n${title}`);
  console.log(line);
}

function normaliseResult(result) {
  if (typeof result === 'boolean') {
    return { ok: result };
  }
  if (typeof result === 'string') {
    return { ok: true, details: result };
  }
  if (!result || typeof result !== 'object') {
    return { ok: true };
  }
  if (typeof result.ok !== 'boolean') {
    return { ok: true, details: result.details, skip: result.skip === true };
  }
  return {
    ok: result.ok,
    details: result.details,
    skip: result.skip === true
  };
}

export async function runSuite(title, checks, options = {}) {
  const { quiet = false } = options;
  if (!quiet) {
    printHeading(title);
  }

  const summary = {
    ok: true,
    passed: 0,
    failed: 0,
    skipped: 0,
    durationMs: 0,
  };

  const start = performance.now();

  for (const check of checks) {
    const { name, task } = check;
    const label = name || 'Unnamed check';
    const checkStart = performance.now();
    let status;
    let details;

    try {
      const result = await task();
      const normalised = normaliseResult(result);
      details = normalised.details;

      if (normalised.skip) {
        status = 'skip';
        summary.skipped += 1;
      } else if (normalised.ok) {
        status = 'pass';
        summary.passed += 1;
      } else {
        status = 'fail';
        summary.failed += 1;
        summary.ok = false;
      }
    } catch (error) {
      status = 'fail';
      summary.failed += 1;
      summary.ok = false;
      details = error instanceof Error ? error.message : String(error);
    }

    const duration = performance.now() - checkStart;
    const prefix = status === 'pass' ? '✅' : status === 'skip' ? '⚠️' : '❌';
    const suffix = quiet ? '' : ` (${formatDuration(duration)})`;

    console.log(`${prefix} ${label}${suffix}`);
    if (details && !quiet) {
      console.log(`   ↳ ${details}`);
    }
  }

  summary.durationMs = performance.now() - start;

  if (!quiet) {
    const total = summary.passed + summary.failed + summary.skipped;
    console.log(`\nSummary: ${summary.passed} passed, ${summary.failed} failed, ${summary.skipped} skipped (total ${total})`);
    console.log(`Duration: ${formatDuration(summary.durationMs)}`);
  }

  return summary;
}

export async function runSuitesSequentially(suites) {
  let overallOk = true;
  for (const { title, runner } of suites) {
    const result = await runner();
    if (!result.ok) {
      overallOk = false;
    }
  }
  return overallOk;
}
