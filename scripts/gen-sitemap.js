// Generates public/sitemap.xml at build time.
// Keep the XML sitemap limited to canonical, indexable URLs that actually exist.
const fs = require('fs');
const path = require('path');

const BASE = 'https://natureswaysoil.com';
const ROOT = path.join(__dirname, '..');
const PAGES = path.join(ROOT, 'pages');

// Canonical public landing pages only. Do not add aliases/redirect sources here.
const STATIC_ROUTES = [
  '', 'shop', 'solutions', 'about', 'bio', 'guide', 'blog', 'contact',
  'government', 'homeowners-landscapers-government',
  'pasture-boost', 'pasture-lawn-recovery', 'pasture-hay-farmers',
  'soil-boost', 'soil-recovery-systems', 'soil-success-guide',
  'liquid-biochar-soil-restoration', 'liquid-biochar',
  'dog-urine-lawn-repair', 'pet-lawn-spot-odor-control',
  'home-garden-fertilizer', 'fruit-tree-fertilizer',
  'lawn-soil-recovery-system', 'living-compost', 'compacted-clay-soil',
  'soil-advisor', 'shipping', 'returns', 'privacy', 'terms',
];

// URLs in next.config.js that intentionally redirect. A redirect source must never
// be submitted in the XML sitemap because Google expects sitemap URLs to return 200.
const REDIRECT_SOURCES = new Set([
  'lawn-repair',
  'dog-urine-neutralizer-bundle',
  'products',
  'privacy-policy',
  'refund-policy',
  'governement',
]);

function pageExists(route) {
  const name = route === '' ? 'index' : route;
  return ['tsx', 'ts', 'jsx', 'js'].some((ext) =>
    fs.existsSync(path.join(PAGES, `${name}.${ext}`))
  );
}

function canonicalStaticRoutes() {
  const unique = [...new Set(STATIC_ROUTES)];
  const valid = [];

  for (const route of unique) {
    if (REDIRECT_SOURCES.has(route)) {
      console.warn(`gen-sitemap: excluding redirect source /${route}`);
      continue;
    }
    if (!pageExists(route)) {
      console.warn(`gen-sitemap: excluding missing page /${route}`);
      continue;
    }
    valid.push(route);
  }
  return valid;
}

let productIds = [];
let blogSlugs = [];
try {
  const src = fs.readFileSync(path.join(ROOT, 'data', 'products.ts'), 'utf8');
  productIds = [...new Set([...src.matchAll(/id:\s*'([^']+)'/g)].map((m) => m[1]))];
} catch (e) {
  console.warn('gen-sitemap: could not read products.ts:', e.message);
}

try {
  const src = fs.readFileSync(path.join(ROOT, 'data', 'blog.ts'), 'utf8');
  blogSlugs = [...new Set([...src.matchAll(/"slug":\s*"([^"]+)"/g)].map((m) => m[1]))];
} catch (e) {
  console.warn('gen-sitemap: could not read blog.ts:', e.message);
}

const xmlEscape = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const entry = (loc, priority) => {
  const url = loc ? `${BASE}/${loc}` : `${BASE}/`;
  return `  <url><loc>${xmlEscape(url)}</loc><priority>${priority}</priority></url>`;
};

const staticRoutes = canonicalStaticRoutes();
const urls = [
  ...staticRoutes.map((route) => entry(route, route === '' ? '1.0' : '0.7')),
  ...productIds.map((id) => entry(`product/${encodeURIComponent(id)}`, '0.8')),
  ...blogSlugs.map((slug) => entry(`blog/${encodeURIComponent(slug)}`, '0.7')),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
fs.mkdirSync(path.join(ROOT, 'public'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'public', 'sitemap.xml'), xml);
console.log(`gen-sitemap: wrote ${urls.length} canonical URLs (${staticRoutes.length} static, ${productIds.length} products, ${blogSlugs.length} articles)`);
