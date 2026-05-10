cat > scripts/heygen-marketing-generator.mjs <<'EOF'
#!/usr/bin/env node
/**
 * Marketing-mode HeyGen generator.
 *
 * - 5-scene video per product (hook, problem, solution, proof, CTA)
 * - Each scene uses a Pexels b-roll video as background
 * - Avatar pinned to lower-right corner (~32% scale)
 * - Garden/farm avatar pools, deterministic per product
 * - OpenAI script generation (with template fallback)
 */

import BaseHeyGenVideoGenerator from './heygen-video-generator.mjs';

const GARDEN_AVATAR_POOL = [
  { avatar_id: 'Anna_public_3_20240108',        voice_id: 'f8c69e517f424cafaecde32dde57096b' },
  { avatar_id: 'Abigail_expressive_2024112501', voice_id: '97dd67ab8ce242b6a9e7689cb00c6414' },
  { avatar_id: 'Daisy-inskirt-20220818',        voice_id: 'f8c69e517f424cafaecde32dde57096b' },
];

const FARM_AVATAR_POOL = [
  { avatar_id: 'Aditya_public_4', voice_id: '5d8c378ba8c3434586081a52ac368738' },
  { avatar_id: 'Aditya_public_1', voice_id: '5d8c378ba8c3434586081a52ac368738' },
];

const SCENE_QUERIES_GARDEN = [
  ['lush vegetable garden sunrise', 'thriving backyard garden'],
  ['dry cracked soil',              'wilting garden plants'],
  ['hands healthy soil compost',    'pouring organic fertilizer plants'],
  ['green lush lawn growth',        'harvest basket vegetables'],
  ['happy gardener smiling',        'gardener watering plants'],
];

const SCENE_QUERIES_FARM = [
  ['green pasture sunrise cattle',         'horse grazing field'],
  ['dry brown pasture field',              'overgrazed pasture'],
  ['farmer spreading fertilizer pasture',  'tractor pasture field'],
  ['lush green hay field',                 'healthy cattle grazing'],
  ['farmer smiling field',                 'farm sunset pasture'],
];

function pick(...values) {
  for (const v of values) {
    if (v !== undefined && v !== null) {
      const t = String(v).trim();
      if (t) return t;
    }
  }
  return '';
}

function list(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(v => String(v || '').trim()).filter(Boolean);
  return String(value).split(/[|,\n]/).map(v => v.trim()).filter(Boolean);
}

function getRowValue(product, names) {
  const row = product?._sourceRecord || product?.sourceRecord || {};
  for (const name of names) {
    if (product?.[name] !== undefined && product?.[name] !== null && String(product[name]).trim()) return String(product[name]).trim();
    if (row?.[name] !== undefined && row?.[name] !== null && String(row[name]).trim()) return String(row[name]).trim();
  }
  return '';
}

function getMarketingContext(product) {
  const name = pick(product?.name, getRowValue(product, ['name', 'Name', 'Product', 'Product Name']));
  const category = pick(product?.category, getRowValue(product, ['category', 'Category']), 'Garden Product');
  const description = pick(product?.description, getRowValue(product, ['description', 'Description', 'Product Description']));
  const keywords = [
    ...list(product?.keywords),
    ...list(getRowValue(product, ['keywords', 'Keywords', 'Search Terms', 'Search_Terms'])),
  ];
  const usage = [
    ...list(product?.usage),
    ...list(getRowValue(product, ['usage', 'Usage', 'instructions', 'Instructions', 'Directions', 'directions'])),
  ];
  const brollScenes = [
    ...list(product?.brollScenes),
    ...list(product?.b_roll_scenes),
    ...list(getRowValue(product, [
      'brollScenes', 'Broll Scenes', 'B-Roll Scenes', 'b_roll_scenes', 'broll_scenes',
      'Broll_Scenes', 'B-Roll', 'b-roll', 'Scenes', 'scenes', 'Scene Ideas', 'Video Scenes',
    ])),
  ];
  const painPoint = getRowValue(product, ['painPoint', 'Pain Point', 'Problem', 'Customer Problem', 'Hook']);
  const solution  = getRowValue(product, ['solution', 'Solution', 'Benefit', 'Main Benefit', 'Value Proposition']);

  return {
    name,
    category,
    description,
    keywords: Array.from(new Set(keywords)).slice(0, 16),
    usage: Array.from(new Set(usage)).slice(0, 5),
    brollScenes: Array.from(new Set(brollScenes)).slice(0, 8),
    painPoint,
    solution,
  };
}

function isPastureOrFarm(product) {
  const text = [product?.name, product?.category, product?.description, ...(Array.isArray(product?.keywords) ? product.keywords : [])]
    .filter(Boolean).join(' ').toLowerCase();
  return /hay|pasture|forage|horse|cattle|livestock|farm|field/.test(text);
}

function pickFromPool(pool, key = '') {
  const h = [...String(key)].reduce((a, c) => a + c.charCodeAt(0), 0);
  return pool[h % pool.length];
}

async function fetchPexelsBackground(queries) {
  const key = process.env.PEXELS_API_KEY;
  if (!key) return null;
  for (const q of queries) {
    try {
      const res = await fetch(
        `https://api.pexels.com/videos/search?query=${encodeURIComponent(q)}&orientation=landscape&per_page=8`,
        { headers: { Authorization: key } }
      );
      if (!res.ok) continue;
      const data = await res.json();
      const ranked = (data?.videos || [])
        .filter(v => v.duration >= 6 && v.duration <= 30)
        .sort((a, b) => (b.width || 0) - (a.width || 0));
      const vid = ranked[0] || data?.videos?.[0];
      const file =
        vid?.video_files?.find(f => f.quality === 'hd' && f.width >= 1280 && f.width <= 1920) ||
        vid?.video_files?.find(f => f.quality === 'hd') ||
        vid?.video_files?.[0];
      if (file?.link) return file.link;
    } catch { /* try next */ }
  }
  return null;
}

function splitScriptIntoFiveScenes(fullScript, ctx) {
  const sentences = String(fullScript || '')
    .split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);

  if (sentences.length >= 5) {
    const per = Math.ceil(sentences.length / 5);
    const buckets = [];
    for (let i = 0; i < 5; i++) {
      buckets.push(sentences.slice(i * per, (i + 1) * per).join(' ').trim());
    }
    for (let i = 0; i < 5; i++) {
      if (!buckets[i]) buckets[i] = sentences[Math.min(i, sentences.length - 1)];
    }
    return buckets;
  }

  const name = ctx?.name || 'this product';
  const benefit = ctx?.solution || 'healthier soil and stronger plants';
  return [
    `Tired of weak plants and tired soil?`,
    `Most products feed plants but ignore the soil biology underneath.`,
    `${name} from Nature's Way Soil delivers ${benefit} the natural way.`,
    `Gardeners see greener growth, deeper roots, and bigger harvests.`,
    `Visit Nature's Way Soil and try ${name} today.`,
  ];
}

export class HeyGenMarketingVideoGenerator extends BaseHeyGenVideoGenerator {
  async generateProductScript(product) {
    const ctx = getMarketingContext(product);

    if (process.env.VIDEO_LOCK_SCRIPT === '1' && product.videoScript && String(product.videoScript).trim()) {
      this.log(`Using locked sheet script for ${ctx.name}`);
      return String(product.videoScript).trim();
    }

    const fallbackScript = this.buildFallbackMarketingScript(ctx);

    if (!process.env.OPENAI_API_KEY) {
      this.log(`OPENAI_API_KEY not found; using marketing template script for ${ctx.name}`);
      return fallbackScript;
    }

    const prompt = [
      `Product name: ${ctx.name}`,
      `Category: ${ctx.category}`,
      ctx.description ? `Description: ${ctx.description}` : '',
      ctx.keywords.length ? `Keywords: ${ctx.keywords.join(', ')}` : '',
      ctx.usage.length ? `Usage/Application: ${ctx.usage.join(' | ')}` : '',
      ctx.brollScenes.length ? `Requested b-roll scenes: ${ctx.brollScenes.join(' | ')}` : '',
      ctx.painPoint ? `Customer pain point: ${ctx.painPoint}` : '',
      ctx.solution ? `Solution angle: ${ctx.solution}` : '',
    ].filter(Boolean).join('\n');

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.OPENAI_VIDEO_SCRIPT_MODEL || 'gpt-4o-mini',
          temperature: 0.75,
          max_tokens: 360,
          messages: [
            {
              role: 'system',
              content: [
                "You are a direct-response video marketer for Nature's Way Soil lawn, garden, farm, compost, pet lawn, and plant-care products.",
                "Write one polished 30-40 second spoken script of about 90-110 words split across 5 short beats (hook, problem, solution, proof, CTA).",
                "Each beat should be 1-2 short sentences and flow naturally as one spoken script. No headings, no scene labels, no timestamps, no hashtags, no emojis, no quotation marks.",
                "Sound helpful, confident, farm/garden practical. No medical or pesticide claims. No guaranteed-cure language.",
              ].join(' '),
            },
            { role: 'user', content: prompt },
          ],
        }),
      });

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        this.log(`OpenAI marketing script failed HTTP ${response.status}: ${body.slice(0, 180)}`);
        return fallbackScript;
      }
      const data = await response.json();
      const script = data?.choices?.[0]?.message?.content?.trim();
      if (script) {
        this.log(`OpenAI marketing script generated for ${ctx.name}`);
        return script.replace(/^['"]|['"]$/g, '').trim();
      }
    } catch (error) {
      this.log(`OpenAI marketing script failed: ${error.message}`);
    }
    return fallbackScript;
  }

  buildFallbackMarketingScript(ctx) {
    const lower = `${ctx.name} ${ctx.category} ${ctx.description} ${ctx.keywords.join(' ')}`.toLowerCase();
    const isDog = /dog|urine|pet|yellow spot/.test(lower);
    const isPasture = /hay|pasture|forage|field|livestock|horse|cattle/.test(lower);
    const isCompost = /compost|biochar|worm|soil amendment/.test(lower);

    const hook = ctx.painPoint || (
      isDog ? 'Dog spots can ruin a good lawn fast.' :
      isPasture ? 'Thin pasture and slow regrowth cost you grass when you need it most.' :
      isCompost ? 'If your plants are struggling, the problem is usually tired soil.' :
      'If your plants are not responding, your soil may need more support.'
    );
    const benefit = ctx.solution || (
      isDog ? 'It supports the soil around damaged spots while green growth returns.' :
      isPasture ? 'It supports root activity, soil biology, and steady forage growth.' :
      isCompost ? 'It adds organic matter, biology, and structure so roots work better.' :
      'It supports stronger roots, better nutrient flow, and healthier growth.'
    );
    const usage = ctx.usage[0] || 'Mix with water and apply evenly around the root zone.';

    return `${hook} ${ctx.name} from Nature's Way Soil is the simple, natural fix. ${benefit} ${usage} Use it as part of your regular lawn or garden care. Feed the soil first and your plants will follow. Visit Nature's Way Soil to get yours today.`;
  }

  async generateProductVideo(product, outputDir = './public/videos', options = {}) {
    const farm = isPastureOrFarm(product);
    const productKey = product?.id || product?.asin || product?.name || 'nws';
    const pool = farm ? FARM_AVATAR_POOL : GARDEN_AVATAR_POOL;
    const picked = pickFromPool(pool, productKey);

    const avatarOverride = product?.heygenAvatarId || product?.heygen_avatar_id || product?.HEYGEN_AVATAR_ID;
    const voiceOverride  = product?.heygenVoiceId  || product?.heygen_voice_id  || product?.HEYGEN_VOICE_ID;

    process.env.HEYGEN_FORCE_COLOR_BACKGROUND = process.env.HEYGEN_FORCE_COLOR_BACKGROUND || '0';

    return super.generateProductVideo(product, outputDir, {
      ...options,
      avatarId: avatarOverride || picked.avatar_id,
      voiceId:  voiceOverride  || picked.voice_id,
      background: options.background || '#123f2b',
      productImage: options.productImage || product?.image || null,
      marketingContext: getMarketingContext(product),
    });
  }

  // Override createVideo to emit 5 scenes with Pexels b-roll backgrounds
  // and avatar pinned to the lower-right corner.
  async createVideo({
    script,
    title,
    avatarId,
    voiceId,
    background = '#0d3b2a',
    productImage = null,
    product = null,
  }) {
    if (!voiceId) {
      throw new Error('HeyGen voice_id is required for v2/video/generate.');
    }

    this.log(`Creating 5-scene marketing video: ${title}`);

    const ctx = getMarketingContext(product || {});
    const farm = isPastureOrFarm(product || {});
    const sceneQueries = farm ? SCENE_QUERIES_FARM : SCENE_QUERIES_GARDEN;
    const customBroll = Array.isArray(ctx.brollScenes) ? ctx.brollScenes.filter(Boolean) : [];
    const sceneScripts = splitScriptIntoFiveScenes(script, ctx);

    const video_inputs = [];
    for (let i = 0; i < 5; i++) {
      const queries = [];
      if (customBroll[i]) queries.push(customBroll[i]);
      queries.push(...sceneQueries[i]);

      const bgUrl = await fetchPexelsBackground(queries);
      const sceneBackground = bgUrl
        ? { type: 'video', url: bgUrl, play_style: 'fit_to_scene' }
        : (i === 0 && productImage)
          ? { type: 'image', url: productImage, fit: 'cover' }
          : { type: 'color', value: background };

      video_inputs.push({
        character: {
          type: 'avatar',
          avatar_id: avatarId,
          avatar_style: 'normal',
          scale: 0.32,
          offset: { x: 0.33, y: 0.33 }, // lower-right corner
        },
        voice: {
          type: 'text',
          input_text: sceneScripts[i],
          voice_id: voiceId,
          speed: 1.03,
        },
        background: sceneBackground,
      });
    }

    const videoData = {
      video_inputs,
      dimension: { width: 1920, height: 1080 },
      aspect_ratio: '16:9',
      test: process.env.HEYGEN_TEST_MODE === '1',
      caption: true,
      callback_id: `nws_mkt_${Date.now()}`,
    };

    const response = await this.fetchWithRetry(`${this.baseUrl}/video/generate`, {
      method: 'POST',
      headers: {
        'X-Api-Key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(videoData),
    }, {
      label: 'create-video-marketing-5scene',
      retries: this.maxRetries,
      timeoutMs: this.requestTimeoutMs,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HeyGen API error (5-scene): ${response.status} - ${error}`);
    }

    const result = await response.json();
    this.log(`5-scene video creation initiated - Video ID: ${result.data.video_id}`);
    return { videoId: result.data.video_id, status: 'processing', title };
  }
}

export default HeyGenMarketingVideoGenerator;
EOF

