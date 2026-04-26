#!/usr/bin/env node
/**
 * Generate missing ASIN scripts for products not yet in asin-scripts.json.
 * Uses OpenAI to write 30-second talking-head video scripts matching the
 * style of existing entries. Run once; safe to re-run (skips existing ASINs).
 *
 * Usage:
 *   OPENAI_API_KEY=sk-... node scripts/generate-asin-scripts.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT = path.resolve(__dirname, '..');
const ASIN_SCRIPTS_FILE = path.join(PROJECT, 'content', 'video-scripts', 'asin-scripts.json');
const SHEET_CACHE = path.join(PROJECT, 'content', 'video-scripts', 'sheet-products.json');

// ---------- style examples for few-shot prompt ----------
const STYLE_EXAMPLES = [
  {
    title: 'Organic Liquid Fertilizer (Garden & House Plants)',
    script: "Houseplants looking tired? Gardens need a gentle boost? Fast-absorbing, plant-friendly nutrients with B-1 & aloe support roots, transplants, and steady growth—indoors or out. Mix 1–2 oz/gal. Feed every 2–3 weeks. For foliar, use 1 oz/gal early or late in the day. Shop Nature's Way Soil—free shipping $50+. Safe when used as directed.",
  },
  {
    title: 'Activated Charcoal (4 Quarts)',
    script: "Funky smells and soggy pots? Activated charcoal improves drainage, filters odors, and keeps terrariums, bonsai, and cacti fresher, longer. Blend 10–20% into potting mix or add a thin layer under soil in containers. Long-lasting—works in pots, terrariums, and gardens. Shop Nature's Way Soil—nature-first plant care.",
  },
  {
    title: 'Dog Urine Neutralizer & Lawn Revitalizer',
    script: "Dog spots got you down? Targets problem areas in the soil, reduces odors, helps grass recover—pet-safe when used as directed. Ready-to-use: saturate spots, wait 10–20 min, water in. Repeat stubborn areas weekly. Reclaim your lawn—Nature's Way Soil.",
  },
];

function buildPrompt(product) {
  const keywords = Array.isArray(product.keywords) && product.keywords.length
    ? product.keywords.join(', ')
    : product.category || 'organic plant care';
  const examples = STYLE_EXAMPLES.map((e, i) =>
    `Example ${i + 1} – "${e.title}":\n${e.script}`
  ).join('\n\n');

  return `You write concise 30-second talking-head video scripts for Nature's Way Soil organic lawn and garden products. Each script should be 55–75 words, conversational, match the style of the examples below, mention what problem it solves, key benefit, that it's pet-safe/organic where relevant, and end with a call to action for NaturesWaySoil.com.

${examples}

Now write a script for: "${product.name}"
Category: ${product.category || 'Garden product'}
Keywords: ${keywords}

Return ONLY the script text, no title, no quotes, no extra commentary.`;
}

async function generateScript(product, apiKey) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 200,
      temperature: 0.7,
      messages: [
        { role: 'system', content: "You are a copywriter for Nature's Way Soil organic garden products. Write concise, conversational video scripts." },
        { role: 'user', content: buildPrompt(product) },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI error ${response.status}: ${err.slice(0, 200)}`);
  }

  const data = await response.json();
  const script = data.choices?.[0]?.message?.content?.trim();
  if (!script) throw new Error('Empty OpenAI response');
  return script;
}

function scriptToSegments(script) {
  // Split into ~4 natural segments spread across 30 seconds
  const sentences = script.match(/[^.!?]+[.!?]+/g) || [script];
  const total = sentences.length;
  const segments = [];
  let t = 0;
  sentences.forEach((s, i) => {
    const duration = i === total - 1 ? 30 - t : Math.round((30 / total));
    segments.push({ start: t, end: Math.min(t + duration, 30), text: s.trim() });
    t += duration;
  });
  // Clamp last segment
  if (segments.length > 0) segments[segments.length - 1].end = 30;
  return segments;
}

function fallbackScript(product) {
  const keywords = Array.isArray(product.keywords) && product.keywords.length
    ? product.keywords.slice(0, 3).join(', ')
    : 'healthy plants';
  const name = product.name.split('–')[0].split('|')[0].trim();
  return [
    `Looking to improve your garden results? ${name} is the natural solution.`,
    `Organic and pet-safe—supports stronger roots and better nutrient uptake.`,
    `Apply as directed for consistent results you can see season after season.`,
    `Shop Nature's Way Soil at NaturesWaySoil.com.`,
  ].join(' ');
}

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;

  // Load existing scripts
  let asinMap = {};
  if (fs.existsSync(ASIN_SCRIPTS_FILE)) {
    asinMap = JSON.parse(fs.readFileSync(ASIN_SCRIPTS_FILE, 'utf8'));
  }

  // Load sheet products
  const sheetData = JSON.parse(fs.readFileSync(SHEET_CACHE, 'utf8'));
  const products = sheetData.products || [];

  const missing = products.filter((p) => p.asin && !(p.asin in asinMap));
  // Also handle products without ASIN — key by product ID
  const missingNoAsin = products.filter((p) => !p.asin && !(p.id in asinMap));

  const toProcess = [
    ...missing.map((p) => ({ ...p, _key: p.asin })),
    ...missingNoAsin.map((p) => ({ ...p, _key: p.id })),
  ];

  if (toProcess.length === 0) {
    console.log('✅ All products already have scripts in asin-scripts.json');
    return;
  }

  console.log(`📝 Generating scripts for ${toProcess.length} products...`);
  if (!apiKey) {
    console.log('⚠️  No OPENAI_API_KEY — using fallback template scripts');
  }

  let added = 0;
  for (const product of toProcess) {
    const key = product._key;
    const shortName = product.name.split('–')[0].split('|')[0].trim().slice(0, 60);
    process.stdout.write(`  ${product.id} (${key}): `);

    try {
      const script = apiKey
        ? await generateScript(product, apiKey)
        : fallbackScript(product);

      const segments = scriptToSegments(script);
      asinMap[key] = {
        title: shortName,
        segments,
      };
      console.log(`✅ ${script.split(' ').length} words`);
      added++;

      // Save after each to avoid losing progress
      fs.writeFileSync(ASIN_SCRIPTS_FILE, JSON.stringify(asinMap, null, 2));

      // Polite delay when using OpenAI
      if (apiKey) await new Promise((r) => setTimeout(r, 600));
    } catch (err) {
      console.log(`❌ ${err.message}`);
      // Write fallback so the key exists
      const script = fallbackScript(product);
      asinMap[key] = { title: shortName, segments: scriptToSegments(script) };
      fs.writeFileSync(ASIN_SCRIPTS_FILE, JSON.stringify(asinMap, null, 2));
    }
  }

  console.log(`\n✅ Done — added ${added}/${toProcess.length} scripts to ${ASIN_SCRIPTS_FILE}`);
}

main().catch((e) => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
