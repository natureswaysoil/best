// Generates public/sitemap.xml at build time. No TS/page type-check surface.
const fs = require('fs');
const path = require('path');

const BASE = 'https://natureswaysoil.com';
const STATIC_ROUTES = [
  '', 'shop', 'solutions', 'about', 'bio', 'guide', 'blog', 'contact',
  'government', 'homeowners-landscapers-government',
  'pasture-boost', 'pasture-lawn-recovery', 'pasture-hay-farmers',
  'soil-boost', 'soil-recovery-systems', 'soil-success-guide',
  'liquid-biochar-soil-restoration', 'dog-urine-lawn-repair',
  'pet-lawn-spot-odor-control', 'lawn-repair', 'home-garden-fertilizer',
  'living-compost', 'compacted-clay-soil',
  'shipping', 'returns', 'privacy', 'terms',
];

let productIds = [];
try {
  const src = fs.readFileSync(path.join(__dirname, '..', 'data', 'products.ts'), 'utf8');
  productIds = [...src.matchAll(/id:\s*'([^']+)'/g)].map((m) => m[1]);
} catch (e) {
  console.warn('gen-sitemap: could not read products.ts:', e.message);
}

const entry = (loc, pr) =>
  `  <url><loc>${BASE}/${loc}</loc><changefreq>weekly</changefreq><priority>${pr}</priority></url>`;

const urls = [
  ...STATIC_ROUTES.map((r) => entry(r, r === '' ? '1.0' : '0.7')),
  ...productIds.map((id) => entry(`product/${id}`, '0.8')),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
fs.mkdirSync(path.join(__dirname, '..', 'public'), { recursive: true });
fs.writeFileSync(path.join(__dirname, '..', 'public', 'sitemap.xml'), xml);
console.log(`gen-sitemap: wrote ${urls.length} urls (${productIds.length} products) to public/sitemap.xml`);
