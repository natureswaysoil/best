import Head from 'next/head';
import Image from 'next/image';
import { CheckCircle, Leaf, Droplets, Sprout, ShieldCheck, Truck, Star } from 'lucide-react';
import Layout from '../../components/Layout';
import DirectCheckoutButton from '../../components/DirectCheckoutButton';

const variants = [
  {
    productId: 'NWS_024_32OZ',
    sku: 'NWS-LSRS-32OZ',
    productName: "Nature's Way Soil Lawn & Soil Recovery System",
    sizeName: '32 oz Concentrate',
    price: 29.99,
    image: '/images/products/NWS_024/lawn-recovery-32oz.svg',
    coverage: 'Makes up to 32 gallons',
    badge: 'Starter Size',
  },
  {
    productId: 'NWS_024_1GAL',
    sku: 'NWS-LSRS-1GAL',
    productName: "Nature's Way Soil Lawn & Soil Recovery System",
    sizeName: '1 Gallon Concentrate',
    price: 49.99,
    image: '/images/products/NWS_024/main.svg',
    coverage: 'Makes up to 128 gallons',
    badge: 'Best Seller',
  },
  {
    productId: 'NWS_024_25GAL',
    sku: 'NWS-LSRS-25GAL',
    productName: "Nature's Way Soil Lawn & Soil Recovery System",
    sizeName: '2.5 Gallon Concentrate',
    price: 99.99,
    image: '/images/products/NWS_024/lawn-recovery-25gal-box.svg',
    coverage: 'Makes up to 320 gallons',
    badge: 'Best Value',
  },
];

const featuredProduct = variants[1];

const bullets = [
  'Fix Yellow Grass Support – concentrated liquid soil conditioner made for stressed, thin, yellow, heat-stressed, or tired lawns.',
  'Liquid Humic & Fulvic Acid with Kelp – supports nutrient availability, root-zone activity, and better soil performance over time.',
  'Improve Root Growth – designed to support stronger root development so grass can respond better to watering and regular lawn care.',
  'Boost Lawn Health Naturally – helps condition the soil instead of relying on a quick cosmetic green dye.',
  'For Lawns, Gardens & Landscapes – use on turf, garden beds, trees, shrubs, pasture edges, and ornamental landscapes.',
];

const benefits = [
  'Yellow or stressed lawn recovery support',
  'Root growth and root-zone performance',
  'Nutrient availability in the soil',
  'Soil conditioning and moisture movement',
  'Lawn, garden, and landscape health',
  'Heat and seasonal stress recovery programs',
];

const directions = [
  'Shake well before use.',
  'General lawn application: mix 1 oz per gallon of water and apply evenly to lawn or soil.',
  'Heavy stress/recovery use: mix 2 oz per gallon of water and apply to yellow, weak, or stressed areas.',
  'Apply with a pump sprayer, backpack sprayer, watering can, hose-end sprayer, or tank sprayer.',
  'Water in after application when possible for best soil contact.',
  'Repeat every 2–4 weeks during the growing season or as needed for stressed lawns and landscapes.',
];

const coverage = [
  { size: '32 oz', finished: 'Up to 32 gallons', bestFor: 'Small lawns, spot treatment, first-time trial' },
  { size: '1 gallon', finished: 'Up to 128 gallons', bestFor: 'Most home lawns and repeat applications' },
  { size: '2.5 gallons', finished: 'Up to 320 gallons', bestFor: 'Large lawns, acreage, landscape crews' },
];

const searchKeywords = 'lawn recovery, yellow grass treatment, liquid humic acid for lawn, fulvic acid fertilizer, kelp for lawns, lawn soil conditioner, grass root growth, soil conditioner liquid, lawn repair concentrate, stressed grass treatment, lawn health booster, humic fulvic kelp, lawn soil amendment, liquid lawn treatment, root growth fertilizer, lawn conditioner, soil recovery system, liquid kelp fertilizer, humic acid soil conditioner, lawn green up support';

export default function LawnSoilRecoverySystemPage() {
  return (
    <Layout>
      <Head>
        <title>Lawn & Soil Recovery System | Humic, Fulvic & Kelp | Nature&apos;s Way Soil</title>
        <meta
          name="description"
          content="Nature's Way Soil Lawn & Soil Recovery System is a concentrated humic, fulvic, and kelp soil conditioner for yellow grass, stressed lawns, root growth, and soil health. Direct Stripe checkout available."
        />
        <meta name="keywords" content={searchKeywords} />
      </Head>

      <main className="bg-gradient-to-b from-white via-green-50/40 to-white">
        <section className="max-w-7xl mx-auto px-4 py-10 lg:py-16 grid lg:grid-cols-2 gap-10 items-center">
          <div className="bg-white rounded-3xl shadow-xl border border-green-100 p-4">
            <div className="relative aspect-square bg-white rounded-2xl overflow-hidden">
              <Image
                src={featuredProduct.image}
                alt="Nature's Way Soil Lawn and Soil Recovery System 1 gallon concentrate"
                fill
                priority
                unoptimized
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>

          <div>
            <p className="uppercase tracking-[0.22em] text-nature-green-700 font-bold text-sm mb-3">Lawn & Soil Recovery • Humic + Fulvic + Kelp</p>
            <h1 className="text-4xl lg:text-6xl font-extrabold text-gray-950 leading-tight mb-4">
              Restore Stressed Lawns from the Soil Up
            </h1>
            <p className="text-2xl font-bold text-nature-green-700 mb-4">Fix Yellow Grass • Improve Root Growth • Boost Lawn Health</p>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              A concentrated liquid soil conditioner made for yellow grass, weak roots, heat-stressed turf, compacted soil, and tired landscapes. It works below the surface with humic acid, fulvic acid, and kelp to support healthier soil and stronger lawn recovery.
            </p>

            <div className="grid sm:grid-cols-3 gap-3 mb-8">
              <div className="bg-white border border-green-100 rounded-2xl p-4 shadow-sm">
                <Droplets className="w-7 h-7 text-nature-green-700 mb-2" />
                <p className="font-bold text-gray-900">Concentrate</p>
                <p className="text-sm text-gray-600">32 oz, 1 gal, 2.5 gal</p>
              </div>
              <div className="bg-white border border-green-100 rounded-2xl p-4 shadow-sm">
                <Sprout className="w-7 h-7 text-nature-green-700 mb-2" />
                <p className="font-bold text-gray-900">Root Support</p>
                <p className="text-sm text-gray-600">Soil-first recovery</p>
              </div>
              <div className="bg-white border border-green-100 rounded-2xl p-4 shadow-sm">
                <Leaf className="w-7 h-7 text-nature-green-700 mb-2" />
                <p className="font-bold text-gray-900">No Green Dye</p>
                <p className="text-sm text-gray-600">Real lawn support</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div>
                <p className="text-sm text-gray-500">1 gallon launch price</p>
                <p className="text-4xl font-extrabold text-gray-950">${featuredProduct.price.toFixed(2)}</p>
                <p className="text-sm text-gray-600">Makes up to 128 gallons</p>
              </div>
              <DirectCheckoutButton product={{ ...featuredProduct, quantity: 1 }}>
                Buy 1 Gallon with Stripe
              </DirectCheckoutButton>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-6">
            {variants.map((variant) => (
              <div key={variant.sku} className="bg-white rounded-3xl border border-green-100 shadow-sm p-6 flex flex-col">
                <div className="flex justify-between items-start gap-3 mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-nature-green-700 font-extrabold">{variant.badge}</p>
                    <h2 className="text-2xl font-extrabold text-gray-950 mt-1">{variant.sizeName}</h2>
                  </div>
                  <span className="rounded-full bg-green-50 text-nature-green-700 text-xs font-bold px-3 py-1 border border-green-100">{variant.coverage}</span>
                </div>
                <div className="relative h-64 bg-white rounded-2xl overflow-hidden mb-5">
                  <Image
                    src={variant.image}
                    alt={`${variant.productName} ${variant.sizeName}`}
                    fill
                    unoptimized
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <p className="text-3xl font-black text-gray-950 mb-4">${variant.price.toFixed(2)}</p>
                <DirectCheckoutButton product={{ ...variant, quantity: 1 }} fullWidth>
                  Buy {variant.sizeName}
                </DirectCheckoutButton>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-10 grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-extrabold text-gray-950 mb-5">Why This Page Converts Better</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Customers do not just want another fertilizer. They want their yellow lawn to recover, roots to grow better, and soil to hold nutrients and moisture more effectively. This page focuses on the visible problem first, then explains how the humic, fulvic, and kelp blend supports the soil underneath.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Use this page for Google ads, social media posts, Amazon comparison traffic, QR codes, and direct customer links because the customer can choose a size and go straight to Stripe checkout.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-extrabold text-gray-950 mb-5">Formula Highlights</h2>
            <div className="space-y-4 text-gray-700">
              <p><strong>Liquid Humic Acid</strong> – supports soil structure, nutrient holding, and root-zone activity.</p>
              <p><strong>Fulvic Acid</strong> – helps with nutrient availability and movement.</p>
              <p><strong>Kelp Extract</strong> – supports root vigor, plant health, and stress recovery.</p>
              <p><strong>Concentrated Soil Conditioner</strong> – made to dilute into finished spray or drench solution.</p>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-10">
          <div className="bg-gray-950 text-white rounded-3xl p-8 lg:p-10 shadow-xl">
            <div className="grid lg:grid-cols-2 gap-8 items-start">
              <div>
                <p className="uppercase tracking-[0.22em] text-green-300 font-bold text-sm mb-3">Lawn recovery benefits</p>
                <h2 className="text-3xl font-extrabold mb-5">Built for stressed lawns, roots, and soil health.</h2>
                <div className="space-y-4">
                  {bullets.map((item) => (
                    <div key={item} className="flex gap-3">
                      <CheckCircle className="w-6 h-6 text-green-300 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-100 leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white/10 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-bold mb-4">Key Product Benefits</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {benefits.map((item) => (
                    <div key={item} className="flex gap-2 items-start">
                      <ShieldCheck className="w-5 h-5 text-green-300 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-100">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-10 grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-extrabold text-gray-950 mb-5">Directions for Use</h2>
            <ol className="space-y-3 list-decimal list-inside text-gray-700 leading-relaxed">
              {directions.map((item) => <li key={item}>{item}</li>)}
            </ol>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-extrabold text-gray-950 mb-5">Size & Coverage Guide</h2>
            <p className="text-gray-700 mb-5">Coverage varies based on lawn condition, application rate, sprayer type, and how heavily the treatment area is applied.</p>
            <div className="overflow-hidden rounded-2xl border border-gray-200">
              <table className="w-full text-left">
                <thead className="bg-nature-green-700 text-white">
                  <tr>
                    <th className="p-3">Size</th>
                    <th className="p-3">Makes Up To</th>
                    <th className="p-3">Best For</th>
                  </tr>
                </thead>
                <tbody>
                  {coverage.map((row) => (
                    <tr key={row.size} className="border-t border-gray-200">
                      <td className="p-3 font-semibold text-gray-900">{row.size}</td>
                      <td className="p-3 text-gray-700">{row.finished}</td>
                      <td className="p-3 text-gray-700">{row.bestFor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-10 pb-16">
          <div className="bg-green-50 border border-green-100 rounded-3xl p-8 lg:p-10 text-center shadow-sm">
            <div className="flex justify-center gap-6 mb-5 text-nature-green-700">
              <Star className="w-7 h-7" />
              <Truck className="w-7 h-7" />
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-950 mb-4">Ready to Start Lawn Recovery?</h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-6">
              Choose your size above, then checkout securely through Stripe. Best results come from deep soil contact, repeat applications, and normal watering during active grass growth.
            </p>
            <DirectCheckoutButton product={{ ...featuredProduct, quantity: 1 }}>
              Buy 1 Gallon with Stripe - $49.99
            </DirectCheckoutButton>
          </div>
        </section>
      </main>
    </Layout>
  );
}
