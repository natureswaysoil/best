import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { getServiceSupabase } from '../../lib/supabase';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

function getStripe(): Stripe {
  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' });
}

const toDollars = (value?: number | null) => Number(((value || 0) / 100).toFixed(2));

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { paymentIntentId } = req.body as { paymentIntentId?: string };

    if (!paymentIntentId || typeof paymentIntentId !== 'string') {
      return res.status(400).json({ error: 'Payment intent id is required.' });
    }

    const paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId);
    const metadata = paymentIntent.metadata || {};
    const paid = paymentIntent.status === 'succeeded';

    const order = {
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
      paid,
      amount: toDollars(paymentIntent.amount),
      subtotal: toDollars(Number(metadata.subtotal_cents || 0)),
      discount: toDollars(Number(metadata.discount_cents || 0)),
      shipping: toDollars(Number(metadata.shipping_cents || 0)),
      tax: toDollars(Number(metadata.tax_cents || 0)),
      productName: metadata.product_name || '',
      sizeName: metadata.size_name || '',
      sku: metadata.sku || '',
      quantity: Number(metadata.quantity || 1),
    };

    if (paid) {
      try {
        const supabase = getServiceSupabase();
        await supabase.from('orders').update({ status: 'paid' }).eq('pi_id', paymentIntent.id);
      } catch (databaseError) {
        console.warn('Unable to update order status:', databaseError);
      }
    }

    return res.status(200).json({ order });
  } catch (error) {
    console.error('Payment confirmation error:', error);
    const message = error instanceof Error ? error.message : 'Unable to confirm payment.';
    return res.status(500).json({ error: message });
  }
}
