import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { CheckCircle, Droplets, Leaf, ShieldCheck, Sprout } from 'lucide-react';
import Layout from '../components/Layout';

const product = {
  id: 'NWS_014_BUNDLE',
  sku: 'NWS-DUN-32OZ-1GAL-BUNDLE',
  name: "Nature's Way Soil® Dog Urine Neutralizer & Lawn Revitalizer Bundle",
  subtitle: '32 Ounce Hose-End Sprayer + 1 Gallon Refill',
  price: 49.99,
  originalPrice: 59.99,
  image: '/images/products/NWS_014/bundle.svg',
  size: 'Bundle with 32 oz hose-end sprayer and 1 gallon refill',
  category: 'Pet Lawn Care',
};

const bullets = [
  'Not a dye or instant fix: this naturally dark, enzyme- and humic-acid-based lawn treatment is designed to address dog urine damage at the soil level. It does not contain green dyes or provide instant cosmetic results. Lawn improvement appears gradually as grass regrows and soil balance is restored.',
  'Targets the real cause of dog spots: enzymes help break down urine salts and organic waste residues left behind after pet use, while humic and fulvic acids support healthier soil conditions that allow grass to recover naturally over time.',
  'Helps discourage repeat marking with our new and improved formula: by neutralizing odor-causing residues and scent markers that attract repeat use, this formula helps discourage dogs from returning to the same spot without harsh repellents or harmful chemicals.',
  'Pet-safe, lawn-safe formula made with enzymes, plant-based surfactants, humic and fulvic acids, and natural oils. No dyes, bleach, ammonia, or toxic deterrents. Safe for use around pets and people when used as directed.',
  'Use correctly for best results: thoroughly soak the affected area because surface misting is not enough. For heavy damage or repeat spots, apply 2 to 3 times over 7 to 10 days.',
  'Small-batch made in the USA by Nature’s Way Soil, a family-run soil health company focused on natural solutions that work with your lawn, not against it.',
];

const ingredients = [
  'Purified water',
  'Hydrogen peroxide 3%',
  'Protease and amylase enzymes',
  'Natural odor neutralizer',
  'Humic and fulvic acids',
  'Citric acid',
  'Xanthan stabilizer',
];

const directions = [
  'Shake well before each use.',
  'Attach the 32 oz hose-end sprayer to a garden hose or pour refill into the sprayer bottle as needed.',
  'Thoroughly soak the dog urine spot and the soil around the damaged area. Do not just mist the grass blades.',
  'For heavy damage or repeat-use spots, apply 2 to 3 times over 7 to 10 days.',
  'Water normally after application and continue regular lawn care during active growing seasons.',
  'Store concentrate in a cool, dark place. Shelf-stable for months unmixed.',
];

const searchKeywords = 'dog urine neutralizer, dog urine lawn repair, pet spot lawn treatment, dog pee grass repair, hose end dog urine neutralizer, lawn revitalizer, pet safe lawn treatment, dog urine odor neutralizer, dog spot repair, Nature’s Way Soil dog urine neutralizer';

export default function DogUrineNeutralizerBundlePage() {
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
        <title>Dog Urine Neutralizer & Lawn Revitalizer Bundle | Nature&apos;s Way Soil</title>
        <meta
          name="description"
          content="Nature's Way Soil Dog Urine Neutralizer & Lawn Revitalizer bundle includes a 32 oz hose-end sprayer and 1 gallon refill for pet lawn spots, odor residues, and soil-level recovery."
        />
        <meta name="keywords" content={searchKeywords} />
      </Head>

      <main className="bg-gradient-to-b from-white via-green-50/40 to-white">
        <section className="max-w-7xl mx-auto px-4 py-10 lg:py-16 grid lg:grid-cols-2 gap-10 items-center">
          <div className="bg-white rounded-3xl shadow-xl border border-green-100 p-4">
            <div className="relative aspect-square bg-white rounded-2xl overflow-hidden">
              <Image
                src={product.image}
                alt="Nature's Way Soil Dog Urine Neutralizer bundle with 32 ounce hose-end sprayer and 1 gallon refill"
                fill
                priority
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>

          <div>
            <p className="uppercase tracking-[0.22em] text-nature-green-700 font-bold text-sm mb-3">Dog Urine Lawn Repair Bundle</p>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-950 leading-tight mb-4">
              Nature&apos;s Way Soil® Dog Urine Neutralizer &amp; Lawn Revitalizer
            </h1>
            <p className="text-2xl font-bold text-nature-green-700 mb-4">{product.subtitle}</p>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              A soil-level treatment for dog urine lawn spots, odor-causing residues, and repeat marking areas. Includes the ready-to-attach hose-end sprayer plus a 1 gallon refill for continued treatment.
            </p>

            <div className="grid sm:grid-cols-3 gap-3 mb-8">
              <div className="bg-white border border-green-100 rounded-2xl p-4 shadow-sm">
                <Droplets className="w-7 h-7 text-nature-green-700 mb-2" />
                <p className="font-bold text-gray-900">32 oz Sprayer</p>
                <p className="text-sm text-gray-600">Hose-end application</p>
              </div>
              <div className="bg-white border border-green-100 rounded-2xl p-4 shadow-sm">
                <Sprout className="w-7 h-7 text-nature-green-700 mb-2" />
                <p className="font-bold text-gray-900">1 Gallon Refill</p>
                <p className="text-sm text-gray-600">Bundle value</p>
              </div>
              <div className="bg-white border border-green-100 rounded-2xl p-4 shadow-sm">
                <Leaf className="w-7 h-7 text-nature-green-700 mb-2" />
                <p className="font-bold text-gray-900">No Green Dye</p>
                <p className="text-sm text-gray-600">Soil-first recovery</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div>
                <p className="text-sm text-gray-500">Bundle price</p>
                <div className="flex items-baseline gap-3">
                  <p className="text-4xl font-extrabold text-gray-950">${product.price.toFixed(2)}</p>
                  <p className="text-xl text-gray-500 line-through">${product.originalPrice.toFixed(2)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleBuyNow}
                className="btn-primary text-base px-8 py-4 rounded-xl shadow-lg"
              >
                Buy Bundle Now
              </button>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-10 grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-extrabold text-gray-950 mb-5">Product Description</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              This is a naturally dark, enzyme- and humic-acid-based lawn treatment designed to help address dog urine damage at the soil level. It is not a dye, paint, or instant cosmetic green-up product.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Best results come from soaking the affected soil deeply, repeating applications on heavy spots, and using normal watering and lawn care so grass can regrow as soil balance improves.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-extrabold text-gray-950 mb-5">Made Fresh at Our North Carolina Farm</h2>
            <div className="grid sm:grid-cols-2 gap-3 text-gray-700">
              {ingredients.map((item) => (
                <div key={item} className="flex gap-2 items-start">
                  <ShieldCheck className="w-5 h-5 text-nature-green-700 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <p className="text-gray-600 text-sm mt-5">No synthetic fragrances, no ammonia, and no bleach.</p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-10">
          <div className="bg-gray-950 text-white rounded-3xl p-8 lg:p-10 shadow-xl">
            <p className="uppercase tracking-[0.22em] text-green-300 font-bold text-sm mb-3">Amazon-style listing bullets</p>
            <h2 className="text-3xl font-extrabold mb-6">Soak the spot. Treat the soil. Support regrowth.</h2>
            <div className="grid lg:grid-cols-2 gap-4">
              {bullets.map((item) => (
                <div key={item} className="flex gap-3">
                  <CheckCircle className="w-6 h-6 text-green-300 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-100 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-10 grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-extrabold text-gray-950 mb-5">Directions for Best Results</h2>
            <ol className="space-y-3 list-decimal list-inside text-gray-700 leading-relaxed">
              {directions.map((item) => <li key={item}>{item}</li>)}
            </ol>
          </div>

          <div className="bg-green-50 border border-green-100 rounded-3xl p-8">
            <h2 className="text-2xl font-extrabold text-gray-950 mb-5">Important Customer Expectation</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Dog urine damage usually needs time, moisture, and active grass growth to recover. This product supports recovery by treating the soil and residues; it does not repaint grass green overnight.
            </p>
            <p className="text-gray-700 leading-relaxed">
              For severe dead patches, rake out dead grass and reseed after the area has been treated and watered.
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-10 pb-16">
          <div className="bg-white border border-green-100 rounded-3xl p-8 text-center shadow-sm">
            <h2 className="text-3xl font-extrabold text-gray-950 mb-4">Get the Sprayer and Refill Together</h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-6">
              Bundle includes one 32 oz hose-end sprayer bottle and one 1 gallon refill of Nature&apos;s Way Soil Dog Urine Neutralizer &amp; Lawn Revitalizer.
            </p>
            <button type="button" onClick={handleBuyNow} className="btn-primary text-base px-8 py-4 rounded-xl">
              Add Bundle to Checkout - $49.99
            </button>
          </div>
        </section>
      </main>
    </Layout>
  );
}
