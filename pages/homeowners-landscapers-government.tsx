import Link from 'next/link';
import { ArrowRight, CheckCircle, Home, Leaf, Shield, Truck, Users } from 'lucide-react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';

const audiences = [
  {
    icon: Home,
    title: 'Homeowners',
    description: 'For yellow grass, dry spots, hard soil, weak roots, summer stress, and lawns that do not respond well to regular fertilizer.',
    bullets: ['Easy hose-end or pump sprayer application', 'Helps improve water and nutrient movement', 'Supports deeper root growth and lawn recovery']
  },
  {
    icon: Users,
    title: 'Landscapers',
    description: 'A professional refill product for lawn recovery jobs, maintenance routes, compacted soil, and customer lawns under heat or drought stress.',
    bullets: ['2.5 gallon commercial refill option', 'Good add-on service for soil conditioning', 'Use before or after fertilizer programs']
  },
  {
    icon: Shield,
    title: 'Government & Facilities',
    description: 'A biobased soil-conditioning option for parks, housing grounds, municipal turf, campuses, public landscapes, and grounds maintenance buyers.',
    bullets: ['Built for larger turf and grounds needs', 'Family farm supplier with B2B support', 'Good fit for micro-purchase product orders']
  }
];

const benefits = [
  'Liquid humic and fulvic acid support nutrient availability in the root zone',
  'Kelp helps lawns handle heat, drought, traffic, and transplant-style stress',
  'Designed for yellow grass, thin turf, dry patches, hard soil, and poor fertilizer response',
  'Works with hose-end sprayers, pump sprayers, tank sprayers, and irrigation injection systems',
  'Ideal as a premium 2.5 gallon Cubitainer refill for repeat lawn recovery use'
];

const useCases = [
  'Yellow or tired lawns after summer heat',
  'Dry spots and hard compacted soil',
  'Weak roots and slow lawn recovery',
  'Lawns that do not respond well to fertilizer',
  'Commercial turf, parks, rental properties, and public grounds'
];

export default function HomeownersLandscapersGovernmentPage() {
  return (
    <>
      <SEO
        title="Lawn Recovery System for Homeowners, Landscapers & Government Grounds | Nature's Way Soil"
        description="Nature's Way Soil Lawn Recovery System is a 2.5 gallon liquid humic, fulvic, and kelp soil conditioner for yellow grass, hard soil, dry spots, weak roots, landscapers, and government grounds maintenance."
        url="https://natureswaysoil.com/homeowners-landscapers-government"
        type="website"
      />

      <Layout>
        <section className="bg-gradient-to-br from-green-50 via-white to-amber-50 py-20">
          <div className="max-w-7xl mx-auto container-padding grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-800 mb-6">
                <Leaf className="w-4 h-4" />
                Liquid Humic + Fulvic Acid with Kelp
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Lawn Recovery System for Yellow Grass, Hard Soil & Weak Roots
              </h1>
              <p className="text-xl text-gray-700 leading-relaxed mb-8">
                A concentrated liquid soil conditioner built for homeowners, landscapers, and facilities teams that need a better answer for stressed lawns, compacted soil, dry spots, and poor fertilizer response.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/product/NWS_011" className="inline-flex items-center justify-center rounded-lg bg-nature-green-600 px-6 py-4 font-bold text-white hover:bg-nature-green-700 transition-colors">
                  View Product Options
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <a href="mailto:sales@natureswaysoil.com?subject=Lawn%20Recovery%20System%20Bulk%20Quote" className="inline-flex items-center justify-center rounded-lg border-2 border-nature-green-600 px-6 py-4 font-bold text-nature-green-700 hover:bg-green-50 transition-colors">
                  Request Bulk Quote
                </a>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-8 border border-green-100">
              <img
                src="/images/products/NWS_011/main.jpg"
                alt="Nature's Way Soil Lawn Recovery System liquid humic fulvic acid with kelp"
                className="w-full rounded-2xl object-cover mb-6"
              />
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-green-50 p-4">
                  <p className="text-2xl font-bold text-green-800">2.5 gal</p>
                  <p className="text-sm text-green-700">Refill Size</p>
                </div>
                <div className="rounded-xl bg-green-50 p-4">
                  <p className="text-2xl font-bold text-green-800">Humic</p>
                  <p className="text-sm text-green-700">Soil Support</p>
                </div>
                <div className="rounded-xl bg-green-50 p-4">
                  <p className="text-2xl font-bold text-green-800">Kelp</p>
                  <p className="text-sm text-green-700">Stress Support</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-padding bg-white">
          <div className="max-w-7xl mx-auto container-padding">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">One Product, Three Buyer Types</h2>
              <p className="text-lg text-gray-600">The same formula can be marketed as a homeowner recovery product, landscaper refill, and facilities soil-conditioning option.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {audiences.map((audience) => {
                const Icon = audience.icon;
                return (
                  <div key={audience.title} className="rounded-2xl border border-gray-200 p-8 hover:shadow-lg transition-shadow">
                    <div className="w-14 h-14 rounded-xl bg-nature-green-100 flex items-center justify-center mb-5">
                      <Icon className="w-7 h-7 text-nature-green-700" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{audience.title}</h3>
                    <p className="text-gray-600 mb-5 leading-relaxed">{audience.description}</p>
                    <ul className="space-y-3">
                      {audience.bullets.map((bullet) => (
                        <li key={bullet} className="flex gap-3 text-gray-700">
                          <CheckCircle className="w-5 h-5 text-nature-green-600 flex-shrink-0 mt-0.5" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section-padding bg-gray-50">
          <div className="max-w-7xl mx-auto container-padding grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Why It Works</h2>
              <ul className="space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex gap-3 text-gray-700 leading-relaxed">
                    <CheckCircle className="w-5 h-5 text-nature-green-600 flex-shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Best Use Cases</h2>
              <div className="grid grid-cols-1 gap-4">
                {useCases.map((useCase) => (
                  <div key={useCase} className="rounded-xl bg-green-50 border border-green-100 p-4 text-green-900 font-medium">
                    {useCase}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section-padding bg-nature-green-700 text-white">
          <div className="max-w-7xl mx-auto container-padding grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for Google Ads Landing Traffic</h2>
              <p className="text-green-50 text-lg leading-relaxed">
                Send homeowners to yellow grass and dry spot messaging, send landscapers to refill and route-use messaging, and send government or facilities buyers to bulk quote and grounds maintenance messaging.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/product/NWS_011" className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-4 font-bold text-nature-green-700 hover:bg-green-50 transition-colors">
                Shop Lawn Recovery
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <a href="mailto:sales@natureswaysoil.com?subject=Lawn%20Recovery%20System%20Government%20or%20Bulk%20Order" className="inline-flex items-center justify-center rounded-lg border border-white px-6 py-4 font-bold text-white hover:bg-white hover:text-nature-green-700 transition-colors">
                Government / Bulk Quote
              </a>
            </div>
          </div>
        </section>

        <section className="py-10 bg-white">
          <div className="max-w-7xl mx-auto container-padding grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex items-center justify-center gap-3 text-gray-700">
              <Truck className="w-6 h-6 text-nature-green-600" />
              <span>Ships direct from Nature's Way Soil</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-gray-700">
              <Shield className="w-6 h-6 text-nature-green-600" />
              <span>Commercial refill positioning</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-gray-700">
              <Leaf className="w-6 h-6 text-nature-green-600" />
              <span>Soil-first lawn recovery message</span>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}
