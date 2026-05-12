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
    name: 'Liquid Biochar Soil Recovery',
    eyebrow: 'Best premium soil restoration',
    price: '1 Gallon $89.99',
    image: '/images/products/NWS_002/main.jpg',
    href: '/contact',
    problem: 'Sandy soil, nutrient leaching, dry spots, tired root zones',
    promise: 'Biochar-enhanced liquid soil conditioner built for nutrient retention, microbial habitat, and long-term soil improvement.',
    bullets: ['Supports water and nutrient retention', 'Great for sandy or depleted soil', 'Ask about 1 gallon and 2.5 gallon options'],
  },
];

const painPoints = [
  'Dog urine burns and yellow lawn spots',
  'Fertilizer washes through sandy soil too quickly',
  'Grass greens up for a week, then fades again',
  'Hard compacted soil blocks roots and water',
  'Garden plants look stressed even after feeding',
  'You want fewer Amazon fees and more direct value',
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
              <p className="text-nature-green-700 font-bold uppercase tracking-wide mb-3">Common problems this page is built to solve</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Stop paying for clicks that send people to the wrong product.</h2>
              <p className="text-lg text-gray-600">This landing page is built for Google Ads traffic. It gets buyers to the right offer fast, then backs the decision with benefits, use cases, and simple product selection.</p>
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
              <p className="text-gray-600 max-w-xl">For best conversion, run separate Google Ads groups to this page using keywords for dog urine spots, liquid humic acid, and liquid biochar.</p>
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
                <p className="text-nature-green-700 font-bold uppercase tracking-wide mb-3">Why this converts better</p>
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">It gives buyers a simple decision path.</h2>
                <div className="space-y-5">
                  {[
                    ['Pet problem', 'Dog urine spots and outdoor odor need a focused pet-lawn product.'],
                    ['General soil problem', 'Hard soil, nutrient lockout, and weak roots need humic, fulvic, and kelp.'],
                    ['Retention problem', 'Sandy soil and fast leaching need biochar and humates to help hold more water and nutrients.'],
                  ].map(([title, body]) => (
                    <div key={title} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                      <h3 className="font-extrabold text-gray-900 mb-2">{title}</h3>
                      <p className="text-gray-600">{body}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                <h3 className="text-2xl font-extrabold text-gray-900 mb-4">Recommended Google Ads structure</h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-nature-green-600 pl-4">
                    <p className="font-bold text-gray-900">Campaign 1: Dog Urine Lawn Repair</p>
                    <p className="text-sm text-gray-600">dog urine spots lawn, dog pee killing grass, outdoor dog urine odor</p>
                  </div>
                  <div className="border-l-4 border-blue-600 pl-4">
                    <p className="font-bold text-gray-900">Campaign 2: Humic/Fulvic/Kelp</p>
                    <p className="text-sm text-gray-600">liquid humic acid, humic fulvic acid fertilizer, soil conditioner for lawns</p>
                  </div>
                  <div className="border-l-4 border-amber-600 pl-4">
                    <p className="font-bold text-gray-900">Campaign 3: Liquid Biochar</p>
                    <p className="text-sm text-gray-600">liquid biochar, biochar for sandy soil, biochar soil conditioner</p>
                  </div>
                </div>
                <Link href="#shop-systems" className="mt-8 bg-nature-green-700 hover:bg-nature-green-800 text-white rounded-full py-3 px-5 font-bold inline-flex items-center justify-center">
                  Pick a product now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
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
            <h2 className="text-3xl md:text-5xl font-extrabold mb-5">Ready to send Google Ads traffic somewhere built to sell?</h2>
            <p className="text-xl text-white/85 mb-8">Use this page as the first direct-to-website funnel for your three hero offers.</p>
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
