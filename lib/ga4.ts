export type PurchaseEventItem = {
  item_id?: string;
  item_name: string;
  item_variant?: string;
  price: number;
  quantity: number;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

export const hasGa4 = () => Boolean(GA_MEASUREMENT_ID);

export function trackPurchase(params: {
  transaction_id: string;
  value: number;
  tax?: number;
  shipping?: number;
  currency?: string;
  items: PurchaseEventItem[];
}) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return;
  }

  window.gtag('event', 'purchase', {
    transaction_id: params.transaction_id,
    value: params.value,
    tax: params.tax || 0,
    shipping: params.shipping || 0,
    currency: params.currency || 'USD',
    items: params.items,
  });
}
