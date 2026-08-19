import { getProductById } from '../data/products';

export type CheckoutCatalogItem = {
  productId: string;
  productName: string;
  sizeName: string;
  sku: string;
  price: number;
};

const specialOffers: Record<string, CheckoutCatalogItem> = {
  NWS_014_BUNDLE: {
    productId: 'NWS_014_BUNDLE',
    productName: "Nature's Way Soil Dog Urine Neutralizer & Lawn Revitalizer Bundle",
    sizeName: '32 oz Hose-End Sprayer + 1 Gallon Refill',
    sku: 'NWS-DUN-32OZ-1GAL-BUNDLE',
    price: 49.99,
  },
  NWS_BIOCHAR_1GAL: {
    productId: 'NWS_BIOCHAR_1GAL',
    productName: "Nature's Way Soil Liquid Biochar Soil Conditioner with Humic, Fulvic & Kelp",
    sizeName: '1 Gallon',
    sku: 'NWS-BIOCHAR-1GAL',
    price: 89.99,
  },
};

export function resolveCheckoutItem(productId: unknown, requestedSku: unknown, requestedSize: unknown): CheckoutCatalogItem | null {
  if (typeof productId !== 'string') return null;

  const specialOffer = specialOffers[productId];
  if (specialOffer) return specialOffer;

  const product = getProductById(productId);
  if (!product || !product.inStock) return null;

  const sku = typeof requestedSku === 'string' ? requestedSku : '';
  const sizeName = typeof requestedSize === 'string' ? requestedSize : '';
  const size = product.sizes?.find((option) => option.sku === sku)
    ?? product.sizes?.find((option) => option.name === sizeName);

  if (product.sizes?.length && !size) return null;

  return {
    productId: product.id,
    productName: product.name,
    sizeName: size?.name ?? '',
    sku: size?.sku ?? product.id,
    price: size?.price ?? product.price,
  };
}
