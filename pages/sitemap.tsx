import Head from 'next/head';
import Layout from '../components/Layout';

const sitemapSections = [
  {
    title: 'Main Pages',
    links: [
      { label: 'Home', href: '/' },
      { label: 'Shop', href: '/shop' },
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' }
    ]
  },
  {
    title: 'Featured Products',
    links: [
      { label: 'Natural Liquid Fertilizer', href: '/product/NWS_001' },
      { label: 'Organic Tomato Fertilizer', href: '/product/NWS_003' },
      { label: 'Liquid Kelp Fertilizer', href: '/product/NWS_006' },
      { label: 'Dog Urine Neutralizer', href: '/product/NWS_014' }
    ]
  },
  {
    title: 'Customer Support',
    links: [
      { label: 'Email Support', href: 'mailto:info@natureswaysoil.com' },
      { label: 'Wholesale Inquiries', href: 'mailto:wholesale@natureswaysoil.com' },
      { label: 'Call the Farm', href: 'tel:+15551234567' }
    ]
  }
];

export default function Sitemap() {
  return (
    <>
      <Head>
        <title>Sitemap - Nature's Way Soil</title>
        <meta name="description" content="Explore the full Nature's Way Soil website sitemap including main pages, product categories, and helpful resources." />
      </Head>
      <Layout>
        <section className="bg-gradient-to-b from-nature-green-50 to-white py-16">
          <div className="max-w-5xl mx-auto px-4">
            <h1 className="text-4xl font-bold text-gray-900 text-center">Website Sitemap</h1>
            <p className="mt-4 text-lg text-gray-600 text-center">
              Quick access to every page and section of the Nature's Way Soil website.
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
                      <a href={link.href} className="text-nature-green-600 hover:text-nature-green-700 font-medium">
                        {link.label}
                      </a>
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
