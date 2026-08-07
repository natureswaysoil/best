import Head from 'next/head';
import Link from 'next/link';
import { useEffect } from 'react';
import Layout from '../components/Layout';
import { CART_KEY, CART_EVENT } from '../lib/cart';

export default function CartSuccess() {
  useEffect(() => { window.localStorage.removeItem(CART_KEY); window.dispatchEvent(new CustomEvent(CART_EVENT)); }, []);
  return <Layout><Head><title>Order Received - Nature&apos;s Way Soil</title><meta name="robots" content="noindex"/></Head><main className="max-w-3xl mx-auto px-4 py-16">
    <div className="bg-white border rounded-2xl p-8 text-center"><div className="text-5xl mb-4">✓</div><h1 className="text-3xl font-bold mb-3">Thank you for your order!</h1><p className="text-gray-600 mb-8">Your payment was received. We will email your confirmation and prepare every item for shipment.</p>
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-7"><h2 className="font-bold text-xl mb-2">Build an even stronger soil-care routine</h2><p className="text-gray-700 mb-4">Customers often pair their order with living compost, liquid biochar, or humic and kelp support.</p><Link href="/upsell" className="btn-primary">See Recommended Add-ons</Link></div>
      <Link href="/shop" className="underline">Continue Shopping</Link></div>
  </main></Layout>;
}
