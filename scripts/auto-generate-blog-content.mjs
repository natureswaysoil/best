#!/usr/bin/env node

/**
 * Automated Blog Content Generator — Nature's Way Soil
 * Uses OpenAI to generate genuinely unique, SEO-quality articles.
 */

import { promises as fs } from 'fs';
import path from 'path';
import https from 'https';

const BLOG_DATA_PATH = path.join(process.cwd(), 'data', 'blog.ts');
const LOG_FILE = path.join(process.cwd(), 'auto-blog-generation.log');

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
      max_tokens: 2000,
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
  const existingList = existingTitles.slice(0, 30).join('\n- ');
  const systemPrompt = `You are an SEO content strategist for Nature's Way Soil, a small family farm in Snow Hill, NC selling premium organic fertilizers, biochar, worm castings, compost, kelp, and humic acid on Amazon, Walmart, and their website. Return valid JSON only. No markdown.`;
  const prompt = `Generate ONE unique blog article topic.

EXISTING ARTICLES (do NOT repeat):
- ${existingList}

Target product-relevant angles: biochar benefits, worm castings uses, humic acid for soil, pet-safe lawn fertilizer, organic tomato growing, fixing clay soil, spring soil prep, raised bed soil, horse pasture management, dog urine lawn repair, blueberry soil pH, strawberry fertilizer, fall garden prep, liquid kelp foliar spray, compost tea brewing.

Return ONLY this JSON:
{
  "title": "SEO title 50-65 chars",
  "slug": "url-slug-no-special-chars-max-60-chars",
  "category": "Soil Health or Organic Gardening or Lawn Care or Farming or Product Guide",
  "tags": ["tag1","tag2","tag3","tag4"],
  "seoTitle": "meta title 55-60 chars",
  "seoDescription": "meta description 145-160 chars",
  "readTime": 8,
  "contentPrompt": "3-4 sentences: unique angle, key points, which NWS products to mention"
}`;
  const response = await callOpenAI(prompt, systemPrompt);
  return JSON.parse(response.replace(/```json|```/g, '').trim());
}

async function generateArticleContent(topic) {
  const systemPrompt = `You are an expert organic gardening writer for Nature's Way Soil, a family farm in Snow Hill, NC. Write warmly and knowledgeably. Return valid JSON only. No markdown fences.`;
  const prompt = `Write a complete blog article:

Title: ${topic.title}
Direction: ${topic.contentPrompt}
Tags: ${topic.tags.join(', ')}

Requirements:
- 900-1200 words, genuine unique content
- Use ## and ### markdown headers
- At least one actionable how-to section with numbered steps
- Mention Nature's Way Soil products naturally: biochar, worm castings, liquid fertilizer, humic acid, kelp
- End with CTA to shop at natureswaysoil.com
- No generic filler sentences

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
  await logActivity('Starting blog content generation');

  if (!process.env.OPENAI_API_KEY) {
    await logActivity('No OPENAI_API_KEY — skipping');
    return null;
  }

  const { slugs: existingSlugs, titles: existingTitles } = await readExistingArticles();
  await logActivity(`Found ${existingSlugs.length} existing unique articles`);

  const topic = await generateUniqueTopic(existingTitles);
  await logActivity(`Topic: "${topic.title}"`);

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
