#!/usr/bin/env node

/**
 * Automated Blog Content Generator — Nature's Way Soil
 * Uses OpenAI to generate genuinely unique, SEO-quality articles.
 * Focus: product-relevant problem searches that can convert into purchases or quote requests.
 */

import { promises as fs } from 'fs';
import path from 'path';
import https from 'https';

const BLOG_DATA_PATH = path.join(process.cwd(), 'data', 'blog.ts');
const LOG_FILE = path.join(process.cwd(), 'auto-blog-generation.log');

const PRODUCT_FOCUS_AREAS = [
  'dog urine lawn spots and outdoor pet area odor control',
  'compacted clay soil and liquid lawn soil conditioner',
  'liquid biochar for soil restoration and water retention',
  'humic acid, fulvic acid, and kelp for lawn root-zone support',
  'horse pasture, hay field, food plot, and large lawn recovery',
  'compost, worm castings, activated biochar, and living-soil amendments',
  'government grounds maintenance, parks, housing, and facility turf care',
  'North Carolina lawn, pasture, clay soil, and garden soil problems',
];

const REQUIRED_INTERNAL_LINKS = [
  '/pet-lawn-spot-odor-control',
  '/compacted-clay-soil',
  '/liquid-biochar-soil-restoration',
  '/pasture-lawn-recovery',
  '/homeowners-landscapers-government',
  '/government',
  '/shop',
];

async function logActivity(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(logMessage.trim());
  try { await fs.appendFile(LOG_FILE, logMessage); } catch {}
}

async function readExistingArticles() {
  try {
    const content = await fs.readFile(BLOG_DATA_PATH, 'utf-8');
    const slugs = [...content.matchAll(/"slug":\s*"([^"]+)"/g)].map(m => m[1]);
    const titles = [...content.matchAll(/"title":\s*"([^"]+)"/g)].map(m => m[1].toLowerCase());
    return { slugs: [...new Set(slugs)], titles: [...new Set(titles)] };
  } catch {
    return { slugs: [], titles: [] };
  }
}

function callOpenAI(prompt, systemPrompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 2600,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ]
    });
    const req = https.request({
      hostname: 'api.openai.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) return reject(new Error(parsed.error.message));
          resolve(parsed.choices[0].message.content);
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function generateUniqueTopic(existingTitles) {
  const existingList = existingTitles.slice(0, 50).join('\n- ');
  const systemPrompt = `You are an SEO content strategist for Nature's Way Soil, a small family farm in Snow Hill, NC selling liquid soil conditioners, dog lawn spot products, liquid biochar, worm castings, compost, kelp, humic acid, pasture fertilizer, and government-friendly grounds products. Return valid JSON only. No markdown.`;
  const prompt = `Generate ONE unique, buyer-intent blog article topic.

EXISTING ARTICLES (do NOT repeat):
- ${existingList}

Only choose from these product-relevant topic areas:
- ${PRODUCT_FOCUS_AREAS.join('\n- ')}

Do NOT choose generic lifestyle topics like vertical gardening, companion planting, herbs, decor, or broad gardening unless the article directly connects to a Nature's Way Soil product and a buying problem.

Return ONLY this JSON:
{
  "title": "SEO title 50-65 chars",
  "slug": "url-slug-no-special-chars-max-60-chars",
  "category": "Lawn Care or Soil Health or Product Guide or Farming or Government Grounds",
  "tags": ["tag1","tag2","tag3","tag4"],
  "seoTitle": "meta title 55-60 chars",
  "seoDescription": "meta description 145-160 chars",
  "readTime": 7,
  "targetKeyword": "primary search phrase",
  "productMention": "main Nature's Way Soil product or page to mention",
  "internalLink": "one of these paths: ${REQUIRED_INTERNAL_LINKS.join(', ')}",
  "contentPrompt": "3-4 sentences: exact buyer problem, who searches it, which NWS products/pages to mention, and what next step to recommend"
}`;
  const response = await callOpenAI(prompt, systemPrompt);
  return JSON.parse(response.replace(/```json|```/g, '').trim());
}

async function generateArticleContent(topic) {
  const systemPrompt = `You are an expert lawn, soil, and organic gardening writer for Nature's Way Soil, a family farm in Snow Hill, NC. Write specific, practical, product-relevant content. Return valid JSON only. No markdown fences.`;
  const prompt = `Write a complete blog article for Nature's Way Soil.

Title: ${topic.title}
Target keyword: ${topic.targetKeyword}
Product/page to mention: ${topic.productMention}
Internal link to include naturally: ${topic.internalLink}
Direction: ${topic.contentPrompt}
Tags: ${topic.tags.join(', ')}

Requirements:
- 900-1200 words, genuinely useful, no generic filler
- Use ## and ### markdown headers
- Include a short answer in the first 120 words
- Include at least one actionable how-to section with numbered steps
- Include one section titled "Recommended Nature's Way Soil Product"
- Mention only relevant products naturally: dog lawn spot support, liquid soil conditioner, liquid biochar, humic/fulvic/kelp, compost, worm castings, pasture fertilizer, or government quote page
- Include this exact markdown link once where relevant: [View the recommended Nature's Way Soil solution](${topic.internalLink})
- End with a CTA to shop or request a quote at natureswaysoil.com
- Do not mention "Premium Organic Soil Mix" unless the topic is specifically about potting or garden soil

Return ONLY:
{"excerpt":"150-160 char excerpt","content":"full markdown content"}`;
  const response = await callOpenAI(prompt, systemPrompt);
  return JSON.parse(response.replace(/```json|```/g, '').trim());
}

async function addArticleToBlogData(article) {
  const content = await fs.readFile(BLOG_DATA_PATH, 'utf-8');
  const marker = 'export const blogArticles: BlogArticle[] = [';
  const arrayStart = content.indexOf(marker);
  if (arrayStart === -1) throw new Error('Could not find blogArticles array');
  const insertAt = arrayStart + marker.length;
  const articleJson = '\n  ' + JSON.stringify(article, null, 2).replace(/\n/g, '\n  ') + ',';
  const newContent = content.slice(0, insertAt) + articleJson + content.slice(insertAt);
  await fs.writeFile(BLOG_DATA_PATH, newContent, 'utf-8');
}

async function generateNewContent() {
  await logActivity('Starting product-focused blog content generation');

  if (!process.env.OPENAI_API_KEY) {
    await logActivity('No OPENAI_API_KEY — skipping');
    return null;
  }

  const { slugs: existingSlugs, titles: existingTitles } = await readExistingArticles();
  await logActivity(`Found ${existingSlugs.length} existing unique articles`);

  const topic = await generateUniqueTopic(existingTitles);
  await logActivity(`Topic: "${topic.title}" targeting "${topic.targetKeyword}"`);

  let slug = topic.slug.slice(0, 60);
  if (existingSlugs.includes(slug)) {
    slug = `${slug.slice(0, 50)}-${new Date().toISOString().slice(0, 10)}`;
  }

  const articleBody = await generateArticleContent(topic);
  await logActivity(`Generated ~${articleBody.content.split(' ').length} words`);

  const now = new Date().toISOString();
  const article = {
    id: slug,
    title: topic.title,
    slug,
    excerpt: articleBody.excerpt,
    content: articleBody.content,
    author: "Nature's Way Soil Team",
    publishedAt: now,
    updatedAt: now,
    featuredImage: `/images/blog/${slug}.jpg`,
    tags: topic.tags,
    category: topic.category,
    readTime: topic.readTime,
    seoTitle: topic.seoTitle,
    seoDescription: topic.seoDescription
  };

  await addArticleToBlogData(article);
  await logActivity(`Added: "${article.title}" (${slug})`);
  return { success: true, article };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generateNewContent()
    .then(r => {
      if (r?.article) {
        console.log(`\nGenerated: "${r.article.title}"`);
        console.log(`Slug: ${r.article.slug}`);
      }
    })
    .catch(err => { console.error('Error:', err.message); process.exit(1); });
}
