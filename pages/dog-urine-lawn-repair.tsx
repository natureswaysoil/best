import Head from 'next/head';
import Link from 'next/link';
import { CheckCircle, Star, Shield, Droplets, Zap } from 'lucide-react';
import Layout from '../components/Layout';

export default function DogUrineLawnRepair() {
  return (
    <>
      <Head>
        <title>Dog Urine Lawn Repair - Fix Yellow Spots Fast | Nature's Way Soil</title>
        <meta
          name="description"
          content="Eliminate yellow lawn spots from dog urine with Nature's Way Soil Dog Urine Neutralizer. Pet-safe formula neutralizes salts and revives grass fast. No waiting period."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://natureswaysoil.com/dog-urine-lawn-repair" />
      </Head>

      <Layout>
        {/* Hero */}
        <section className="bg-gradient-to-b from-nature-green-50 to-white py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="inline-block bg-nature-green-100 text-nature-green-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
                  Pet Owner Formula
                </span>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  Say Goodbye to Yellow Lawn Spots From Dog Urine
                </h1>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Our professional-strength Dog Urine Neutralizer eliminates burn spots, neutralizes
                  harmful salts, removes odors, and revives damaged grass — all with a formula
                  that's 100% safe for your pets.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/product/NWS_014" className="btn-primary text-center">
                    Shop Dog Urine Neutralizer
                  </Link>
                  <Link href="/shop" className="btn-secondary text-center">
                    See All Lawn Products
                  </Link>
                </div>
                <div className="mt-6 flex flex-wrap gap-4">
                  {['Pet-safe formula', 'No waiting period', 'Eliminates odors'].map((benefit) => (
                    <span key={benefit} className="flex items-center gap-1 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-nature-green-600" />
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=900&q=80"
                  alt="Happy dog on healthy green lawn"
                  className="w-full rounded-2xl shadow-xl object-cover"
                />
                <div className="absolute -bottom-5 -left-5 bg-white rounded-xl shadow-lg p-4">
                  <p className="text-2xl font-bold text-nature-green-600">100%</p>
                  <p className="text-sm text-gray-600">Pet-Safe Formula</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Problem/Solution */}
        <section className="section-padding bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Why Dog Urine Burns Your Lawn
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Dog urine contains high concentrations of nitrogen salts and ammonia that overwhelm
                grass roots — creating those unsightly yellow or brown patches. Our formula works
                at the soil level to fix the root cause, not just the surface.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Zap className="w-8 h-8 text-nature-green-600" />,
                  title: 'Neutralizes Salts Instantly',
                  body: 'The concentrated formula immediately breaks down the harmful nitrogen salts in dog urine that cause grass to yellow and die.',
                },
                {
                  icon: <Droplets className="w-8 h-8 text-nature-green-600" />,
                  title: 'Revives Damaged Grass',
                  body: 'Beneficial microbes and natural compounds restore soil biology so grass can recover and regrow in as little as a few weeks.',
                },
                {
                  icon: <Shield className="w-8 h-8 text-nature-green-600" />,
                  title: 'Safe for Dogs & Cats',
                  body: 'No toxic chemicals, no waiting periods. Pets can return to treated areas as soon as the spray has dried — typically minutes.',
                },
              ].map((item) => (
                <div key={item.title} className="bg-gray-50 rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 bg-nature-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Product Feature */}
        <section className="section-padding bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
              <div>
                <img
                  src="/images/products/NWS_014/main.jpg"
                  alt="Dog Urine Neutralizer & Lawn Repair by Nature's Way Soil"
                  className="w-full rounded-2xl shadow-xl object-cover"
                />
              </div>
              <div>
                <span className="inline-block bg-nature-green-100 text-nature-green-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
                  Professional-Strength Formula
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Dog Urine Neutralizer &amp; Lawn Repair
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Available in 32 oz and 1 gallon sizes for yards of any scale. Our concentrated
                  formula goes further — and works faster — than anything you'll find at the big
                  box stores.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    'Eliminates yellow spots from pet urine burn',
                    'Neutralizes harmful nitrogen salts in soil',
                    'Removes pet odors naturally',
                    'Revives and regrows damaged grass',
                    '100% safe for dogs, cats, and all pets',
                    'No waiting period after application',
                  ].map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-nature-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/product/NWS_014" className="btn-primary text-center">
                    View Product — From $29.99
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How to Use */}
        <section className="section-padding bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                How to Use It
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { step: '1', title: 'Shake Vigorously', body: 'Activate the neutralizing microbes before every use.' },
                { step: '2', title: 'Mix with Water', body: 'For fresh spots: mix 4 oz with 1 gallon of water.' },
                { step: '3', title: 'Saturate the Area', body: 'Drench the burn spot and surrounding soil thoroughly.' },
                { step: '4', title: 'Reapply as Needed', body: 'For stubborn spots, repeat every 1–2 weeks.' },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-12 h-12 bg-nature-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="section-padding bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Pet Owners Love It</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  quote: 'My lawn was covered in yellow patches from our two labs. Within a few weeks of using this, the grass came back greener than ever.',
                  author: 'Mike D.',
                  location: 'Dog owner, Florida',
                },
                {
                  quote: "I was skeptical but it really works! No more embarrassing dead spots. And I don't have to worry about my dogs getting sick.",
                  author: 'Priya S.',
                  location: 'Pet owner, Oregon',
                },
                {
                  quote: 'Bought the gallon size — best investment for my lawn. The smell disappeared after the first application.',
                  author: 'Tom B.',
                  location: 'Lawn enthusiast, Georgia',
                },
              ].map((review) => (
                <div key={review.author} className="bg-white rounded-2xl p-8 shadow-sm">
                  <div className="flex mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic leading-relaxed">"{review.quote}"</p>
                  <div>
                    <p className="font-semibold text-gray-900">{review.author}</p>
                    <p className="text-sm text-gray-500">{review.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding bg-nature-green-600 text-white">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Restore Your Lawn Today
            </h2>
            <p className="text-xl text-nature-green-100 mb-8">
              Get professional results with a formula your pets can safely enjoy — available in 32 oz
              and 1 gallon sizes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/product/NWS_014" className="bg-white text-nature-green-700 font-semibold py-3 px-8 rounded-lg hover:bg-nature-green-50 transition-colors text-center">
                Buy Now — From $29.99
              </Link>
              <Link href="/contact" className="border-2 border-white text-white font-semibold py-3 px-8 rounded-lg hover:bg-nature-green-700 transition-colors text-center">
                Ask a Question
              </Link>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}
