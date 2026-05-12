import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Droplets,
  Leaf,
  ShieldCheck,
  Sprout,
  Star,
  Truck,
} from 'lucide-react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';

const liquidBiocharImage = 'data:image/webp;base64,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';

const heroProducts = [
  {
    name: 'Dog Urine Lawn Repair Kit',
    eyebrow: 'Best for pet lawn damage',
    price: 'From $29.99',
    image: '/images/products/NWS_014/main.jpg',
    href: '/product/NWS_014',
    problem: 'Yellow spots, outdoor pet odor, repeat marking areas',
    promise: 'Targets the soil problem behind dog urine spots while helping revive stressed grass.',
    bullets: ['Enzyme-powered lawn support', 'Pet-focused odor control', '32 oz and 1 gallon options'],
  },
  {
    name: 'Liquid Humic & Fulvic Acid with Kelp',
    eyebrow: 'Best all-around soil conditioner',
    price: 'From $19.99',
    image: '/images/products/NWS_011/main.jpg',
    href: '/product/NWS_011',
    problem: 'Hard soil, weak roots, poor nutrient uptake, stressed lawns',
    promise: 'Helps unlock nutrients and support stronger root growth in lawns, gardens, trees, and containers.',
    bullets: ['Humic + fulvic acid', 'Kelp for stress support', '1 gallon and 2.5 gallon sizes'],
  },
  {
    name: 'Liquid Biochar Soil Conditioner',
    eyebrow: 'Best premium soil restoration',
    price: '1 Gallon $89.99',
    image: liquidBiocharImage,
    href: '/contact',
    problem: 'Sandy soil, nutrient leaching, dry spots, tired root zones',
    promise: 'A premium soil-building blend made with activated 5-micron biochar, humic acid, fulvic acid, and kelp to support healthier soil, stronger roots, and improved nutrient availability.',
    bullets: ['Supports water and nutrient retention', '5-micron biochar with humates', 'Use 2-4 oz per gallon of water'],
  },
];

const painPoints = [
  'Dog urine burns and yellow lawn spots',
  'Fertilizer washes through sandy soil too quickly',
  'Grass greens up for a week, then fades again',
  'Hard compacted soil blocks roots and water',
  'Garden plants look stressed even after feeding',
  'You want one clear system instead of a confusing shelf of products',
];

const biocharBenefits = [
  'Liquid biochar works like a microscopic soil sponge to help reduce nutrient leaching.',
  'Humic and fulvic acids help support nutrient uptake and root-zone activity.',
  'Kelp helps lawns, gardens, trees, and containers handle stress.',
  'Molasses and aloe help encourage beneficial soil life and long-term improvement.',
  'Mix 2-4 oz per gallon of water as a soil drench, compost tea booster, transplant solution, or lawn and garden soil conditioner.',
];

const faqs = [
  {
    q: 'Which product should I buy first?',
    a: 'If you have dog urine spots, start with the Dog Urine Lawn Repair Kit. For general lawn, garden, tree, or raised bed soil improvement, start with Liquid Humic & Fulvic Acid with Kelp. For sandy, depleted, or high-value soil recovery, add Liquid Biochar.',
  },
  {
    q: 'Can I use these products together?',
    a: 'Yes. Use the dog urine product on damaged pet areas, then use humic/fulvic/kelp or liquid biochar as a broader soil conditioner. Always dilute and apply each product according to its label directions.',
  },
  {
    q: 'Are these safe around pets?',
    a: 'They are made for home lawn and garden use and are intended to be safe when used as directed. Keep pets away from concentrated product, apply as directed, and allow treated areas to dry before normal use.',
  },
  {
    q: 'How fast will I see results?',
    a: 'Green-up products can show faster visual results, but soil recovery is a process. Most customers should judge improvement over 2 to 4 weeks, especially in sandy soil, compacted areas, or dog urine-damaged spots.',
  },
];

export default function SoilRecoverySystems() {
  return (
    <>
      <SEO
        title="Lawn & Soil Recovery Systems | Dog Urine Repair, Liquid Humic Acid & Liquid Biochar | Nature's Way Soil"
        description="Shop Nature's Way Soil's best direct lawn and soil recovery products: dog urine lawn repair, liquid humic and fulvic acid with kelp, and premium liquid biochar soil conditioner."
        url="https://natureswaysoil.com/soil-recovery-systems"
        type="website"
      />

      <Layout>
        <section className="relative overflow-hidden bg-gradient-to-br from-nature-green-950 via-nature-green-800 to-soil-brown-800 text-white">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_left,_#ffffff,_transparent_35%)]" />
          <div className="relative max-w-7xl mx-auto container-padding py-20 md:py-28">
            <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold mb-6">
                  <Leaf className="w-4 h-4" />
                  Direct farm pricing on our 3 strongest soil recovery products
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
                  Fix the soil problem, not just the symptom.
                </h1>
                <p className="text-xl md:text-2xl text-white/90 leading-relaxed mb-8 max-w-3xl">
                  A simple 3-product system for dog urine spots, hard or sandy soil, weak roots, and fertilizer that does not seem to last.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Link href="#shop-systems" className="bg-white text-nature-green-800 hover:bg-nature-green-50 rounded-full px-7 py-4 font-bold inline-flex items-center justify-center shadow-lg">
                    Shop the 3-product system
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                  <Link href="#help-me-choose" className="border border-white/50 text-white hover:bg-white/10 rounded-full px-7 py-4 font-bold inline-flex items-center justify-center">
                    Help me choose
                  </Link>
                </div>
                <div className="grid sm:grid-cols-3 gap-3 text-sm">
                  {['Made by a small family farm', 'Free shipping over $50', 'Direct website support'].map((item) => (
                    <div key={item} className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-3">
                      <CheckCircle2 className="w-5 h-5 text-nature-green-200 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/95 text-gray-900 rounded-3xl shadow-2xl p-6 md:p-8">
                <p className="text-sm font-bold text-nature-green-700 uppercase tracking-wide mb-3">Best first order</p>
                <h2 className="text-2xl md:text-3xl font-extrabold mb-4">Start with the product that matches the problem.</h2>
                <div className="space-y-4">
                  <div className="flex gap-4 rounded-2xl border border-green-100 p-4 bg-green-50">
                    <ShieldCheck className="w-8 h-8 text-nature-green-700 shrink-0" />
                    <div>
                      <p className="font-bold">Dog urine spots?</p>
                      <p className="text-gray-700 text-sm">Use the dog urine lawn repair product first.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 rounded-2xl border border-blue-100 p-4 bg-blue-50">
                    <Sprout className="w-8 h-8 text-blue-700 shrink-0" />
                    <div>
                      <p className="font-bold">Weak lawn or garden soil?</p>
                      <p className="text-gray-700 text-sm">Use humic, fulvic, and kelp for nutrient uptake and roots.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 rounded-2xl border border-amber-100 p-4 bg-amber-50">
                    <Droplets className="w-8 h-8 text-amber-700 shrink-0" />
                    <div>
                      <p className="font-bold">Sandy soil or leaching?</p>
                      <p className="text-gray-700 text-sm">Add liquid biochar for nutrient and moisture retention support.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-10 border-b border-gray-100">
          <div className="max-w-7xl mx-auto container-padding">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="flex items-center justify-center gap-3 rounded-2xl bg-gray-50 p-5">
                <Star className="w-6 h-6 text-yellow-500" />
                <span className="font-semibold text-gray-800">Focused hero products, not a confusing catalog</span>
              </div>
              <div className="flex items-center justify-center gap-3 rounded-2xl bg-gray-50 p-5">
                <Truck className="w-6 h-6 text-nature-green-700" />
                <span className="font-semibold text-gray-800">Direct shipping from Nature's Way Soil</span>
              </div>
              <div className="flex items-center justify-center gap-3 rounded-2xl bg-gray-50 p-5">
                <ShieldCheck className="w-6 h-6 text-nature-green-700" />
                <span className="font-semibold text-gray-800">Clear use directions and customer support</span>
              </div>
            </div>
          </div>
        </section>

        <section id="help-me-choose" className="section-padding bg-gray-50">
          <div className="max-w-7xl mx-auto container-padding">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <p className="text-nature-green-700 font-bold uppercase tracking-wide mb-3">Common lawn and soil problems</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Get the right product for the problem you actually have.</h2>
              <p className="text-lg text-gray-600">This page keeps the choice simple: pet damage, general soil recovery, or premium biochar-based nutrient retention support.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {painPoints.map((item) => (
                <div key={item} className="bg-white rounded-2xl border border-gray-200 p-5 flex gap-3 items-start">
                  <CheckCircle2 className="w-6 h-6 text-nature-green-600 shrink-0 mt-0.5" />
                  <p className="font-semibold text-gray-800">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="shop-systems" className="section-padding bg-white">
          <div className="max-w-7xl mx-auto container-padding">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
              <div>
                <p className="text-nature-green-700 font-bold uppercase tracking-wide mb-3">Shop by problem</p>
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Choose your soil recovery system.</h2>
              </div>
              <p className="text-gray-600 max-w-xl">Each product is built around a clear use case, so customers do not have to guess which bottle belongs in their yard, garden, or pasture program.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {heroProducts.map((product) => (
                <article key={product.name} className="relative bg-white rounded-3xl border-2 border-gray-100 shadow-sm hover:shadow-xl hover:border-nature-green-200 transition-all overflow-hidden flex flex-col">
                  <div className="absolute top-4 left-4 z-10 rounded-full bg-nature-green-700 text-white px-3 py-1 text-xs font-bold uppercase tracking-wide">
                    {product.eyebrow}
                  </div>
                  <div className="aspect-square bg-gray-50 p-8 flex items-center justify-center">
                    <img src={product.image} alt={product.name} className="max-h-full max-w-full object-contain" />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <p className="text-nature-green-700 font-bold mb-2">{product.price}</p>
                    <h3 className="text-2xl font-extrabold text-gray-900 mb-3">{product.name}</h3>
                    <div className="rounded-2xl bg-red-50 border border-red-100 p-4 mb-4">
                      <p className="text-sm font-bold text-red-700 mb-1">Problem it solves</p>
                      <p className="text-gray-800 text-sm">{product.problem}</p>
                    </div>
                    <p className="text-gray-600 leading-relaxed mb-5">{product.promise}</p>
                    <ul className="space-y-2 mb-6">
                      {product.bullets.map((bullet) => (
                        <li key={bullet} className="flex gap-2 text-sm text-gray-700">
                          <CheckCircle2 className="w-5 h-5 text-nature-green-600 shrink-0" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href={product.href} className="mt-auto w-full bg-nature-green-700 hover:bg-nature-green-800 text-white rounded-full py-3 px-5 font-bold text-center inline-flex items-center justify-center">
                      {product.name.includes('Biochar') ? 'Request liquid biochar' : 'View product'}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section-padding bg-gradient-to-br from-green-50 to-blue-50">
          <div className="max-w-7xl mx-auto container-padding">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <p className="text-nature-green-700 font-bold uppercase tracking-wide mb-3">Featured product</p>
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Liquid Biochar Soil Conditioner</h2>
                <p className="text-lg text-gray-700 mb-6">Nature's Way Soil Liquid Biochar Soil Conditioner is a 1 gallon, 5-micron biochar blend with humic, fulvic, and kelp for gardens, lawns, raised beds, trees, and containers.</p>
                <div className="space-y-4">
                  {biocharBenefits.map((benefit) => (
                    <div key={benefit} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex gap-3">
                      <CheckCircle2 className="w-6 h-6 text-nature-green-600 shrink-0 mt-0.5" />
                      <p className="text-gray-700">{benefit}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                <img src={liquidBiocharImage} alt="Nature's Way Soil Liquid Biochar with Humates 1 Gallon" className="mx-auto max-h-[520px] object-contain" />
                <div className="mt-6 rounded-2xl bg-nature-green-50 border border-nature-green-100 p-5">
                  <p className="font-extrabold text-gray-900 mb-2">1 Gallon Concentrate - $89.99</p>
                  <p className="text-gray-700 text-sm">Use 2-4 oz per gallon of water as a soil drench, compost tea booster, transplant solution, or lawn and garden soil conditioner.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-padding bg-white">
          <div className="max-w-4xl mx-auto container-padding">
            <div className="text-center mb-10">
              <p className="text-nature-green-700 font-bold uppercase tracking-wide mb-3">Questions before you buy</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Frequently asked questions</h2>
            </div>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <details key={faq.q} className="bg-gray-50 rounded-2xl p-6 border border-gray-200 group">
                  <summary className="cursor-pointer font-bold text-gray-900 flex items-center justify-between gap-4">
                    <span>{faq.q}</span>
                    <ArrowRight className="w-5 h-5 text-nature-green-700 group-open:rotate-90 transition-transform" />
                  </summary>
                  <p className="mt-4 text-gray-600 leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-nature-green-900 text-white py-16">
          <div className="max-w-5xl mx-auto container-padding text-center">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-5">Ready to restore tired soil naturally?</h2>
            <p className="text-xl text-white/85 mb-8">Choose the product that matches your lawn, garden, or soil problem and start with clear directions.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="#shop-systems" className="bg-white text-nature-green-900 hover:bg-nature-green-50 rounded-full px-8 py-4 font-bold inline-flex items-center justify-center">
                Shop the system
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link href="/contact" className="border border-white/40 hover:bg-white/10 rounded-full px-8 py-4 font-bold inline-flex items-center justify-center">
                Ask which product fits my yard
              </Link>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}
