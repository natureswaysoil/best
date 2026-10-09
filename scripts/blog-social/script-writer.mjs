// Turns a blog post into a 20-30 second vertical video script plus captions,
// following the brand voice and claim rules in marketing/brand-context.md.

import fs from 'fs';
import path from 'path';
import { PROJECT, blogUrl } from './lib.mjs';
import { collectScriptText, findClaimViolations } from './claims.mjs';

const MODEL = process.env.BLOG_SOCIAL_SCRIPT_MODEL || 'gpt-4o-mini';

export class ClaimViolationError extends Error {
  constructor(violations) {
    super(`Script still breaks claim rules after a retry: ${violations.join('; ')}`);
    this.violations = violations;
  }
}

function brandContext() {
  return fs.readFileSync(path.join(PROJECT, 'marketing', 'brand-context.md'), 'utf8');
}

function articleText(post) {
  // Enough of the article for facts; the model must not invent beyond it.
  return String(post.content || '').replace(/\s+/g, ' ').slice(0, 6000);
}

function prompt(post, product) {
  return [
    `Write a short vertical video script and social captions for this Nature's Way Soil blog post.`,
    `Title: ${post.title}`,
    `Excerpt: ${post.excerpt}`,
    `Article (facts must come only from here): ${articleText(post)}`,
    product ? `Related product shown at the end: ${product.name}` : '',
    ``,
    `Return JSON with exactly these keys:`,
    `- hook: one line, max 8 words, from a reader's problem.`,
    `- scenes: exactly 4 objects { "text": on-screen line, max 9 words, "query": a 3-5 word Pexels stock-video search for a real outdoor/garden shot that matches the line }.`,
    `- endCard: max 8 words inviting viewers to read the full guide on NaturesWaySoil.com.`,
    `- captions: { instagram, facebook, tiktok (each 2-4 short sentences plus 4-6 hashtags, no link), twitter (max 200 chars, no link), youtubeTitle (max 90 chars), youtubeDescription (3-5 sentences, no link), pinterestTitle (max 90 chars), pinterestDescription (2-3 sentences) }.`,
    ``,
    `Rules: plain, practical farm voice; explain why it works; results happen over time; never use guarantees, "instant", "eliminate", "cure", "100%", certifications, reviews, star ratings or statistics that are not in the article; say "pet-safe when used as directed" if safety comes up at all.`,
  ].filter(Boolean).join('\n');
}

async function callOpenAI(messages) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, temperature: 0.6, response_format: { type: 'json_object' }, messages }),
  });
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`OpenAI script request failed: HTTP ${response.status} ${body.slice(0, 200)}`);
  }
  const data = await response.json();
  return JSON.parse(data.choices?.[0]?.message?.content || '{}');
}

export function validateScriptShape(script) {
  const problems = [];
  if (!script.hook) problems.push('missing hook');
  if (!Array.isArray(script.scenes) || script.scenes.length !== 4) problems.push('need exactly 4 scenes');
  for (const [i, s] of (script.scenes || []).entries()) {
    if (!s?.text || !s?.query) problems.push(`scene ${i + 1} needs text and query`);
  }
  if (!script.endCard) problems.push('missing endCard');
  for (const key of ['instagram', 'facebook', 'tiktok', 'twitter', 'youtubeTitle', 'youtubeDescription', 'pinterestTitle', 'pinterestDescription']) {
    if (!script.captions?.[key]) problems.push(`missing captions.${key}`);
  }
  return problems;
}

/** Adds the tracked blog link for each platform; links are never left to the model. */
export function withLinks(script, post) {
  const c = script.captions;
  return {
    ...script,
    links: {
      instagram: blogUrl(post, 'instagram'),
      facebook: blogUrl(post, 'facebook'),
      twitter: blogUrl(post, 'twitter'),
      youtube: blogUrl(post, 'youtube'),
      pinterest: blogUrl(post, 'pinterest'),
      tiktok: blogUrl(post, 'tiktok'),
    },
    captions: {
      ...c,
      twitter: String(c.twitter).slice(0, 200),
      youtubeTitle: String(c.youtubeTitle).slice(0, 95),
      pinterestTitle: String(c.pinterestTitle).slice(0, 95),
    },
  };
}

export async function writeScript(post, product) {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is required to write the video script.');
  const messages = [
    { role: 'system', content: `You are the copywriter on the Nature's Way Soil marketing team. Follow this brand context exactly:\n\n${brandContext()}` },
    { role: 'user', content: prompt(post, product) },
  ];

  let script = await callOpenAI(messages);
  for (let attempt = 0; attempt < 2; attempt++) {
    const shape = validateScriptShape(script);
    const violations = shape.length ? [] : findClaimViolations(collectScriptText(script));
    if (!shape.length && !violations.length) return withLinks(script, post);
    if (attempt === 1) {
      if (shape.length) throw new Error(`Script is incomplete after a retry: ${shape.join('; ')}`);
      throw new ClaimViolationError(violations);
    }
    messages.push({ role: 'assistant', content: JSON.stringify(script) });
    messages.push({
      role: 'user',
      content: `Fix these problems and return the full JSON again: ${[...shape, ...violations].join('; ')}`,
    });
    script = await callOpenAI(messages);
  }
  throw new Error('unreachable');
}
