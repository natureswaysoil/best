#!/usr/bin/env node

/**
 * Add audio to generated seed videos.
 *
 * Preferred path:
 * - Load OPENAI_API_KEY from env or Google Secret Manager.
 * - Generate short voiceover narration from each video's scene plan.
 * - Mix voiceover over a very light FFmpeg-generated background bed.
 *
 * Fallback:
 * - If no OpenAI key is available, add a low-volume background bed so the MP4
 *   is no longer silent.
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT = path.resolve(__dirname, '..');
const VIDEOS_DIR = path.join(PROJECT, 'public', 'videos');
const PLAN_DIR = path.join(PROJECT, 'content', 'generated-videos');
const SECRET_PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT || process.env.PROJECT_ID;
const PRODUCT_IDS = (process.env.PRODUCT_IDS || 'NWS_014,NWS_011,NWS_013,NWS_021,NWS_018').split(',').map((x) => x.trim()).filter(Boolean);
const TTS_MODEL = process.env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts';
const TTS_VOICE = process.env.OPENAI_TTS_VOICE || 'alloy';
const FFMPEG_PRESET = process.env.FFMPEG_PRESET || 'veryfast';
const FFMPEG_TIMEOUT_MS = Number(process.env.FFMPEG_TIMEOUT_MS || 900000);
let OPENAI_API_KEY = process.env.OPENAI_API_KEY;

function capture(command, args, timeout = 30000) {
  const result = spawnSync(command, args, { cwd: PROJECT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout });
  return result.status === 0 ? result.stdout.trim() : '';
}
function run(command, args, options = {}) {
  const result = spawnSync(command, args, { cwd: PROJECT, stdio: 'inherit', timeout: FFMPEG_TIMEOUT_MS, ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} failed with exit ${result.status}`);
}
function hydrateSecret(name) {
  if (process.env[name]) return process.env[name];
  if (!SECRET_PROJECT_ID) return '';
  const value = capture('gcloud', ['secrets', 'versions', 'access', 'latest', '--secret', name, '--project', SECRET_PROJECT_ID], 45000);
  if (value) process.env[name] = value;
  return value;
}
function hydrateSecrets() {
  OPENAI_API_KEY = OPENAI_API_KEY || hydrateSecret('OPENAI_API_KEY');
  if (OPENAI_API_KEY) console.log('Loaded OPENAI_API_KEY for voiceover.');
  else console.log('OPENAI_API_KEY not found. Adding low-volume background audio only.');
}
function readJson(file, fallback = {}) {
  try { return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : fallback; }
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
function narrationFromPlan(plan) {
  const sceneTexts = (plan.sceneAudit || [])
    .map((s) => clean(s.text))
    .filter(Boolean)
    .filter((text) => !/^shop direct/i.test(text));
  const productName = clean(plan.productName || plan.productId || 'Nature\'s Way Soil product');
  const cta = clean((plan.cta || '').replace(/\n/g, ' '));
  const words = [
    productName,
    ...sceneTexts,
    cta || 'Visit NaturesWaySoil.com to shop direct and save.'
  ].join('. ');
  return words.replace(/\.\./g, '.').slice(0, 900);
}
async function createVoiceover(text, outFile) {
  if (!OPENAI_API_KEY) return false;
  try {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: TTS_MODEL,
        voice: TTS_VOICE,
        input: text,
        format: 'mp3'
      })
    });
    if (!response.ok) {
      const body = await response.text().catch(() => '');
      console.log(`OpenAI TTS failed with HTTP ${response.status}: ${body.slice(0, 200)}`);
      return false;
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(outFile, buffer);
    return fs.existsSync(outFile) && fs.statSync(outFile).size > 1000;
  } catch (error) {
    console.log(`OpenAI TTS failed: ${error.message}`);
    return false;
  }
}
function durationSeconds(file) {
  const out = capture('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nk=1:nw=1', file]);
  const n = Number(out);
  return Number.isFinite(n) && n > 0 ? n : 30;
}
function addAudio(videoFile, outputFile, voiceFile = null) {
  const dur = durationSeconds(videoFile);
  const background = `sine=frequency=196:sample_rate=44100:duration=${Math.ceil(dur)},volume=0.018`;

  if (voiceFile && fs.existsSync(voiceFile)) {
    run('ffmpeg', [
      '-y', '-hide_banner', '-loglevel', 'error',
      '-i', videoFile,
      '-i', voiceFile,
      '-f', 'lavfi', '-i', background,
      '-filter_complex', '[1:a]volume=1.25,apad[a1];[2:a]apad[a2];[a1][a2]amix=inputs=2:duration=first:dropout_transition=2[aout]',
      '-map', '0:v:0', '-map', '[aout]',
      '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k',
      '-shortest', '-movflags', '+faststart', outputFile
    ]);
  } else {
    run('ffmpeg', [
      '-y', '-hide_banner', '-loglevel', 'error',
      '-i', videoFile,
      '-f', 'lavfi', '-i', background,
      '-map', '0:v:0', '-map', '1:a:0',
      '-c:v', 'copy', '-c:a', 'aac', '-b:a', '128k',
      '-shortest', '-movflags', '+faststart', outputFile
    ]);
  }
}
async function processProduct(productId) {
  const videoFile = path.join(VIDEOS_DIR, `${productId}.mp4`);
  const planFile = path.join(PLAN_DIR, `${productId}-quality-seed-plan.json`);
  if (!fs.existsSync(videoFile)) {
    console.log(`Skipping ${productId}: video missing at ${path.relative(PROJECT, videoFile)}`);
    return;
  }

  const plan = readJson(planFile, { productId, productName: productId, sceneAudit: [] });
  const work = fs.mkdtempSync(path.join(os.tmpdir(), `nws_audio_${productId}_`));
  const voiceFile = path.join(work, `${productId}-voice.mp3`);
  const outputFile = path.join(VIDEOS_DIR, `${productId}-with-audio.mp4`);
  const replaceOriginal = process.env.REPLACE_ORIGINAL_AUDIO === '1';
  const finalFile = replaceOriginal ? path.join(work, `${productId}-final.mp4`) : outputFile;

  console.log(`\n🔊 Adding audio to ${productId}`);
  const narration = narrationFromPlan(plan);
  const hasVoice = await createVoiceover(narration, voiceFile);
  if (hasVoice) console.log(`Voiceover created for ${productId}.`);
  else console.log(`Using background audio fallback for ${productId}.`);

  addAudio(videoFile, finalFile, hasVoice ? voiceFile : null);
  if (replaceOriginal) {
    fs.copyFileSync(finalFile, videoFile);
    console.log(`✅ Updated original: ${path.relative(PROJECT, videoFile)}`);
  } else {
    console.log(`✅ Ready: ${path.relative(PROJECT, outputFile)}`);
  }
}
async function main() {
  hydrateSecrets();
  run('ffmpeg', ['-version'], { stdio: 'ignore', timeout: 30000 });
  run('ffprobe', ['-version'], { stdio: 'ignore', timeout: 30000 });
  for (const productId of PRODUCT_IDS) await processProduct(productId);
}

main().catch((error) => {
  console.error(`❌ Audio pass failed: ${error.message}`);
  process.exit(1);
});
