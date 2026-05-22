import type { GetServerSideProps } from 'next'
import articles from '../public/blog_articles.json'

const BASE = 'https://natureswaysoil.com'

const STATIC_PAGES = [
  { loc: `${BASE}/`,                         priority: '1.0', changefreq: 'weekly'  },
  { loc: `${BASE}/shop`,                     priority: '0.9', changefreq: 'weekly'  },
  { loc: `${BASE}/blog`,                     priority: '0.8', changefreq: 'daily'   },
  { loc: `${BASE}/about`,                    priority: '0.7', changefreq: 'monthly' },
  { loc: `${BASE}/contact`,                  priority: '0.6', changefreq: 'monthly' },
  { loc: `${BASE}/dog-urine-lawn-repair`,    priority: '0.7', changefreq: 'monthly' },
  { loc: `${BASE}/home-garden-fertilizer`,   priority: '0.7', changefreq: 'monthly' },
  { loc: `${BASE}/pasture-hay-farmers`,      priority: '0.7', changefreq: 'monthly' },
]

function SitemapXML() { return null }

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const now = new Date().toISOString()

  const staticUrls = STATIC_PAGES.map(p => `
  <url>
    <loc>${p.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('')

  const blogUrls = (articles as any[]).map(a => {
    const date = a.publishDate
      ? new Date(a.publishDate).toISOString().split('T')[0]
      : now.split('T')[0]
    return `
  <url>
    <loc>${BASE}/blog/${a.slug}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`
  }).join('')

  const sitemap = \`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
\${staticUrls}
\${blogUrls}
</urlset>\`

  res.setHeader('Content-Type', 'application/xml')
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=3600')
  res.write(sitemap)
  res.end()
  return { props: {} }
}

export default SitemapXML
