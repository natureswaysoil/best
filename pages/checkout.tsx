import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import CheckoutForm from '../components/CheckoutForm';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, Stripe } from '@stripe/stripe-js';

const parseNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const FREE_SHIPPING_THRESHOLD_CENTS = Math.max(
  0,
  Math.round(parseNumber(process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD_CENTS, 5000)),
);

type CheckoutSelection = {
  productId: string;
  productName: string;
  productImage?: string;
  sizeName?: string;
  price: number;
  quantity: number;
  sku?: string;
};

type PaymentBreakdown = {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  taxRatePercent?: number;
};

const STORAGE_KEY = 'nws-checkout-selection';

export default function CheckoutPage() {
  const [selection, setSelection] = useState<CheckoutSelection | null>(null);
  const [quantity, setQuantity] = useState(1);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');

  const [breakdown, setBreakdown] = useState<PaymentBreakdown | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [intentId, setIntentId] = useState<string | null>(null);

  const [serverError, setServerError] = useState<string | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [stripeError, setStripeError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const stored = window.sessionStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return;
      }
      const parsed = JSON.parse(stored) as CheckoutSelection;
      setSelection(parsed);
      setQuantity(Math.max(1, parsed.quantity || 1));
    } catch (error) {
      console.warn('Unable to read checkout selection from storage', error);
    }
  }, []);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      setStripeError('Stripe publishable key is not configured. Please add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to your environment.');
      return;
    }
    setStripePromise(loadStripe(key));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !selection) {
      return;
    }

    const updated: CheckoutSelection = { ...selection, quantity };
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, [quantity, selection]);

  const computedSubtotal = useMemo(() => {
    if (!selection) {
      return 0;
    }
    return Number((selection.price * quantity).toFixed(2));
  }, [selection, quantity]);

  const fieldsComplete = Boolean(
    selection &&
    name.trim() &&
    email.trim() &&
    address1.trim() &&
    city.trim() &&
    state.trim() &&
    zip.trim()
  );

  const formatCurrency = (value: number) => {
    return `$${(value / 100).toFixed(2)}`;
  };

  const handlePreparePayment = async () => {
    if (!selection) {
      setServerError('Please select a product before checking out.');
      return;
    }

    if (!fieldsComplete) {
      setServerError('Please fill in all required fields before continuing.');
      return;
    }

    setServerError(null);
    setIsPreparing(true);

    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selection.productId,
          productName: selection.productName,
          productImage: selection.productImage,
          sizeName: selection.sizeName,
          sku: selection.sku,
          price: selection.price,
          quantity,
          customer: {
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim() || undefined,
          },
          address: {
            line1: address1.trim(),
            line2: address2.trim() || undefined,
            city: city.trim(),
            state: state.trim(),
            postal_code: zip.trim(),
            country: 'US',
            phone: phone.trim() || undefined,
          },
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.clientSecret) {
        const message = data?.error || 'Unable to prepare payment. Please try again later.';
        throw new Error(message);
      }

      setClientSecret(data.clientSecret);
      setIntentId(data.intentId || null);
      setBreakdown(data.breakdown || null);
    } catch (error) {
      console.error('Failed to prepare payment', error);
      setServerError(error instanceof Error ? error.message : 'Unable to prepare payment.');
      setClientSecret(null);
      setIntentId(null);
      setBreakdown(null);
    } finally {
      setIsPreparing(false);
    }
  };

  useEffect(() => {
    setClientSecret(null);
    setIntentId(null);
    setBreakdown(null);
  }, [computedSubtotal, name, email, address1, address2, city, state, zip, phone]);

  const renderSummary = () => {
    if (!selection) {
      return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-sm">
          <p className="text-gray-600">Your cart is empty. Please return to the shop to select a product.</p>
        </div>
      );
    }

    const subtotalCents = Math.round(computedSubtotal * 100);
    const shippingCentsValue = breakdown ? breakdown.shipping : null;
    const taxCentsValue = breakdown ? breakdown.tax : null;
    const totalCentsValue = breakdown ? breakdown.total : null;

    const subtotalDisplay = formatCurrency(subtotalCents);
    const shippingDisplay = shippingCentsValue !== null
      ? formatCurrency(shippingCentsValue)
      : 'Calculated at payment step';
    const taxDisplay = taxCentsValue !== null
      ? formatCurrency(taxCentsValue)
      : 'Calculated at payment step';
    const totalDisplay = totalCentsValue !== null
      ? formatCurrency(totalCentsValue)
      : `${subtotalDisplay} + shipping & tax`;

    const qualifiesForFreeShipping =
      FREE_SHIPPING_THRESHOLD_CENTS > 0 && subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS;
    const amountToFreeShipping = FREE_SHIPPING_THRESHOLD_CENTS > 0
      ? Math.max(0, FREE_SHIPPING_THRESHOLD_CENTS - subtotalCents)
      : 0;

    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-start gap-4">
          {selection.productImage && (
            <img
              src={selection.productImage}
              alt={selection.productName}
              className="w-24 h-24 object-contain rounded-lg border border-gray-200 bg-white"
            />
          )}
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">{selection.productName}</h2>
            {selection.sizeName && (
              <p className="text-sm text-gray-600 mt-1">Size: {selection.sizeName}</p>
            )}
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                >
                  −
                </button>
                <span className="px-4 py-1 text-sm font-medium text-gray-900">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
              <span className="text-sm text-gray-500">${selection.price.toFixed(2)} each</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4 space-y-2 text-sm text-gray-700">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{subtotalDisplay}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{shippingDisplay}</span>
          </div>
          <div className="flex justify-between">
            <span>Estimated Tax</span>
            <span>{taxDisplay}</span>
          </div>
          <div className="flex justify-between text-base font-semibold text-gray-900 pt-2 border-t border-gray-200">
            <span>Total</span>
            <span>{totalDisplay}</span>
          </div>
        </div>

        {FREE_SHIPPING_THRESHOLD_CENTS > 0 && (
          <div className="text-sm">
            {qualifiesForFreeShipping ? (
              <p className="text-nature-green-700 font-medium">You unlocked free shipping on this order.</p>
            ) : (
              <p className="text-gray-500">
                Spend {formatCurrency(amountToFreeShipping)} more to unlock free shipping.
              </p>
            )}
          </div>
        )}

        {breakdown?.taxRatePercent !== undefined && breakdown.taxRatePercent > 0 && (
          <p className="text-xs text-gray-500">
            Effective tax rate: {breakdown.taxRatePercent.toFixed(2)}%
          </p>
        )}
      </div>
    );
  };

  return (
    <Layout>
      <Head>
        <title>Checkout - Nature&apos;s Way Soil</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        {stripeError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
            {stripeError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Shipping Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex flex-col gap-2 text-sm text-gray-700">
                  Full Name
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-nature-green-500"
                    placeholder="Jane Doe"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm text-gray-700">
                  Email
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-nature-green-500"
                    placeholder="you@example.com"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm text-gray-700">
                  Phone (optional)
                  <input
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-nature-green-500"
                    placeholder="(555) 123-4567"
                  />
                </label>
              </div>

              <div className="space-y-4">
                <label className="flex flex-col gap-2 text-sm text-gray-700">
                  Address Line 1
                  <input
                    type="text"
                    value={address1}
                    onChange={(event) => setAddress1(event.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-nature-green-500"
                    placeholder="123 Garden Lane"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm text-gray-700">
                  Address Line 2 (optional)
                  <input
                    type="text"
                    value={address2}
                    onChange={(event) => setAddress2(event.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-nature-green-500"
                    placeholder="Apartment, suite, etc."
                  />
                </label>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="flex flex-col gap-2 text-sm text-gray-700 md:col-span-2">
                    City
                    <input
                      type="text"
                      value={city}
                      onChange={(event) => setCity(event.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-nature-green-500"
                      placeholder="Raleigh"
                    />
                  </label>

                  <label className="flex flex-col gap-2 text-sm text-gray-700">
                    State
                    <input
                      type="text"
                      value={state}
                      onChange={(event) => setState(event.target.value.toUpperCase())}
                      maxLength={2}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-nature-green-500 uppercase"
                      placeholder="NC"
                    />
                  </label>
                </div>

                <label className="flex flex-col gap-2 text-sm text-gray-700">
                  ZIP Code
                  <input
                    type="text"
                    value={zip}
                    onChange={(event) => setZip(event.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-nature-green-500"
                    placeholder="27513"
                  />
                </label>
              </div>

              {serverError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
                  {serverError}
                </div>
              )}

              {/* Shipping Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                <h3 className="font-medium text-blue-800 mb-2">🚚 Shipping Information</h3>
                <div className="text-blue-700 space-y-1">
                  <p><strong>FREE Shipping</strong> on orders over $50!</p>
                  <p>Orders under $50: Shipping calculated based on weight and delivery location</p>
                  <p>Typical shipping costs: $4.99 - $19.99 depending on speed and distance</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePreparePayment}
                disabled={isPreparing}
                className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-nature-green-600 hover:bg-nature-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {clientSecret ? 'Update Payment Details' : 'Continue to Payment'}
              </button>
            </div>

            {clientSecret && intentId && stripePromise && (
              <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'flat' } }}>
                <CheckoutForm
                  intentId={intentId}
                  name={name.trim()}
                  email={email.trim()}
                  address={{
                    line1: address1.trim(),
                    line2: address2.trim() || undefined,
                    city: city.trim(),
                    state: state.trim(),
                    postal_code: zip.trim(),
                    country: 'US',
                    phone: phone.trim() || undefined,
                  }}
                  onSuccess={() => {
                    // Nothing needed here because Stripe redirects via return_url.
                  }}
                />
              </Elements>
            )}
          </div>

          <div>{renderSummary()}</div>
        </div>
      </div>
    </Layout>
  );
}
