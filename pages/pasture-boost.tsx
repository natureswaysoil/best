import Layout from '../components/Layout';
import Link from 'next/link';

export default function PastureBoost() {
  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">

        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Thicker Pasture. Better Yield. Save 15%</h1>
          <p className="text-lg text-gray-600">Feed your land the right way and see stronger grass growth.</p>
          <Link href="/checkout?productId=NWS_021&coupon=SAVE15">
            <button className="bg-green-600 text-white px-6 py-3 rounded-xl text-lg">
              Buy Direct & Save 15%
            </button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold">The Problem</h2>
            <p className="text-gray-600 mt-2">Pasture and lawns often struggle due to poor soil nutrition and weak feeding practices.</p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold">The Solution</h2>
            <p className="text-gray-600 mt-2">A balanced liquid fertilizer that feeds both the plant and soil for stronger results.</p>
          </div>
        </div>

        <div className="text-center">
          <Link href="/checkout?productId=NWS_021&coupon=SAVE15">
            <button className="bg-green-700 text-white px-8 py-4 rounded-xl text-xl">
              Boost Your Pasture Today
            </button>
          </Link>
        </div>

      </div>
    </Layout>
  );
}
