const sanitizeKey = (value: string) => value.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();

interface StripeLinkLookupParams {
  productId: string;
  sizeName: string;
  sku?: string;
}

export function getStripePaymentLink({ productId, sizeName, sku }: StripeLinkLookupParams): string | null {
  const candidates: Array<string | undefined> = [];

  if (sku) {
    candidates.push(process.env[`NEXT_PUBLIC_STRIPE_LINK_${sanitizeKey(sku)}`]);
  }

  candidates.push(
    process.env[`NEXT_PUBLIC_STRIPE_LINK_${sanitizeKey(`${productId}_${sizeName}`)}`],
    process.env[`NEXT_PUBLIC_STRIPE_LINK_${sanitizeKey(productId)}`],
    process.env.NEXT_PUBLIC_STRIPE_DEFAULT_LINK
  );

  for (const candidate of candidates) {
    if (candidate && candidate.startsWith('https://')) {
      return candidate;
    }
  }

  console.warn(`Stripe payment link missing for ${productId} (${sizeName}${sku ? `, ${sku}` : ''})`);
  return null;
}

export function appendQuantity(link: string, quantity: number): string {
  if (quantity <= 1) {
    return link;
  }

  const separator = link.includes('?') ? '&' : '?';
  return `${link}${separator}prefilled_quantity=${quantity}`;
}
