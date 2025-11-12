#!/usr/bin/env node
import { runCsvProcessingSuite } from './test-csv-processing.mjs';
import { runOpenAiScriptSuite } from './test-openai-script.mjs';
import { runHeygenSuite } from './test-heygen-integration.mjs';
import { runPlatformSuite } from './test-all-platforms.mjs';

function parseArgs(argv) {
  const args = new Set(argv.slice(2));
  return {
    dryRun: args.has('--dry-run') || args.has('dry-run'),
    quiet: args.has('--quiet'),
  };
}

export async function runEndToEndSuite(options = {}) {
  const { dryRun = false, quiet = false } = options;

  console.log('Nature\'s Way Soil — Video Automation End-to-End Test');
  console.log('====================================================');
  console.log(`Mode: ${dryRun ? 'Dry run (no external API calls)' : 'Full validation'}`);
  console.log('');

  const suites = [
    () => runCsvProcessingSuite({ quiet }),
    () => runOpenAiScriptSuite({ quiet }),
    () => runHeygenSuite({ quiet, requireApiKey: !dryRun }),
    () => runPlatformSuite({ quiet, allowMissingEnv: dryRun }),
  ];

  let overallOk = true;
  for (const runner of suites) {
    const result = await runner();
    if (!result.ok) {
      overallOk = false;
    }
    console.log('');
  }

  if (overallOk) {
    console.log('✅ End-to-end verification passed');
  } else {
    console.log('❌ End-to-end verification failed — review suite output above');
  }

  return overallOk;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = parseArgs(process.argv);
  runEndToEndSuite(args).then(ok => {
    if (!ok) {
      process.exitCode = 1;
    }
  });
}
