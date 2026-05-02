import Layout from '../components/Layout';
import Link from 'next/link';

export default function BioPage() {
  return (
    <Layout>
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <h1 className="text-3xl font-bold">Nature's Way Soil</h1>
        <p className="text-gray-600">Fix your soil. Grow better. Save on your first order.</p>

        <div className="space-y-4">
          <Link href="/lawn-repair">
            <button className="w-full bg-green-600 text-white py-3 rounded-xl">Fix Dog Urine Lawn Damage</button>
          </Link>

          <Link href="/soil-boost">
            <button className="w-full bg-green-600 text-white py-3 rounded-xl">Boost Soil & Plant Growth</button>
          </Link>

          <Link href="/living-compost">
            <button className="w-full bg-green-600 text-white py-3 rounded-xl">Upgrade Your Soil</button>
          </Link>

          <Link href="/pasture-boost">
            <button className="w-full bg-green-600 text-white py-3 rounded-xl">Improve Pasture & Lawn</button>
          </Link>

          <a href="https://www.amazon.com" target="_blank">
            <button className="w-full border border-gray-300 py-3 rounded-xl">Prefer Amazon? Shop Here</button>
          </a>
        </div>

        <p className="text-sm text-gray-500">Use code SAVE15 for 15% off your first purchase</p>
      </div>
    </Layout>
  );
}
