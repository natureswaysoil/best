import { useState } from 'react';
import { useRouter } from 'next/router';
import { ArrowRight, Lock, ShoppingCart } from 'lucide-react';

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

export default function SoilRecoveryCheckoutPanel() {
  const router = useRouter();
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);
  const isSoilRecoveryPage = router.pathname === '/soil-recovery-systems';

  if (!isSoilRecoveryPage) {
    return null;
  }

  const startCheckout = async (product: CheckoutProduct) => {
    if (loadingProductId) {
      return;
    }

    setLoadingProductId(product.id);

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          sizeName: product.sizeName,
          quantity: 1,
          price: product.price,
          sku: product.sku,
          cancelPath: '/soil-recovery-systems',
          successPath: '/soil-recovery-systems?checkout=success',
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.url) {
        throw new Error(data.error || 'Unable to start checkout.');
      }

      window.location.href = data.url;
    } catch (error) {
      console.error('Unable to create Stripe checkout session', error);
      alert('Unable to start checkout. Please contact support@natureswaysoil.com and we can help complete your order.');
      setLoadingProductId(null);
    }
  };

  return (
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
                Secure Stripe checkout - no need to open a separate product page
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:min-w-[720px]">
            {checkoutProducts.map((product) => {
              const isLoading = loadingProductId === product.id;
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => startCheckout(product)}
                  disabled={Boolean(loadingProductId)}
                  className="rounded-2xl border border-nature-green-200 bg-nature-green-50 px-3 py-2 text-left transition hover:border-nature-green-500 hover:bg-nature-green-100 disabled:cursor-wait disabled:opacity-70"
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
                  {isLoading && <p className="mt-1 text-xs font-semibold text-nature-green-700">Opening checkout...</p>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
