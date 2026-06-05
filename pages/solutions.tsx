import Link from 'next/link';
import { ArrowRight, Building2, Dog, Droplets, Leaf, Sprout, Tractor } from 'lucide-react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';

const solutions = [
  {
    title: 'Pet Lawn Spots & Outdoor Odor Control',
    href: '/pet-lawn-spot-odor-control',
    icon: Dog,
    description: 'For lawns, kennels, patios, artificial turf, concrete, dog runs, housing, parks, and pet relief areas.',
  },
  {
    title: 'Compacted Clay Soil & Dry Spots',
    href: '/compacted-clay-soil',
    icon: Droplets,
    description: 'For hard soil, poor drainage, weak roots, liquid aeration searches, and lawn recovery programs.',
  },
  {
    title: 'Liquid Biochar Soil Restoration',
    href: '/liquid-biochar-soil-restoration',
    icon: Leaf,
    description: 'For poor soil, public grounds, landscape beds, sustainability programs, and soil-building projects.',
  },
  {
    title: 'Pasture, Hay & Large Lawn Recovery',
    href: '/pasture-lawn-recovery',
    icon: Tractor,
    description: 'For hay fields, horse pastures, food plots, public turf, recreation areas, and larger grass programs.',
  },
  {
    title: 'Homeowners, Landscapers & Government Grounds',
    href: '/homeowners-landscapers-government',
    icon: Sprout,
    description: 'A general lawn recovery funnel for yellow grass, hard soil, dry spots, weak roots, and facilities.',
  },
  {
    title: 'Government Purchasing',
    href: '/government',
    icon: Building2,
    description: 'HUBZone, SAM, GPC, micro-purchase, CAGE, UEI, quote request, and public-sector product recommendations.',
  },
];

export default function SolutionsPage() {
  return (
    <>
      <SEO
        title="Soil, Lawn & Facility Care Solutions | Nature's Way Soil"
        description="Find Nature's Way Soil solutions for pet lawn spots, compacted clay soil, liquid biochar, pasture recovery, lawn recovery, and government grounds purchasing."
        url="https://natureswaysoil.com/solutions"
        type="website"
      />
      <Layout>
        <section className="bg-gradient-to-br from-green-50 via-white to-amber-50 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl">
              <p className="mb-4 inline-flex rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-800">
                Nature&apos;s Way Soil Solutions
              </p>
              <h1 className="mb-6 text-4xl font-bold leading-tight text-gray-900 md:text-6xl">
                Find the right product by the problem you need to solve.
              </h1>
              <p className="max-w-3xl text-xl leading-relaxed text-gray-700">
                These landing pages help homeowners, landscapers, farms, facilities, and government buyers move from a real-world soil, lawn, or outdoor-care problem to the right Nature&apos;s Way Soil product or quote request.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {solutions.map((solution) => {
                const Icon = solution.icon;
                return (
                  <Link
                    key={solution.href}
                    href={solution.href}
                    className="group rounded-3xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:border-nature-green-300 hover:shadow-lg"
                  >
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-nature-green-100">
                      <Icon className="h-7 w-7 text-nature-green-700" />
                    </div>
                    <h2 className="mb-3 text-2xl font-bold text-gray-900 group-hover:text-nature-green-700">
                      {solution.title}
                    </h2>
                    <p className="mb-5 leading-relaxed text-gray-600">{solution.description}</p>
                    <span className="inline-flex items-center font-bold text-nature-green-700">
                      Open solution
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}
