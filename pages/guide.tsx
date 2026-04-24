import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { allProducts } from '../data/products';

const AMAZON_TAG = process.env.NEXT_PUBLIC_AMAZON_ATTRIBUTION_TAG || 'natureswaysoil-20';

function toTrackedAmazonUrl(asin: string, src: string, productId: string) {
  const base = `https://www.amazon.com/dp/${asin}`;
  const params = new URLSearchParams({
    tag: AMAZON_TAG,
    linkCode: 'ogi',
    th: '1',
    ascsubtag: `${src}-${productId}`,
    utm_source: src,
    utm_medium: 'qr_insert',
    utm_campaign: 'soil_recovery_guide',
  });

  return `${base}?${params.toString()}`;
}

export default function GuidePage() {
  const router = useRouter();
  const src = typeof router.query.src === 'string' && router.query.src.trim().length > 0
    ? router.query.src.trim()
    : 'guide';

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(`https://natureswaysoil.com/guide?src=${src}`)}`;

  const featuredProducts = allProducts
    .filter((p) => Boolean(p.asin))
    .slice(0, 8)
    .map((p) => ({
      id: p.id,
      name: p.name,
      asin: p.asin as string,
      url: toTrackedAmazonUrl(p.asin as string, src, p.id),
    }));

  const reviewUrl = featuredProducts[0]?.asin
    ? `https://www.amazon.com/product-reviews/${featuredProducts[0].asin}?tag=${encodeURIComponent(AMAZON_TAG)}&ascsubtag=${encodeURIComponent(`${src}-review`)}`
    : 'https://www.amazon.com/';

  return (
    <Layout>
      <Head>
        <title>Soil Recovery Guide | Nature&apos;s Way Soil</title>
        <meta
          name="description"
          content="Full soil recovery guide with application rates, quick-start steps, and pro tips to help your lawn, trees, and garden thrive."
        />
      </Head>

      <main className="max-w-6xl mx-auto px-4 py-10 space-y-10">
        <section className="rounded-2xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-700 text-white p-8 lg:p-10">
          <p className="text-sm uppercase tracking-[0.18em] text-emerald-200">Nature&apos;s Way Soil</p>
          <h1 className="text-3xl lg:text-5xl font-extrabold mt-2">Naturally Stronger Soil Starts Here</h1>
          <p className="text-xl mt-4 text-emerald-100">Your soil is waking up.</p>
          <p className="mt-4 max-w-3xl text-emerald-50 leading-relaxed">
            You&apos;re not just feeding plants. You&apos;re rebuilding the biology that makes everything grow stronger,
            greener, and more resilient.
          </p>
          <div className="grid sm:grid-cols-3 gap-3 mt-6 text-sm">
            <div className="rounded-lg bg-white/10 border border-white/20 p-3">Improves root development</div>
            <div className="rounded-lg bg-white/10 border border-white/20 p-3">Helps retain moisture</div>
            <div className="rounded-lg bg-white/10 border border-white/20 p-3">Supports long-term soil health</div>
          </div>
        </section>

        <section className="grid lg:grid-cols-[1.3fr_1fr] gap-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-2xl font-bold text-gray-900">Quick Start (Most Customers Miss This)</h2>
            <ol className="mt-4 space-y-2 text-gray-700 list-decimal list-inside">
              <li>Water first</li>
              <li>Apply diluted solution</li>
              <li>Focus on root zone, not leaves</li>
              <li>Repeat weekly for best results</li>
            </ol>

            <div className="mt-6 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-900">
              Safe for kids, pets, and beneficial insects. Built for long-term soil health.
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 flex flex-col items-center text-center">
            <h3 className="text-lg font-semibold text-gray-900">Scan to Save This Guide</h3>
            <img src={qrUrl} alt="QR code to Nature's Way Soil guide" className="w-52 h-52 mt-4 rounded-xl border border-gray-200 p-2 bg-white" />
            <p className="text-xs text-gray-500 mt-3 break-all">natureswaysoil.com/guide?src={src}</p>
            <a
              href="/print/soil-insert-4x6.html"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center justify-center rounded-lg bg-gray-900 text-white px-4 py-2 text-sm font-semibold hover:bg-black"
            >
              Open 4x6 Print Card
            </a>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-2xl font-bold text-gray-900">Application Rates</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-600">
                  <th className="py-3 pr-4">Use Case</th>
                  <th className="py-3 pr-4">Mix Rate</th>
                  <th className="py-3 pr-4">Coverage</th>
                  <th className="py-3">Frequency</th>
                </tr>
              </thead>
              <tbody className="text-gray-800">
                <tr className="border-b border-gray-100">
                  <td className="py-3 pr-4">Lawns</td>
                  <td className="py-3 pr-4">2 oz per gallon</td>
                  <td className="py-3 pr-4">Up to 1,000 sq ft</td>
                  <td className="py-3">Weekly during recovery</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 pr-4">Trees and shrubs</td>
                  <td className="py-3 pr-4">3-4 oz per gallon</td>
                  <td className="py-3 pr-4">Root zone drench</td>
                  <td className="py-3">Every 7-14 days</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4">Garden beds</td>
                  <td className="py-3 pr-4">2-3 oz per gallon</td>
                  <td className="py-3 pr-4">Even soil soak</td>
                  <td className="py-3">Weekly through active growth</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-2xl font-bold text-gray-900">Pro Tips for Faster Results</h2>
          <ul className="mt-4 space-y-2 text-gray-700 list-disc list-inside">
            <li>Apply in the early morning or late afternoon when soil stays cooler.</li>
            <li>Use consistent weekly applications for the first month to rebuild biology faster.</li>
            <li>Prioritize compacted, dry, or yellowing zones first.</li>
            <li>Pair with deep watering once or twice weekly to push nutrients to root depth.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="text-2xl font-bold text-amber-900">Amazon Attribution Tracking Links</h2>
          <p className="mt-2 text-amber-900/90 text-sm">
            Source tracking is active. Current source: {src}
          </p>
          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            {featuredProducts.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-amber-200 bg-white p-3 hover:border-amber-400"
              >
                <p className="font-semibold text-gray-900">{item.id}</p>
                <p className="text-sm text-gray-600 line-clamp-2 mt-1">{item.name}</p>
                <p className="text-xs text-amber-700 mt-2">ASIN: {item.asin}</p>
              </a>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 text-center">
          <p className="text-lg text-gray-800">If you&apos;re seeing results, we&apos;d really appreciate your feedback.</p>
          <p className="mt-1 text-gray-600">We&apos;re a small family business and your review helps us grow.</p>
          <a
            href={reviewUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex mt-4 rounded-lg bg-emerald-700 text-white px-5 py-3 font-semibold hover:bg-emerald-800"
          >
            Leave a Review on Amazon
          </a>
          <div className="mt-5">
            <Link href="/shop" className="text-emerald-700 font-semibold hover:underline">
              Shop Nature&apos;s Way Soil Products
            </Link>
          </div>
        </section>
      </main>
    </Layout>
  );
}
