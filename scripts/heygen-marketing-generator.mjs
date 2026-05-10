atureswaysoil ➜ /workspaces/best (main) $ grep -nE "process\.env\.(PRODUCT|ONLY|TARGET|FILTER)" scripts/generate-product-videos.mjs scripts/generate-product-videos-fixed.mjs scripts/.generate-product-videos.runtime.mjs 2>/dev/null
grep -nE "skip|alreadyExists|FORCE_REGENERATE|REAL_VIDEO" scripts/generate-product-videos.mjs scripts/.generate-product-videos.runtime.mjs 2>/dev/null | head -30
scripts/generate-product-videos.mjs:26:const FORCE_REGENERATE = process.argv.includes('--force') || process.env.VIDEO_FORCE_REGENERATE === '1';
scripts/generate-product-videos.mjs:367:    console.log(`   ⚠️  FFmpeg not available, skipping b-roll enhancement for ${prod.id}`);
scripts/generate-product-videos.mjs:692:  if (FORCE_REGENERATE) {
scripts/generate-product-videos.mjs:736:      if (!FORCE_REGENERATE && fs.existsSync(existingVideo) && fs.statSync(existingVideo).size > 100000) {
scripts/generate-product-videos.mjs:851:    if (!FORCE_REGENERATE && fs.existsSync(existingVideo) && fs.statSync(existingVideo).size > 100000) {
scripts/.generate-product-videos.runtime.mjs:26:const FORCE_REGENERATE = process.argv.includes('--force') || process.env.VIDEO_FORCE_REGENERATE === '1';
scripts/.generate-product-videos.runtime.mjs:369:    console.log(`   ⚠️  FFmpeg not available, skipping Pexels b-roll enhancement for ${prod.id}`);
scripts/.generate-product-videos.runtime.mjs:375:    console.log(`   ⚠️  PEXELS_API_KEY not set, skipping Pexels b-roll for ${prod.id}`);
scripts/.generate-product-videos.runtime.mjs:781:  if (FORCE_REGENERATE) {
scripts/.generate-product-videos.runtime.mjs:825:      if (!FORCE_REGENERATE && fs.existsSync(existingVideo) && fs.statSync(existingVideo).size > 100000) {
scripts/.generate-product-videos.runtime.mjs:940:    if (!FORCE_REGENERATE && fs.existsSync(existingVideo) && fs.statSync(existingVideo).size > 100000) {
@natureswaysoil ➜ /workspaces/best (main) $ grep -nE "5-scene|video_inputs\s*\[|GARDEN_AVATAR_POOL|SCENE_QUERIES" scripts/heygen-marketing-generator.mjs 
wc -l scripts/heygen-marketing-generator.mjs
209 scripts/heygen-marketing-generator.mjs
@natureswaysoil ➜ /workspaces/best (main) $ sed -n '1,40p' scripts/.generate-product-videos.runtime.mjs 2>/dev/null
#!/usr/bin/env node
/**
 * Generate 30-second AI presenter videos for each product using HeyGen.
 * - Professional AI avatars present product benefits and usage instructions
 * - High-quality talking head videos with branded backgrounds
 * - Outputs MP4 optimized for web and social media
 * - Fallback to FFmpeg generation if HeyGen is unavailable
 */
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { spawnSync, execSync } from 'child_process';
import HeyGenVideoGenerator from './heygen-video-generator.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT = path.resolve(__dirname, '..');
const DATA_FILE = path.join(PROJECT, 'data', 'products.ts');
const OUT_DIR = path.join(PROJECT, 'public', 'videos');
const ASIN_SCRIPTS = path.join(PROJECT, 'content', 'video-scripts', 'asin-scripts.json');
const VIDEO_CONFIG = path.join(PROJECT, 'content', 'video-scripts', 'video-config.json');
const SHEET_CACHE = path.join(PROJECT, 'content', 'video-scripts', 'sheet-products.json');
const VIDEO_SCRIPTS_DIR = path.join(PROJECT, 'content', 'video-scripts');

const FORCE_REGENERATE = process.argv.includes('--force') || process.env.VIDEO_FORCE_REGENERATE === '1';
const LOCK_SCRIPT_MODE = process.argv.includes('--lock-script') || process.env.VIDEO_LOCK_SCRIPT === '1';

function readArgValue(...names) {
  for (const name of names) {
    const eqArg = process.argv.find((arg) => arg.startsWith(`${name}=`));
    if (eqArg) return eqArg.slice(name.length + 1).trim();
    const idx = process.argv.indexOf(name);
    if (idx >= 0 && process.argv[idx + 1]) return String(process.argv[idx + 1]).trim();
  }
  return null;
}

const TARGET_PRODUCT_ID = readArgValue('--product', '--product-id') || process.env.VIDEO_PRODUCT_ID || null;

@natureswaysoil ➜ /workspaces/best (main) $ 
