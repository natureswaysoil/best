import { GetServerSideProps } from 'next';
import { allProducts } from '../data/products';

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

function entry(loc: string, priority: string) {
  return `  <url><loc>${BASE}/${loc}</loc><changefreq>weekly</changefreq><priority>${priority}</priority></url>`;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const urls = STATIC_ROUTES.map((r) => entry(r, r === '' ? '1.0' : '0.7'));
  try {
    for (const p of (allProducts as any[]) || []) {
      if (p && p.id) urls.push(entry(`product/${p.id}`, '0.8'));
    }
  } catch {}
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;
  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  res.write(xml);
  res.end();
  return { props: {} };
};

export default function SiteMapXml() {
  return null;
}
