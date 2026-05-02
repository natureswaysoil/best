import Link from 'next/link';
import Layout from '../components/Layout';

export default function LawnRepairPage() {
  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">

        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Fix Dog Urine Lawn Damage — Save 15%</h1>
          <p className="text-lg text-gray-600">Stop yellow spots at the soil level. Not a dye. Real repair.</p>
          <Link href="/product/NWS_014">
            <button className="bg-green-600 text-white px-6 py-3 rounded-xl text-lg">
              Shop Now & Save 15%
            </button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold">The Problem</h2>
            <p className="text-gray-600 mt-2">Dog urine burns grass and builds up salts in the soil. That’s why spots keep coming back.</p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold">The Solution</h2>
            <p className="text-gray-600 mt-2">Neutralize the salts and restore soil biology so grass can regrow naturally.</p>
          </div>
        </div>

        <div className="text-center">
          <Link href="/checkout?coupon=SAVE15">
            <button className="bg-green-700 text-white px-8 py-4 rounded-xl text-xl">
              Buy Direct & Save 15%
            </button>
          </Link>
        </div>

      </div>
    </Layout>
  );
}
