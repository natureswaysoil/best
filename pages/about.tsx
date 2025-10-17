import Head from 'next/head';
import { Users, Award, Leaf, Shield } from 'lucide-react';
import Layout from '../components/Layout';

export default function About() {
  return (
    <>
      <Head>
        <title>About Us - Nature's Way Soil</title>
        <meta name="description" content="Learn about our family farm and three generations of soil expertise. Discover why thousands of gardeners trust Nature's Way Soil for healthier plants." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Layout>
        {/* Hero Section */}
        <section className="relative py-24 bg-gradient-to-b from-nature-green-50 to-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Our Story
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
                Three generations of farming wisdom, combined with cutting-edge soil science, 
                to bring you the finest natural soil amendments on the market.
              </p>
            </div>
          </div>
        </section>

        {/* Family Story */}
        <section className="section-padding">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Our Story
                </h2>
                <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                  <p>
                    At Nature's Way Soil, our mission is simple: to bring life back to the soil, naturally.
                  </p>
                  <p>
                    We're a family-run farm that saw firsthand the damage years of synthetic fertilizers 
                    had done to the land. The soil was tired, lifeless, and unable to sustain the healthy 
                    crops and pastures we needed. Instead of following the same path, we set out to restore 
                    the earth the way nature intended—through biology, not chemistry.
                  </p>
                  <p>
                    Soil isn't just dirt—it's a living ecosystem. By nurturing the microbes and natural 
                    processes in the ground, we create healthier plants, stronger food systems, and a 
                    cleaner environment for future generations.
                  </p>
                  <p>
                    Every bottle and bag of Nature's Way Soil® carries this commitment: to restore the 
                    balance between people, plants, and the planet.
                  </p>
                </div>
              </div>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80"
                  alt="Nature's Way Soil family farm"
                  className="w-full rounded-2xl shadow-xl object-cover h-full"
                />
                <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-xl shadow-lg">
                  <p className="text-2xl font-bold text-nature-green-600">70+</p>
                  <p className="text-sm text-gray-600">Years of Experience</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="section-padding bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Our Values
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Everything we do is guided by these core principles that have shaped 
                our family farm for over 70 years.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
                <div className="w-16 h-16 bg-nature-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-nature-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Safe & Natural</h3>
                <p className="text-gray-600">
                  Every product we make is safe for children, pets, and pollinators.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
                <div className="w-16 h-16 bg-nature-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-nature-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Microbe-Rich Formulas</h3>
                <p className="text-gray-600">
                  We use beneficial microbes, worm castings, biochar, and natural extracts to restore soil health.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
                <div className="w-16 h-16 bg-nature-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Leaf className="w-8 h-8 text-nature-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Sustainable Farming</h3>
                <p className="text-gray-600">
                  From duckweed to compost teas, our ingredients are chosen to recycle nutrients and heal the land.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
                <div className="w-16 h-16 bg-nature-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Award className="w-8 h-8 text-nature-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Results You Can See</h3>
                <p className="text-gray-600">
                  Greener lawns, healthier pastures, stronger roots, and thriving gardens—without synthetic chemicals.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="section-padding">
          <div className="max-w-7xl mx-auto px-4">
            <div className="bg-nature-green-600 rounded-3xl p-8 md:p-16 text-center text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Our Mission
              </h2>
              <p className="text-xl md:text-2xl leading-relaxed max-w-4xl mx-auto">
                To help every gardener—from beginners to professionals—grow healthier plants 
                and build stronger soil through premium natural amendments that are safe for 
                families, pets, and the planet.
              </p>
            </div>
          </div>
        </section>



        {/* Stats */}
        <section className="section-padding">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <p className="text-4xl md:text-5xl font-bold text-nature-green-600 mb-2">10,000+</p>
                <p className="text-gray-600 font-medium">Happy Customers</p>
              </div>
              <div>
                <p className="text-4xl md:text-5xl font-bold text-nature-green-600 mb-2">70+</p>
                <p className="text-gray-600 font-medium">Years Experience</p>
              </div>
              <div>
                <p className="text-4xl md:text-5xl font-bold text-nature-green-600 mb-2">200</p>
                <p className="text-gray-600 font-medium">Acre Farm</p>
              </div>
              <div>
                <p className="text-4xl md:text-5xl font-bold text-nature-green-600 mb-2">100%</p>
                <p className="text-gray-600 font-medium">Natural</p>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}