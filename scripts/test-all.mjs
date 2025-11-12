#!/usr/bin/env node
import { runCsvProcessingSuite } from './test-csv-processing.mjs';
import { runOpenAiScriptSuite } from './test-openai-script.mjs';
import { runHeygenSuite } from './test-heygen-integration.mjs';

export async function runFastAutomationSuite(options = {}) {
  const { quiet = false } = options;
  console.log('Running fast automation validation suite');
  console.log('========================================');

  const suites = [
    () => runCsvProcessingSuite({ quiet }),
    () => runOpenAiScriptSuite({ quiet }),
    () => runHeygenSuite({ quiet, requireApiKey: false }),
  ];

  let ok = true;
  for (const runner of suites) {
    const result = await runner();
    if (!result.ok) {
      ok = false;
    }
    console.log('');
  }

  if (ok) {
    console.log('✅ Fast validation succeeded');
  } else {
    console.log('❌ Fast validation detected issues');
  }

  return ok;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runFastAutomationSuite().then(ok => {
    if (!ok) {
      process.exitCode = 1;
    }
  });
}
