import Head from 'next/head';
import Link from 'next/link';
import { CheckCircle, Star, Leaf, Shield, Zap } from 'lucide-react';
import Layout from '../components/Layout';

export default function PastureHayFarmers() {
  return (
    <>
      <Head>
        <title>Hay Field & Pasture Fertilizer for Farmers - Nature's Way Soil</title>
        <meta
          name="description"
          content="Nature's Way Soil Horse Safe Hay & Pasture Fertilizer. Microbial nitrogen formula grows greener, denser hay fields and pastures. Safe for horses and livestock."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://natureswaysoil.com/pasture-hay-farmers" />
      </Head>

      <Layout>
        {/* Hero */}
        <section className="bg-gradient-to-b from-nature-green-50 to-white py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="inline-block bg-nature-green-100 text-nature-green-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
                  Hay &amp; Pasture Formula
                </span>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  More Yield From Your Hay Fields &amp; Pastures — Naturally
                </h1>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Our Horse Safe Hay, Pasture &amp; Lawn Fertilizer uses a microbial nitrogen blend
                  to grow denser, greener pastures and hay fields — without synthetic chemicals that
                  could harm your horses or livestock.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/product/NWS_021" className="btn-primary text-center">
                    Shop Pasture Fertilizer
                  </Link>
                  <Link href="/shop" className="btn-secondary text-center">
                    See All Farm Products
                  </Link>
                </div>
                <div className="mt-6 flex flex-wrap gap-4">
                  {['Horse-safe formula', 'Microbial nitrogen', 'No re-entry waiting period'].map((benefit) => (
                    <span key={benefit} className="flex items-center gap-1 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-nature-green-600" />
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=900&q=80"
                  alt="Lush green hay field and pasture"
                  className="w-full rounded-2xl shadow-xl object-cover"
                />
                <div className="absolute -bottom-5 -right-5 bg-white rounded-xl shadow-lg p-4">
                  <p className="text-2xl font-bold text-nature-green-600">Horse Safe</p>
                  <p className="text-sm text-gray-600">Graze after 2 hours</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="section-padding bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Built for Working Farms
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Whether you're growing hay for sale or maintaining a grazing pasture, our
                biology-first approach delivers real, measurable improvements in grass density
                and soil health.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Leaf className="w-8 h-8 text-nature-green-600" />,
                  title: 'Microbial Nitrogen Blend',
                  body: 'Natural nitrogen-fixing microbes work with the soil to feed grass from the ground up — producing sustained, even growth without volatility.',
                },
                {
                  icon: <Zap className="w-8 h-8 text-nature-green-600" />,
                  title: 'Greener, Denser Growth',
                  body: 'Farmers report noticeably denser stands and richer color after 2–4 applications, with improved soil structure that holds up through dry spells.',
                },
                {
                  icon: <Shield className="w-8 h-8 text-nature-green-600" />,
                  title: 'Safe for Horses &amp; Livestock',
                  body: 'No synthetic chemicals, no harmful runoff. Horses and cattle can return to pasture just 2 hours after application — no blackout period.',
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
                  src="/images/products/NWS_021/main.jpg"
                  alt="Horse Safe Hay, Pasture & Lawn Fertilizer by Nature's Way Soil"
                  className="w-full rounded-2xl shadow-xl object-cover"
                />
              </div>
              <div>
                <span className="inline-block bg-nature-green-100 text-nature-green-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
                  Available in 1 Gallon &amp; 2.5 Gallon
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Horse Safe Hay, Pasture &amp; Lawn Fertilizer
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  A premium microbial nitrogen blend specifically formulated for hay fields, horse
                  pastures, and large turf areas. One gallon covers up to 8,000 sq ft, making it
                  economical even for large acreage.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    'Safe for horses and all livestock — no waiting period',
                    'Microbial nitrogen for sustained, even growth',
                    'Greener lawns and pastures in weeks',
                    'Improves soil structure and water retention',
                    'Perfect for organic farms and horse properties',
                    'Suitable for both hay fields and residential lawns',
                  ].map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-nature-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/product/NWS_021" className="btn-primary text-center">
                    View Product — From $39.99
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Application Guide */}
        <section className="section-padding bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Application Guide for Hay &amp; Pasture
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { step: '1', title: 'Shake Well', body: 'Mix the microbial blend before diluting.' },
                { step: '2', title: 'Mix 8 oz per Gallon', body: 'Dilute with water for broadcast spraying.' },
                { step: '3', title: 'Spray Evenly', body: 'Apply across ~1,000 sq ft per gallon of solution.' },
                { step: '4', title: 'Irrigate Within 24 hrs', body: 'Water in to carry nutrients into the root zone. Livestock may graze after spray dries (~2 hrs).' },
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

        {/* Stats */}
        <section className="section-padding bg-nature-green-600 text-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { stat: '70+', label: 'Years Farm Experience' },
                { stat: '200', label: 'Acre Farm' },
                { stat: '100%', label: 'Natural Ingredients' },
                { stat: '2 hrs', label: 'Return to Grazing' },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-3xl md:text-4xl font-bold mb-1">{item.stat}</p>
                  <p className="text-nature-green-100">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="section-padding bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Farmers Trust Nature's Way Soil</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  quote: "I've tried every fertilizer out there for my hay fields. This is the first one that noticeably improved tonnage per acre without worrying about my horses.",
                  author: 'Dale W.',
                  location: 'Hay farmer, Kentucky',
                },
                {
                  quote: "The pastures are greener than they've been in years. My horses went right back on the field the same day I applied it.",
                  author: 'Rachel F.',
                  location: 'Horse property owner, Texas',
                },
                {
                  quote: 'We run an organic operation. This product fits perfectly — natural ingredients, works fast, and no chemical runoff into our pond.',
                  author: 'Stan M.',
                  location: 'Organic farm, Missouri',
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
        <section className="section-padding bg-white">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Grow a Healthier Hay Field or Pasture This Season
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Try our Horse Safe Hay &amp; Pasture Fertilizer on your acreage and see the living-soil
              difference — available in 1 gallon and 2.5 gallon sizes for farms of any scale.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/product/NWS_021" className="btn-primary">
                Buy Now — From $39.99
              </Link>
              <Link href="/contact" className="btn-secondary">
                Talk to Our Farm Team
              </Link>
            </div>
            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-nature-green-600" /> Free shipping over $50
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-nature-green-600" /> Livestock-safe
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-nature-green-600" /> 100% natural
              </span>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}
