export type PurchaseEventItem = {
  item_id?: string;
  item_name: string;
  item_variant?: string;
  item_category?: string;
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

type GaEventParams = Record<string, string | number | boolean | null | undefined | PurchaseEventItem[]>;

function trackEvent(eventName: string, params: GaEventParams = {}) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return;
  }

  window.gtag('event', eventName, params);
}

export function trackPurchase(params: {
  transaction_id: string;
  value: number;
  tax?: number;
  shipping?: number;
  currency?: string;
  items: PurchaseEventItem[];
}) {
  trackEvent('purchase', {
    transaction_id: params.transaction_id,
    value: params.value,
    tax: params.tax || 0,
    shipping: params.shipping || 0,
    currency: params.currency || 'USD',
    items: params.items,
  });
}

export function trackCheckoutStart(params: {
  value: number;
  currency?: string;
  coupon?: string;
  items: PurchaseEventItem[];
}) {
  trackEvent('begin_checkout', {
    value: params.value,
    currency: params.currency || 'USD',
    coupon: params.coupon,
    items: params.items,
  });
}

export function trackProductCtaClick(params: {
  cta_label: string;
  page_path?: string;
  destination?: string;
  product_id?: string;
  campaign_id?: string;
}) {
  trackEvent('product_cta_click', params);
}

export function trackLeadCapture(params: {
  source: string;
  page_path?: string;
  product_id?: string;
  coupon_code?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}) {
  trackEvent('generate_lead', {
    source: params.source,
    page_path: params.page_path,
    product_id: params.product_id,
    coupon_code: params.coupon_code,
    utm_source: params.utm_source,
    utm_medium: params.utm_medium,
    utm_campaign: params.utm_campaign,
  });
}
