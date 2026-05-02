import { ProductData } from '../data/products';

export function buildDirectCheckoutUrl(product: ProductData, sizeIndex = 0, coupon = 'SAVE15') {
  const size = product.sizes?.[sizeIndex] ?? product.sizes?.[0];
  const params = new URLSearchParams();
  params.set('productId', product.id);
  params.set('quantity', '1');
  params.set('coupon', coupon);

  if (size?.name) {
    params.set('sizeName', size.name);
  }

  if (size?.sku) {
    params.set('sku', size.sku);
  }

  return `/checkout?${params.toString()}`;
}
