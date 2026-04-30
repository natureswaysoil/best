import fs from 'fs';

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(field);
      field = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(field);
      if (row.some((value) => String(value || '').trim() !== '')) rows.push(row);
      row = [];
      field = '';
      continue;
    }

    field += char;
  }

  row.push(field);
  if (row.some((value) => String(value || '').trim() !== '')) rows.push(row);
  return rows;
}

export function normalizeHeader(header) {
  return String(header || '')
    .trim()
    .replace(/^\uFEFF/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function pick(row, ...keys) {
  for (const key of keys) {
    const normalized = normalizeHeader(key);
    if (row[normalized] !== undefined && String(row[normalized]).trim()) {
      return String(row[normalized]).trim();
    }
  }
  return '';
}

function parseDelimitedList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item) => String(item || '').trim()).filter(Boolean);
  return String(value)
    .split(/[|,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function pickMany(row, ...keys) {
  const values = [];
  for (const key of keys) {
    const value = pick(row, key);
    if (value) values.push(...parseDelimitedList(value));
  }
  return Array.from(new Set(values));
}

function compactObject(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => {
    if (value === null || value === undefined) return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'string') return value.trim() !== '';
    return true;
  }));
}

function mapRowToProduct(row, index) {
  const asin = pick(row, 'asin', 'ASIN', 'amazon_asin');
  const id = pick(row, 'id', 'product_id', 'product id', 'sku', 'product sku', 'nws_id', 'nws id', 'product_code') || (asin ? `ASIN_${asin}` : `SHEET_${String(index + 1).padStart(3, '0')}`);
  const name = pick(row, 'name', 'product_name', 'product name', 'title', 'product_title', 'product title', 'amazon_title', 'amazon title') || asin || id;

  const image = pick(row,
    'image', 'image_url', 'image url', 'main_image', 'main image', 'product_image', 'product image',
    'background_image', 'background image', 'heygen_background_image', 'heygen background image',
    'hero_image', 'hero image', 'thumbnail', 'thumbnail_url'
  );

  const brollImages = pickMany(row,
    'brollImages', 'broll_images', 'b-roll images', 'b roll images', 'b_roll_images',
    'broll', 'b-roll', 'b roll', 'b_roll', 'extra_images', 'extra images',
    'image_gallery', 'image gallery', 'gallery_images', 'gallery images',
    'scene_images', 'scene images', 'product_images', 'product images',
    'video_broll', 'video broll', 'video_b_roll', 'video b-roll',
    'heygen_broll', 'heygen broll', 'visual_assets', 'visual assets'
  );

  const product = {
    id,
    name,
    category: pick(row, 'category', 'product_category', 'product category', 'type') || 'General',
    usage: parseDelimitedList(pick(row, 'usage', 'instructions', 'directions', 'how_to_use', 'how to use', 'application_rate', 'application rate')),
    asin: asin || null,
    image: image || null,
    description: pick(row, 'description', 'product_description', 'product description', 'short_description', 'short description', 'bullet_1', 'bullet 1') || '',
    videoScript: pick(row, 'videoScript', 'video_script', 'video script', 'script', 'voiceover', 'voice_over', 'voice over', 'heygen_script', 'heygen script') || null,
    heygenAvatarId: pick(row, 'heygenAvatarId', 'heygen_avatar_id', 'heygen avatar id', 'avatar_id', 'avatar id', 'HEYGEN_AVATAR_ID', 'avatar') || null,
    heygenVoiceId: pick(row, 'heygenVoiceId', 'heygen_voice_id', 'heygen voice id', 'voice_id', 'voice id', 'HEYGEN_VOICE_ID', 'voice') || null,
    heygenBackground: pick(row, 'heygen_background', 'heygen background', 'background', 'background_prompt', 'background prompt', 'scene_prompt', 'scene prompt') || null,
    visualDirection: pick(row, 'visual_direction', 'visual direction', 'video_visual_direction', 'video visual direction', 'creative_direction', 'creative direction') || null,
    hook: pick(row, 'hook', 'video_hook', 'video hook', 'tiktok_hook', 'tiktok hook', 'first_two_seconds', 'first two seconds') || null,
    cta: pick(row, 'cta', 'call_to_action', 'call to action', 'product_url', 'product url', 'landing_page', 'landing page') || null,
    keywords: parseDelimitedList(pick(row, 'keywords', 'search_terms', 'search terms', 'tags', 'hashtags')),
    brollImages,
    rawSheetRow: compactObject(row),
    _source: 'google_sheet_csv',
  };

  return product;
}

export async function loadProductsFromGoogleSheetCsv(csvUrl, cachePath = null) {
  if (!csvUrl) return [];

  const response = await fetch(csvUrl);
  if (!response.ok) {
    throw new Error(`Google Sheet CSV fetch failed: HTTP ${response.status}`);
  }

  const csvText = await response.text();
  const rows = parseCsv(csvText);
  if (rows.length < 2) return [];

  const originalHeaders = rows[0].map((header) => String(header || '').trim().replace(/^\uFEFF/, ''));
  const headers = rows[0].map(normalizeHeader);
  const products = rows.slice(1)
    .map((values, index) => {
      const row = {};
      headers.forEach((header, headerIndex) => {
        row[header] = values[headerIndex] || '';
      });
      return mapRowToProduct(row, index);
    })
    .filter((product) => product.id && product.name);

  if (cachePath) {
    fs.writeFileSync(cachePath, JSON.stringify({
      _source: 'GOOGLE_SHEET_CSV_URL',
      _generated: new Date().toISOString(),
      _headers: originalHeaders,
      _normalizedHeaders: headers,
      products,
    }, null, 2));
  }

  return products;
}
