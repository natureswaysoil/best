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
const PINTEREST_ACCESS_TOKEN = process.env.PINTEREST_ACCESS_TOKEN;
const PINTEREST_BOARD_ID = process.env.PINTEREST_BOARD_ID;

// Configuration
const VIDEOS_DIR = path.join(PROJECT, 'public', 'videos');
const PRODUCTS_FILE = path.join(PROJECT, 'data', 'products.ts');
const POSTED_SOCIAL_FILE = path.join(PROJECT, 'social-posted-content.json');
const WEBSITE_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://natureswaysoil.com';

class SocialMediaAutoPoster {
  constructor() {
    this.postedContent = this.loadPostedContent();
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
        title: `Fix ${randomProblem} Naturally - ${product.name} Review & Application`,
        description: `Transform your lawn with ${product.name}! This natural, pet-safe solution tackles ${randomProblem} to give you ${randomBenefit}.\n\n🌱 What You'll Learn:\n• How to identify ${randomProblem}\n• Safe, organic treatment options\n• Step-by-step application guide\n• Expected results timeline\n\n✅ Product Benefits:\n• Pet & family safe\n• Organic ingredients\n• Fast-acting formula\n• Easy application\n• Proven results\n\n🛒 Shop ${product.name}:\n${WEBSITE_BASE_URL}/product/${product.id}\n\n📧 Questions? Contact us at support@natureswaysoil.com\n\nTags: ${hashtags.youtube}`,
        tags: hashtags.youtube.split(', '),
        category_id: '26' // Howto & Style
      },
      facebook: {
        message: `🌱 Struggling with ${randomProblem}? Nature's Way Soil has you covered!\n\n${product.name} is your organic, pet-safe solution to achieve ${randomBenefit}. Made with natural ingredients that work with your lawn, not against it.\n\n✅ Pet & family safe\n✅ Organic ingredients\n✅ Fast-acting results\n✅ Easy to apply\n\n👉 Shop now: ${WEBSITE_BASE_URL}/product/${product.id}\n\n${hashtags.facebook}`,
        link: `${WEBSITE_BASE_URL}/product/${product.id}`
      },
      pinterest: {
        title: `${product.name} – Fix ${randomProblem} Naturally`,
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
      
      // Use product image from the website
      const imageUrl = `${WEBSITE_BASE_URL}/images/products/${product.id}/main.jpg`;
      
      const mediaData = {
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

      // Poll until media container is ready (up to 30s)
      let ready = false;
      for (let i = 0; i < 10; i++) {
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
      oauth_signature_method: 'HMAC-SHA256',
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

    // HMAC-SHA256 using Node crypto
    const signature = createHmac('sha256', signingKey).update(sigBase).digest('base64');

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
      const tweetData = { text: content.text };
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
      const videoPath = path.join(PROJECT, 'public', 'videos', `${product.id}.mp4`);
      if (!fs.existsSync(videoPath)) {
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

      const uploadResult = await uploadResponse.json();
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
  async postToFacebook(product) {
    try {
      if (!FACEBOOK_PAGE_ID || !FACEBOOK_ACCESS_TOKEN) {
        throw new Error('Facebook credentials not configured (need FACEBOOK_PAGE_ID, FACEBOOK_ACCESS_TOKEN)');
      }

      if (this.postedContent.facebook[product.id]) {
        this.log(`Already posted to Facebook: ${product.id}`);
        return this.postedContent.facebook[product.id];
      }

      const content = this.generateSocialContent(product, 'facebook');
      const imageUrl = `${WEBSITE_BASE_URL}/images/products/${product.id}/main.jpg`;

      // Post to Facebook Page with photo
      const response = await fetch(
        `https://graph.facebook.com/v19.0/${FACEBOOK_PAGE_ID}/photos`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: imageUrl,
            caption: content.message,
            access_token: FACEBOOK_ACCESS_TOKEN
          })
        }
      );

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Facebook API error: ${response.status} - ${err}`);
      }

      const data = await response.json();
      const postId = data.post_id || data.id;

      this.postedContent.facebook[product.id] = {
        postId,
        url: `https://www.facebook.com/${FACEBOOK_PAGE_ID}/posts/${postId}`,
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

      const response = await fetch('https://api.pinterest.com/v5/pins', {
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

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Pinterest API error: ${response.status} - ${err}`);
      }

      const data = await response.json();
      const pinId = data.id;

      this.postedContent.pinterest[product.id] = {
        pinId,
        url: `https://www.pinterest.com/pin/${pinId}`,
        createdAt: new Date().toISOString(),
        productId: product.id
      };

      this.savePostedContent();
      this.log(`✅ Pinterest pin created: ${product.name} → https://www.pinterest.com/pin/${pinId}`);
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

      this.log(`Found ${products.length} products to process`);

      // Pick ONE product per run — the next one not yet posted to any platform
      const unposted = products.filter(p => {
        const hasVideo = fs.existsSync(path.join(VIDEOS_DIR, `${p.id}.mp4`));
        const alreadyPosted =
          this.postedContent.instagram[p.id] &&
          this.postedContent.twitter[p.id] &&
          this.postedContent.facebook[p.id];
        return hasVideo && !alreadyPosted;
      });

      if (!unposted.length) {
        this.log('All products already posted — resetting posted content for next cycle');
        this.postedContent = { instagram: {}, twitter: {}, youtube: {}, facebook: {}, pinterest: {} };
        this.savePostedContent();
        return;
      }

      const product = unposted[0];
      this.log(`Selected product for this run: ${product.name} (${product.id})`);

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
            if (ytResult.status === 'ready_for_upload') {
              results.success.youtube.push({ productId: product.id, videoId: ytResult.videoId, status: 'prepared' });
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
          this.log(`\n📺 YouTube (${results.success.youtube.length} videos prepared):`);
          results.success.youtube.forEach(post => {
            this.log(`  • ${post.productId}: Ready for manual upload`);
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