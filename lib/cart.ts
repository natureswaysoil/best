export const CART_KEY = 'nws-cart-v1';
export const CART_EVENT = 'nws_cart_changed';

export type CartItem = {
  productId: string;
  productName: string;
  sizeName?: string;
  sku?: string;
  image?: string;
  price: number;
  quantity: number;
};

export function readCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(CART_KEY) || '[]');
    return Array.isArray(value) ? value : [];
  } catch { return []; }
}

export function writeCart(items: CartItem[]) {
  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(CART_EVENT));
}

export function addCartItem(item: CartItem) {
  const items = readCart();
  const index = items.findIndex((x) => x.productId === item.productId && x.sku === item.sku);
  if (index >= 0) items[index] = { ...items[index], quantity: items[index].quantity + item.quantity };
  else items.push(item);
  writeCart(items.slice(0, 12));
}
