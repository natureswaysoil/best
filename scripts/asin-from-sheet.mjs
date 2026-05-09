#!/usr/bin/env node
/**
 * Sync product rows from Google Sheets into content/video-scripts/sheet-products.json.
 *
 * Usage:
 *   node scripts/asin-from-sheet.mjs <spreadsheetId> <sheetGid> <outputFile>
 *
 * Or with env vars:
 *   GOOGLE_SHEET_ID=... GOOGLE_SHEET_GID=... node scripts/asin-from-sheet.mjs
 *   GOOGLE_SHEET_CSV_URL=... node scripts/asin-from-sheet.mjs
 *
 * Notes:
 * - This uses the Google Sheets CSV export URL, so the sheet must be accessible
 *   to the environment running the script. For private sheets, publish/share the
 *   sheet appropriately or provide a working GOOGLE_SHEET_CSV_URL.
 * - No extra npm dependencies are required.
 */

import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const spreadsheetId = args[0] || process.env.GOOGLE_SHEET_ID || '';
const sheetGid = args[1] || process.env.GOOGLE_SHEET_GID || '0';
const outputFile = args[2] || path.join('content', 'video-scripts', 'sheet-products.json');
const directCsvUrl = process.env.GOOGLE_SHEET_CSV_URL || process.env.CSV_URL || '';

function buildCsvUrl() {
  if (directCsvUrl) return directCsvUrl;
  if (!spreadsheetId) {
    throw new Error('Missing spreadsheet ID. Set GOOGLE_SHEET_ID or GOOGLE_SHEET_CSV_URL.');
  }
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${sheetGid}`;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(cell);
      cell = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i++;
      row.push(cell);
      if (row.some((value) => String(value || '').trim() !== '')) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }

  row.push(cell);
  if (row.some((value) => String(value || '').trim() !== '')) rows.push(row);
  return rows;
}

function first(record, names) {
  for (const name of names) {
    const value = record[name];
    if (value !== undefined && value !== null && String(value).trim() !== '') return String(value).trim();
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

function normalizeProduct(record, index) {
  const asin = first(record, ['asin', 'ASIN', 'Parent_ASIN', 'parent_asin']);
  const explicitId = first(record, ['id', 'ID', 'Product_ID', 'product_id', 'Product Id', 'Video_Product_ID']);
  const sku = first(record, ['sku', 'SKU']);
  const name = first(record, ['name', 'Name', 'title', 'Title', 'Product', 'Product_Name', 'Product Name']);
  const description = first(record, ['description', 'Description', 'details', 'Details', 'Product Description', 'Product_Description', 'caption', 'Caption']);
  const category = first(record, ['category', 'Category', 'Product_Category', 'Product Category']) || 'General';
  const image = first(record, ['image', 'Image', 'Product_Image', 'Product Image', 'Image_URL', 'image_url', 'Product_Image_URL', 'Main_Image_URL']);
  const videoScript = first(record, ['videoScript', 'VideoScript', 'Video_Script', 'video_script', 'Script', 'script']);
  const usage = parseDelimitedList(first(record, ['usage', 'Usage', 'instructions', 'Instructions', 'Directions', 'directions']));
  const keywords = parseDelimitedList(first(record, ['keywords', 'Keywords', 'tags', 'Tags', 'Search_Terms']));
  const brollImages = parseDelimitedList(first(record, ['brollImages', 'Broll_Images', 'broll_images', 'b_roll_images', 'B-Roll Images', 'Images', 'images']));

  const id = explicitId || (sku && /^NWS_\d{3}$/i.test(sku) ? sku.toUpperCase() : '') || (asin ? `ASIN_${asin}` : `SHEET_${String(index + 1).padStart(3, '0')}`);

  return {
    id,
    name: name || asin || id,
    category,
    usage,
    asin: asin || null,
    image: image || null,
    description,
    videoScript: videoScript || null,
    heygenAvatarId: first(record, ['heygenAvatarId', 'HEYGEN_AVATAR_ID', 'heygen_avatar_id']) || null,
    heygenVoiceId: first(record, ['heygenVoiceId', 'HEYGEN_VOICE_ID', 'heygen_voice_id']) || null,
    keywords,
    brollImages,
    _rowNumber: index + 2,
    _sourceRecord: record,
  };
}

async function main() {
  const csvUrl = buildCsvUrl();

  console.log('📋 Google Sheet Product Sync');
  console.log('============================');
  console.log(`CSV URL: ${csvUrl.replace(/([?&](?:key|token|access_token)=)[^&]+/gi, '$1***')}`);
  console.log(`Output file: ${outputFile}`);
  console.log('');

  const response = await fetch(csvUrl);
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Google Sheet CSV fetch failed ${response.status}: ${body.slice(0, 300)}`);
  }

  const csv = await response.text();
  const rows = parseCsv(csv);
  if (rows.length < 2) throw new Error('CSV has no data rows.');

  const headers = rows[0].map((header) => String(header || '').trim());
  const products = rows.slice(1)
    .map((cols, index) => {
      const record = {};
      headers.forEach((header, colIndex) => {
        if (header) record[header] = String(cols[colIndex] || '').trim();
      });
      return normalizeProduct(record, index);
    })
    .filter((product) => product.id && product.name);

  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, JSON.stringify({
    _comment: 'Generated by scripts/asin-from-sheet.mjs',
    _source: directCsvUrl ? 'GOOGLE_SHEET_CSV_URL' : `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
    _sheetGid: sheetGid,
    _generated: new Date().toISOString(),
    _headerCount: headers.length,
    _rowCount: products.length,
    products,
  }, null, 2));

  console.log(`✅ Synced ${products.length} products to ${outputFile}`);
  const sample = products.slice(0, 8).map((p) => p.id).join(', ');
  if (sample) console.log(`Sample product IDs: ${sample}`);
}

main().catch((error) => {
  console.error(`❌ Sheet sync failed: ${error.message}`);
  process.exit(1);
});
