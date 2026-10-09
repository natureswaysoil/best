#!/usr/bin/env node
/**
 * Blog post -> short vertical video -> social posts.
 *
 *   node scripts/blog-social/job.mjs render [--slug <slug>]
 *     Picks the newest blog post that has not been handled yet (or --slug),
 *     writes a claim-checked script, renders the video with the existing
 *     quality seed generator + voiceover, uploads it to Cloud Storage and
 *     writes blog-social-manifest.json. Nothing is posted.
 *
 *   node scripts/blog-social/job.mjs post --manifest <file>
 *     Posts the rendered video to every configured platform (Instagram,
 *     Facebook, YouTube, X, Pinterest, TikTok) and records the result.
 *
 * Splitting render and post lets the GitHub workflow put an approval gate in
 * between. State is kept in gs://<bucket>/blog-social/state.json.
 */

import fs from 'fs';
import path from 'path';
import {
  PROJECT, SITE_URL, assertPostResult, choosePost, bucketConfig, capture, hydrateSecrets, loadBlogPosts, loadCatalog,
  loadState, pickProductForPost, readJson, run, saveState, urlIsReachable, videoIdForPost,
} from './lib.mjs';
import { ClaimViolationError, writeScript } from './script-writer.mjs';
import { TIKTOK_SECRET_NAMES, checkTikTokPublish, hasTikTokCredentials, postVideoToTikTok } from './tiktok.mjs';

const VIDEOS_DIR = path.join(PROJECT, 'public', 'videos');
const WORK_DIR = path.join(PROJECT, 'content', 'generated-videos', 'blog');
const MANIFEST = path.join(PROJECT, 'blog-social-manifest.json');
const MAX_AGE_DAYS = Number(process.env.BLOG_SOCIAL_MAX_AGE_DAYS || 14);

const SECRET_NAMES = [
  'OPENAI_API_KEY', 'PEXELS_API_KEY', 'NEXT_PUBLIC_SITE_URL',
  'VIDEO_OUTPUT_BUCKET', 'VIDEO_OUTPUT_PREFIX', 'VIDEO_PUBLIC_BASE_URL',
  'INSTAGRAM_ACCESS_TOKEN', 'INSTAGRAM_IG_ID', 'FACEBOOK_PAGE_ID', 'FACEBOOK_ACCESS_TOKEN', 'FACEBOOK_PAGE_ACCESS_TOKEN',
  'PINTEREST_ACCESS_TOKEN', 'PINTEREST_BOARD_ID', 'TWITTER_CLIENT_ID', 'TWITTER_CLIENT_SECRET', 'TWITTER_REFRESH_TOKEN',
  'YT_CLIENT_ID', 'YT_CLIENT_SECRET', 'YT_REFRESH_TOKEN',
  ...TIKTOK_SECRET_NAMES,
];

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? '' : process.argv[i + 1] || '';
}

function setOutput(key, value) {
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
}

async function render() {
  hydrateSecrets(SECRET_NAMES);
  const state = loadState();
  const posts = await loadBlogPosts();
  const post = choosePost(posts, state, arg('slug'), MAX_AGE_DAYS);
  if (!post) {
    console.log(`[Blog Social] No unhandled blog post from the last ${MAX_AGE_DAYS} days.`);
    setOutput('has_post', 'false');
    return;
  }
  console.log(`[Blog Social] Post: ${post.title} (${post.slug})`);
  const existing = state.posts[post.slug];
  if (existing?.status === 'posted') {
    console.log('[Blog Social] Already posted; skipping.');
    setOutput('has_post', 'false');
    return;
  }
  if (existing?.manifest) {
    const manifest = existing.manifest;
    const { blogDir } = bucketConfig();
    fs.mkdirSync(VIDEOS_DIR, { recursive: true });
    for (const extension of ['mp4', ...(manifest.posterUrl?.endsWith(`${manifest.videoId}.jpg`) ? ['jpg'] : [])]) {
      const source = `${blogDir}/${manifest.videoId}.${extension}`;
      const result = capture('gcloud', ['storage', 'cp', source, path.join(VIDEOS_DIR, `${manifest.videoId}.${extension}`)], { timeout: 600000 });
      if (!result.ok) throw new Error(`Could not resume rendered asset ${source}: ${result.stderr.slice(0, 300)}`);
    }
    fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
    setOutput('has_post', 'true');
    setOutput('slug', post.slug);
    console.log('[Blog Social] Resuming previously rendered video; successful platforms will be skipped.');
    return;
  }


  const catalog = await loadCatalog();
  const topIds = (readJson(path.join(PROJECT, 'config', 'top-products.json'), {}).topProducts || []).map((p) => p.id);
  const product = pickProductForPost(post, catalog, topIds);
  if (!product) throw new Error('No catalog product with a usable image to show in the video');
  console.log(`[Blog Social] Product shown: ${product.id} ${product.name}`);

  let script;
  try {
    script = await writeScript(post, product);
  } catch (error) {
    if (error instanceof ClaimViolationError) {
      state.posts[post.slug] = { status: 'held', reason: error.message, at: new Date().toISOString() };
      saveState(state);
      console.log(`[Blog Social] Held: ${error.message}`);
      setOutput('has_post', 'false');
      return;
    }
    throw error;
  }

  const id = videoIdForPost(post);
  fs.mkdirSync(WORK_DIR, { recursive: true });
  const configFile = path.join(WORK_DIR, `${id}-config.json`);
  fs.writeFileSync(configFile, JSON.stringify({
    topProducts: [{
      id,
      name: product.name,
      category: post.category,
      productImagePath: product.image,
      cta: script.endCard,
      keywords: post.tags || [],
      scenes: [
        ...script.scenes.map((s, i) => ({
          text: i === 0 ? script.hook : s.text,
          query: s.query,
          seconds: 5,
          broll: String(s.query).split(/\s+/).slice(0, 4),
        })),
        { text: script.endCard, product: true, endCard: true, seconds: 5 },
      ],
    }],
  }, null, 2));

  run('node', ['scripts/create-quality-seed-videos.mjs'], { VIDEO_PRODUCT_CONFIG: path.relative(PROJECT, configFile), PRODUCT_ID: id });
  run('node', ['scripts/add-audio-to-seed-videos.mjs'], { PRODUCT_IDS: id, REPLACE_ORIGINAL_AUDIO: '1' });
  const mp4 = path.join(VIDEOS_DIR, `${id}.mp4`);
  const jpg = path.join(VIDEOS_DIR, `${id}.jpg`);
  run('node', ['scripts/validate-social-video.mjs'], { VIDEO_FILE: mp4 });

  const { blogDir, publicBase } = bucketConfig();
  const files = [mp4, ...(fs.existsSync(jpg) ? [jpg] : [])];
  const up = capture('gcloud', ['storage', 'cp', ...files, `${blogDir}/`], { timeout: 600000 });
  if (!up.ok) throw new Error(`Upload to ${blogDir} failed: ${up.stderr.slice(0, 300)}`);
  if (process.env.MAKE_GCS_VIDEOS_PUBLIC === '1') {
    capture('gcloud', ['storage', 'objects', 'update', `${blogDir}/${id}.*`, '--add-acl-grant=entity=AllUsers,role=READER']);
  }

  const manifest = {
    slug: post.slug,
    title: post.title,
    category: post.category,
    tags: post.tags || [],
    videoId: id,
    productId: product.id,
    videoUrl: `${publicBase}/blog/${id}.mp4`,
    posterUrl: fs.existsSync(jpg) ? `${publicBase}/blog/${id}.jpg` : `${SITE_URL}${product.image}`,
    script,
    renderedAt: new Date().toISOString(),
  };
  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
  state.posts[post.slug] = { status: 'rendered', videoId: id, videoUrl: manifest.videoUrl, at: manifest.renderedAt, manifest };
  saveState(state);

  setOutput('has_post', 'true');
  setOutput('slug', post.slug);
  console.log(`[Blog Social] Rendered ${id}. Captions:\n${JSON.stringify(script.captions, null, 2)}`);
}

function hashtagsFor(manifest) {
  return (manifest.tags || []).slice(0, 5).map((t) => String(t).replace(/[^A-Za-z0-9]/g, '')).filter(Boolean);
}

async function post() {
  const manifestFile = arg('manifest') || MANIFEST;
  const manifest = readJson(manifestFile, null);
  if (!manifest?.slug) throw new Error(`Manifest not found or invalid: ${manifestFile}`);

  hydrateSecrets(SECRET_NAMES);
  // The shared poster reads credentials when imported, so import after hydrating.
  const { SocialMediaAutoPoster, configuredPlatforms } = await import('../social-media-auto-post.mjs');

  const state = loadState();
  const entry = state.posts[manifest.slug] || {};
  const already = entry.platforms || {};

  const videoPath = path.join(VIDEOS_DIR, `${manifest.videoId}.mp4`);
  if (!fs.existsSync(videoPath)) throw new Error(`Rendered video missing: ${videoPath}`);

  const postLink = `${SITE_URL}/blog/${manifest.slug}`;
  if (!(await urlIsReachable(postLink))) {
    throw new Error(`${postLink} is not live yet (waiting on the site deploy). Re-run this job once it is.`);
  }
  const videoReachable = await urlIsReachable(manifest.videoUrl);

  const { script } = manifest;
  const c = script.captions;
  const links = script.links;
  const product = { id: manifest.videoId, name: manifest.title, description: script.hook, category: manifest.category, keywords: manifest.tags };

  class BlogPoster extends SocialMediaAutoPoster {
    loadPostedContent() { return { instagram: {}, twitter: {}, youtube: {}, facebook: {}, pinterest: {} }; }
    savePostedContent() {}
    getPublicVideoUrl() { return manifest.videoUrl; }
    getImageUrl() { return manifest.posterUrl; }
    generateSocialContent(_product, platform) {
      switch (platform) {
        case 'instagram': return { caption: `${c.instagram}\n\nRead the full guide: link in bio or ${postLink}`, alt_text: manifest.title };
        case 'facebook': return { message: `${c.facebook}\n\nRead more: ${links.facebook}`, link: links.facebook };
        case 'twitter': return { text: `${c.twitter}\n${links.twitter}`, alt_text: manifest.title };
        case 'youtube': return {
          title: c.youtubeTitle,
          description: `${c.youtubeDescription}\n\nRead the full article: ${links.youtube}`,
          tags: hashtagsFor(manifest),
          category_id: '26',
        };
        case 'pinterest': return { title: c.pinterestTitle, description: c.pinterestDescription, link: links.pinterest, alt_text: manifest.title };
        default: return null;
      }
    }
  }

  const poster = new BlogPoster();
  poster.assertPublishableVideo(product);

  const platforms = configuredPlatforms(process.env);
  if (hasTikTokCredentials()) platforms.push('tiktok');
  console.log(`[Blog Social] Platforms: ${platforms.join(', ') || 'none configured'}`);
  if (!platforms.length) throw new Error('No social platforms are configured.');

  const methods = {
    instagram: () => poster.postToInstagram(product),
    facebook: () => poster.postToFacebook(product),
    twitter: () => poster.postToTwitter(product),
    youtube: () => poster.uploadToYouTube(product),
    pinterest: () => poster.postToPinterest(product),
    tiktok: () => postVideoToTikTok({ videoPath, caption: `${c.tiktok}\n\nFull guide at NaturesWaySoil.com` }),
  };

  const results = { ...already };
  const errors = {};
  for (const platform of platforms) {
    if (already[platform] && !already[platform].pending) {
      console.log(`[Blog Social] Already posted to ${platform}; skipping.`);
      continue;
    }
    if ((platform === 'instagram' || platform === 'facebook') && !videoReachable) {
      errors[platform] = `video URL is not publicly reachable: ${manifest.videoUrl}`;
      continue;
    }
    try {
      results[platform] = { ...assertPostResult(platform === 'tiktok' && already.tiktok?.pending ? await checkTikTokPublish(already.tiktok) : await methods[platform](), platform), at: new Date().toISOString() };
      // Save each confirmed post immediately, so retries after interruption do not repost it.
      state.posts[manifest.slug] = { ...entry, status: 'partial', manifest, videoId: manifest.videoId, videoUrl: manifest.videoUrl, platforms: { ...results }, at: new Date().toISOString() };
      saveState(state);
      if (results[platform].pending) {
        errors[platform] = 'Accepted by platform; publication is still pending';
        console.log(`[Blog Social] ${platform} pending; retaining publish ID for status checks.`);
      } else console.log(`[Blog Social] ✅ ${platform}`);
    } catch (error) {
      errors[platform] = error.message;
      console.log(`[Blog Social] ❌ ${platform}: ${error.message}`);
    }
  }

  const posted = Object.keys(results).filter(platform => !results[platform].pending);
  state.posts[manifest.slug] = {
    ...entry,
    manifest,
    status: posted.length ? (Object.keys(errors).length ? 'partial' : 'posted') : 'failed',
    videoId: manifest.videoId,
    videoUrl: manifest.videoUrl,
    platforms: results,
    errors,
    at: new Date().toISOString(),
  };
  saveState(state);

  if (Object.keys(errors).length) throw new Error(`Social publishing incomplete: ${JSON.stringify(errors)}`);
  if (!posted.length) throw new Error(`Nothing was posted: ${JSON.stringify(errors)}`);
  console.log(`[Blog Social] Posted to ${posted.join(', ')}${Object.keys(errors).length ? `; failed: ${Object.keys(errors).join(', ')}` : ''}.`);
}

const command = process.argv[2];
const handlers = { render, post };
if (!handlers[command]) {
  console.error('Usage: node scripts/blog-social/job.mjs render [--slug <slug>] | post [--manifest <file>]');
  process.exit(2);
}
handlers[command]().catch((error) => {
  console.error(`[Blog Social] Failed: ${error.message}`);
  process.exit(1);
});
