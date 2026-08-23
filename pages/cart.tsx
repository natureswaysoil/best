import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import { CartItem, readCart, writeCart } from '../lib/cart';
import { allProducts, ProductData } from '../data/products';
import { trackCheckoutStart } from '../lib/ga4';

const FREE_SHIPPING = 50;

type CrossSellRule = { triggerIds: string[]; title: string; reason: string; recommendIds: string[] };
const CROSS_SELL_RULES: CrossSellRule[] = [
  { triggerIds: ['NWS_014'], title: 'Complete Your Dog Lawn Recovery', reason: 'Pair odor and urine-spot treatment with lawn and root-zone support.', recommendIds: ['NWS_018', 'NWS_011'] },
  { triggerIds: ['NWS_018'], title: 'Build a Stronger Lawn Program', reason: 'Add dog-spot support or humic/fulvic soil conditioning to your lawn treatment.', recommendIds: ['NWS_014', 'NWS_011'] },
  { triggerIds: ['NWS_011', 'NWS_001', 'NWS_004', 'NWS_023'], title: 'Build the Soil from Both Sides', reason: 'Combine liquid root-zone support with a carbon-rich or living soil amendment.', recommendIds: ['NWS_023', 'NWS_011', 'NWS_002'] },
  { triggerIds: ['NWS_021'], title: 'Upgrade to Pasture Recovery', reason: 'For stressed hay or pasture, add the recovery system with liquid biochar and humic support.', recommendIds: ['NWS_022', 'NWS_011'] },
  { triggerIds: ['NWS_022'], title: 'Keep the Recovery Program Going', reason: 'Use the base hay/pasture fertilizer for routine feeding between recovery applications.', recommendIds: ['NWS_021', 'NWS_011'] },
];

function firstSize(product: ProductData) { return product.sizes?.[0] || { name: '', price: product.price, sku: product.id }; }

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => setItems(readCart()), []);

  const subtotal = useMemo(() => items.reduce((sum, x) => sum + x.price * x.quantity, 0), [items]);
  const remaining = Math.max(0, FREE_SHIPPING - subtotal);
  const estimatedSavings = subtotal * 0.15;
  const estimatedAfterCoupon = subtotal - estimatedSavings;
  const cartProductIds = useMemo(() => new Set(items.map((x) => x.productId)), [items]);
  const matchedRule = CROSS_SELL_RULES.find((rule) => rule.triggerIds.some((id) => cartProductIds.has(id)));
  const systemRecommendations = (matchedRule?.recommendIds || []).map((id) => allProducts.find((p) => p.id === id)).filter((p): p is ProductData => Boolean(p && p.inStock && !cartProductIds.has(p.id))).slice(0, 2);
  const freeShippingSuggestion = allProducts.flatMap((p) => (p.sizes || [{ name: '', price: p.price, sku: p.id }]).map((s) => ({ product: p, size: s }))).filter(({ product, size }) => product.inStock && !items.some((x) => x.productId === product.id && x.sku === size.sku) && size.price >= remaining).sort((a, b) => a.size.price - b.size.price)[0];

  const addProduct = (product: ProductData) => {
    const size = firstSize(product);
    const existingIndex = items.findIndex((x) => x.productId === product.id && x.sku === size.sku);
    const next = [...items];
    if (existingIndex >= 0) next[existingIndex] = { ...next[existingIndex], quantity: next[existingIndex].quantity + 1 };
    else next.push({ productId: product.id, productName: product.name, sizeName: size.name, sku: size.sku, image: product.image, price: size.price, quantity: 1 });
    setItems(next); writeCart(next);
  };

  const update = (index: number, quantity: number) => {
    const next = items.map((x, i) => (i === index ? { ...x, quantity: Math.max(0, quantity) } : x)).filter((x) => x.quantity > 0);
    setItems(next); writeCart(next);
  };

  const checkout = async () => {
    setBusy(true); setError('');
    try {
      const analyticsItems = items.map((x) => ({ item_id: x.sku || x.productId, item_name: x.productName, item_variant: x.sizeName, price: x.price, quantity: x.quantity }));
      trackCheckoutStart({ value: subtotal, items: analyticsItems });
      window.fbq?.('track', 'InitiateCheckout', { value: subtotal, currency: 'USD', num_items: items.reduce((sum, x) => sum + x.quantity, 0), content_ids: items.map((x) => x.sku || x.productId), content_type: 'product' });
      window.ttq?.track?.('InitiateCheckout', { value: subtotal, currency: 'USD', quantity: items.reduce((sum, x) => sum + x.quantity, 0) });

      const response = await fetch('/api/create-cart-checkout-session', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ items, successPath: '/order-success?session_id={CHECKOUT_SESSION_ID}', cancelPath: '/cart' }) });
      const data = await response.json();
      if (!response.ok || !data.url) throw new Error(data.error || 'Unable to start checkout');
      window.location.assign(data.url);
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to start checkout'); setBusy(false); }
  };

  return <Layout><Head><title>Your Cart - Nature&apos;s Way Soil</title></Head><main className="max-w-6xl mx-auto px-4 py-12">
    <div className="flex flex-wrap items-end justify-between gap-3 mb-8"><div><p className="text-sm font-semibold uppercase tracking-wide text-nature-green-700">Your order</p><h1 className="text-3xl font-bold">Your Cart</h1></div><p className="text-sm text-gray-600">Free shipping on orders over ${FREE_SHIPPING}</p></div>
    {!items.length ? <div className="bg-white border rounded-2xl p-10 text-center"><p className="text-lg mb-5">Your cart is empty.</p><Link href="/shop" className="btn-primary">Shop Products</Link></div> : <div className="grid lg:grid-cols-3 gap-8">
      <section className="lg:col-span-2 space-y-5">{items.map((x, i) => <article key={`${x.productId}-${x.sku}`} className="bg-white border rounded-xl p-4 flex gap-4 items-center">{x.image && <img src={x.image} alt="" className="w-24 h-24 object-contain" />}<div className="flex-1 min-w-0"><h2 className="font-semibold leading-snug">{x.productName}</h2><p className="text-sm text-gray-500">{x.sizeName}</p><p className="font-bold text-green-700 mt-2">${x.price.toFixed(2)} each</p></div><div className="flex items-center gap-2"><button onClick={() => update(i, x.quantity - 1)} className="border rounded px-3 py-1">−</button><span className="min-w-6 text-center">{x.quantity}</span><button onClick={() => update(i, x.quantity + 1)} className="border rounded px-3 py-1">+</button></div></article>)}
        {matchedRule && systemRecommendations.length > 0 && <section className="rounded-2xl border-2 border-nature-green-200 bg-nature-green-50 p-5"><p className="text-xs font-bold uppercase tracking-wide text-nature-green-700">Frequently bought together</p><h2 className="text-xl font-bold text-gray-900 mt-1">{matchedRule.title}</h2><p className="text-sm text-gray-650 mt-1">{matchedRule.reason}</p><p className="text-sm font-semibold text-amber-800 mt-2 mb-4">Build the complete system, then apply your 15% coupon at checkout.</p><div className="grid sm:grid-cols-2 gap-3">{systemRecommendations.map((product) => { const size = firstSize(product); return <div key={product.id} className="bg-white rounded-xl border p-4 flex gap-3 items-center"><img src={product.image} alt="" className="w-20 h-20 object-contain" /><div className="min-w-0 flex-1"><p className="font-semibold text-sm leading-snug line-clamp-2">{product.name}</p><p className="text-xs text-gray-500 mt-1">{size.name}</p><p className="font-bold text-nature-green-700 mt-1">${size.price.toFixed(2)}</p><button onClick={() => addProduct(product)} className="mt-2 text-sm font-bold text-nature-green-700">+ Add to my order</button></div></div>; })}</div></section>}
      </section>
      <aside className="bg-white border rounded-2xl p-6 h-fit space-y-5 lg:sticky lg:top-24"><div className="flex justify-between text-lg font-bold"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div><div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><div className="font-bold">15% coupon available at checkout</div><div>Estimated savings: ${estimatedSavings.toFixed(2)}</div><div className="font-semibold mt-1">Approx. after coupon: ${estimatedAfterCoupon.toFixed(2)}</div></div>
        {remaining > 0 ? <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm"><strong>Add ${remaining.toFixed(2)} for free shipping.</strong>{freeShippingSuggestion && <button onClick={() => addProduct(freeShippingSuggestion.product)} className="block mt-3 text-green-700 font-semibold text-left">+ Add {freeShippingSuggestion.product.name} (${freeShippingSuggestion.size.price.toFixed(2)})</button>}</div> : <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 font-semibold">✓ Free shipping unlocked</div>}
        <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-700 space-y-1"><p>✓ Secure payment</p><p>✓ Promotion-code field available at checkout</p><p>✓ 30-day satisfaction guarantee</p><p>✓ Lower-48 shipping</p></div>{error && <p className="text-red-700 text-sm">{error}</p>}<button onClick={checkout} disabled={busy} className="btn-primary w-full disabled:opacity-50">{busy ? 'Opening secure checkout…' : `Checkout & Apply 15% Coupon — $${subtotal.toFixed(2)}`}</button><Link href="/shop" className="block text-center underline text-sm">Continue shopping</Link>
      </aside></div>}
  </main></Layout>;
}
