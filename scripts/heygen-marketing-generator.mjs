#!/usr/bin/env node
/**
 * Marketing-mode wrapper around the base HeyGen generator.
 *
 * Goals:
 * - Use Google Sheet row info as the source of truth.
 * - Write a hook + problem + solution + proof + CTA script with OpenAI.
 * - Prefer garden/farm-friendly avatar and voice aliases.
 * - Avoid plain white-background product videos by giving HeyGen stronger
 *   garden/product visual direction. Pexels post-processing still adds the
 *   real b-roll layer after HeyGen finishes.
 */

import BaseHeyGenVideoGenerator from './heygen-video-generator.mjs';

const GARDEN_AVATAR_ID = process.env.HEYGEN_GARDEN_AVATAR_ID || 'Anna_public_3_20240108';
const GARDEN_VOICE_ID = process.env.HEYGEN_GARDEN_VOICE_ID || 'f8c69e517f424cafaecde32dde57096b';
const FARM_AVATAR_ID = process.env.HEYGEN_FARM_AVATAR_ID || 'Aditya_public_4';
const FARM_VOICE_ID = process.env.HEYGEN_FARM_VOICE_ID || GARDEN_VOICE_ID;

function pick(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null) {
      const trimmed = String(value).trim();
      if (trimmed) return trimmed;
    }
  }
  return '';
}

function list(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item) => String(item || '').trim()).filter(Boolean);
  return String(value).split(/[|,\n]/).map((item) => item.trim()).filter(Boolean);
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
      'Broll_Scenes', 'B-Roll', 'b-roll', 'Scenes', 'scenes', 'Scene Ideas', 'Video Scenes'
    ])),
  ];
  const painPoint = getRowValue(product, ['painPoint', 'Pain Point', 'Problem', 'Customer Problem', 'Hook']);
  const solution = getRowValue(product, ['solution', 'Solution', 'Benefit', 'Main Benefit', 'Value Proposition']);

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
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return /hay|pasture|forage|horse|cattle|livestock|farm|field/.test(text);
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
          max_tokens: 320,
          messages: [
            {
              role: 'system',
              content: [
                'You are a direct-response video marketer for Nature\'s Way Soil lawn, garden, farm, compost, pet lawn, and plant-care products.',
                'Write one polished 25-35 second spoken script, about 75-95 words.',
                'Structure: 1) strong hook about the customer problem, 2) introduce product as the simple solution, 3) explain the mechanism/benefit in plain language, 4) give one easy usage cue, 5) end with a direct CTA to Nature\'s Way Soil.',
                'Use the sheet data. Mention requested b-roll scenes naturally only if it helps the script, not as camera directions.',
                'Sound helpful, confident, and farm/garden practical. No hype, no medical/disease claims, no guaranteed cure, no pesticide claims unless clearly provided.',
                'Do not include scene labels, timestamps, hashtags, emojis, quotation marks, or markdown. Spoken words only.'
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
        return script.replace(/^['\"]|['\"]$/g, '').trim();
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
    const isTomato = /tomato|vegetable|garden/.test(lower);

    const hook = ctx.painPoint || (
      isDog ? 'Dog spots can make a good lawn look rough fast.' :
      isPasture ? 'Thin pasture and slow regrowth can cost you grass when you need it most.' :
      isCompost ? 'If your plants are struggling, the problem may be tired soil.' :
      isTomato ? 'Tomatoes need more than water when they start pushing roots, blooms, and fruit.' :
      'If your plants are not responding, your soil may need a better support system.'
    );

    const benefit = ctx.solution || (
      isDog ? 'It supports the soil around damaged spots while helping fresh green growth return.' :
      isPasture ? 'It helps support root activity, soil biology, and steady forage growth.' :
      isCompost ? 'It adds organic matter, biology, and structure to help roots work better.' :
      'It helps support stronger roots, better nutrient movement, and healthier growth.'
    );

    const usage = ctx.usage[0] || 'Mix with water and apply evenly around the root zone or target area.';

    return `${hook} ${ctx.name} from Nature's Way Soil is built as the simple, natural solution. ${benefit} ${usage} Use it as part of your regular lawn, garden, or soil care routine. Feed the soil first, and give your plants the foundation they need. Visit Nature's Way Soil to get yours today.`;
  }

  async generateProductVideo(product, outputDir = './public/videos', options = {}) {
    const farm = isPastureOrFarm(product);
    const ctx = getMarketingContext(product);
    const avatarOverride = product?.heygenAvatarId || product?.heygen_avatar_id || product?.HEYGEN_AVATAR_ID;
    const voiceOverride = product?.heygenVoiceId || product?.heygen_voice_id || product?.HEYGEN_VOICE_ID;

    process.env.HEYGEN_FORCE_COLOR_BACKGROUND = process.env.HEYGEN_FORCE_COLOR_BACKGROUND || '0';

    return super.generateProductVideo(product, outputDir, {
      ...options,
      background: options.background || '#123f2b',
      avatarId: avatarOverride || (farm ? FARM_AVATAR_ID : GARDEN_AVATAR_ID),
      voiceId: voiceOverride || (farm ? FARM_VOICE_ID : GARDEN_VOICE_ID),
      productImage: options.productImage || product?.image || null,
      marketingContext: ctx,
    });
  }
}

export default HeyGenMarketingVideoGenerator;
