// Shared helpers for the blog -> short video -> social pipeline.

import fs from 'fs';
import os from 'os';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath, pathToFileURL } from 'url';
import { spawnSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
export const PROJECT = path.resolve(path.dirname(__filename), '..', '..');
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.natureswaysoil.com').replace(/\/$/, '');

const require = createRequire(import.meta.url);

// data/*.ts are plain data modules with interfaces only, so a transpile is enough.
async function importTs(relativePath) {
  const ts = require('typescript');
  const source = fs.readFileSync(path.join(PROJECT, relativePath), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
  });
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nws_ts_'));
  const file = path.join(dir, `${path.basename(relativePath, '.ts')}.mjs`);
  fs.writeFileSync(file, outputText);
  return import(pathToFileURL(file).href);
}

export async function loadBlogPosts() {
  const mod = await importTs('data/blog.ts');
  return mod.blogArticles || [];
}

export async function loadCatalog() {
  const mod = await importTs('data/products.ts');
  return mod.allProducts || [];
}

export function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

const STOP = new Set([
  'the', 'and', 'for', 'with', 'your', 'you', 'how', 'what', 'why', 'from', 'that', 'this', 'are', 'can', 'into',
  'natures', 'way', 'soil', 'nature', 'liquid', 'organic', 'natural', 'health', 'healthy', 'growth', 'best', 'effective',
]);
// Shown when a post matches no product: the general-purpose soil conditioner.
const DEFAULT_PRODUCT_ID = process.env.BLOG_SOCIAL_DEFAULT_PRODUCT || 'NWS_011';

function tokens(text) {
  return new Set(
    String(text || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .split(' ')
      .filter((w) => w.length > 2 && !STOP.has(w)),
  );
}

export function productImageExists(product) {
  const image = product.image || product.productImagePath;
  return Boolean(image) && fs.existsSync(path.join(PROJECT, 'public', String(image).replace(/^\//, '')));
}

/**
 * Pick the catalog product a post is most about, so the video's product scene
 * and end card show the right bottle. Only products with a real image qualify.
 * Ties go to the order of config/top-products.json, then catalog order; a post
 * that matches nothing gets DEFAULT_PRODUCT_ID.
 */
export function pickProductForPost(post, catalog, topProductIds = []) {
  const postWords = tokens([post.title, post.excerpt, post.category, ...(post.tags || [])].join(' '));
  const rank = (id) => {
    const i = topProductIds.indexOf(id);
    return i === -1 ? topProductIds.length : i;
  };
  const eligible = catalog.filter((p) => p.inStock !== false && productImageExists(p));
  const productWords = eligible.map((p) => tokens([p.name, ...(p.tags || [])].join(' ').replace(/-/g, ' ')));
  // Rare words (e.g. "biochar") say more about a post than words most products share ("lawn").
  const docFreq = new Map();
  for (const words of productWords) for (const w of words) docFreq.set(w, (docFreq.get(w) || 0) + 1);
  const scored = eligible
    .map((p, index) => {
      let score = 0;
      for (const w of productWords[index]) if (postWords.has(w)) score += 1 / docFreq.get(w);
      return { product: p, score, index };
    })
    .sort((a, b) => b.score - a.score || rank(a.product.id) - rank(b.product.id) || a.index - b.index);
  if (scored[0]?.score >= 0.5) return scored[0].product;
  return scored.find((s) => s.product.id === DEFAULT_PRODUCT_ID)?.product || scored[0]?.product || null;
}

export function choosePost(posts, state, slug, maxAgeDays = 14, now = Date.now()) {
  if (slug) {
    const post = posts.find(p => p.slug === slug);
    if (!post) throw new Error(`No blog post with slug "${slug}"`);
    return post;
  }
  const pending = posts.filter(p => ['rendered', 'partial', 'failed'].includes(state.posts[p.slug]?.status));
  if (pending.length) return pending.sort((a, b) => Date.parse(a.publishedAt) - Date.parse(b.publishedAt))[0];
  const cutoff = now - maxAgeDays * 86400000;
  return posts.filter(p => !state.posts[p.slug] && Date.parse(p.publishedAt) >= cutoff)
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))[0];
}

export function assertPostResult(result, platform) {
  if (!result || result.skipped || result.success === false || result.error) {
    throw new Error(`${platform} did not confirm a successful post`);
  }
  const id = result.id || result.postId || result.videoId || result.tweetId || result.pinId || result.publish_id || result.publishId;
  if (!id) throw new Error(`${platform} did not return a post or video ID`);
  return result;
}

export function blogUrl(post, platform) {
  const params = new URLSearchParams({
    utm_source: platform,
    utm_medium: 'social',
    utm_campaign: 'blog_video',
    utm_content: post.slug,
  });
  return `${SITE_URL}/blog/${post.slug}?${params}`;
}

// Short, filesystem- and API-safe id for the video files of one post.
export function videoIdForPost(post) {
  return `BLOG-${String(post.slug).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60)}`;
}

export function run(command, args, env = {}) {
  const result = spawnSync(command, args, {
    cwd: PROJECT,
    stdio: 'inherit',
    env: { ...process.env, ...env },
    timeout: Number(process.env.JOB_STEP_TIMEOUT_MS || 1800000),
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed with exit ${result.status}`);
}

export function capture(command, args, { input, timeout = 45000 } = {}) {
  const result = spawnSync(command, args, {
    cwd: PROJECT,
    encoding: 'utf8',
    input,
    stdio: [input === undefined ? 'ignore' : 'pipe', 'pipe', 'pipe'],
    timeout,
  });
  return { ok: result.status === 0, stdout: (result.stdout || '').trim(), stderr: (result.stderr || '').trim() };
}

export function secretProjectId(env = process.env) {
  return env.SECRET_PROJECT_ID || env.GOOGLE_CLOUD_PROJECT || env.GCLOUD_PROJECT || env.GCP_PROJECT || env.PROJECT_ID || '';
}

/** Fill missing env vars from Google Secret Manager. Never logs values. */
export function hydrateSecrets(names) {
  const project = secretProjectId();
  if (!project) {
    console.log('[Blog Social] No Google Cloud project id; using existing environment only.');
    return;
  }
  let loaded = 0;
  for (const name of names) {
    if (process.env[name]) continue;
    const res = capture('gcloud', ['secrets', 'versions', 'access', 'latest', '--secret', name, '--project', project]);
    if (res.ok && res.stdout) {
      process.env[name] = res.stdout;
      loaded++;
    }
  }
  console.log(`[Blog Social] Loaded ${loaded} secret(s) from Secret Manager.`);
}

export function bucketConfig() {
  const bucket = process.env.VIDEO_OUTPUT_BUCKET || process.env.GCS_VIDEO_BUCKET || 'natureswaysoil-videos';
  const prefix = (process.env.VIDEO_OUTPUT_PREFIX || 'seed-videos').replace(/^\/+|\/+$/g, '');
  const publicBase = (process.env.VIDEO_PUBLIC_BASE_URL || `https://storage.googleapis.com/${bucket}/${prefix}`).replace(/\/$/, '');
  return { bucket, prefix, publicBase, blogDir: `gs://${bucket}/${prefix}/blog`, stateUri: `gs://${bucket}/blog-social/state.json` };
}

/** Posting state lives in Cloud Storage so it survives between CI runners. */
export function loadState() {
  const { stateUri } = bucketConfig();
  const res = capture('gcloud', ['storage', 'cat', stateUri]);
  if (!res.ok) {
    if (/not found|No URLs matched|404/i.test(res.stderr)) return { posts: {} };
    throw new Error(`Could not read ${stateUri}: ${res.stderr.slice(0, 300)}`);
  }
  try {
    const parsed = JSON.parse(res.stdout);
    return parsed && typeof parsed.posts === 'object' ? parsed : { posts: {} };
  } catch {
    throw new Error(`${stateUri} is not valid JSON; fix or delete it before rerunning.`);
  }
}

export function saveState(state) {
  const { stateUri } = bucketConfig();
  const res = capture('gcloud', ['storage', 'cp', '-', stateUri], { input: JSON.stringify(state, null, 2) });
  if (!res.ok) throw new Error(`Could not write ${stateUri}: ${res.stderr.slice(0, 300)}`);
}

export async function urlIsReachable(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(30000) });
    return res.ok;
  } catch {
    return false;
  }
}
