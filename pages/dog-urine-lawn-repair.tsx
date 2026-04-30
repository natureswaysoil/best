import Head from 'next/head';
import Link from 'next/link';
import { CheckCircle, Star, Shield, Droplets, Sprout } from 'lucide-react';
import Layout from '../components/Layout';

const checkoutLinks = {
  small: process.env.NEXT_PUBLIC_DOG_URINE_32OZ_CHECKOUT_URL || '/product/NWS_014',
  gallon: process.env.NEXT_PUBLIC_DOG_URINE_GALLON_CHECKOUT_URL || '/product/NWS_014',
  bundle: process.env.NEXT_PUBLIC_DOG_URINE_BUNDLE_CHECKOUT_URL || '/shop',
  guide: process.env.NEXT_PUBLIC_LAWN_RECOVERY_GUIDE_URL || '/guide?src=dog-urine-landing',
};

const faqs = [
  {
    q: 'Is this a green dye?',
    a: 'No. This is not a temporary green color spray. It is designed to support the lawn and soil environment where dog urine has stressed the grass.',
  },
  {
    q: 'How fast will I see results?',
    a: 'Recovery depends on grass type, severity, soil condition, watering, and weather. Some stressed areas improve with routine care, while severely dead patches may need reseeding.',
  },
  {
    q: 'Is it safe around pets?',
    a: 'Use according to label directions. Keep pets off treated areas until the product has dried or watered in as directed.',
  },
  {
    q: 'Can I use it with a sprayer?',
    a: 'Yes. It can be applied with a pump sprayer, watering can, or compatible lawn sprayer when mixed according to label directions.',
  },
  {
    q: 'Will it stop my dog from peeing in the same spot?',
    a: 'No. This product is for lawn and soil recovery. It is not a behavioral training product.',
  },
];

function CtaButton({ href, children, secondary = false }: { href: string; children: React.ReactNode; secondary?: boolean }) {
  return (
    <Link
      href={href}
      className={secondary
        ? 'inline-flex w-full sm:w-auto items-center justify-center rounded-xl border-2 border-nature-green-700 bg-white px-6 py-4 text-base font-extrabold text-nature-green-700 shadow-sm hover:bg-nature-green-50'
        : 'inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-nature-green-600 px-6 py-4 text-base font-extrabold text-white shadow-lg shadow-green-900/20 hover:bg-nature-green-700'}
    >
      {children}
    </Link>
  );
}

export default function DogUrineLawnRepair() {
  return (
    <Layout>
      <Head>
        <title>Fix Yellow Dog Spots From the Soil Up | Nature&apos;s Way Soil</title>
        <meta
          name="description"
          content="Nature’s Way Soil Dog Urine Neutralizer & Lawn Revitalizer helps support lawn recovery where dog urine has stressed grass and soil. Order direct."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://natureswaysoil.com/dog-urine-lawn-repair" />
      </Head>

      <main className="bg-stone-50 text-gray-900">
        <section className="bg-gradient-to-br from-nature-green-900 via-nature-green-800 to-green-700 py-20 text-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="inline-block bg-white/15 text-nature-green-50 text-sm font-bold px-4 py-1.5 rounded-full mb-4 border border-white/20">
                  Dog Lawn Recovery • Soil-First Formula
                </span>
                <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                  Fix Yellow Dog Spots From the Soil Up
                </h1>
                <p className="text-xl text-nature-green-50 mb-8 leading-relaxed">
                  Nature&apos;s Way Soil Dog Urine Neutralizer & Lawn Revitalizer helps support lawn recovery where dog urine has stressed the grass and soil — without relying on temporary green dye.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <CtaButton href={checkoutLinks.gallon}>Order Direct</CtaButton>
                  <CtaButton href={checkoutLinks.guide} secondary>Get Free Lawn Recovery Guide</CtaButton>
                </div>
                <div className="mt-6 flex flex-wrap gap-4">
                  {['Soil-level support', 'Not a green dye', 'Easy spot treatment'].map((benefit) => (
                    <span key={benefit} className="flex items-center gap-1 text-sm text-nature-green-50">
                      <CheckCircle className="w-4 h-4" />
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=900&q=80"
                  alt="Dog on healthy green lawn"
                  className="w-full rounded-2xl shadow-xl object-cover"
                />
                <div className="absolute -bottom-5 -left-5 bg-white rounded-xl shadow-lg p-4 text-gray-900">
                  <p className="text-2xl font-black text-nature-green-600">Direct</p>
                  <p className="text-sm text-gray-600">from Nature&apos;s Way Soil</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-padding bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
                Dog Spots Are Usually More Than a Surface Problem
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                When dog urine hits the same area repeatedly, grass can yellow, thin out, or stop growing well. The visible spot is only part of the issue. The soil underneath also needs support so the lawn has a better chance to recover.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Sprout className="w-8 h-8 text-nature-green-600" />,
                  title: 'Soil-Level Support',
                  body: 'Supports the soil and root-zone environment where repeated dog urine stress can affect lawn recovery.',
                },
                {
                  icon: <Droplets className="w-8 h-8 text-nature-green-600" />,
                  title: 'Easy Spot Treatment',
                  body: 'Apply to affected areas with a sprayer or watering can according to label directions as part of your regular lawn care routine.',
                },
                {
                  icon: <Shield className="w-8 h-8 text-nature-green-600" />,
                  title: 'Not a Temporary Dye',
                  body: 'Built for soil-first lawn care instead of simply covering yellow spots with temporary color.',
                },
              ].map((item) => (
                <div key={item.title} className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-100">
                  <div className="w-16 h-16 bg-nature-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-padding bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
              <div>
                <img
                  src="/images/products/NWS_014/main.jpg"
                  alt="Nature's Way Soil Dog Urine Neutralizer & Lawn Revitalizer"
                  className="w-full rounded-2xl shadow-xl object-cover bg-white"
                />
              </div>
              <div>
                <span className="inline-block bg-nature-green-100 text-nature-green-700 text-sm font-bold px-4 py-1.5 rounded-full mb-4">
                  Direct-Order Lawn Recovery
                </span>
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6">
                  Dog Urine Neutralizer &amp; Lawn Revitalizer
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Available in 32 oz and 1 gallon sizes for yards of different sizes. Order direct from Nature&apos;s Way Soil for bundles, lawn recovery resources, and support from a small soil-focused business.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    'Supports recovery of dog urine-stressed lawn areas',
                    'Helps support soil and root-zone conditions',
                    'Designed for spot treatment and routine lawn care',
                    'Useful for repeat dog areas and larger lawns',
                    'Order direct for bundles and lawn recovery resources',
                  ].map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-nature-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col sm:flex-row gap-4">
                  <CtaButton href={checkoutLinks.gallon}>Order 1 Gallon Direct</CtaButton>
                  <CtaButton href={checkoutLinks.small} secondary>Order 32 oz</CtaButton>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-padding bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
                Simple Spot Treatment
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { step: '1', title: 'Shake Well', body: 'Shake before use so the formula is evenly mixed.' },
                { step: '2', title: 'Mix by Label', body: 'Dilute according to the product label for your application method.' },
                { step: '3', title: 'Apply to Spots', body: 'Treat the yellow or stressed area and surrounding soil.' },
                { step: '4', title: 'Repeat as Needed', body: 'Use as part of your lawn recovery routine. Severely dead areas may need reseeding.' },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-12 h-12 bg-nature-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-padding bg-nature-green-50">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Order Direct and Save on Lawn Recovery</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Social traffic should come here first, not Amazon. Ordering direct helps support our small business and gives you access to bundles and lawn recovery resources.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10 text-left">
              {[
                { title: '32 oz Concentrate', copy: 'Best for small yards and first-time use.', href: checkoutLinks.small, button: 'Order 32 oz' },
                { title: '1 Gallon', copy: 'Best for repeat dog spots and larger lawns.', href: checkoutLinks.gallon, button: 'Order 1 Gallon', badge: 'Most Popular' },
                { title: 'Lawn Recovery Bundle', copy: 'Best value with add-ons such as sprayer or soil booster.', href: checkoutLinks.bundle, button: 'Get the Bundle', badge: 'Best Value' },
              ].map((offer) => (
                <div key={offer.title} className={`relative rounded-2xl bg-white p-8 shadow-sm border ${offer.badge === 'Most Popular' ? 'border-nature-green-600 ring-2 ring-nature-green-600' : 'border-gray-100'}`}>
                  {offer.badge && <span className="absolute -top-4 left-6 rounded-full bg-nature-green-600 px-4 py-2 text-xs font-black uppercase tracking-wide text-white">{offer.badge}</span>}
                  <h3 className="text-2xl font-black text-gray-900">{offer.title}</h3>
                  <p className="mt-3 text-gray-600">{offer.copy}</p>
                  <Link href={offer.href} className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-nature-green-600 px-5 py-3 font-extrabold text-white hover:bg-nature-green-700">
                    {offer.button}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-padding bg-white">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-black text-gray-900 mb-4">Not Ready to Order Yet?</h2>
            <p className="text-lg text-gray-600 mb-8">
              Get the free Yellow Spot Lawn Recovery Guide and learn how to support grass recovery from the soil up.
            </p>
            <CtaButton href={checkoutLinks.guide}>Get Free Lawn Recovery Guide</CtaButton>
          </div>
        </section>

        <section className="section-padding bg-gray-50">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-center text-3xl font-black text-gray-900 mb-8">Questions Before You Order?</h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <details key={faq.q} className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
                  <summary className="cursor-pointer text-lg font-bold text-gray-900">{faq.q}</summary>
                  <p className="mt-3 leading-7 text-gray-700">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="section-padding bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-gray-900 mb-4">Built by a Soil-Focused Small Business</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  quote: 'I wanted a product that focused on the lawn and soil, not just covering the spot. This was exactly what I needed.',
                  author: 'Verified customer',
                },
                {
                  quote: 'The directions were simple, and I liked that it was made by a small soil-focused company.',
                  author: 'Verified customer',
                },
                {
                  quote: 'The gallon size made sense for our yard because our dogs use the same area every day.',
                  author: 'Verified customer',
                },
              ].map((review) => (
                <div key={review.quote} className="bg-gray-50 rounded-2xl p-8 shadow-sm border border-gray-100">
                  <div className="flex mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic leading-relaxed">&quot;{review.quote}&quot;</p>
                  <p className="font-bold text-gray-900">{review.author}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-padding bg-nature-green-600 text-white">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-black mb-6">
              Start Lawn Recovery From the Soil Up
            </h2>
            <p className="text-xl text-nature-green-100 mb-8">
              Order direct from Nature&apos;s Way Soil and give your lawn soil-level support after dog urine stress.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <CtaButton href={checkoutLinks.gallon}>Order Direct</CtaButton>
              <CtaButton href={checkoutLinks.guide} secondary>Get Free Guide</CtaButton>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
