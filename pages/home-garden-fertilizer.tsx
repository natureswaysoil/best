import Head from 'next/head';
import Link from 'next/link';
import { Leaf, CheckCircle, Star, Truck, Shield, Droplets } from 'lucide-react';
import Layout from '../components/Layout';

export default function HomeGardenFertilizer() {
  return (
    <>
      <Head>
        <title>Natural Home Garden Fertilizer - Nature's Way Soil</title>
        <meta
          name="description"
          content="Supercharge your home garden with Nature's Way Soil organic liquid fertilizers. Made fresh weekly with billions of living microbes. Safe for kids, pets, and pollinators."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://natureswaysoil.com/home-garden-fertilizer" />
      </Head>

      <Layout>
        {/* Hero */}
        <section className="bg-gradient-to-b from-nature-green-50 to-white py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="inline-block bg-nature-green-100 text-nature-green-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
                  Home Garden Formula
                </span>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  Give Your Garden the Living Soil It Deserves
                </h1>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Our organic liquid fertilizers are made fresh every week on our family farm with
                  billions of beneficial microbes, worm castings, and natural extracts — so your
                  vegetables, flowers, and herbs thrive without synthetic chemicals.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/shop"
                    className="btn-primary text-center"
                  >
                    Shop Garden Fertilizers
                  </Link>
                  <Link
                    href="/about"
                    className="btn-secondary text-center"
                  >
                    Our Story
                  </Link>
                </div>
                <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
                  <Truck className="w-4 h-4 text-nature-green-600" />
                  <span>Free shipping on orders over $50</span>
                </div>
              </div>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=900&q=80"
                  alt="Home garden with thriving vegetables and flowers"
                  className="w-full rounded-2xl shadow-xl object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="section-padding bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Why Home Gardeners Choose Nature's Way Soil
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Feed your soil — not just your plants — with a living, biology-first formula
                proven to produce healthier, more productive gardens.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Leaf className="w-8 h-8 text-nature-green-600" />,
                  title: 'Billions of Living Microbes',
                  body: 'Each bottle contains beneficial bacteria and fungi that rebuild your soil ecosystem, boost nutrient uptake, and protect roots naturally.',
                },
                {
                  icon: <Droplets className="w-8 h-8 text-nature-green-600" />,
                  title: 'Made Fresh Every Week',
                  body: 'Unlike shelf-stable products, our liquid fertilizers are brewed fresh on our farm every week for maximum microbial activity and potency.',
                },
                {
                  icon: <Shield className="w-8 h-8 text-nature-green-600" />,
                  title: '100% Safe for Families',
                  body: 'No harmful chemicals — our formulas are safe for children, pets, and pollinators, making them perfect for backyard food gardens.',
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

        {/* Featured Products */}
        <section className="section-padding bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Top Picks for Home Gardens
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                From liquid fertilizers to living compost, every product is designed to work together.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  name: 'Natural Liquid Fertilizer',
                  price: '$20.99',
                  desc: 'All-purpose formula with Vitamin B-1 and aloe vera. Great for vegetables, herbs, flowers, and houseplants.',
                  img: '/images/products/NWS_001/main.jpg',
                  href: '/product/NWS_001',
                },
                {
                  name: 'Organic Tomato Fertilizer',
                  price: '$29.99',
                  desc: 'Balanced nutrition for tomatoes and fruiting vegetables. Prevents blossom end rot and boosts yields.',
                  img: '/images/products/NWS_003/main.jpg',
                  href: '/product/NWS_003',
                },
                {
                  name: 'Enhanced Living Compost',
                  price: '$29.99',
                  desc: 'A premium blend of worm castings, activated biochar, and weed-free compost with fermented duckweed extract.',
                  img: '/images/products/NWS_013/main.jpg',
                  href: '/product/NWS_013',
                },
              ].map((product) => (
                <div key={product.name} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <img
                    src={product.img}
                    alt={product.name}
                    className="w-full h-52 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">{product.desc}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-nature-green-600 font-bold text-lg">{product.price}</span>
                      <Link href={product.href} className="btn-primary text-sm py-2 px-4">
                        View Product
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/shop" className="btn-secondary">
                Browse All Products
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="section-padding bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Simple to Use, Powerful Results
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { step: '1', title: 'Shake Well', body: 'Activate the living microbes inside before each use.' },
                { step: '2', title: 'Mix with Water', body: 'Dilute per the label — typically 2 oz per gallon.' },
                { step: '3', title: 'Apply to Roots', body: 'Drench around the root zone or foliar spray directly.' },
                { step: '4', title: 'Repeat Every 10–14 Days', body: 'Consistent applications build lasting soil health.' },
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

        {/* Trust Signals */}
        <section className="section-padding bg-nature-green-600 text-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { stat: '10,000+', label: 'Happy Customers' },
                { stat: '70+', label: 'Years of Experience' },
                { stat: '100%', label: 'Natural Ingredients' },
                { stat: '5★', label: 'Average Rating' },
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
              <h2 className="text-3xl font-bold text-gray-900 mb-4">What Gardeners Are Saying</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  quote: "My tomatoes doubled in size compared to last year. I'll never go back to synthetic fertilizers.",
                  author: 'Sarah M.',
                  location: 'Home gardener, Ohio',
                },
                {
                  quote: 'The liquid fertilizer is so easy to use. My herbs are thriving and my kids can help apply it safely.',
                  author: 'James R.',
                  location: 'Backyard gardener, Texas',
                },
                {
                  quote: 'Within two weeks of using the living compost, I could see my roses were greener and more vibrant.',
                  author: 'Linda T.',
                  location: 'Flower gardener, California',
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
              Ready to Transform Your Garden?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Start with our best-selling Natural Liquid Fertilizer and see the living-soil difference
              in your garden within two weeks — guaranteed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/shop" className="btn-primary">
                Shop Now
              </Link>
              <Link href="/contact" className="btn-secondary">
                Ask a Question
              </Link>
            </div>
            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-nature-green-600" /> Free shipping over $50
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-nature-green-600" /> Made fresh weekly
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-nature-green-600" /> Pet &amp; kid safe
              </span>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}
