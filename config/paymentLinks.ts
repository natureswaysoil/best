const sanitizeKey = (value: string) => value.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();

type LinkMap = Record<string, string>;

let cachedMap: LinkMap | null = null;

const loadLinkMap = (): LinkMap => {
  if (cachedMap) {
    return cachedMap;
  }

  const raw =
    process.env.NEXT_PUBLIC_STRIPE_LINKS_JSON ||
    process.env.NEXT_PUBLIC_STRIPE_LINKS ||
    process.env.NEXT_PUBLIC_STRIPE_LINK_MAP ||
    process.env.NEXT_PUBLIC_STRIPE_LINKS_MAP;

  if (!raw) {
    cachedMap = {};
    return cachedMap;
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    const normalized: LinkMap = {};

    Object.entries(parsed).forEach(([key, value]) => {
      if (!value || typeof value !== 'string') {
        return;
      }

      buildKeyVariants(key).forEach((variant) => {
        normalized[variant] = value;
      });
    });

    cachedMap = normalized;
  } catch (error) {
    console.warn('Unable to parse Stripe link JSON env value:', error);
    cachedMap = {};
  }

  return cachedMap;
};

const buildKeyVariants = (value?: string): string[] => {
  if (!value) return [];

  const variants = new Set<string>();
  const trimmed = value.trim();
  if (!trimmed) return [];

  const upper = trimmed.toUpperCase();
  variants.add(trimmed);
  variants.add(upper);
  variants.add(sanitizeKey(trimmed));
  variants.add(sanitizeKey(upper));
  variants.add(trimmed.replace(/[^a-zA-Z0-9]/g, '_'));

  return Array.from(variants).filter(Boolean);
};

interface StripeLinkLookupParams {
  productId: string;
  sizeName: string;
  sku?: string;
}

export function getStripePaymentLink({ productId, sizeName, sku }: StripeLinkLookupParams): string | null {
  const envCandidates = [
    ...buildKeyVariants(sku).map(key => `NEXT_PUBLIC_STRIPE_LINK_${key}`),
    ...buildKeyVariants(`${productId}_${sizeName}`).map(key => `NEXT_PUBLIC_STRIPE_LINK_${key}`),
    ...buildKeyVariants(productId).map(key => `NEXT_PUBLIC_STRIPE_LINK_${key}`)
  ];

  for (const envKey of envCandidates) {
    const value = process.env[envKey as keyof NodeJS.ProcessEnv];
    if (value && value.startsWith('https://')) {
      return value;
    }
  }

  const linkMap = loadLinkMap();
  const mapCandidates = [
    ...buildKeyVariants(sku),
    ...buildKeyVariants(`${productId}_${sizeName}`),
    ...buildKeyVariants(productId)
  ];

  for (const key of mapCandidates) {
    const match = linkMap[key];
    if (match && match.startsWith('https://')) {
      return match;
    }
  }

  const fallback = process.env.NEXT_PUBLIC_STRIPE_DEFAULT_LINK;
  if (fallback && fallback.startsWith('https://')) {
    return fallback;
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
