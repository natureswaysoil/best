#!/usr/bin/env node
/**
 * Complete Social Media Automation System
 * Automatically posts generated videos to Instagram, Twitter, and YouTube
 * Integrates with the video generation pipeline
 */

import { createReadStream } from 'fs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createHmac } from 'crypto';
import { buildForcedSocialContent } from './social-caption-overrides.mjs';
generateSocialContent(product, platform) {const forced = buildForcedSocialContent({
  product,
  platform,
  baseUrl: WEBSITE_BASE_URL,
});

if (forced) {
  this.log(
    `Using forced ${platform} variation caption for ${product.id}: ${
      process.env.SOCIAL_VARIATION_HOOK || 'variation'
    }`
  );
  return forced;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT = path.resolve(__dirname, '..');

// API Configuration
const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const INSTAGRAM_IG_ID = process.env.INSTAGRAM_IG_ID;
const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
const YOUTUBE_CLIENT_ID = process.env.YT_CLIENT_ID;
const YOUTUBE_CLIENT_SECRET = process.env.YT_CLIENT_SECRET;
const YOUTUBE_REFRESH_TOKEN = process.env.YT_REFRESH_TOKEN;
const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID;
const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_PAGE_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
const PINTEREST_ACCESS_TOKEN = process.env.PINTEREST_ACCESS_TOKEN;
const PINTEREST_BOARD_ID = process.env.PINTEREST_BOARD_ID;

// Configuration
const VIDEOS_DIR = path.join(PROJECT, 'public', 'videos');
const PRODUCTS_FILE = path.join(PROJECT, 'data', 'products.ts');
const SHEET_PRODUCTS_FILE = path.join(PROJECT, 'content', 'video-scripts', 'sheet-products.json');
const POSTED_SOCIAL_FILE = path.join(PROJECT, 'social-posted-content.json');
const WEBSITE_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.natureswaysoil.com';

class SocialMediaAutoPoster {
  constructor() {
    this.postedContent = this.loadPostedContent();
    this.warnRootLevelMp4Ignored();
  }

  getVideoPath(product) {
    return path.join(VIDEOS_DIR, `${product.id}.mp4`);
  }

  hasLocalVideo(product) {
    const videoPath = this.getVideoPath(product);
    if (!fs.existsSync(videoPath)) {
      return false;
    }

    try {
      const realVideoPath = fs.realpathSync(videoPath);
      const realVideosDir = fs.realpathSync(VIDEOS_DIR);
      const canonicalPrefix = `${realVideosDir}${path.sep}`;

      if (!realVideoPath.startsWith(canonicalPrefix)) {
        this.log(`Ignoring non-canonical video path: ${realVideoPath}`);
        return false;
      }
    } catch (error) {
      this.log(`Warning: failed canonical path check for ${videoPath}: ${error.message}`);
      return false;
    }

    return true;
  }

  warnRootLevelMp4Ignored() {
    try {
      const rootMp4s = fs
        .readdirSync(PROJECT)
        .filter((name) => /\.mp4$/i.test(name));

      if (rootMp4s.length > 0) {
        this.log('🛡️ Root-level MP4 files are ignored by automation:');
        rootMp4s.forEach((name) => this.log(`   - ${name}`));
        this.log('   Canonical source is public/videos/{PRODUCT_ID}.mp4 only.');
      }
    } catch (error) {
      this.log(`Warning: unable to scan root-level MP4 guard: ${error.message}`);
    }
  }

  getPublicVideoUrl(product) {
    return `${WEBSITE_BASE_URL}/videos/${product.id}.mp4`;
  }

  getActivePlatforms() {
    const active = [];
    if (INSTAGRAM_ACCESS_TOKEN && INSTAGRAM_IG_ID) active.push('instagram');
    if (process.env.TWITTER_API_KEY && process.env.TWITTER_ACCESS_TOKEN) active.push('twitter');
    if (process.env.YT_CLIENT_ID && process.env.YT_CLIENT_SECRET && process.env.YT_REFRESH_TOKEN) active.push('youtube');
    if (FACEBOOK_PAGE_ID && (FACEBOOK_PAGE_ACCESS_TOKEN || FACEBOOK_ACCESS_TOKEN)) active.push('facebook');
    if (PINTEREST_ACCESS_TOKEN && PINTEREST_BOARD_ID) active.push('pinterest');
    return active;
  }

  log(message) {
    console.log(`[Social Auto-Post] ${new Date().toISOString()} - ${message}`);
  }

  loadPostedContent() {
    try {
      if (fs.existsSync(POSTED_SOCIAL_FILE)) {
        return JSON.parse(fs.readFileSync(POSTED_SOCIAL_FILE, 'utf8'));
      }
    } catch (e) {
      this.log(`Warning: Could not load posted content file: ${e.message}`);
    }
    return { instagram: {}, twitter: {}, youtube: {}, facebook: {}, pinterest: {} };
  }

  savePostedContent() {
    try {
      fs.writeFileSync(POSTED_SOCIAL_FILE, JSON.stringify(this.postedContent, null, 2));
    } catch (e) {
      this.log(`Error saving posted content: ${e.message}`);
    }
  }

  loadProducts() {
    try {
      // Prefer Google Sheets cache when available so product selection follows sheet data.
      if (fs.existsSync(SHEET_PRODUCTS_FILE)) {
        const sheetData = JSON.parse(fs.readFileSync(SHEET_PRODUCTS_FILE, 'utf8'));
        if (Array.isArray(sheetData.products) && sheetData.products.length > 0) {
          const sheetProducts = sheetData.products
            .map((p) => {
              const id = p.id || (p.asin ? `ASIN_${p.asin}` : null);
              const name = p.name || p.asin || '';
              const description = p.description || '';
              const category = p.category || 'General';
              const keywords = Array.isArray(p.keywords) ? p.keywords : [];
              return { id, name, description, category, keywords };
            })
            .filter((p) => p.id && p.name)
            .filter((p) => /^NWS_\d{3}$/.test(p.id));

          if (sheetProducts.length > 0) {
            this.log(`Using Google Sheets cache for product selection (${sheetProducts.length} products)`);
            return sheetProducts;
          }
        }
      }

      const ts = fs.readFileSync(PRODUCTS_FILE, 'utf8');
      const products = [];
      const productBlocks = ts.split(/\n\s*},\s*\n\s*{\s*id:/).map((block, idx) => 
        (idx === 0 ? block : '{ id:' + block)
      );

      for (const block of productBlocks) {
        const idMatch = block.match(/id:\s*'([^']+)'/);
        const nameMatch = block.match(/name:\s*'([^']+)'/);
        const descriptionMatch = block.match(/description:\s*'([^']+)'/);
        const categoryMatch = block.match(/category:\s*'([^']+)'/);
        const keywordsMatch = block.match(/keywords:\s*\[(.*?)\]/s);

        if (!idMatch || !nameMatch) continue;

        const id = idMatch[1];
        const name = nameMatch[1];
        const description = descriptionMatch ? descriptionMatch[1] : '';
        const category = categoryMatch ? categoryMatch[1] : '';
        
        let keywords = [];
        if (keywordsMatch) {
          const inner = keywordsMatch[1];
          keywords = Array.from(inner.matchAll(/'([^']+)'/g)).map(m => m[1]);
        }

        products.push({ id, name, description, category, keywords });
      }

      return products.filter(p => /^NWS_\d{3}$/.test(p.id));
    } catch (error) {
      this.log(`Error loading products: ${error.message}`);
      return [];
    }
  }

  normalizeWhitespace(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  shortProductName(name, maxLen = 44) {
    const normalized = this.normalizeWhitespace(name)
      .split('/')[0]
      .split(' - ')[0]
      .trim();

    if (normalized.length <= maxLen) return normalized;
    return `${normalized.slice(0, maxLen - 1).trimEnd()}…`;
  }

  truncateWithEllipsis(value, maxLen) {
    const normalized = this.normalizeWhitespace(value);
    if (normalized.length <= maxLen) return normalized;
    return `${normalized.slice(0, maxLen - 1).trimEnd()}…`;
  }

  generateSocialContent(product, platform) {
    const lawnProblems = [
      'yellow grass', 'brown patches', 'thin lawn', 'bare spots', 
      'weeds', 'poor soil', 'lawn not growing', 'dead grass'
    ];
    
    const benefits = [
      'thicker grass', 'greener lawn', 'healthier soil', 'faster growth',
      'stronger roots', 'drought resistant', 'organic solution', 'pet safe'
    ];

    const randomProblem = lawnProblems[Math.floor(Math.random() * lawnProblems.length)];
    const randomBenefit = benefits[Math.floor(Math.random() * benefits.length)];
    const conciseName = this.shortProductName(product.name);

    const hashtags = {
      instagram: '#LawnCare #OrganicGardening #HealthyLawn #PetSafe #GreenLawn #LawnGoals #GardeningLife #SoilHealth #LawnTips #OrganicLawn',
      twitter: '#LawnCare #OrganicGardening #HealthyLawn #PetSafe #GreenLawn #LawnTips',
      youtube: 'lawn care, organic gardening, healthy lawn, pet safe, green lawn, soil health',
      facebook: '#LawnCare #OrganicGardening #HealthyLawn #PetSafe #NaturesWaySoil',
      pinterest: '#LawnCare #OrganicGarden #HealthyLawn #PetSafeLawn #GreenLawn #LawnTips #GardenInspiration'
    };

    const content = {
      instagram: {
        caption: `Transform your ${randomProblem} into ${randomBenefit}! 🌱\n\n${product.name} delivers natural lawn care results you can trust.\n\n✅ Pet & kid safe\n✅ Organic ingredients\n✅ Fast-acting formula\n✅ Easy application\n\nShop now: ${WEBSITE_BASE_URL}/product/${product.id}\n\n${hashtags.instagram}`,
        alt_text: `${product.name} - Natural lawn care solution for ${randomProblem}`
      },
      twitter: {
        text: `🌱 Fix ${randomProblem} naturally! ${product.name} delivers ${randomBenefit} with organic ingredients. Pet-safe ✅ Fast results ✅\n\nLearn more: ${WEBSITE_BASE_URL}/product/${product.id}\n\n${hashtags.twitter}`,
        alt_text: `${product.name} for natural lawn care`
      },
      youtube: {
        title: this.truncateWithEllipsis(`Fix ${randomProblem} Naturally - ${conciseName}`, 100),
        description: `Transform your lawn with ${product.name}! This natural, pet-safe solution tackles ${randomProblem} to give you ${randomBenefit}.\n\n🌱 What You'll Learn:\n• How to identify ${randomProblem}\n• Safe, organic treatment options\n• Step-by-step application guide\n• Expected results timeline\n\n✅ Product Benefits:\n• Pet & family safe\n• Organic ingredients\n• Fast-acting formula\n• Easy application\n• Proven results\n\n🛒 Shop ${product.name}:\n${WEBSITE_BASE_URL}/product/${product.id}\n\n📧 Questions? Contact us at support@natureswaysoil.com\n\nTags: ${hashtags.youtube}`,
        tags: hashtags.youtube.split(', '),
        category_id: '26' // Howto & Style
      },
      facebook: {
        message: `🌱 Struggling with ${randomProblem}? Nature's Way Soil has you covered!\n\n${product.name} is your organic, pet-safe solution to achieve ${randomBenefit}. Made with natural ingredients that work with your lawn, not against it.\n\n✅ Pet & family safe\n✅ Organic ingredients\n✅ Fast-acting results\n✅ Easy to apply\n\n👉 Shop now: ${WEBSITE_BASE_URL}/product/${product.id}\n\n${hashtags.facebook}`,
        link: `${WEBSITE_BASE_URL}/product/${product.id}`
      },
      pinterest: {
        title: this.truncateWithEllipsis(`${conciseName} - Fix ${randomProblem} Naturally`, 100),
        description: `Tired of ${randomProblem}? ${product.name} delivers ${randomBenefit} using safe, organic ingredients. Perfect for pet owners and families who want a beautiful lawn without harsh chemicals.\n\n✅ Pet & family safe\n✅ Organic & natural\n✅ Easy application\n\nShop here: ${WEBSITE_BASE_URL}/product/${product.id}\n\n${hashtags.pinterest}`,
        link: `${WEBSITE_BASE_URL}/product/${product.id}`,
        alt_text: `${product.name} - organic lawn care solution`
      }
    };

    return content[platform];
  }

  // Instagram Methods
  async postToInstagram(product) {
    try {
      if (!INSTAGRAM_ACCESS_TOKEN || !INSTAGRAM_IG_ID) {
        throw new Error('Instagram credentials not configured');
      }

      if (this.postedContent.instagram[product.id]) {
        this.log(`Already posted to Instagram: ${product.id}`);
        return this.postedContent.instagram[product.id];
      }

      const content = this.generateSocialContent(product, 'instagram');
      
      const imageUrl = `${WEBSITE_BASE_URL}/images/products/${product.id}/main.jpg`;
      const videoUrl = this.getPublicVideoUrl(product);
      const shouldTryVideo = this.hasLocalVideo(product) && process.env.SOCIAL_FORCE_IMAGE_ONLY !== '1';

      // Prefer short-form video posts when product video exists, with image fallback.
      const mediaData = shouldTryVideo
        ? {
            media_type: 'REELS',
            video_url: videoUrl,
            caption: content.caption,
            share_to_feed: true,
            access_token: INSTAGRAM_ACCESS_TOKEN
          }
        : {
            image_url: imageUrl,
            caption: content.caption,
            access_token: INSTAGRAM_ACCESS_TOKEN
          };

      // Create media object
      const createResponse = await fetch(`https://graph.facebook.com/v19.0/${INSTAGRAM_IG_ID}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mediaData)
      });

      if (!createResponse.ok) {
        const error = await createResponse.text();
        throw new Error(`Instagram media creation failed: ${createResponse.status} - ${error}`);
      }

      const mediaResult = await createResponse.json();
      const containerId = mediaResult.id;

      // Poll until media container is ready.
      let ready = false;
      for (let i = 0; i < 20; i++) {
        await new Promise(r => setTimeout(r, 3000));
        const statusRes = await fetch(
          `https://graph.facebook.com/v19.0/${containerId}?fields=status_code&access_token=${INSTAGRAM_ACCESS_TOKEN}`
        );
        const statusData = await statusRes.json();
        if (statusData.status_code === 'FINISHED') { ready = true; break; }
        if (statusData.status_code === 'ERROR') throw new Error(`Instagram media processing error: ${JSON.stringify(statusData)}`);
      }
      if (!ready) throw new Error('Instagram media container timed out waiting to be ready');

      // Publish the media
      const publishData = {
        creation_id: containerId,
        access_token: INSTAGRAM_ACCESS_TOKEN
      };

      const publishResponse = await fetch(`https://graph.facebook.com/v19.0/${INSTAGRAM_IG_ID}/media_publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(publishData)
      });

      if (!publishResponse.ok) {
        const error = await publishResponse.text();
        throw new Error(`Instagram publish failed: ${publishResponse.status} - ${error}`);
      }

      const publishResult = await publishResponse.json();

      // Store posted content info
      this.postedContent.instagram[product.id] = {
        postId: publishResult.id,
        mediaId: mediaResult.id,
        mediaType: shouldTryVideo ? 'video' : 'image',
        caption: content.caption,
        createdAt: new Date().toISOString(),
        productId: product.id
      };

      this.savePostedContent();
      this.log(`✅ Posted to Instagram: ${product.name} (${publishResult.id})`);
      
      return this.postedContent.instagram[product.id];

    } catch (error) {
      this.log(`❌ Instagram posting failed for ${product.name}: ${error.message}`);
      throw error;
    }
  }

  // Twitter Methods
  // FIX: Bearer token is READ-ONLY. Posting tweets requires OAuth 1.0a user context.
  buildOAuth1Header(method, url, bodyParams = {}) {
    const TWITTER_API_KEY = process.env.TWITTER_API_KEY;
    const TWITTER_API_SECRET = process.env.TWITTER_API_SECRET;
    const TWITTER_ACCESS_TOKEN = process.env.TWITTER_ACCESS_TOKEN;
    const TWITTER_ACCESS_SECRET = process.env.TWITTER_ACCESS_TOKEN_SECRET || process.env.TWITTER_ACCESS_SECRET;

    if (!TWITTER_API_KEY || !TWITTER_API_SECRET || !TWITTER_ACCESS_TOKEN || !TWITTER_ACCESS_SECRET) {
      throw new Error('Twitter OAuth 1.0a credentials missing: need TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_TOKEN_SECRET');
    }

    const oauthParams = {
      oauth_consumer_key: TWITTER_API_KEY,
      oauth_nonce: Math.random().toString(36).substring(2) + Date.now().toString(36),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_token: TWITTER_ACCESS_TOKEN,
      oauth_version: '1.0'
    };

    // Build signature base string
    const allParams = { ...oauthParams, ...bodyParams };
    const sortedParams = Object.keys(allParams).sort()
      .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(allParams[k])}`)
      .join('&');

    const sigBase = [
      method.toUpperCase(),
      encodeURIComponent(url),
      encodeURIComponent(sortedParams)
    ].join('&');

    const signingKey = `${encodeURIComponent(TWITTER_API_SECRET)}&${encodeURIComponent(TWITTER_ACCESS_SECRET)}`;

    // OAuth 1.0a for Twitter write APIs uses HMAC-SHA1.
    const signature = createHmac('sha1', signingKey).update(sigBase).digest('base64');

    oauthParams.oauth_signature = signature;

    const authHeader = 'OAuth ' + Object.keys(oauthParams).sort()
      .map(k => `${encodeURIComponent(k)}="${encodeURIComponent(oauthParams[k])}"`)
      .join(', ');

    return authHeader;
  }

  async postToTwitter(product) {
    try {
      const TWITTER_API_KEY = process.env.TWITTER_API_KEY;
      const TWITTER_ACCESS_TOKEN = process.env.TWITTER_ACCESS_TOKEN;

      if (!TWITTER_API_KEY || !TWITTER_ACCESS_TOKEN) {
        throw new Error('Twitter OAuth credentials not configured (need TWITTER_API_KEY + TWITTER_ACCESS_TOKEN)');
      }

      if (this.postedContent.twitter[product.id]) {
        this.log(`Already posted to Twitter: ${product.id}`);
        return this.postedContent.twitter[product.id];
      }

      const content = this.generateSocialContent(product, 'twitter');
      let tweetData;

      if (this.hasLocalVideo(product) && process.env.TWITTER_FORCE_LINK_ONLY !== '1') {
        try {
          const mediaId = await this.uploadVideoToTwitter(product);
          tweetData = {
            text: content.text,
            media: { media_ids: [mediaId] }
          };
        } catch (uploadError) {
          this.log(`Twitter native media upload failed, falling back to video link: ${uploadError.message}`);
          tweetData = {
            text: `${content.text}\n🎥 Watch: ${this.getPublicVideoUrl(product)}`
          };
        }
      } else {
        const videoText = this.hasLocalVideo(product)
          ? `\n🎥 Watch: ${this.getPublicVideoUrl(product)}`
          : '';
        tweetData = { text: `${content.text}${videoText}` };
      }

      const url = 'https://api.twitter.com/2/tweets';

      // Build OAuth 1.0a header (required for write operations)
      const authHeader = await this.buildOAuth1Header('POST', url, {});

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tweetData)
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Twitter posting failed: ${response.status} - ${error}`);
      }

      const result = await response.json();

      this.postedContent.twitter[product.id] = {
        tweetId: result.data.id,
        mediaId: tweetData.media?.media_ids?.[0] || null,
        usedNativeMediaUpload: Boolean(tweetData.media?.media_ids?.[0]),
        text: content.text,
        createdAt: new Date().toISOString(),
        productId: product.id
      };

      this.savePostedContent();
      this.log(`✅ Posted to Twitter: ${product.name} (${result.data.id})`);

      return this.postedContent.twitter[product.id];

    } catch (error) {
      this.log(`❌ Twitter posting failed for ${product.name}: ${error.message}`);
      throw error;
    }
  }

  async uploadVideoToTwitter(product) {
    const videoPath = this.getVideoPath(product);
    if (!this.hasLocalVideo(product)) {
      throw new Error(`No video file found at ${videoPath}`);
    }

    const uploadUrl = 'https://upload.twitter.com/1.1/media/upload.json';
    const videoBuffer = fs.readFileSync(videoPath);
    const totalBytes = videoBuffer.length;
    const chunkSize = 5 * 1024 * 1024; // 5MB per chunk

    this.log(`Twitter upload init for ${product.id} (${(totalBytes / 1024 / 1024).toFixed(1)}MB)`);

    const initParams = {
      command: 'INIT',
      total_bytes: totalBytes.toString(),
      media_type: 'video/mp4',
      media_category: 'tweet_video'
    };

    const initAuthHeader = this.buildOAuth1Header('POST', uploadUrl, initParams);
    const initResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': initAuthHeader,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams(initParams)
    });

    if (!initResponse.ok) {
      const initErr = await initResponse.text();
      throw new Error(`Twitter upload INIT failed: ${initResponse.status} - ${initErr}`);
    }

    const initData = await initResponse.json();
    const mediaId = initData.media_id_string || String(initData.media_id);
    if (!mediaId) {
      throw new Error(`Twitter upload INIT returned no media id: ${JSON.stringify(initData)}`);
    }

    for (let offset = 0, segmentIndex = 0; offset < totalBytes; offset += chunkSize, segmentIndex++) {
      const chunk = videoBuffer.subarray(offset, Math.min(offset + chunkSize, totalBytes));
      const appendAuthHeader = this.buildOAuth1Header('POST', uploadUrl, {});
      const form = new FormData();
      form.append('command', 'APPEND');
      form.append('media_id', mediaId);
      form.append('segment_index', String(segmentIndex));
      form.append('media', new Blob([chunk], { type: 'video/mp4' }), `${product.id}.mp4`);

      const appendResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': appendAuthHeader
        },
        body: form
      });

      if (!appendResponse.ok) {
        const appendErr = await appendResponse.text();
        throw new Error(`Twitter upload APPEND failed (segment ${segmentIndex}): ${appendResponse.status} - ${appendErr}`);
      }
    }

    const finalizeParams = {
      command: 'FINALIZE',
      media_id: mediaId
    };
    const finalizeAuthHeader = this.buildOAuth1Header('POST', uploadUrl, finalizeParams);
    const finalizeResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': finalizeAuthHeader,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams(finalizeParams)
    });

    if (!finalizeResponse.ok) {
      const finalizeErr = await finalizeResponse.text();
      throw new Error(`Twitter upload FINALIZE failed: ${finalizeResponse.status} - ${finalizeErr}`);
    }

    let finalizeData = await finalizeResponse.json();

    if (finalizeData.processing_info) {
      finalizeData = await this.waitForTwitterMediaProcessing(uploadUrl, mediaId, finalizeData.processing_info);
    }

    this.log(`Twitter media upload complete for ${product.id}: media_id=${mediaId}`);
    return mediaId;
  }

  async waitForTwitterMediaProcessing(uploadUrl, mediaId, processingInfo) {
    let info = processingInfo;

    for (let i = 0; i < 15; i++) {
      if (info.state === 'succeeded') {
        return { media_id_string: mediaId, processing_info: info };
      }
      if (info.state === 'failed') {
        const err = info.error ? `${info.error.code}: ${info.error.message}` : 'unknown processing error';
        throw new Error(`Twitter media processing failed: ${err}`);
      }

      const waitMs = Math.max((info.check_after_secs || 2) * 1000, 2000);
      await sleep(waitMs);

      const statusParams = {
        command: 'STATUS',
        media_id: mediaId
      };
      const statusAuthHeader = this.buildOAuth1Header('GET', uploadUrl, statusParams);
      const statusUrl = `${uploadUrl}?${new URLSearchParams(statusParams).toString()}`;

      const statusResponse = await fetch(statusUrl, {
        method: 'GET',
        headers: {
          'Authorization': statusAuthHeader
        }
      });

      if (!statusResponse.ok) {
        const statusErr = await statusResponse.text();
        throw new Error(`Twitter upload STATUS failed: ${statusResponse.status} - ${statusErr}`);
      }

      const statusData = await statusResponse.json();
      info = statusData.processing_info || { state: 'succeeded' };
    }

    throw new Error('Twitter media processing timed out');
  }

  // YouTube Methods
  async getYouTubeAccessToken() {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.YT_CLIENT_ID,
        client_secret: process.env.YT_CLIENT_SECRET,
        refresh_token: process.env.YT_REFRESH_TOKEN,
        grant_type: 'refresh_token'
      })
    });
    if (!tokenResponse.ok) {
      const err = await tokenResponse.text();
      throw new Error(`YouTube token refresh failed: ${tokenResponse.status} - ${err}`);
    }
    const data = await tokenResponse.json();
    if (!data.access_token) {
      throw new Error(`YouTube token refresh returned no access_token: ${JSON.stringify(data)}`);
    }
    return data.access_token;
  }

  async uploadToYouTube(product) {
    try {
      if (!process.env.YT_CLIENT_ID || !process.env.YT_CLIENT_SECRET || !process.env.YT_REFRESH_TOKEN) {
        throw new Error('YouTube credentials not configured (need YT_CLIENT_ID, YT_CLIENT_SECRET, YT_REFRESH_TOKEN)');
      }

      if (this.postedContent.youtube[product.id]) {
        this.log(`Already uploaded to YouTube: ${product.id}`);
        return this.postedContent.youtube[product.id];
      }

      // Check if video file exists for this product
      const videoPath = this.getVideoPath(product);
      if (!this.hasLocalVideo(product)) {
        throw new Error(`No video file found at ${videoPath} — run HeyGen generation first`);
      }

      this.log(`Uploading ${product.id} to YouTube...`);

      // Step 1: Get fresh access token
      const accessToken = await this.getYouTubeAccessToken();

      const content = this.generateSocialContent(product, 'youtube');
      const videoStats = fs.statSync(videoPath);
      const videoSize = videoStats.size;

      // Step 2: Initialize resumable upload session
      const initResponse = await fetch(
        'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Upload-Content-Type': 'video/mp4',
            'X-Upload-Content-Length': videoSize.toString()
          },
          body: JSON.stringify({
            snippet: {
              title: content.title,
              description: content.description,
              tags: content.tags,
              categoryId: '26', // Howto & Style
              defaultLanguage: 'en',
              defaultAudioLanguage: 'en'
            },
            status: {
              privacyStatus: 'public',
              selfDeclaredMadeForKids: false
            }
          })
        }
      );

      if (!initResponse.ok) {
        const err = await initResponse.text();
        throw new Error(`YouTube upload init failed: ${initResponse.status} - ${err}`);
      }

      const uploadUrl = initResponse.headers.get('location');
      if (!uploadUrl) {
        throw new Error('YouTube did not return an upload URL');
      }

      this.log(`Upload session created, uploading ${(videoSize / 1024 / 1024).toFixed(1)}MB...`);

      // Step 3: Upload the actual video file
      const videoStream = createReadStream(videoPath);

      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Length': videoSize.toString()
        },
        body: videoStream,
        duplex: 'half'
      });

      if (!uploadResponse.ok && uploadResponse.status !== 308) {
        const err = await uploadResponse.text();
        throw new Error(`YouTube video upload failed: ${uploadResponse.status} - ${err}`);
      }

      const rawUploadResult = await uploadResponse.text();
      const uploadResult = rawUploadResult ? JSON.parse(rawUploadResult) : {};
      const videoId = uploadResult.id;

      if (!videoId) {
        throw new Error(`YouTube upload completed but no video ID returned: ${JSON.stringify(uploadResult)}`);
      }

      this.postedContent.youtube[product.id] = {
        videoId,
        title: content.title,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        createdAt: new Date().toISOString(),
        productId: product.id,
        status: 'uploaded'
      };

      this.savePostedContent();
      this.log(`✅ YouTube upload complete: ${product.name} → https://www.youtube.com/watch?v=${videoId}`);

      return this.postedContent.youtube[product.id];

    } catch (error) {
      this.log(`❌ YouTube upload failed for ${product.name}: ${error.message}`);
      throw error;
    }
  }

  // Facebook Methods
  async resolveFacebookPageAccessToken() {
    if (!FACEBOOK_PAGE_ID) {
      throw new Error('FACEBOOK_PAGE_ID is required for Facebook posting');
    }

    if (FACEBOOK_PAGE_ACCESS_TOKEN) {
      this.log('Using FACEBOOK_PAGE_ACCESS_TOKEN for Facebook posting');
      return FACEBOOK_PAGE_ACCESS_TOKEN;
    }

    if (!FACEBOOK_ACCESS_TOKEN) {
      throw new Error('Facebook token missing: set FACEBOOK_PAGE_ACCESS_TOKEN or FACEBOOK_ACCESS_TOKEN');
    }

    // If FACEBOOK_ACCESS_TOKEN is already a Page token, this probe succeeds.
    const directProbe = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_PAGE_ID}?fields=id,name&access_token=${encodeURIComponent(FACEBOOK_ACCESS_TOKEN)}`
    );

    if (directProbe.ok) {
      this.log('FACEBOOK_ACCESS_TOKEN appears to be a valid Page token');
      return FACEBOOK_ACCESS_TOKEN;
    }

    // Otherwise, treat FACEBOOK_ACCESS_TOKEN as a user token and resolve page token via /me/accounts.
    const pageTokenResponse = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,access_token&limit=200&access_token=${encodeURIComponent(FACEBOOK_ACCESS_TOKEN)}`
    );

    if (!pageTokenResponse.ok) {
      const errText = await pageTokenResponse.text();
      throw new Error(
        `Could not resolve Page access token via /me/accounts: ${pageTokenResponse.status} - ${errText}`
      );
    }

    const pageTokenData = await pageTokenResponse.json();
    const pages = Array.isArray(pageTokenData.data) ? pageTokenData.data : [];
    const pageMatch = pages.find((page) => String(page.id) === String(FACEBOOK_PAGE_ID));

    if (!pageMatch?.access_token) {
      throw new Error(
        `No Page access token found for page ${FACEBOOK_PAGE_ID}. Ensure token has pages_show_list and pages_manage_posts.`
      );
    }

    this.log('Resolved Facebook Page access token from /me/accounts');
    return pageMatch.access_token;
  }

  async postToFacebook(product) {
    try {
      if (!FACEBOOK_PAGE_ID || (!FACEBOOK_PAGE_ACCESS_TOKEN && !FACEBOOK_ACCESS_TOKEN)) {
        throw new Error('Facebook credentials not configured (need FACEBOOK_PAGE_ID plus FACEBOOK_PAGE_ACCESS_TOKEN or FACEBOOK_ACCESS_TOKEN)');
      }

      if (this.postedContent.facebook[product.id]) {
        this.log(`Already posted to Facebook: ${product.id}`);
        return this.postedContent.facebook[product.id];
      }

      const facebookPageToken = await this.resolveFacebookPageAccessToken();

      const content = this.generateSocialContent(product, 'facebook');
      const imageUrl = `${WEBSITE_BASE_URL}/images/products/${product.id}/main.jpg`;
      const videoUrl = this.getPublicVideoUrl(product);
      const shouldTryVideo = this.hasLocalVideo(product) && process.env.SOCIAL_FORCE_IMAGE_ONLY !== '1';

      let response;
      let mediaType = shouldTryVideo ? 'video' : 'image';
      if (shouldTryVideo) {
        response = await fetch(
          `https://graph.facebook.com/v19.0/${FACEBOOK_PAGE_ID}/videos`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              file_url: videoUrl,
              title: product.name.slice(0, 100),
              description: content.message,
              published: true,
              access_token: facebookPageToken
            })
          }
        );

        if (!response.ok) {
          const videoErr = await response.text();
          this.log(`Facebook video upload failed, falling back to image post: ${response.status} - ${videoErr}`);
          response = null;
          mediaType = 'image';
        }
      }

      if (!response) {
        // Fallback 1: image post to Page photos endpoint.
        response = await fetch(
          `https://graph.facebook.com/v19.0/${FACEBOOK_PAGE_ID}/photos`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: imageUrl,
              caption: content.message,
              published: true,
              access_token: facebookPageToken
            })
          }
        );

        if (!response.ok) {
          const photoErr = await response.text();
          this.log(`Facebook photo upload failed, falling back to feed link post: ${response.status} - ${photoErr}`);

          // Fallback 2: feed link post, supported with pages_manage_posts.
          response = await fetch(
            `https://graph.facebook.com/v19.0/${FACEBOOK_PAGE_ID}/feed`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                message: content.message,
                link: content.link,
                access_token: facebookPageToken
              })
            }
          );
          mediaType = 'link';
        }
      }

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Facebook API error: ${response.status} - ${err}`);
      }

      const data = await response.json();
      const postId = data.post_id || data.id;

      this.postedContent.facebook[product.id] = {
        postId,
        url: `https://www.facebook.com/${FACEBOOK_PAGE_ID}/posts/${postId}`,
        mediaType,
        createdAt: new Date().toISOString(),
        productId: product.id
      };

      this.savePostedContent();
      this.log(`✅ Facebook post created: ${product.name} → post ${postId}`);
      return this.postedContent.facebook[product.id];

    } catch (error) {
      this.log(`❌ Facebook post failed for ${product.name}: ${error.message}`);
      throw error;
    }
  }

  // Pinterest Methods
  async postToPinterest(product) {
    try {
      if (!PINTEREST_ACCESS_TOKEN || !PINTEREST_BOARD_ID) {
        throw new Error('Pinterest credentials not configured (need PINTEREST_ACCESS_TOKEN, PINTEREST_BOARD_ID)');
      }

      if (this.postedContent.pinterest[product.id]) {
        this.log(`Already posted to Pinterest: ${product.id}`);
        return this.postedContent.pinterest[product.id];
      }

      const content = this.generateSocialContent(product, 'pinterest');
      const imageUrl = `${WEBSITE_BASE_URL}/images/products/${product.id}/main.jpg`;

      const requestedBase = (process.env.PINTEREST_API_BASE_URL || '').trim();
      const testMode = process.env.PINTEREST_TEST_MODE === '1';
      const productionBase = 'https://api.pinterest.com';
      const sandboxBase = 'https://api-sandbox.pinterest.com';
      const initialBase = requestedBase || (testMode ? sandboxBase : productionBase);

      const createPin = async (apiBase) => fetch(`${apiBase}/v5/pins`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PINTEREST_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          board_id: PINTEREST_BOARD_ID,
          title: content.title,
          description: content.description,
          link: content.link,
          media_source: {
            source_type: 'image_url',
            url: imageUrl
          },
          alt_text: content.alt_text
        })
      });

      let apiBase = initialBase;
      let response = await createPin(apiBase);
      let errText = response.ok ? '' : await response.text();

      if (!response.ok) {
        let errCode = null;
        try {
          const parsed = JSON.parse(errText);
          errCode = parsed?.code;
        } catch {
          // Ignore parse errors.
        }

        const trialAccessError = response.status === 403 && (errCode === 29 || /Trial access/i.test(errText));

        if (trialAccessError) {
          throw new Error(
            'Pinterest app is in Trial access mode — pin creation is blocked in production. ' +
            'To fix: go to https://developers.pinterest.com/apps/ → select your app → request Standard/Advanced access. ' +
            'Once approved, posting will work automatically.'
          );
        }
      }

      if (!response.ok) {
        throw new Error(`Pinterest API error (${apiBase}): ${response.status} - ${errText}`);
      }

      const data = await response.json();
      const pinId = data.id;
      const isSandbox = apiBase === sandboxBase;

      this.postedContent.pinterest[product.id] = {
        pinId,
        url: isSandbox ? `${sandboxBase}/v5/pins/${pinId}` : `https://www.pinterest.com/pin/${pinId}`,
        apiBase,
        sandboxMode: isSandbox,
        createdAt: new Date().toISOString(),
        productId: product.id
      };

      this.savePostedContent();
      this.log(
        `✅ Pinterest pin created (${isSandbox ? 'sandbox' : 'production'}): ${product.name} → ${this.postedContent.pinterest[product.id].url}`
      );
      return this.postedContent.pinterest[product.id];

    } catch (error) {
      this.log(`❌ Pinterest post failed for ${product.name}: ${error.message}`);
      throw error;
    }
  }

  async processNewVideos() {
    try {
      this.log('Starting social media auto-posting process...');

      const products = this.loadProducts();
      if (!products.length) {
        this.log('No products found');
        return;
      }

      const activePlatforms = this.getActivePlatforms();
      this.log(`Active platforms this run: ${activePlatforms.join(', ') || 'none configured'}`);

      this.log(`Found ${products.length} products to process`);

      // Pick ONE product per run — the next one not yet posted to any platform
      const unposted = products.filter(p => {
        const hasVideo = this.hasLocalVideo(p);
        const alreadyPosted = activePlatforms.length > 0
          ? activePlatforms.every(platform => Boolean(this.postedContent[platform]?.[p.id]))
          : false;
        return hasVideo && !alreadyPosted;
      });

      if (!unposted.length) {
        this.log('All eligible products already posted for active platforms — resetting posted content for next cycle');
        this.postedContent = { instagram: {}, twitter: {}, youtube: {}, facebook: {}, pinterest: {} };
        this.savePostedContent();
        return;
      }

      const product = unposted[0];
      this.log(`Selected product for this run: ${product.name} (${product.id})`);
      this.log(`SCHEDULE_TICK product_id=${product.id} run_at=${new Date().toISOString()} active_platforms=${activePlatforms.join(',') || 'none'}`);

      const results = {
        success: { instagram: [], twitter: [], youtube: [], facebook: [], pinterest: [] },
        skipped: { instagram: [], twitter: [], youtube: [], facebook: [], pinterest: [] },
        errors: { instagram: [], twitter: [], youtube: [], facebook: [], pinterest: [] }
      };

      try {

          // Instagram posting
          try {
            const igResult = await this.postToInstagram(product);
            if (igResult.postId && !igResult.postId.includes('placeholder')) {
              results.success.instagram.push({ productId: product.id, postId: igResult.postId });
            } else {
              results.skipped.instagram.push(product.id);
            }
          } catch (error) {
            results.errors.instagram.push({ productId: product.id, error: error.message });
          }

          // Twitter posting
          try {
            const twitterResult = await this.postToTwitter(product);
            if (twitterResult.tweetId) {
              results.success.twitter.push({ productId: product.id, tweetId: twitterResult.tweetId });
            } else {
              results.skipped.twitter.push(product.id);
            }
          } catch (error) {
            results.errors.twitter.push({ productId: product.id, error: error.message });
          }

          // YouTube upload preparation
          try {
            const ytResult = await this.uploadToYouTube(product);
            if (ytResult.videoId) {
              results.success.youtube.push({ productId: product.id, videoId: ytResult.videoId, url: ytResult.url });
            } else {
              results.skipped.youtube.push(product.id);
            }
          } catch (error) {
            results.errors.youtube.push({ productId: product.id, error: error.message });
          }

          // Facebook posting
          try {
            const fbResult = await this.postToFacebook(product);
            if (fbResult.postId) {
              results.success.facebook.push({ productId: product.id, postId: fbResult.postId });
            } else {
              results.skipped.facebook.push(product.id);
            }
          } catch (error) {
            results.errors.facebook.push({ productId: product.id, error: error.message });
          }

          // Pinterest posting
          try {
            const pinResult = await this.postToPinterest(product);
            if (pinResult.pinId) {
              results.success.pinterest.push({ productId: product.id, pinId: pinResult.pinId });
            } else {
              results.skipped.pinterest.push(product.id);
            }
          } catch (error) {
            results.errors.pinterest.push({ productId: product.id, error: error.message });
          }

      } catch (error) {
        this.log(`Error processing ${product.id}: ${error.message}`);
      }

      // Summary
      this.log('\n📊 Social Media Auto-Post Summary:');
      this.log('=====================================');
      
      ['instagram', 'twitter', 'youtube', 'facebook', 'pinterest'].forEach(platform => {
        const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
        this.log(`\n${platformName}:`);
        this.log(`  ✅ Success: ${results.success[platform].length}`);
        this.log(`  ⏭️  Skipped: ${results.skipped[platform].length}`);
        this.log(`  ❌ Errors: ${results.errors[platform].length}`);
      });

      // Show successful posts
      if (results.success.instagram.length > 0 || results.success.twitter.length > 0 || results.success.youtube.length > 0) {
        this.log('\n🎯 New content posted:');
        
        if (results.success.instagram.length > 0) {
          this.log(`\n📱 Instagram (${results.success.instagram.length} posts):`);
          results.success.instagram.forEach(post => {
            this.log(`  • ${post.productId}: https://instagram.com/p/${post.postId}`);
          });
        }

        if (results.success.twitter.length > 0) {
          this.log(`\n🐦 Twitter (${results.success.twitter.length} tweets):`);
          results.success.twitter.forEach(post => {
            this.log(`  • ${post.productId}: https://twitter.com/i/status/${post.tweetId}`);
          });
        }

        if (results.success.youtube.length > 0) {
          this.log(`\n📺 YouTube (${results.success.youtube.length} uploads):`);
          results.success.youtube.forEach(post => {
            this.log(`  • ${post.productId}: ${post.url}`);
          });
        }
      }

      // Show errors
      ['instagram', 'twitter', 'youtube', 'facebook', 'pinterest'].forEach(platform => {
        if (results.errors[platform].length > 0) {
          const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
          this.log(`\n❌ ${platformName} Errors:`);
          results.errors[platform].forEach(err => {
            this.log(`  • ${err.productId}: ${err.error}`);
          });
        }
      });

      return results;

    } catch (error) {
      this.log(`Fatal error in social media auto-posting: ${error.message}`);
      throw error;
    }
  }
}

// Utility function for delays
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main execution
async function main() {
  try {
    const poster = new SocialMediaAutoPoster();
    await poster.processNewVideos();
    process.exit(0);
  } catch (error) {
    console.error('Social media auto-posting failed:', error);
    process.exit(1);
  }
}

// Export for use in other modules
export { SocialMediaAutoPoster };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
