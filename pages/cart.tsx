import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import { CartItem, readCart, writeCart } from '../lib/cart';
import { allProducts } from '../data/products';

const FREE_SHIPPING = 50;

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => setItems(readCart()), []);
  const subtotal = useMemo(() => items.reduce((sum, x) => sum + x.price * x.quantity, 0), [items]);
  const remaining = Math.max(0, FREE_SHIPPING - subtotal);
  const suggestion = allProducts
    .flatMap((p) => (p.sizes || [{ name: '', price: p.price, sku: p.id }]).map((s) => ({ product: p, size: s })))
    .filter(({ product, size }) => !items.some((x) => x.productId === product.id && x.sku === size.sku) && size.price >= remaining)
    .sort((a, b) => a.size.price - b.size.price)[0];

  const update = (index:number, quantity:number) => {
    const next = items.map((x, i) => i === index ? { ...x, quantity: Math.max(0, quantity) } : x).filter((x) => x.quantity > 0);
    setItems(next); writeCart(next);
  };
  const checkout = async () => {
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/create-cart-checkout-session', { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({ items, successPath:'/order-success?session_id={CHECKOUT_SESSION_ID}', cancelPath:'/cart' }) });
      const data = await response.json();
      if (!response.ok || !data.url) throw new Error(data.error || 'Unable to start checkout');
      window.location.assign(data.url);
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to start checkout'); setBusy(false); }
  };

  return <Layout><Head><title>Your Cart - Nature&apos;s Way Soil</title></Head><main className="max-w-5xl mx-auto px-4 py-12">
    <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
    {!items.length ? <div className="bg-white border rounded-2xl p-10 text-center"><p className="text-lg mb-5">Your cart is empty.</p><Link href="/shop" className="btn-primary">Shop Products</Link></div> : <div className="grid lg:grid-cols-3 gap-8">
      <section className="lg:col-span-2 space-y-4">{items.map((x,i)=><article key={`${x.productId}-${x.sku}`} className="bg-white border rounded-xl p-4 flex gap-4">
        {x.image && <img src={x.image} alt="" className="w-24 h-24 object-contain"/>}<div className="flex-1"><h2 className="font-semibold">{x.productName}</h2><p className="text-sm text-gray-500">{x.sizeName}</p><p className="font-bold text-green-700 mt-2">${x.price.toFixed(2)}</p></div>
        <div className="flex items-center gap-2"><button onClick={()=>update(i,x.quantity-1)} className="border rounded px-3 py-1">−</button><span>{x.quantity}</span><button onClick={()=>update(i,x.quantity+1)} className="border rounded px-3 py-1">+</button></div>
      </article>)}</section>
      <aside className="bg-white border rounded-2xl p-6 h-fit space-y-5"><div className="flex justify-between text-lg font-bold"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
        {remaining > 0 ? <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm"><strong>Add ${remaining.toFixed(2)} for free shipping.</strong>{suggestion && <button onClick={()=>{ const s=suggestion.size; const next=[...items,{productId:suggestion.product.id,productName:suggestion.product.name,sizeName:s.name,sku:s.sku,image:suggestion.product.image,price:s.price,quantity:1}]; setItems(next); writeCart(next); }} className="block mt-3 text-green-700 font-semibold text-left">+ Add {suggestion.product.name} (${suggestion.size.price.toFixed(2)})</button>}</div> : <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 font-semibold">✓ Free shipping unlocked</div>}
        {error && <p className="text-red-700 text-sm">{error}</p>}<button onClick={checkout} disabled={busy} className="btn-primary w-full disabled:opacity-50">{busy?'Opening secure checkout…':'Secure Checkout'}</button><Link href="/shop" className="block text-center underline text-sm">Continue shopping</Link>
      </aside></div>}
  </main></Layout>;
}
