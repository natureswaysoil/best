import Layout from '../components/Layout';
import SEO from '../components/SEO';
import Link from 'next/link';

export default function SoilBoostPage() {
  return (
    <Layout>
      <SEO title="Soil Boost — Organic Soil Amendment | Nature's Way Soil" description="Restore tired soil with humic, kelp, and microbial amendments. Improve structure, water retention, and fertility. Organic, pet- and kid-safe." url="https://natureswaysoil.com/soil-boost" type="website" />
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">
        <div className="text-center space-y-4">
          <p className="text-green-700 font-semibold uppercase tracking-wide">First purchase offer</p>
          <h1 className="text-4xl font-bold">Weak Plants? Fix the Soil First.</h1>
          <p className="text-lg text-gray-600">Humic acid, fulvic acid, and kelp help support nutrient uptake, root growth, and better soil activity.</p>
          <Link href="/checkout?productId=NWS_011&coupon=SAVE15">
            <button className="bg-green-600 text-white px-6 py-3 rounded-xl text-lg">
              Buy Direct & Save 15% on Your First Purchase
            </button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white border rounded-xl p-6">
            <h2 className="text-xl font-semibold">Unlock Nutrients</h2>
            <p className="text-gray-600 mt-2">Humic and fulvic acids help improve nutrient availability in tired or compacted soils.</p>
          </div>
          <div className="bg-white border rounded-xl p-6">
            <h2 className="text-xl font-semibold">Support Roots</h2>
            <p className="text-gray-600 mt-2">Kelp provides natural plant-supporting compounds and trace minerals for better vigor.</p>
          </div>
          <div className="bg-white border rounded-xl p-6">
            <h2 className="text-xl font-semibold">Use Everywhere</h2>
            <p className="text-gray-600 mt-2">Great for lawns, gardens, raised beds, trees, flowers, and containers.</p>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center space-y-3">
          <h2 className="text-2xl font-bold">Shop Direct and Save</h2>
          <p className="text-gray-700">Use SAVE15 for 15% off your first direct website purchase.</p>
          <Link href="/checkout?productId=NWS_011&coupon=SAVE15">
            <button className="bg-green-700 text-white px-8 py-4 rounded-xl text-xl">
              Start Soil Recovery
            </button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
