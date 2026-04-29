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

function normalizeHeader(header) {
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
  return String(value)
    .split(/[|,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function mapRowToProduct(row, index) {
  const asin = pick(row, 'asin', 'ASIN');
  const id = pick(row, 'id', 'product_id', 'sku', 'product sku', 'nws_id') || (asin ? `ASIN_${asin}` : `SHEET_${String(index + 1).padStart(3, '0')}`);
  const name = pick(row, 'name', 'product_name', 'title', 'product title', 'amazon_title') || asin || id;
  const image = pick(row, 'image', 'image_url', 'main_image', 'product_image', 'background_image');
  const broll = pick(row, 'brollImages', 'broll_images', 'b_roll_images', 'broll', 'b_roll', 'extra_images', 'image_gallery');

  return {
    id,
    name,
    category: pick(row, 'category', 'product_category') || 'General',
    usage: parseDelimitedList(pick(row, 'usage', 'instructions', 'directions', 'how_to_use')),
    asin: asin || null,
    image: image || null,
    description: pick(row, 'description', 'product_description', 'short_description', 'bullet_1') || '',
    videoScript: pick(row, 'videoScript', 'video_script', 'script', 'voiceover', 'voice_over') || null,
    heygenAvatarId: pick(row, 'heygenAvatarId', 'heygen_avatar_id', 'avatar_id', 'HEYGEN_AVATAR_ID') || null,
    heygenVoiceId: pick(row, 'heygenVoiceId', 'heygen_voice_id', 'voice_id', 'HEYGEN_VOICE_ID') || null,
    keywords: parseDelimitedList(pick(row, 'keywords', 'search_terms', 'tags')),
    brollImages: parseDelimitedList(broll),
    _source: 'google_sheet_csv',
  };
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
      products,
    }, null, 2));
  }

  return products;
}
