import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { ArrowRight, Lock, ShoppingCart, X } from 'lucide-react';

type CheckoutProduct = {
  id: string;
  name: string;
  shortName: string;
  sizeName: string;
  price: number;
  sku: string;
  badge: string;
};

const checkoutProducts: CheckoutProduct[] = [
  {
    id: 'NWS_014',
    name: 'Nature’s Way Soil Dog Urine Neutralizer & Lawn Revitalizer',
    shortName: 'Dog Urine Lawn Repair',
    sizeName: '1 Gallon',
    price: 59.99,
    sku: 'T0-MB9Q-JIKC',
    badge: 'Pet lawn spots',
  },
  {
    id: 'NWS_011',
    name: 'Nature’s Way Soil Liquid Humic & Fulvic Acid with Kelp',
    shortName: 'Humic/Fulvic/Kelp',
    sizeName: '2.5 Gallon',
    price: 69.99,
    sku: 'GA-TZ69-N9XK',
    badge: 'Best value',
  },
  {
    id: 'NWS_BIOCHAR_1GAL',
    name: 'Nature’s Way Soil Liquid Biochar Soil Conditioner with Humic, Fulvic & Kelp',
    shortName: 'Liquid Biochar',
    sizeName: '1 Gallon',
    price: 89.99,
    sku: 'NWS-BIOCHAR-1GAL',
    badge: 'Premium soil recovery',
  },
];

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

export default function SoilRecoveryCheckoutPanel() {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<CheckoutProduct | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const isSoilRecoveryPage = router.pathname === '/soil-recovery-systems';

  const fetchClientSecret = useCallback(async () => {
    if (!selectedProduct) {
      throw new Error('No product selected.');
    }

    setCheckoutError(null);

    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        sizeName: selectedProduct.sizeName,
        quantity: 1,
        price: selectedProduct.price,
        sku: selectedProduct.sku,
        checkoutMode: 'embedded',
        successPath: '/soil-recovery-systems?checkout=success',
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.clientSecret) {
      throw new Error(data.error || 'Unable to start embedded checkout.');
    }

    return data.clientSecret as string;
  }, [selectedProduct]);

  const checkoutOptions = useMemo(() => ({ fetchClientSecret }), [fetchClientSecret]);

  if (!isSoilRecoveryPage) {
    return null;
  }

  const openCheckout = (product: CheckoutProduct) => {
    setCheckoutError(null);
    setSelectedProduct(product);
  };

  const closeCheckout = () => {
    setSelectedProduct(null);
    setCheckoutError(null);
  };

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-nature-green-200 bg-white/95 shadow-2xl backdrop-blur supports-[backdrop-filter]:bg-white/85">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3 text-gray-900">
              <div className="hidden sm:flex h-11 w-11 items-center justify-center rounded-full bg-nature-green-700 text-white">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div>
                <p className="font-extrabold leading-tight">Buy directly from this page</p>
                <p className="flex items-center gap-1 text-sm text-gray-600">
                  <Lock className="h-4 w-4 text-nature-green-700" />
                  Secure embedded Stripe Checkout with Link available when eligible
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:min-w-[720px]">
              {checkoutProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => openCheckout(product)}
                  className="rounded-2xl border border-nature-green-200 bg-nature-green-50 px-3 py-2 text-left transition hover:border-nature-green-500 hover:bg-nature-green-100"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-nature-green-700">
                      {product.badge}
                    </span>
                    <span className="font-extrabold text-nature-green-800">${product.price.toFixed(2)}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-extrabold text-gray-900">{product.shortName}</p>
                      <p className="text-xs text-gray-600">{product.sizeName}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-nature-green-700" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 z-[80] bg-black/60 p-3 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true">
          <div className="mx-auto flex h-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-nature-green-700">Secure checkout</p>
                <h2 className="text-xl font-extrabold text-gray-900">{selectedProduct.shortName}</h2>
                <p className="text-sm text-gray-600">
                  {selectedProduct.sizeName} · ${selectedProduct.price.toFixed(2)} · Powered by Stripe
                </p>
              </div>
              <button
                type="button"
                onClick={closeCheckout}
                className="rounded-full border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
                aria-label="Close checkout"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-50 p-3 sm:p-5">
              {!stripePromise ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
                  <p className="font-bold">Stripe publishable key is missing.</p>
                  <p className="mt-2 text-sm">Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in Vercel so embedded checkout can load.</p>
                </div>
              ) : checkoutError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
                  <p className="font-bold">Checkout could not load.</p>
                  <p className="mt-2 text-sm">{checkoutError}</p>
                </div>
              ) : (
                <div className="rounded-2xl bg-white p-1 sm:p-3">
                  <EmbeddedCheckoutProvider
                    key={selectedProduct.id}
                    stripe={stripePromise}
                    options={checkoutOptions}
                  >
                    <EmbeddedCheckout />
                  </EmbeddedCheckoutProvider>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
