import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { allProducts } from '../../data/products';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2023-10-16' });
type RequestedItem = { productId?:string; sku?:string; quantity?:number };

function path(value:unknown, fallback:string) {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : fallback;
}

export default async function handler(req:NextApiRequest,res:NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({error:'Method not allowed'});
  if (!process.env.STRIPE_SECRET_KEY) return res.status(503).json({error:'Checkout is not configured'});
  const requested = (Array.isArray(req.body?.items) ? req.body.items : []).slice(0,12) as RequestedItem[];
  if (!requested.length) return res.status(400).json({error:'Your cart is empty'});

  const normalized = requested.map((item) => {
    const product = allProducts.find((p) => p.id === item.productId);
    if (!product || !product.inStock) throw new Error('One of the selected products is unavailable');
    const size = product.sizes?.find((s) => s.sku === item.sku) || product.sizes?.[0];
    const price = size?.price ?? product.price;
    return { product, size, quantity:Math.min(20,Math.max(1,Math.floor(Number(item.quantity)||1))), price };
  });
  const subtotal = normalized.reduce((sum,x)=>sum+Math.round(x.price*100)*x.quantity,0);
  const shipping = subtotal >= 5000 ? 0 : 995;
  const rawOrigin = String(req.headers.origin || process.env.NEXT_PUBLIC_SITE_URL || 'https://natureswaysoil.com').trim();
  const origin = (rawOrigin.startsWith('http://') || rawOrigin.startsWith('https://') ? rawOrigin : `https://${rawOrigin}`).replace(/\/$/, '');
  const successPath = path(req.body?.successPath,'/cart-success?session_id={CHECKOUT_SESSION_ID}');
  const cancelPath = path(req.body?.cancelPath,'/cart');
  const summary = normalized.map(x=>`${x.quantity}x ${x.product.id}`).join(', ').slice(0,500);
  const totalQty = normalized.reduce((sum,x)=>sum+x.quantity,0);
  const metadata = { product_id:'CART', product_name:`Multi-item order: ${summary}`.slice(0,500), size_name:'See packing slip', sku:normalized.map(x=>x.size?.sku||x.product.id).join(',').slice(0,500), quantity:String(totalQty), subtotal_cents:String(subtotal), shipping_cents:String(shipping), source:'website-cart' };
  const lineItems:Stripe.Checkout.SessionCreateParams.LineItem[] = normalized.map(({product,size,quantity,price})=>({ price_data:{currency:'usd',unit_amount:Math.round(price*100),product_data:{name:size?.name?`${product.name} – ${size.name}`:product.name,metadata:{productId:product.id,sizeName:size?.name||'',sku:size?.sku||product.id}}},quantity }));

  try {
    const session=await stripe.checkout.sessions.create({mode:'payment',payment_method_types:['card','link'],line_items:lineItems,shipping_options:shipping?[{shipping_rate_data:{type:'fixed_amount',fixed_amount:{amount:shipping,currency:'usd'},display_name:'Standard Shipping'}}]:undefined,billing_address_collection:'auto',shipping_address_collection:{allowed_countries:['US']},phone_number_collection:{enabled:true},allow_promotion_codes:true,metadata,payment_intent_data:{metadata},success_url:`${origin}${successPath}`,cancel_url:`${origin}${cancelPath}`});
    return res.status(200).json({url:session.url});
  } catch(error) { console.error('[cart-checkout]',error); return res.status(500).json({error:'Unable to start secure checkout'}); }
}
