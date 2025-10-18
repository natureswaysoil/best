import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { Leaf, Award, ArrowRight, Users, Shield, Truck } from 'lucide-react';
import Layout from '../components/Layout';
import HeroVideo from '../components/HeroVideo';
import { allProducts } from '../data/products';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
}

interface HomeProps {
  featuredProducts: Product[];
}

export default function Home({ featuredProducts }: HomeProps) {
  return (
    <>
      <Head>
        <title>Nature's Way Soil - Naturally Stronger Soil Starts Here</title>
        <meta name="description" content="Microbe-rich fertilizers, biochar, and compost from our family farm — safe for kids, pets, and pollinators." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout transparentHeader={true}>
        {/* Hero Section with Video */}
        <HeroVideo />

        {/* Features Section */}
        <section className="section-padding bg-white">
          <div className="max-w-7xl mx-auto container-padding">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                The Living Soil Difference
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Most fertilizers feed the plant. We feed the soil—bringing billions of beneficial microbes, 
                worm castings, and biochar together to create naturally healthier, more productive gardens.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="w-20 h-20 bg-nature-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-nature-green-200 transition-colors">
                  <Leaf className="w-10 h-10 text-nature-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Living Microbes</h3>
                <p className="text-gray-600 leading-relaxed">
                  Billions of beneficial bacteria and fungi restore your soil's natural ecosystem, 
                  improving nutrient uptake and plant immunity. Safe for children, pets, and pollinators.
                </p>
              </div>

              <div className="text-center group">
                <div className="w-20 h-20 bg-nature-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-nature-green-200 transition-colors">
                  <Users className="w-10 h-10 text-nature-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Worm Castings & Biochar</h3>
                <p className="text-gray-600 leading-relaxed">
                  Premium worm castings provide slow-release nutrients while activated biochar 
                  improves water retention and creates a thriving habitat for soil life.
                </p>
              </div>

              <div className="text-center group">
                <div className="w-20 h-20 bg-nature-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-nature-green-200 transition-colors">
                  <Award className="w-10 h-10 text-nature-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Made Fresh Weekly</h3>
                <p className="text-gray-600 leading-relaxed">
                  Three generations of farming expertise from our family farm. Our liquid fertilizers 
                  are made fresh weekly for maximum potency and microbial activity.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works - Living Soil Science */}
        <section className="section-padding bg-white">
          <div className="max-w-7xl mx-auto container-padding">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                How Living Soil Works
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Unlike chemical fertilizers that feed only the plant, we restore your soil's natural ecosystem 
                for healthier growth that lasts season after season.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              {/* Step 1 */}
              <div className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-nature-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-6">
                    1
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Add Billions of Microbes
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Our liquid fertilizers contain billions of beneficial bacteria and fungi that colonize your soil, 
                    breaking down natural matter and making nutrients available to plants.
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 text-sm text-nature-green-700 bg-nature-green-50 px-3 py-1.5 rounded-full border border-nature-green-200">
                    <span className="font-semibold">•</span>
                    <span className="font-medium">Made fresh weekly</span>
                  </div>
                </div>
                {/* Connector arrow for desktop */}
                <div className="hidden md:block absolute top-8 -right-6 text-nature-green-300">
                  <ArrowRight className="w-12 h-12" />
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-nature-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-6">
                    2
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Build Soil Structure
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Worm castings provide slow-release nutrients while activated biochar creates a permanent habitat 
                    for microbes and improves water retention by up to 40%.
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 text-sm text-nature-green-700 bg-nature-green-50 px-3 py-1.5 rounded-full border border-nature-green-200">
                    <span className="font-semibold">•</span>
                    <span className="font-medium">20% worm castings</span>
                  </div>
                </div>
                <div className="hidden md:block absolute top-8 -right-6 text-nature-green-300">
                  <ArrowRight className="w-12 h-12" />
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-nature-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-6">
                  3
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  See Healthier Growth
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Living soil means stronger root systems, improved disease resistance, bigger yields, 
                  and plants that thrive naturally without harsh chemicals.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 text-sm text-nature-green-700 bg-nature-green-50 px-3 py-1.5 rounded-full border border-nature-green-200">
                  <span className="font-semibold">•</span>
                  <span className="font-medium">Results in 2-3 weeks</span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center mt-12">
              <Link href="/shop" className="btn-primary inline-flex items-center">
                Shop Living Soil Products
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="section-padding bg-gray-50">
          <div className="max-w-7xl mx-auto container-padding">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Featured Products
                </h2>
                <p className="text-xl text-gray-600">
                  Our most popular soil amendments for healthier gardens
                </p>
              </div>
              <Link href="/shop" className="btn-secondary hidden md:inline-flex">
                View All Products
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden group">
                  <div className="relative aspect-square overflow-hidden bg-white border border-gray-200">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4 bg-nature-green-600 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                      {product.category}
                    </div>
                    {/* Safe Badge */}
                    <div className="absolute bottom-4 left-4 right-4 flex gap-2 flex-wrap">
                      <span className="bg-white/95 backdrop-blur-sm text-gray-700 px-2 py-1 rounded-md text-xs font-medium border border-gray-200">
                        Pet Safe
                      </span>
                      <span className="bg-white/95 backdrop-blur-sm text-gray-700 px-2 py-1 rounded-md text-xs font-medium border border-gray-200">
                        100% Natural
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                    
                    {/* Product Info Badge */}
                    <div className="mb-4 flex items-center gap-2 text-xs text-nature-green-700 bg-nature-green-50 px-3 py-2 rounded-lg border border-nature-green-200">
                      <span className="font-medium">
                        {product.category === 'Fertilizer' 
                          ? 'Made fresh weekly for maximum potency' 
                          : product.category === 'Compost' 
                          ? 'Premium blend with living microbes'
                          : 'Professional-grade soil amendment'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-nature-green-600">
                          ${product.price.toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-500 block">
                          {product.category === 'Compost' ? 'Per 10lb bag' : 'Liquid concentrate'}
                        </span>
                      </div>
                      <Link 
                        href={`/product/${product.id}`}
                        className="btn-primary text-sm py-2 px-4"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8 md:hidden">
              <Link href="/shop" className="btn-secondary">
                View All Products
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </section>

        {/* See Our Living Soil in Action - Video Section */}
        <section className="section-padding bg-gradient-to-br from-nature-green-50 to-nature-green-100">
          <div className="max-w-7xl mx-auto container-padding">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                See the Living Soil Difference
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Watch how our microbe-rich products transform soil and create thriving gardens naturally
              </p>
            </div>
            
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="aspect-video w-full">
                <video
                  className="w-full h-full object-cover"
                  controls
                  autoPlay
                  muted
                  playsInline
                  loop
                  poster="https://images.unsplash.com/photo-1582719478315-1bfa973d8f65?auto=format&fit=crop&w=1200&q=80"
                  preload="auto"
                >
                  <source
                    src="https://d3uryq9bhgb5qr.cloudfront.net/Pictory-API-Self-Service-USD-Monthly/6brpmrpiu3k3kud3b4eb7nc1rs/a2a35808-5743-40eb-8023-22b2c6b6cf2d/VIDEO/soil_symbiosis_hero_video.mp4"
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>
              </div>
              
              <div className="p-8 text-center border-t border-gray-200">
                <p className="text-gray-600 mb-6">
                  From our family farm to your garden - three generations of expertise in natural soil health
                </p>
                <Link 
                  href="/shop"
                  className="btn-primary inline-block"
                >
                  Shop All Products
                  <ArrowRight className="w-4 h-4 ml-2 inline" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Problem-Solution Section */}
        <section className="section-padding bg-gray-50">
          <div className="max-w-7xl mx-auto container-padding">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Common Garden Problems? We Have Solutions.
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Unlike chemical fertilizers that kill soil life, our products restore your soil's natural ecosystem
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Problem 1 */}
              <div className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-nature-green-300 transition-colors">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-red-600">!</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Weak, Yellowing Plants?</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Depleted soil lacks essential microbes to break down nutrients plants can absorb.
                </p>
                <div className="flex items-center gap-2 text-nature-green-700 text-sm font-medium">
                  <ArrowRight className="w-4 h-4" />
                  <span>Use Liquid Fertilizer with billions of microbes</span>
                </div>
              </div>

              {/* Problem 2 */}
              <div className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-nature-green-300 transition-colors">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-blue-600">~</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Poor Water Retention?</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Compacted soil can't hold water or oxygen, stressing plants and wasting resources.
                </p>
                <div className="flex items-center gap-2 text-nature-green-700 text-sm font-medium">
                  <ArrowRight className="w-4 h-4" />
                  <span>Add Biochar to improve retention by 40%</span>
                </div>
              </div>

              {/* Problem 3 */}
              <div className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-nature-green-300 transition-colors">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-orange-600">×</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Disease-Prone Plants?</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Without beneficial microbes, harmful pathogens can overwhelm your garden.
                </p>
                <div className="flex items-center gap-2 text-nature-green-700 text-sm font-medium">
                  <ArrowRight className="w-4 h-4" />
                  <span>Build immunity with Living Compost</span>
                </div>
              </div>

              {/* Problem 4 */}
              <div className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-nature-green-300 transition-colors">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-yellow-600">▼</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Small, Poor Yields?</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Dead soil = dead plants. Living soil creates the foundation for abundant harvests.
                </p>
                <div className="flex items-center gap-2 text-nature-green-700 text-sm font-medium">
                  <ArrowRight className="w-4 h-4" />
                  <span>Restore with Worm Castings</span>
                </div>
              </div>

              {/* Problem 5 */}
              <div className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-nature-green-300 transition-colors">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-purple-600">⚗</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Chemical Dependency?</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Synthetic fertilizers provide quick fix but destroy long-term soil health.
                </p>
                <div className="flex items-center gap-2 text-nature-green-700 text-sm font-medium">
                  <ArrowRight className="w-4 h-4" />
                  <span>Switch to natural, living solutions</span>
                </div>
              </div>

              {/* Problem 6 */}
              <div className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-nature-green-300 transition-colors">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Unsafe for Kids & Pets?</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Worried about chemicals harming your family, pets, or pollinators?
                </p>
                <div className="flex items-center gap-2 text-nature-green-700 text-sm font-medium">
                  <ArrowRight className="w-4 h-4" />
                  <span>100% safe, natural ingredients</span>
                </div>
              </div>
            </div>

            <div className="text-center mt-12">
              <Link href="/shop" className="btn-primary inline-flex items-center">
                Shop Solutions for Your Garden
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="section-padding bg-gray-50">
          <div className="max-w-4xl mx-auto container-padding">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600">
                Everything you need to know about living soil and our products
              </p>
            </div>

            <div className="space-y-4">
              {/* FAQ 1 */}
              <details className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-nature-green-300 transition-colors group">
                <summary className="font-semibold text-gray-900 cursor-pointer flex justify-between items-center">
                  <span>What makes your products different from regular fertilizers?</span>
                  <ArrowRight className="w-5 h-5 text-nature-green-600 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="mt-4 text-gray-600 leading-relaxed">
                  Most fertilizers only feed the plant. We feed the soil by adding billions of beneficial microbes, 
                  worm castings, biochar, and specialty amendments like crab meal that build a thriving ecosystem. 
                  Crab meal is rich in chitin—a natural compound that wakes up chitin-eating microbes. As they break 
                  the chitin down, those microbes hunt harmful nematodes and fungi that also have chitin in their cell 
                  walls. At the same time, the crab meal releases calcium, nitrogen, and phosphorus slowly, so your 
                  soil gets healthier season after season instead of being depleted. The result: resilient soil, 
                  stronger plants, and better yields year after year.
                </p>
              </details>

              {/* FAQ 2 */}
              <details className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-nature-green-300 transition-colors group">
                <summary className="font-semibold text-gray-900 cursor-pointer flex justify-between items-center">
                  <span>Are your products safe for children, pets, and pollinators?</span>
                  <ArrowRight className="w-5 h-5 text-nature-green-600 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="mt-4 text-gray-600 leading-relaxed">
                  Absolutely! All our products are 100% natural with no harsh chemicals or synthetic additives. 
                  They're safe for kids to play on treated lawns, pets to dig in treated soil, and beneficial 
                  pollinators like bees and butterflies. We use these products on our own family farm.
                </p>
              </details>

              {/* FAQ 3 */}
              <details className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-nature-green-300 transition-colors group">
                <summary className="font-semibold text-gray-900 cursor-pointer flex justify-between items-center">
                  <span>How long until I see results?</span>
                  <ArrowRight className="w-5 h-5 text-nature-green-600 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="mt-4 text-gray-600 leading-relaxed">
                  Most gardeners see noticeable improvements within 2-3 weeks. You'll notice greener leaves, 
                  stronger growth, and better water retention. The real magic happens over time as the living 
                  microbes establish a permanent, thriving soil ecosystem that gets better with each season.
                </p>
              </details>

              {/* FAQ 4 */}
              <details className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-nature-green-300 transition-colors group">
                <summary className="font-semibold text-gray-900 cursor-pointer flex justify-between items-center">
                  <span>Why are liquid fertilizers made fresh weekly?</span>
                  <ArrowRight className="w-5 h-5 text-nature-green-600 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="mt-4 text-gray-600 leading-relaxed">
                  Living microbes are most active when fresh! We make our liquid fertilizers in small batches weekly 
                  to ensure maximum microbial activity. This means you're getting billions of living, active 
                  beneficial bacteria and fungi that immediately go to work in your soil.
                </p>
              </details>

              {/* FAQ 5 */}
              <details className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-nature-green-300 transition-colors group">
                <summary className="font-semibold text-gray-900 cursor-pointer flex justify-between items-center">
                  <span>What's the difference between worm castings and compost?</span>
                  <ArrowRight className="w-5 h-5 text-nature-green-600 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="mt-4 text-gray-600 leading-relaxed">
                  Worm castings are nature's perfect plant food. As natural matter passes through worms, it's broken down into 
                  an easily absorbable form packed with beneficial microbes. Our Enhanced Living Compost contains 20% 
                  premium worm castings, 20% activated biochar, and 60% weed-free compost for the ultimate soil amendment.
                </p>
              </details>

              {/* FAQ 6 */}
              <details className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-nature-green-300 transition-colors group">
                <summary className="font-semibold text-gray-900 cursor-pointer flex justify-between items-center">
                  <span>Do you ship nationwide?</span>
                  <ArrowRight className="w-5 h-5 text-nature-green-600 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="mt-4 text-gray-600 leading-relaxed">
                  Yes! We offer reliable shipping to all lower 48 states. Orders over $50 ship free. 
                  Fresh liquid fertilizers are shipped the same week they're made to ensure you get the most 
                  active microbes possible.
                </p>
              </details>
            </div>

            <div className="text-center mt-12">
              <p className="text-gray-600 mb-4">Still have questions?</p>
              <Link href="/contact" className="btn-secondary inline-flex items-center">
                Contact Us
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </section>

        {/* Customer Stories with Hero Video */}
        <section className="section-padding bg-white">
          <div className="max-w-7xl mx-auto container-padding">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                What Our Customers Say
              </h2>
              <p className="text-xl text-gray-600">
                Join thousands of happy gardeners who trust Nature's Way Soil
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Customer Testimonials */}
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-2xl p-6">
                  <p className="text-gray-700 mb-4 leading-relaxed text-lg italic">
                    "My tomatoes have never been bigger! The microbe-rich fertilizer made such a difference in just one season."
                  </p>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-nature-green-200 rounded-full flex items-center justify-center">
                      <span className="font-semibold text-nature-green-700">S</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Sarah Johnson</p>
                      <p className="text-sm text-gray-600">Portland, OR</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6">
                  <p className="text-gray-700 mb-4 leading-relaxed text-lg italic">
                    "The biochar has completely transformed my clay soil. Water drains better and my plants are thriving."
                  </p>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-nature-green-200 rounded-full flex items-center justify-center">
                      <span className="font-semibold text-nature-green-700">M</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Mike Chen</p>
                      <p className="text-sm text-gray-600">Austin, TX</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hero Video */}
              <div className="relative">
                <div className="rounded-2xl overflow-hidden shadow-2xl">
                  <HeroVideo />
                </div>
                <div className="text-center mt-4">
                  <p className="text-sm text-gray-600">
                    See how Nature's Way Soil transforms gardens
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="section-padding bg-nature-green-50">
          <div className="max-w-7xl mx-auto container-padding">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-nature-green-600 rounded-full flex items-center justify-center">
                  <Truck className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Free Shipping</h3>
                <p className="text-gray-600">Free delivery on all orders over $50 to the lower 48---reliable shipping nationwide.</p>
              </div>
              
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-nature-green-600 rounded-full flex items-center justify-center">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">30-Day Guarantee</h3>
                <p className="text-gray-600">Not satisfied? Return any product within 30 days for a full refund---no need to return product.</p>
              </div>
              
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-nature-green-600 rounded-full flex items-center justify-center">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Expert Support</h3>
                <p className="text-gray-600">
                  <span className="inline-block bg-nature-green-100 border-2 border-nature-green-600 rounded-lg px-4 py-2 text-nature-green-800 font-medium">
                    Use our chat box for instant soil expert advice
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="section-padding bg-nature-green-600">
          <div className="max-w-4xl mx-auto container-padding text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Soil?
            </h2>
            <p className="text-xl text-nature-green-100 mb-8">
              Join thousands of gardeners who have discovered the Nature's Way difference. 
              Start building stronger, healthier soil today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/shop" className="btn-secondary bg-white text-nature-green-600 hover:bg-gray-50">
                Shop Products
              </Link>
              <Link href="/about" className="btn-outline text-white border-white hover:bg-white hover:text-nature-green-600">
                Our Story
              </Link>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  // Use featured products from the centralized data file
  const featuredProductIds = ['NWS_001', 'NWS_013', 'NWS_018'];
  const featuredProducts: Product[] = allProducts
    .filter(p => featuredProductIds.includes(p.id))
    .map(p => ({
      id: p.id,
      name: p.name,
      price: p.sizes && p.sizes.length > 0 ? p.sizes[0].price : p.price,
      image: p.image,
      description: p.description,
      category: p.category
    }));

  return {
    props: {
      featuredProducts,
    },
  };
};