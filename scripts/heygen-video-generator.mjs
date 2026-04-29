#!/usr/bin/env node

/**
 * HeyGen Video Generator
 * Professional AI video generation using HeyGen's API
 * Creates product-first videos with avatars, real product imagery, stronger hooks,
 * and richer visual direction instead of plain talking-head green backgrounds.
 */

import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VIDEO_CONFIG_FILE = path.resolve(__dirname, '..', 'content', 'video-scripts', 'video-config.json');

const SHEET_AVATAR_ALIAS_MAP = {
  garden_expert_01: 'Anna_public_3_20240108',
  eco_gardener_01: 'Abigail_expressive_2024112501',
  pasture_specialist_01: 'Aditya_public_4',
  farm_expert_02: 'Aditya_public_1',
};

const SHEET_VOICE_ALIAS_MAP = {
  en_us_warm_female_01: 'f8c69e517f424cafaecde32dde57096b',
  en_us_warm_female_02: '97dd67ab8ce242b6a9e7689cb00c6414',
  en_us_neutral_mx_01: '5d8c378ba8c3434586081a52ac368738',
};

const DEFAULT_HEYGEN_AVATAR_ID = 'Anna_public_3_20240108';
const DEFAULT_HEYGEN_VOICE_ID = 'f8c69e517f424cafaecde32dde57096b';
const DEFAULT_BRAND_BG = '#0d3b2a';

function loadVideoConfig() {
  try {
    if (fsSync.existsSync(VIDEO_CONFIG_FILE)) {
      return JSON.parse(fsSync.readFileSync(VIDEO_CONFIG_FILE, 'utf8'));
    }
  } catch { /* ignore */ }
  return {};
}

function pickNonEmpty(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null) {
      const trimmed = String(value).trim();
      if (trimmed) return trimmed;
    }
  }
  return null;
}

function mapSheetAlias(value, aliasMap) {
  const normalized = pickNonEmpty(value);
  if (!normalized) return null;
  return aliasMap[normalized] || normalized;
}

function resolveSheetAvatarVoice(product) {
  return {
    avatarId: mapSheetAlias(pickNonEmpty(
      product?.heygenAvatarId,
      product?.heygen_avatar_id,
      product?.HEYGEN_AVATAR_ID,
      product?.avatarId,
      product?.avatar_id,
      product?.AVATAR_ID,
    ), SHEET_AVATAR_ALIAS_MAP),
    voiceId: mapSheetAlias(pickNonEmpty(
      product?.heygenVoiceId,
      product?.heygen_voice_id,
      product?.HEYGEN_VOICE_ID,
      product?.voiceId,
      product?.voice_id,
      product?.VOICE_ID,
      product?.HEYGEN_VOICE,
      product?.heygen_voice,
    ), SHEET_VOICE_ALIAS_MAP),
  };
}

function resolveConfigAvatarVoice(product) {
  const cfg = loadVideoConfig();
  const heygen = cfg?.heygen || {};
  const defaultAvatarId = heygen.defaultAvatarId || DEFAULT_HEYGEN_AVATAR_ID;
  const defaultVoiceId = heygen.defaultVoiceId || DEFAULT_HEYGEN_VOICE_ID;

  const productOverride = heygen.productOverrides?.[product.id];
  if (productOverride?.avatarId || productOverride?.voiceId) {
    return {
      avatarId: productOverride.avatarId || defaultAvatarId,
      voiceId: productOverride.voiceId || defaultVoiceId,
    };
  }

  const category = product.category || '';
  const catOverride = heygen.categoryOverrides?.[category];
  if (catOverride?.avatarId || catOverride?.voiceId) {
    return {
      avatarId: catOverride.avatarId || defaultAvatarId,
      voiceId: catOverride.voiceId || defaultVoiceId,
    };
  }

  return { avatarId: defaultAvatarId, voiceId: defaultVoiceId };
}

function buildVisualPrompt(product) {
  const category = String(product?.category || 'lawn and garden').toLowerCase();
  const name = String(product?.name || 'Nature\'s Way Soil product');

  if (category.includes('pet')) {
    return `Create a polished short-form product video background for ${name}: healthy green lawn, repaired dog urine spots, family-safe backyard feel, natural sunlight, subtle product-focused composition, clean e-commerce style.`;
  }

  if (category.includes('compost') || category.includes('soil')) {
    return `Create a premium organic gardening video background for ${name}: rich dark soil, raised beds, roots, vegetables, compost texture, natural farm-to-garden feel, warm daylight, trustworthy educational style.`;
  }

  if (category.includes('fertilizer')) {
    return `Create a premium lawn and garden product video background for ${name}: lush turf, strong roots, healthy plants, watering/application moment, natural sunlight, clean e-commerce product demonstration style.`;
  }

  return `Create a premium Nature's Way Soil product video background for ${name}: organic garden, healthy soil, green plants, natural sunlight, clean product demonstration style.`;
}

export class HeyGenVideoGenerator {
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.HEYGEN_API_KEY;
    this.baseUrl = 'https://api.heygen.com/v2';
    this.baseUrlV1 = 'https://api.heygen.com/v1';
    this.cachedAvatarId = null;
    this.cachedVoiceId = null;
    this.requestTimeoutMs = Number(process.env.HEYGEN_REQUEST_TIMEOUT_MS || 30000);
    this.maxRetries = Number(process.env.HEYGEN_MAX_RETRIES || 3);
    this.retryBaseDelayMs = Number(process.env.HEYGEN_RETRY_BASE_DELAY_MS || 1500);

    if (!this.apiKey) {
      throw new Error('HeyGen API key is required. Set HEYGEN_API_KEY environment variable.');
    }
  }

  log(message) {
    console.log(`[HeyGen] ${new Date().toISOString()} - ${message}`);
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  shouldRetryStatus(status) {
    return status === 408 || status === 409 || status === 425 || status === 429 || status >= 500;
  }

  async fetchWithRetry(url, options = {}, meta = {}) {
    const timeoutMs = Number(meta.timeoutMs || this.requestTimeoutMs);
    const retries = Number(meta.retries ?? this.maxRetries);
    const label = meta.label || 'heygen-request';
    let lastError;

    for (let attempt = 1; attempt <= retries; attempt += 1) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(url, { ...options, signal: controller.signal });

        if (!response.ok && this.shouldRetryStatus(response.status) && attempt < retries) {
          const backoff = this.retryBaseDelayMs * Math.pow(2, attempt - 1);
          this.log(`${label} retry ${attempt}/${retries} after HTTP ${response.status}; waiting ${backoff}ms`);
          await this.sleep(backoff);
          continue;
        }

        return response;
      } catch (error) {
        lastError = error;
        const timedOut = error?.name === 'AbortError';
        const canRetry = attempt < retries;

        if (!canRetry) {
          throw new Error(`${label} failed after ${attempt} attempts: ${timedOut ? `timeout after ${timeoutMs}ms` : error.message}`);
        }

        const backoff = this.retryBaseDelayMs * Math.pow(2, attempt - 1);
        this.log(`${label} retry ${attempt}/${retries} after ${timedOut ? 'timeout' : error.message}; waiting ${backoff}ms`);
        await this.sleep(backoff);
      } finally {
        clearTimeout(timer);
      }
    }

    throw lastError || new Error(`${label} failed without response`);
  }

  async createVideo({
    script,
    title,
    avatarId = DEFAULT_HEYGEN_AVATAR_ID,
    voiceId = null,
    background = DEFAULT_BRAND_BG,
    productImage = null,
    product = null,
  }) {
    try {
      this.log(`Creating video: ${title}`);

      if (!voiceId) {
        throw new Error('HeyGen voice_id is required for v2/video/generate. Resolve a valid voice before creating video.');
      }

      const usePlainBrandBackground = process.env.HEYGEN_FORCE_COLOR_BACKGROUND === '1';
      const backgroundData = usePlainBrandBackground
        ? { type: 'color', value: background }
        : productImage
          ? { type: 'image', url: productImage, fit: 'cover' }
          : {
              type: 'text',
              prompt: buildVisualPrompt(product),
            };

      const videoData = {
        video_inputs: [
          {
            character: {
              type: 'avatar',
              avatar_id: avatarId,
              avatar_style: 'normal',
              scale: 0.82,
              offset: { x: -0.28, y: 0.04 },
            },
            voice: {
              type: 'text',
              input_text: script,
              voice_id: voiceId,
              speed: 1.03,
            },
            background: backgroundData,
          }
        ],
        dimension: { width: 1280, height: 720 },
        aspect_ratio: '16:9',
        test: process.env.HEYGEN_TEST_MODE === '1',
        caption: true,
        callback_id: `nws_${Date.now()}`,
      };

      const response = await this.fetchWithRetry(`${this.baseUrl}/video/generate`, {
        method: 'POST',
        headers: {
          'X-Api-Key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(videoData),
      }, {
        label: 'create-video',
        retries: this.maxRetries,
        timeoutMs: this.requestTimeoutMs,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`HeyGen API error: ${response.status} - ${error}`);
      }

      const result = await response.json();
      this.log(`Video creation initiated - Video ID: ${result.data.video_id}`);

      return { videoId: result.data.video_id, status: 'processing', title };
    } catch (error) {
      this.log(`Video creation failed: ${error.message}`);
      throw error;
    }
  }

  async getVideoStatus(videoId) {
    try {
      const response = await this.fetchWithRetry(`${this.baseUrl}/video/${videoId}`, {
        headers: { 'X-Api-Key': this.apiKey }
      }, {
        label: 'video-status-v2',
        retries: this.maxRetries,
        timeoutMs: this.requestTimeoutMs,
      });

      if (response.ok) {
        const result = await response.json();
        return {
          status: result.data.status,
          progress: result.data.progress || 0,
          videoUrl: result.data.video_url,
          thumbnailUrl: result.data.thumbnail_url,
          duration: result.data.duration,
          error: result.data.error,
        };
      }

      const fallback = await this.fetchWithRetry(`${this.baseUrlV1}/video_status.get?video_id=${encodeURIComponent(videoId)}`, {
        headers: { 'X-Api-Key': this.apiKey }
      }, {
        label: 'video-status-v1',
        retries: this.maxRetries,
        timeoutMs: this.requestTimeoutMs,
      });
      if (!fallback.ok) throw new Error(`Status check failed: ${response.status}/${fallback.status}`);

      const fallbackResult = await fallback.json();
      const data = fallbackResult?.data || {};
      return {
        status: data.status,
        progress: data.progress || 0,
        videoUrl: data.video_url,
        thumbnailUrl: data.thumbnail_url,
        duration: data.duration,
        error: data.error,
      };
    } catch (error) {
      this.log(`Status check failed: ${error.message}`);
      throw error;
    }
  }

  async waitForCompletion(videoId, maxWaitTime = 600000) {
    const startTime = Date.now();
    let transientErrors = 0;

    while (Date.now() - startTime < maxWaitTime) {
      let status;
      try {
        status = await this.getVideoStatus(videoId);
        transientErrors = 0;
      } catch (error) {
        transientErrors += 1;
        if (transientErrors >= 4) throw error;
        this.log(`Transient status check failure (${transientErrors}/4): ${error.message}`);
        await this.sleep(5000);
        continue;
      }

      this.log(`Video ${videoId}: ${status.status} (${status.progress}%)`);
      if (status.status === 'completed') return status;
      if (status.status === 'failed') throw new Error(`Video generation failed: ${status.error || 'Unknown error'}`);
      await this.sleep(15000);
    }

    throw new Error('Video generation timeout');
  }

  async downloadVideo(videoUrl, outputPath) {
    try {
      this.log(`Downloading video to: ${outputPath}`);
      const response = await this.fetchWithRetry(videoUrl, {}, {
        label: 'download-video',
        retries: this.maxRetries,
        timeoutMs: Math.max(this.requestTimeoutMs, 60000),
      });
      if (!response.ok) throw new Error(`Download failed: ${response.status}`);

      const arrayBuffer = await response.arrayBuffer();
      await fs.writeFile(outputPath, Buffer.from(arrayBuffer));
      this.log(`Video downloaded successfully: ${outputPath}`);
      return outputPath;
    } catch (error) {
      this.log(`Download failed: ${error.message}`);
      throw error;
    }
  }

  async getAvatars() {
    try {
      const response = await this.fetchWithRetry(`${this.baseUrl}/avatars`, {
        headers: { 'X-Api-Key': this.apiKey }
      }, {
        label: 'get-avatars',
        retries: this.maxRetries,
        timeoutMs: this.requestTimeoutMs,
      });
      if (!response.ok) throw new Error(`Failed to fetch avatars: ${response.status}`);
      const result = await response.json();
      return result.data.avatars || [];
    } catch (error) {
      this.log(`Failed to get avatars: ${error.message}`);
      throw error;
    }
  }

  async getVoices() {
    try {
      const response = await this.fetchWithRetry(`${this.baseUrl}/voices`, {
        headers: { 'X-Api-Key': this.apiKey }
      }, {
        label: 'get-voices-v2',
        retries: this.maxRetries,
        timeoutMs: this.requestTimeoutMs,
      });
      if (response.ok) {
        const result = await response.json();
        if (Array.isArray(result?.data?.voices) && result.data.voices.length > 0) return result.data.voices;
      }

      const fallbackResponse = await this.fetchWithRetry(`${this.baseUrlV1}/voice.list`, {
        headers: { 'X-Api-Key': this.apiKey }
      }, {
        label: 'get-voices-v1',
        retries: this.maxRetries,
        timeoutMs: this.requestTimeoutMs,
      });
      if (!fallbackResponse.ok) throw new Error(`Failed to fetch voices: ${fallbackResponse.status}`);
      const fallbackResult = await fallbackResponse.json();
      if (Array.isArray(fallbackResult?.data?.voices) && fallbackResult.data.voices.length > 0) return fallbackResult.data.voices;
      if (Array.isArray(fallbackResult?.data?.list) && fallbackResult.data.list.length > 0) return fallbackResult.data.list;
      return [];
    } catch (error) {
      this.log(`Failed to get voices: ${error.message}`);
      throw error;
    }
  }

  async resolveAvatarId(preferredAvatarId = DEFAULT_HEYGEN_AVATAR_ID) {
    if (process.env.HEYGEN_AVATAR_ID) return process.env.HEYGEN_AVATAR_ID;
    if (this.cachedAvatarId) return this.cachedAvatarId;

    const avatars = await this.getAvatars();
    if (!avatars.length) throw new Error('No HeyGen avatars available for this account');

    const preferred = avatars.find((a) => a.avatar_id === preferredAvatarId || a.id === preferredAvatarId);
    const defaultAvatar = avatars.find((a) => a.avatar_id === DEFAULT_HEYGEN_AVATAR_ID || a.id === DEFAULT_HEYGEN_AVATAR_ID);
    const fallback = preferred || defaultAvatar || avatars[0];
    const avatarId = fallback.avatar_id || fallback.id;
    if (!avatarId) throw new Error('Unable to resolve HeyGen avatar ID');

    this.cachedAvatarId = avatarId;
    this.log(`Using avatar_id: ${avatarId}`);
    return avatarId;
  }

  async resolveVoiceId(preferredVoiceId = DEFAULT_HEYGEN_VOICE_ID) {
    if (process.env.HEYGEN_VOICE_ID) return process.env.HEYGEN_VOICE_ID;
    if (this.cachedVoiceId) return this.cachedVoiceId;

    const voices = await this.getVoices();
    if (!voices.length) {
      this.log('No HeyGen voices available from API; falling back to preferred voice ID');
      return preferredVoiceId;
    }

    const preferred = voices.find((v) => v.voice_id === preferredVoiceId || v.id === preferredVoiceId);
    const defaultVoice = voices.find((v) => v.voice_id === DEFAULT_HEYGEN_VOICE_ID || v.id === DEFAULT_HEYGEN_VOICE_ID);
    const fallback = preferred || defaultVoice || voices[0];
    const voiceId = fallback.voice_id || fallback.id;
    if (!voiceId) {
      this.log(`Unable to resolve voice_id from API response; falling back to preferred voice ID (${preferredVoiceId})`);
      return preferredVoiceId;
    }

    this.cachedVoiceId = voiceId;
    this.log(`Using voice_id: ${voiceId}`);
    return voiceId;
  }

  async generateProductScript(product) {
    if (product.videoScript && String(product.videoScript).trim().length > 0) {
      this.log(`Using provided script for ${product.name}`);
      return String(product.videoScript).trim();
    }

    const styleReference = process.env.VIDEO_STYLE_REFERENCE_TEXT
      ? ` Style reference to emulate: ${process.env.VIDEO_STYLE_REFERENCE_TEXT}`
      : '';
    const keywordList = Array.isArray(product.keywords) ? product.keywords.filter(Boolean) : [];
    const description = String(product.description || '').trim();
    const usage = Array.isArray(product.usage) ? product.usage.filter(Boolean).slice(0, 3).join(' | ') : '';
    const metadataHint = [
      description ? `Product description from catalog: ${description}` : '',
      usage ? `Usage directions: ${usage}` : '',
      keywordList.length ? `Keywords from catalog: ${keywordList.join(', ')}` : '',
    ].filter(Boolean).join(' ');

    if (process.env.OPENAI_API_KEY) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            max_tokens: 360,
            messages: [
              {
                role: 'system',
                content: `You write high-converting 30-second short-form video scripts for Nature's Way Soil lawn, garden, compost, pet-lawn, and soil health products. Write 70-90 spoken words. Structure: 1) first sentence is a strong problem hook, 2) identify the product naturally, 3) explain one visual before/after benefit, 4) give one simple usage cue, 5) end with a direct call to action. Sound like a helpful farmer/soil educator, not a corporate ad. Avoid unsupported pesticide, disease, medical, or guaranteed-result claims. Do not mention scenes, camera directions, hashtags, emojis, or quotation marks. Natural speech only.${styleReference}`,
              },
              {
                role: 'user',
                content: `Write the script for: ${product.name}. Category: ${product.category || 'General'}. ${metadataHint}`,
              },
            ],
          }),
        });
        if (response.ok) {
          const data = await response.json();
          const script = data.choices?.[0]?.message?.content?.trim();
          if (script) {
            this.log(`OpenAI script generated for ${product.name}`);
            return script;
          }
        }
      } catch (e) {
        this.log(`OpenAI script failed, using template: ${e.message}`);
      }
    }

    const category = String(product.category || '').toLowerCase();
    const problem = category.includes('pet')
      ? 'Tired of yellow lawn spots where your dog likes to go?'
      : category.includes('compost') || category.includes('soil')
        ? 'If your plants look weak, the problem may be tired soil, not the plant.'
        : 'If your lawn or garden is growing slowly, your soil may need more than basic fertilizer.';
    const benefit = category.includes('pet')
      ? 'It works at the soil level to support recovery, odor control, and healthier regrowth.'
      : category.includes('compost') || category.includes('soil')
        ? 'It helps improve root contact, moisture retention, and long-term soil biology.'
        : 'It supports stronger roots, better nutrient uptake, and steady green growth.';
    const usageCue = Array.isArray(product.usage) && product.usage[0]
      ? product.usage[0]
      : 'Mix with water and apply evenly to the target area.';

    return `${problem} ${product.name} is made to help bring life back into the soil naturally. ${benefit} ${usageCue} Use it as part of your regular soil care routine, especially during active growth. Feed the soil, support the plant, and see why Nature's Way Soil is built for naturally stronger results. Visit NaturesWaySoil.com to learn more.`;
  }

  async generateProductVideo(product, outputDir = './public/videos', options = {}) {
    try {
      const script = await this.generateProductScript(product);
      const title = `${product.name} - Nature's Way Soil`;
      const sheetAV = resolveSheetAvatarVoice(product);
      const configAV = resolveConfigAvatarVoice(product);
      let avatarId = process.env.HEYGEN_AVATAR_ID || sheetAV.avatarId || configAV.avatarId || DEFAULT_HEYGEN_AVATAR_ID;
      let voiceId = process.env.HEYGEN_VOICE_ID || sheetAV.voiceId || configAV.voiceId || null;

      this.log(`Avatar/voice resolution → avatar: ${avatarId}, voice: ${voiceId || '(resolve from API)'} (sheet overrides config when present)`);

      if (process.env.HEYGEN_SKIP_PREFLIGHT !== '1') {
        try {
          avatarId = await this.resolveAvatarId(avatarId);
        } catch (error) {
          this.log(`Falling back to default avatar_id (${avatarId}) because avatar lookup failed: ${error.message}`);
        }
      }

      try {
        voiceId = await this.resolveVoiceId(voiceId || 'b8266b04af0a4c7e8adc8ea21273eecd');
      } catch (error) {
        this.log(`Falling back to default voice_id because voice lookup failed: ${error.message}`);
        voiceId = voiceId || DEFAULT_HEYGEN_VOICE_ID;
      }

      const productImage = options.productImage || null;
      const videoJob = await this.createVideo({
        script,
        title,
        avatarId,
        voiceId,
        background: options.background || DEFAULT_BRAND_BG,
        productImage,
        product,
      });

      const result = await this.waitForCompletion(videoJob.videoId);
      const outputPath = path.join(outputDir, `${product.id}.mp4`);
      await fs.mkdir(outputDir, { recursive: true });
      await this.downloadVideo(result.videoUrl, outputPath);

      return {
        productId: product.id,
        videoPath: outputPath,
        videoUrl: result.videoUrl,
        duration: result.duration,
        script,
      };
    } catch (error) {
      this.log(`Failed to generate video for ${product.name}: ${error.message}`);
      throw error;
    }
  }
}

async function main() {
  const command = process.argv[2];

  if (command === 'test') {
    console.log('🧪 Testing HeyGen integration...');
    try {
      const generator = new HeyGenVideoGenerator();
      console.log('📋 Fetching available avatars...');
      const avatars = await generator.getAvatars();
      console.log(`✅ Found ${avatars.length} avatars`);
      console.log('🎤 Fetching available voices...');
      const voices = await generator.getVoices();
      console.log(`✅ Found ${voices.length} voices`);
      console.log('🎉 HeyGen integration is working!');
    } catch (error) {
      console.error('❌ HeyGen test failed:', error.message);
      console.error('');
      console.error('🔧 Setup required:');
      console.error('1. Get API key from: https://app.heygen.com/settings/api');
      console.error('2. Add to .env.local: HEYGEN_API_KEY=your_api_key');
      console.error('3. Run: npm run heygen:test');
      process.exit(1);
    }
  } else if (command === 'avatars') {
    console.log('👥 Available HeyGen Avatars:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    try {
      const generator = new HeyGenVideoGenerator();
      const avatars = await generator.getAvatars();
      avatars.slice(0, 10).forEach(avatar => {
        console.log(`🎭 ${avatar.avatar_name || avatar.name}`);
        console.log(`   ID: ${avatar.avatar_id}`);
        console.log(`   Type: ${avatar.gender || 'Unknown'}`);
        console.log('');
      });
      if (avatars.length > 10) console.log(`... and ${avatars.length - 10} more avatars available`);
    } catch (error) {
      console.error('❌ Failed to fetch avatars:', error.message);
      process.exit(1);
    }
  } else if (command === 'voices') {
    console.log('🎤 Available HeyGen Voices:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    try {
      const generator = new HeyGenVideoGenerator();
      const voices = await generator.getVoices();
      voices.slice(0, 10).forEach(voice => {
        console.log(`🗣️ ${voice.voice_name || voice.name}`);
        console.log(`   ID: ${voice.voice_id}`);
        console.log(`   Language: ${voice.language || 'Unknown'}`);
        console.log(`   Gender: ${voice.gender || 'Unknown'}`);
        console.log('');
      });
      if (voices.length > 10) console.log(`... and ${voices.length - 10} more voices available`);
    } catch (error) {
      console.error('❌ Failed to fetch voices:', error.message);
      process.exit(1);
    }
  } else {
    console.log('🎬 HeyGen Video Generator');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Commands:');
    console.log('  npm run heygen:test     # Test API connection');
    console.log('  npm run heygen:avatars  # List available avatars');
    console.log('  npm run heygen:voices   # List available voices');
    console.log('');
    console.log('Setup:');
    console.log('  1. Get API key: https://app.heygen.com/settings/api');
    console.log('  2. Add HEYGEN_API_KEY to .env.local');
    console.log('  3. Run: npm run heygen:test');
  }
}

export default HeyGenVideoGenerator;

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
