import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { sendPaymentIntentOrderNotification } from '../../../lib/paymentIntentOrder';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });

export const config = { api: { bodyParser: false } };

async function readRawBody(req: NextApiRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const signature = req.headers['stripe-signature'];
  if (!signature || Array.isArray(signature) || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(400).json({ error: 'Missing webhook configuration or signature' });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      await readRawBody(req),
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    console.error('Stripe webhook signature verification failed:', error);
    return res.status(400).json({ error: 'Invalid Stripe signature' });
  }

  if (event.type === 'payment_intent.succeeded') {
    try {
      await sendPaymentIntentOrderNotification(
        event.data.object as Stripe.PaymentIntent,
        event.id,
      );
    } catch (error) {
      console.error('Order notification failed:', error);
      return res.status(500).json({ error: 'Order notification failed' });
    }
  }

  return res.status(200).json({ received: true });
}
