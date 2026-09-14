// Generates public/sitemap.xml at build time.
// Keep the XML sitemap limited to canonical, indexable URLs that actually exist.
const fs = require('fs');
const path = require('path');

// Vercel redirects the apex domain to www. Keep every submitted/canonical URL
// on the final 200-response host so search engines do not have to reconcile a
// canonical URL that immediately redirects elsewhere.
const BASE = 'https://www.natureswaysoil.com';
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
let blogArticles = [];
try {
  const src = fs.readFileSync(path.join(ROOT, 'data', 'products.ts'), 'utf8');
  productIds = [...new Set([...src.matchAll(/id:\s*'([^']+)'/g)].map((m) => m[1]))];
} catch (e) {
  console.warn('gen-sitemap: could not read products.ts:', e.message);
}

try {
  const src = fs.readFileSync(path.join(ROOT, 'data', 'blog.ts'), 'utf8');
  // Generated entries use quoted property names/double-quoted values, while
  // older hand-authored entries use unquoted properties/single-quoted values.
  // Read both formats and keep each article's publication date for <lastmod>.
  const articlePattern = /(?:^|\n)\s*(?:"slug"|slug):\s*(["'])([^"']+)\1,[\s\S]*?(?:"publishedAt"|publishedAt):\s*(["'])([^"']+)\3/g;
  const bySlug = new Map();
  for (const match of src.matchAll(articlePattern)) {
    const [, , slug, , publishedAt] = match;
    if (!bySlug.has(slug)) bySlug.set(slug, publishedAt);
  }
  blogArticles = [...bySlug].map(([slug, publishedAt]) => ({ slug, publishedAt }));
} catch (e) {
  console.warn('gen-sitemap: could not read blog.ts:', e.message);
}

const xmlEscape = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const entry = (loc, priority, lastmod) => {
  const url = loc ? `${BASE}/${loc}` : `${BASE}/`;
  const modified = lastmod ? `<lastmod>${xmlEscape(new Date(lastmod).toISOString())}</lastmod>` : '';
  return `  <url><loc>${xmlEscape(url)}</loc>${modified}<priority>${priority}</priority></url>`;
};

const staticRoutes = canonicalStaticRoutes();
const urls = [
  ...staticRoutes.map((route) => entry(route, route === '' ? '1.0' : '0.7')),
  ...productIds.map((id) => entry(`product/${encodeURIComponent(id)}`, '0.8')),
  ...blogArticles.map(({ slug, publishedAt }) => entry(`blog/${encodeURIComponent(slug)}`, '0.7', publishedAt)),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
fs.mkdirSync(path.join(ROOT, 'public'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'public', 'sitemap.xml'), xml);
console.log(`gen-sitemap: wrote ${urls.length} canonical URLs (${staticRoutes.length} static, ${productIds.length} products, ${blogArticles.length} articles)`);
