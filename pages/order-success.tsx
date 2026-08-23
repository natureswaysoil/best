import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { CART_EVENT, CART_KEY } from '../lib/cart';
import { trackPurchase, type PurchaseEventItem } from '../lib/ga4';

type VerifiedOrder = {
  transaction_id: string;
  value: number;
  shipping: number;
  tax: number;
  currency: string;
  items: PurchaseEventItem[];
};

export default function OrderSuccess() {
  const router = useRouter();
  const [state, setState] = useState<'loading' | 'paid' | 'error'>('loading');

  useEffect(() => {
    if (!router.isReady) return;
    const raw = router.query.session_id;
    const sessionId = Array.isArray(raw) ? raw[0] : raw;
    if (!sessionId) return setState('error');

    fetch(`/api/checkout-order?session_id=${encodeURIComponent(sessionId)}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.order) throw new Error(data.error || 'Unable to verify order');
        return data.order as VerifiedOrder;
      })
      .then((order) => {
        const trackingKey = `nws-purchase-${order.transaction_id}`;
        if (!window.localStorage.getItem(trackingKey)) {
          trackPurchase(order);

          window.fbq?.('track', 'Purchase', {
            value: order.value,
            currency: order.currency,
            content_ids: order.items.map((item) => item.item_id).filter(Boolean),
            content_type: 'product',
            num_items: order.items.reduce((sum, item) => sum + item.quantity, 0),
          }, { eventID: order.transaction_id });

          window.ttq?.track?.('CompletePayment', {
            value: order.value,
            currency: order.currency,
            content_ids: order.items.map((item) => item.item_id).filter(Boolean),
            quantity: order.items.reduce((sum, item) => sum + item.quantity, 0),
          });

          window.localStorage.setItem(trackingKey, '1');
        }
        window.localStorage.removeItem(CART_KEY);
        window.dispatchEvent(new CustomEvent(CART_EVENT));
        setState('paid');
      })
      .catch(() => setState('error'));
  }, [router.isReady, router.query.session_id]);

  return (
    <Layout>
      <Head><title>Order Received - Nature&apos;s Way Soil</title><meta name="robots" content="noindex" /></Head>
      <main className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded-2xl border bg-white p-8 text-center">
          {state === 'loading' && <><h1 className="mb-3 text-3xl font-bold">Confirming your order…</h1><p className="text-gray-600">Please keep this page open.</p></>}
          {state === 'error' && <><h1 className="mb-3 text-3xl font-bold">We’re verifying your order</h1><p className="mb-6 text-gray-600">Check your email for the Stripe receipt. Contact us if you need help.</p><Link href="/contact" className="btn-primary">Contact Support</Link></>}
          {state === 'paid' && <><div className="mb-4 text-5xl">✓</div><h1 className="mb-3 text-3xl font-bold">Thank you for your order!</h1><p className="mb-8 text-gray-600">Your payment was received. We’ll email your confirmation and prepare your order for shipment.</p><Link href="/upsell" className="btn-primary">See Recommended Add-ons</Link></>}
        </div>
      </main>
    </Layout>
  );
}
