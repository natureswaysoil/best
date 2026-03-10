import type { GetServerSideProps } from 'next';
import { blogArticles } from '../data/blog';

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const host = 'https://natureswaysoil.com';
  const now = new Date().toISOString();

  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'weekly' },
    { url: '/shop', priority: '0.9', changefreq: 'weekly' },
    { url: '/blog', priority: '0.8', changefreq: 'daily' },
    { url: '/about', priority: '0.7', changefreq: 'monthly' },
    { url: '/contact', priority: '0.6', changefreq: 'monthly' },
    { url: '/dog-urine-lawn-repair', priority: '0.7', changefreq: 'monthly' },
    { url: '/home-garden-fertilizer', priority: '0.7', changefreq: 'monthly' },
    { url: '/pasture-hay-farmers', priority: '0.7', changefreq: 'monthly' },
  ];

  // Deduplicate blog articles by slug
  const seen = new Set<string>();
  const uniqueArticles = blogArticles.filter(a => {
    if (seen.has(a.slug)) return false;
    seen.add(a.slug);
    return true;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(p => `  <url>
    <loc>${host}${p.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
${uniqueArticles.map(a => `  <url>
    <loc>${host}/blog/${a.slug}</loc>
    <lastmod>${a.updatedAt || a.publishedAt || now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  res.write(xml);
  res.end();

  return { props: {} };
};

export default function SitemapXml() {
  return null;
}
