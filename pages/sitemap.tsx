import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';

const sitemapSections = [
  {
    title: 'Main Pages',
    links: [
      { label: 'Home', href: '/' },
      { label: 'Shop', href: '/shop' },
      { label: 'Solutions', href: '/solutions' },
      { label: 'Soil Advisor', href: '/soil-advisor' },
      { label: 'Application Guide', href: '/guide' },
      { label: 'Blog', href: '/blog' },
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ]
  },
  {
    title: 'Lawn & Soil Solutions',
    links: [
      { label: 'Dog Urine Lawn Repair', href: '/dog-urine-lawn-repair' },
      { label: 'Lawn & Soil Recovery System', href: '/lawn-soil-recovery-system' },
      { label: 'Liquid Biochar', href: '/liquid-biochar' },
      { label: 'Liquid Biochar Soil Restoration', href: '/liquid-biochar-soil-restoration' },
      { label: 'Compacted Clay Soil', href: '/compacted-clay-soil' },
      { label: 'Soil Recovery Systems', href: '/soil-recovery-systems' },
      { label: 'Living Compost', href: '/living-compost' },
      { label: 'Home & Garden Fertilizer', href: '/home-garden-fertilizer' },
      { label: 'Fruit Tree Fertilizer', href: '/fruit-tree-fertilizer' },
    ]
  },
  {
    title: 'Pasture & Farm',
    links: [
      { label: 'Pasture Boost', href: '/pasture-boost' },
      { label: 'Pasture & Lawn Recovery', href: '/pasture-lawn-recovery' },
      { label: 'Pasture & Hay Farmers', href: '/pasture-hay-farmers' },
      { label: 'Government & Commercial', href: '/government' },
    ]
  },
  {
    title: 'Featured Products',
    links: [
      { label: 'Natural Liquid Fertilizer', href: '/product/NWS_001' },
      { label: 'Organic Tomato Fertilizer', href: '/product/NWS_003' },
      { label: 'Liquid Kelp Fertilizer', href: '/product/NWS_006' },
      { label: 'Dog Urine Neutralizer', href: '/product/NWS_014' },
    ]
  },
  {
    title: 'Policies & Support',
    links: [
      { label: 'Shipping', href: '/shipping' },
      { label: 'Returns', href: '/returns' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ]
  }
];

export default function Sitemap() {
  return (
    <>
      <Head>
        <title>Sitemap - Nature&apos;s Way Soil</title>
        <meta name="description" content="Explore Nature's Way Soil products, lawn and soil solutions, pasture resources, guides, and support pages." />
        <link rel="canonical" href="https://natureswaysoil.com/sitemap" />
        <meta name="robots" content="index, follow" />
      </Head>
      <Layout>
        <section className="bg-gradient-to-b from-nature-green-50 to-white py-16">
          <div className="max-w-5xl mx-auto px-4">
            <h1 className="text-4xl font-bold text-gray-900 text-center">Website Sitemap</h1>
            <p className="mt-4 text-lg text-gray-600 text-center">
              Quick access to Nature&apos;s Way Soil products, solutions, guides, and support.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sitemapSections.map((section) => (
              <div key={section.title} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{section.title}</h2>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-nature-green-600 hover:text-nature-green-700 font-medium">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </Layout>
    </>
  );
}
