import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const sessionId = Array.isArray(req.query.session_id) ? req.query.session_id[0] : req.query.session_id;
  if (!stripeSecretKey || !sessionId || !sessionId.startsWith('cs_')) {
    return res.status(400).json({ error: 'Invalid checkout session' });
  }

  try {
    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' });
    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['line_items'] });
    if (session.payment_status !== 'paid') {
      return res.status(409).json({ error: 'Payment is not complete' });
    }

    const items = (session.line_items?.data || [])
      .filter((item) => item.description !== 'Standard Shipping')
      .map((item) => ({
        item_id: session.metadata?.productId || session.metadata?.product_id || session.metadata?.sku || '',
        item_name: item.description || session.metadata?.productName || session.metadata?.product_name || 'Nature’s Way Soil product',
        item_variant: session.metadata?.sizeName || session.metadata?.size_name || '',
        price: Number(((item.amount_subtotal || 0) / 100 / Math.max(item.quantity || 1, 1)).toFixed(2)),
        quantity: item.quantity || 1,
      }));

    res.setHeader('Cache-Control', 'private, no-store');
    return res.status(200).json({
      order: {
        transaction_id: session.id,
        value: Number(((session.amount_total || 0) / 100).toFixed(2)),
        shipping: Number(((session.total_details?.amount_shipping || 0) / 100).toFixed(2)),
        tax: Number(((session.total_details?.amount_tax || 0) / 100).toFixed(2)),
        currency: (session.currency || 'usd').toUpperCase(),
        items,
      },
    });
  } catch (error) {
    console.error('Checkout order verification failed:', error);
    return res.status(404).json({ error: 'Checkout session not found' });
  }
}
