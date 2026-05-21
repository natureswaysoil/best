import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { CheckCircle, Leaf, Droplets, Sprout, ShieldCheck } from 'lucide-react';
import Layout from '../../components/Layout';

const product = {
  id: 'NWS_024',
  sku: 'NWS-LSRS-1GAL',
  name: "Nature's Way Soil Lawn & Soil Recovery System",
  subtitle: 'Liquid Humic & Fulvic Acid with Kelp',
  price: 49.99,
  image: '/images/products/NWS_024/main.svg',
  size: '1 Gallon Concentrate',
  coverage: 'Makes up to 128 gallons',
  category: 'Lawn Care',
};

const bullets = [
  'Lawn & Soil Recovery Support – concentrated liquid soil conditioner made to support stressed lawns, yellow grass, weak roots, compacted soil, and tired landscapes.',
  'Liquid Humic & Fulvic Acid with Kelp – helps improve nutrient availability, support root development, and encourage healthier soil conditions around grass, gardens, trees, shrubs, and landscape plants.',
  'Helps Improve Yellow, Stressed Grass – designed for lawns showing signs of seasonal stress, heat stress, poor color, weak growth, or low soil performance.',
  'Makes Up to 128 Gallons – one 1-gallon bottle makes up to 128 gallons of finished spray or drench solution depending on application rate.',
  'For Lawns, Gardens & Landscapes – apply with pump sprayers, backpack sprayers, watering cans, hose-end sprayers, or tank sprayers.'
];

const benefits = [
  'Yellow or stressed lawn recovery support',
  'Root growth and root-zone performance',
  'Nutrient availability in the soil',
  'Soil conditioning and moisture movement',
  'Lawn, garden, and landscape health',
  'Heat and seasonal stress recovery programs'
];

const directions = [
  'General Lawn Application: Mix 1 oz per gallon of water and apply evenly to lawn or soil.',
  'Heavy Stress / Recovery Use: Mix 2 oz per gallon of water and apply to yellow, weak, or stressed areas.',
  'Coverage Guide: Apply finished solution evenly over lawn, garden, or landscape areas.',
  'Water in after application when possible for best soil contact.',
  'Apply every 2–4 weeks during the growing season or as needed for stressed lawns and landscapes.',
  'Shake well before use. Do not apply to drought-stressed turf without watering.'
];

const coverage = [
  { rate: '1 oz per gallon', finished: 'Up to 128 gallons' },
  { rate: '2 oz per gallon', finished: 'Up to 64 gallons' },
  { rate: '4 oz per gallon', finished: 'Up to 32 gallons' },
];

const searchKeywords = 'lawn recovery, yellow grass treatment, liquid humic acid for lawn, fulvic acid fertilizer, kelp for lawns, lawn soil conditioner, grass root growth, soil conditioner liquid, lawn repair concentrate, stressed grass treatment, lawn health booster, humic fulvic kelp, lawn soil amendment, liquid lawn treatment, root growth fertilizer, lawn conditioner, soil recovery system, liquid kelp fertilizer, humic acid soil conditioner, lawn green up support';

export default function LawnSoilRecoverySystemPage() {
  const router = useRouter();

  const handleBuyNow = async () => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('nws-checkout-selection', JSON.stringify({
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        sizeName: product.size,
        quantity: 1,
        price: product.price,
        sku: product.sku,
      }));
    }

    await router.push('/checkout');
  };

  return (
    <Layout>
      <Head>
        <title>Nature&apos;s Way Soil Lawn & Soil Recovery System | Humic, Fulvic & Kelp</title>
        <meta
          name="description"
          content="Nature's Way Soil Lawn & Soil Recovery System is a 1 gallon humic, fulvic, and kelp concentrate that makes up to 128 gallons for lawns, gardens, and landscapes."
        />
        <meta name="keywords" content={searchKeywords} />
      </Head>

      <main className="bg-gradient-to-b from-white via-green-50/40 to-white">
        <section className="max-w-7xl mx-auto px-4 py-10 lg:py-16 grid lg:grid-cols-2 gap-10 items-center">
          <div className="bg-white rounded-3xl shadow-xl border border-green-100 p-4">
            <div className="relative aspect-square bg-white rounded-2xl overflow-hidden">
              <Image
                src={product.image}
                alt="Nature's Way Soil Lawn and Soil Recovery System 1 gallon concentrate"
                fill
                priority
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>

          <div>
            <p className="uppercase tracking-[0.22em] text-nature-green-700 font-bold text-sm mb-3">Lawn & Soil Recovery</p>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-950 leading-tight mb-4">
              Nature&apos;s Way Soil Lawn & Soil Recovery System
            </h1>
            <p className="text-2xl font-bold text-nature-green-700 mb-4">{product.subtitle}</p>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              A concentrated liquid soil conditioner formulated to help restore tired, stressed, and underperforming lawns and landscapes from the soil up.
            </p>

            <div className="grid sm:grid-cols-3 gap-3 mb-8">
              <div className="bg-white border border-green-100 rounded-2xl p-4 shadow-sm">
                <Droplets className="w-7 h-7 text-nature-green-700 mb-2" />
                <p className="font-bold text-gray-900">1 Gallon</p>
                <p className="text-sm text-gray-600">Concentrate</p>
              </div>
              <div className="bg-white border border-green-100 rounded-2xl p-4 shadow-sm">
                <Sprout className="w-7 h-7 text-nature-green-700 mb-2" />
                <p className="font-bold text-gray-900">Humic + Fulvic</p>
                <p className="text-sm text-gray-600">With kelp</p>
              </div>
              <div className="bg-white border border-green-100 rounded-2xl p-4 shadow-sm">
                <Leaf className="w-7 h-7 text-nature-green-700 mb-2" />
                <p className="font-bold text-gray-900">128 Gallons</p>
                <p className="text-sm text-gray-600">Finished solution</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div>
                <p className="text-sm text-gray-500">Launch price</p>
                <p className="text-4xl font-extrabold text-gray-950">${product.price.toFixed(2)}</p>
              </div>
              <button
                type="button"
                onClick={handleBuyNow}
                className="btn-primary text-base px-8 py-4 rounded-xl shadow-lg"
              >
                Buy Now
              </button>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-10 grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-extrabold text-gray-950 mb-5">Product Description</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Nature&apos;s Way Soil Lawn & Soil Recovery System combines liquid humic acid, fulvic acid, and kelp to support healthier soil activity, better nutrient movement, stronger root-zone performance, and improved lawn appearance over time.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Use it on yellow grass, heat-stressed lawns, weak turf, compacted soil areas, garden beds, trees, shrubs, and ornamental landscapes. It works best when paired with proper watering, mowing, and a regular lawn care program.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-extrabold text-gray-950 mb-5">Ingredients</h2>
            <div className="space-y-4 text-gray-700">
              <p><strong>Water</strong> – carrier for even mixing and application.</p>
              <p><strong>Liquid Humic Acid</strong> – supports soil structure, nutrient holding, and root-zone activity.</p>
              <p><strong>Fulvic Acid</strong> – helps with nutrient availability and movement.</p>
              <p><strong>Kelp Extract</strong> – supports root vigor, plant health, and stress recovery.</p>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-10">
          <div className="bg-navy-900 bg-gray-950 text-white rounded-3xl p-8 lg:p-10 shadow-xl">
            <div className="grid lg:grid-cols-2 gap-8 items-start">
              <div>
                <p className="uppercase tracking-[0.22em] text-green-300 font-bold text-sm mb-3">Amazon-style listing bullets</p>
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
            <h2 className="text-2xl font-extrabold text-gray-950 mb-5">Suggested Directions for Use</h2>
            <ol className="space-y-3 list-decimal list-inside text-gray-700 leading-relaxed">
              {directions.map((item) => <li key={item}>{item}</li>)}
            </ol>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-extrabold text-gray-950 mb-5">Coverage Guide</h2>
            <p className="text-gray-700 mb-5">One 1-gallon bottle makes up to 128 gallons of finished solution. Coverage varies based on lawn condition, application rate, sprayer type, and how heavily the treatment area is applied.</p>
            <div className="overflow-hidden rounded-2xl border border-gray-200">
              <table className="w-full text-left">
                <thead className="bg-nature-green-700 text-white">
                  <tr>
                    <th className="p-3">Application Rate</th>
                    <th className="p-3">Finished Gallons</th>
                  </tr>
                </thead>
                <tbody>
                  {coverage.map((row) => (
                    <tr key={row.rate} className="border-t border-gray-200">
                      <td className="p-3 font-semibold text-gray-900">{row.rate}</td>
                      <td className="p-3 text-gray-700">{row.finished}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-10 pb-16">
          <div className="bg-green-50 border border-green-100 rounded-3xl p-8 text-center">
            <h2 className="text-3xl font-extrabold text-gray-950 mb-4">Restore Stressed Lawns from the Soil Up</h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-6">
              A concentrated humic, fulvic, and kelp soil conditioner designed to support stronger roots, healthier soil, and greener lawns during seasonal stress.
            </p>
            <button type="button" onClick={handleBuyNow} className="btn-primary text-base px-8 py-4 rounded-xl">
              Add 1 Gallon to Checkout
            </button>
          </div>
        </section>
      </main>
    </Layout>
  );
}
