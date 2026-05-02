import Layout from '../components/Layout';
import Link from 'next/link';

export default function UpsellPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <h1 className="text-3xl font-bold">Upgrade Your Results</h1>
        <p className="text-gray-600">Customers often pair this with compost or soil boosters for better long-term results.</p>

        <div className="grid gap-4">
          <Link href="/checkout?productId=NWS_013&coupon=SAVE15">
            <button className="bg-green-600 text-white py-3 rounded-xl">Add Living Compost (Best Combo)</button>
          </Link>

          <Link href="/checkout?productId=NWS_011&coupon=SAVE15">
            <button className="bg-green-600 text-white py-3 rounded-xl">Add Soil Booster (Humic + Kelp)</button>
          </Link>
        </div>

        <Link href="/">
          <p className="text-sm text-gray-500 underline">No thanks, continue</p>
        </Link>
      </div>
    </Layout>
  );
}
