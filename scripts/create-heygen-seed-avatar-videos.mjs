#!/usr/bin/env node

/**
 * Create HeyGen spoken avatar videos for the seed product list.
 *
 * This is the "spoken presenter" version of the seed videos. It uses:
 * - config/top-products.json for the five product seed list
 * - content/video-scripts/video-config.json for garden/farm avatar overrides
 * - Google Secret Manager to hydrate HEYGEN_API_KEY when available
 *
 * Output:
 * - public/videos/NWS_014-heygen-avatar.mp4
 * - public/videos/NWS_011-heygen-avatar.mp4
 * - etc.
 */

import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';
import { HeyGenVideoGenerator } from './heygen-video-generator.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT = path.resolve(__dirname, '..');
const TOP_PRODUCTS_FILE = path.join(PROJECT, 'config', 'top-products.json');
const VIDEO_CONFIG_FILE = path.join(PROJECT, 'content', 'video-scripts', 'video-config.json');
const OUT_DIR = path.join(PROJECT, 'public', 'videos');
const SECRET_PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT || process.env.PROJECT_ID;
const BUILD_ALL = process.argv.includes('--all');
const TARGET_PRODUCT_ID = process.env.PRODUCT_ID || process.env.VIDEO_PRODUCT_ID || 'NWS_014';
const MAX_WAIT_MS = Number(process.env.HEYGEN_MAX_WAIT_MS || 900000);
const AVATAR_SUFFIX = process.env.HEYGEN_SEED_SUFFIX || 'heygen-avatar';

const AVATAR_ALIAS_MAP = {
  garden_expert_01: 'Anna_public_3_20240108',
  eco_gardener_01: 'Abigail_expressive_2024112501',
  pasture_specialist_01: 'Aditya_public_4',
  farm_expert_02: 'Aditya_public_1'
};

const VOICE_ALIAS_MAP = {
  en_us_warm_female_01: 'ybOJaAgPlBdcGBEpCJzA',
  en_us_warm_female_02: '3o5awrz3sR3uP9rxaD80',
  en_us_neutral_mx_01: 'ybOJaAgPlBdcGBEpCJzA'
};

function capture(command, args, timeout = 30000) {
  const result = spawnSync(command, args, { cwd: PROJECT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout });
  return result.status === 0 ? result.stdout.trim() : '';
}

function hydrateSecret(name) {
  if (process.env[name]) return process.env[name];
  if (!SECRET_PROJECT_ID) return '';
  const value = capture('gcloud', ['secrets', 'versions', 'access', 'latest', '--secret', name, '--project', SECRET_PROJECT_ID], 45000);
  if (value) process.env[name] = value;
  return value;
}

function hydrateSecrets() {
  const heygen = hydrateSecret('HEYGEN_API_KEY');
  if (heygen) console.log('Loaded HEYGEN_API_KEY from Google Secret Manager.');
  else console.log('HEYGEN_API_KEY was not found. Set it in env or Google Secret Manager before running this script.');
}

function readJson(file, fallback = {}) {
  try { return fsSync.existsSync(file) ? JSON.parse(fsSync.readFileSync(file, 'utf8')) : fallback; }
  catch { return fallback; }
}

function clean(text) {
  return String(text || '')
    .replace(/[“”]/g, '"')
    .replace(/[’]/g, "'")
    .replace(/[—–]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function products() {
  const topProducts = readJson(TOP_PRODUCTS_FILE, { topProducts: [] }).topProducts || [];
  return topProducts
    .map((product) => ({ ...product, productName: product.name || product.productName || product.id }))
    .sort((a, b) => (a.priority || 999) - (b.priority || 999));
}

function resolveConfigOverride(product) {
  const cfg = readJson(VIDEO_CONFIG_FILE, {});
  const heygen = cfg.heygen || {};
  const productOverride = heygen.productOverrides?.[product.id] || {};
  const categoryOverride = heygen.categoryOverrides?.[product.category] || {};
  return {
    avatarId: productOverride.avatarId || categoryOverride.avatarId || heygen.defaultAvatarId,
    voiceId: productOverride.voiceId || categoryOverride.voiceId || heygen.defaultVoiceId
  };
}

function resolveAvatarVoice(product) {
  const cfg = resolveConfigOverride(product);
  const avatarAlias = product.avatar_id || product.heygenAvatarId || product.heygen_avatar_id;
  const voiceAlias = product.heygen_voice_id || product.voice_id || product.HEYGEN_VOICE_ID;
  const avatarId = process.env.HEYGEN_AVATAR_ID || AVATAR_ALIAS_MAP[avatarAlias] || avatarAlias || cfg.avatarId || 'Anna_public_3_20240108';
  const voiceId = process.env.HEYGEN_VOICE_ID || VOICE_ALIAS_MAP[voiceAlias] || voiceAlias || cfg.voiceId || 'ybOJaAgPlBdcGBEpCJzA';
  return { avatarId, voiceId };
}

function sceneScript(product) {
  const scenes = Array.isArray(product.scenes) ? product.scenes : [];
  const sceneText = scenes
    .map((scene) => clean(scene.text))
    .filter(Boolean)
    .filter((text) => !/^shop direct/i.test(text));

  const intro = `Hi, I'm here from Nature's Way Soil. This is ${product.productName}.`;
  const body = sceneText.join(' ');
  const cta = clean((product.cta || '').replace(/\n/g, ' ')) || 'Visit NaturesWaySoil.com to shop direct and save.';

  return `${intro} ${body} ${cta}`.slice(0, 950);
}

function backgroundFor(product) {
  const category = String(product.category || '').toLowerCase();
  const name = product.productName;
  if (category.includes('pasture') || category.includes('farm')) {
    return {
      type: 'text',
      prompt: `Natural farm and pasture background for ${name}: green field, healthy grass, small farm, warm sunlight, trustworthy soil-care product education.`
    };
  }
  if (category.includes('compost') || category.includes('soil')) {
    return {
      type: 'text',
      prompt: `Organic garden background for ${name}: raised beds, rich dark soil, compost, healthy plants, natural sunlight, family farm style.`
    };
  }
  return {
    type: 'text',
    prompt: `Garden and lawn background for ${name}: green lawn, healthy plants, watering scene, natural sunlight, clean product education style.`
  };
}

async function createAvatarVideo(generator, product) {
  const { avatarId, voiceId } = resolveAvatarVoice(product);
  const script = sceneScript(product);
  const title = `${product.productName} - Garden/Farm Avatar`;
  console.log(`\n🎙️ ${product.id}: ${title}`);
  console.log(`Using HeyGen avatar: ${avatarId}`);
  console.log(`Using HeyGen voice: ${voiceId}`);

  const videoData = {
    video_inputs: [
      {
        character: {
          type: 'avatar',
          avatar_id: avatarId,
          avatar_style: 'normal',
          scale: 0.82,
          offset: { x: -0.28, y: 0.04 }
        },
        voice: {
          type: 'text',
          input_text: script,
          voice_id: voiceId,
          speed: 1.03
        },
        background: backgroundFor(product)
      }
    ],
    dimension: { width: 1280, height: 720 },
    aspect_ratio: '16:9',
    test: process.env.HEYGEN_TEST_MODE === '1',
    caption: true,
    callback_id: `nws_seed_${product.id}_${Date.now()}`
  };

  const response = await generator.fetchWithRetry(`${generator.baseUrl}/video/generate`, {
    method: 'POST',
    headers: {
      'X-Api-Key': generator.apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(videoData)
  }, { label: `seed-avatar-${product.id}`, timeoutMs: generator.requestTimeoutMs, retries: generator.maxRetries });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`HeyGen create failed for ${product.id}: HTTP ${response.status} ${body}`);
  }

  const result = await response.json();
  const videoId = result.data.video_id;
  console.log(`HeyGen video started: ${videoId}`);
  const complete = await generator.waitForCompletion(videoId, MAX_WAIT_MS);
  const outFile = path.join(OUT_DIR, `${product.id}-${AVATAR_SUFFIX}.mp4`);
  await fs.mkdir(OUT_DIR, { recursive: true });
  await generator.downloadVideo(complete.videoUrl, outFile);

  const metaFile = path.join(PROJECT, 'content', 'generated-videos', `${product.id}-${AVATAR_SUFFIX}-plan.json`);
  await fs.mkdir(path.dirname(metaFile), { recursive: true });
  await fs.writeFile(metaFile, JSON.stringify({
    productId: product.id,
    productName: product.productName,
    category: product.category,
    avatarId,
    voiceId,
    script,
    output: path.relative(PROJECT, outFile),
    heygenVideoId: videoId,
    generatedAt: new Date().toISOString()
  }, null, 2));

  console.log(`✅ Ready: ${path.relative(PROJECT, outFile)}`);
}

async function main() {
  hydrateSecrets();
  if (!process.env.HEYGEN_API_KEY) throw new Error('HEYGEN_API_KEY is required. Add it to Google Secret Manager or export it in the shell.');
  const selected = BUILD_ALL ? products() : products().filter((p) => p.id === TARGET_PRODUCT_ID);
  if (!selected.length) throw new Error(`No matching product for ${TARGET_PRODUCT_ID}`);
  const generator = new HeyGenVideoGenerator(process.env.HEYGEN_API_KEY);
  for (const product of selected) await createAvatarVideo(generator, product);
}

main().catch((error) => {
  console.error(`❌ HeyGen seed avatar generation failed: ${error.message}`);
  process.exit(1);
});
