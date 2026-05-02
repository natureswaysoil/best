import Layout from '../components/Layout';
import Link from 'next/link';

export default function LivingCompostPage() {
  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">

        <div className="text-center space-y-4">
          <p className="text-green-700 font-semibold uppercase">First purchase offer</p>
          <h1 className="text-4xl font-bold">Upgrade Your Soil — Not Just Your Plants</h1>
          <p className="text-lg text-gray-600">Concentrated living compost with worm castings and biochar for real soil improvement.</p>
          <Link href="/checkout?productId=NWS_013&coupon=SAVE15">
            <button className="bg-green-600 text-white px-6 py-3 rounded-xl text-lg">
              Buy Direct & Save 15%
            </button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold">Why Most Compost Fails</h2>
            <p className="text-gray-600 mt-2">Bulk compost is often low in biology and diluted with filler materials.</p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold">What Makes This Different</h2>
            <p className="text-gray-600 mt-2">Higher concentration of worm castings and activated biochar helps support soil structure and moisture retention.</p>
          </div>
        </div>

        <div className="text-center">
          <Link href="/checkout?productId=NWS_013&coupon=SAVE15">
            <button className="bg-green-700 text-white px-8 py-4 rounded-xl text-xl">
              Upgrade Your Soil Today
            </button>
          </Link>
        </div>

      </div>
    </Layout>
  );
}
