import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

type ConfirmedOrder = {
  paymentIntentId: string;
  status: string;
  paid: boolean;
  amount: number;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  productName: string;
  sizeName: string;
  sku: string;
  quantity: number;
};

const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

export default function ThankYouPage() {
  const router = useRouter();
  const [order, setOrder] = useState<ConfirmedOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const paymentIntentId = useMemo(() => {
    const value = router.query.payment_intent || router.query.pi;
    return Array.isArray(value) ? value[0] : value;
  }, [router.query.payment_intent, router.query.pi]);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    if (!paymentIntentId) {
      setError('Missing payment confirmation details.');
      setIsLoading(false);
      return;
    }

    const confirmPayment = async () => {
      try {
        const response = await fetch('/api/confirm-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentIntentId }),
        });
        const data = await response.json();

        if (!response.ok || !data.order) {
          throw new Error(data.error || 'Unable to confirm this order.');
        }

        setOrder(data.order);
        if (typeof window !== 'undefined' && data.order.paid) {
          window.sessionStorage.removeItem('nws-checkout-selection');
          window.dispatchEvent(new CustomEvent('nws_purchase', { detail: data.order }));
        }
      } catch (confirmError) {
        setError(confirmError instanceof Error ? confirmError.message : 'Unable to confirm this order.');
      } finally {
        setIsLoading(false);
      }
    };

    confirmPayment();
  }, [router.isReady, paymentIntentId]);

  return (
    <Layout>
      <Head>
        <title>Thank You - Nature&apos;s Way Soil</title>
        <meta name="robots" content="noindex" />
      </Head>

      <main className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          {isLoading && (
            <div className="text-center py-10">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">Confirming your order…</h1>
              <p className="text-gray-600">Please do not refresh this page.</p>
            </div>
          )}

          {!isLoading && error && (
            <div className="text-center py-10">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">We need to verify your order</h1>
              <p className="text-red-700 bg-red-50 border border-red-200 rounded-lg p-4 mb-6">{error}</p>
              <p className="text-gray-600 mb-6">
                If your card was charged, email support@natureswaysoil.com and include your payment reference.
              </p>
              <Link href="/shop" className="btn-primary inline-flex">
                Return to Shop
              </Link>
            </div>
          )}

          {!isLoading && order && (
            <div>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✓</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                  {order.paid ? 'Thank you for your order!' : 'Payment is still processing'}
                </h1>
                <p className="text-gray-600">
                  {order.paid
                    ? 'We received your payment and are preparing your Nature’s Way Soil order.'
                    : 'Stripe has not marked this payment as complete yet. Please check your email for confirmation.'}
                </p>
              </div>

              <div className="border border-gray-200 rounded-xl p-5 space-y-3 mb-6">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Product</span>
                  <span className="font-medium text-gray-900 text-right">{order.productName || 'Nature’s Way Soil product'}</span>
                </div>
                {order.sizeName && (
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">Size</span>
                    <span className="font-medium text-gray-900">{order.sizeName}</span>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Quantity</span>
                  <span className="font-medium text-gray-900">{order.quantity}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">{formatCurrency(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between gap-4 text-green-700">
                    <span>Discount</span>
                    <span>-{formatCurrency(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-gray-900">{formatCurrency(order.shipping)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium text-gray-900">{formatCurrency(order.tax)}</span>
                </div>
                <div className="flex justify-between gap-4 pt-3 border-t border-gray-200 text-lg font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(order.amount)}</span>
                </div>
              </div>

              <p className="text-sm text-gray-500 mb-6">
                Payment reference: {order.paymentIntentId}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/shop" className="btn-primary text-center">
                  Continue Shopping
                </Link>
                <Link href="/contact" className="btn-secondary text-center">
                  Contact Support
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </Layout>
  );
}
