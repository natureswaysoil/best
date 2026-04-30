import { useState } from 'react';

export type CheckoutProduct = {
  productId: string;
  productName: string;
  sizeName: string;
  quantity: number;
  price: number;
  sku: string;
};

export default function DirectCheckoutButton({
  product,
  children,
  secondary = false,
  fullWidth = false,
}: {
  product: CheckoutProduct;
  children: React.ReactNode;
  secondary?: boolean;
  fullWidth?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });

      const data = await response.json();

      if (!response.ok || !data?.url) {
        throw new Error(data?.error || 'Unable to start checkout.');
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start checkout.');
      setLoading(false);
    }
  }

  return (
    <span className={`${fullWidth ? 'w-full' : 'w-full sm:w-auto'} inline-flex flex-col`}>
      <button
        type="button"
        onClick={startCheckout}
        disabled={loading}
        className={secondary
          ? `${fullWidth ? 'w-full' : 'w-full sm:w-auto'} inline-flex items-center justify-center rounded-xl border-2 border-nature-green-700 bg-white px-6 py-4 text-base font-extrabold text-nature-green-700 shadow-sm hover:bg-nature-green-50 disabled:opacity-60`
          : `${fullWidth ? 'w-full' : 'w-full sm:w-auto'} inline-flex items-center justify-center rounded-xl bg-nature-green-600 px-6 py-4 text-base font-extrabold text-white shadow-lg shadow-green-900/20 hover:bg-nature-green-700 disabled:opacity-60`}
      >
        {loading ? 'Opening secure checkout…' : children}
      </button>
      {error && <span className="mt-2 text-sm font-semibold text-red-700">{error}</span>}
    </span>
  );
}
