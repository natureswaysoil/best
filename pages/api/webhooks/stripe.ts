import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { getServiceSupabase } from '../../../lib/supabase';
import { sendOrderConfirmation } from '../../../lib/resend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;

  try {
    const body = JSON.stringify(req.body);
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send('Webhook signature verification failed');
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    
    try {
      const supabase = getServiceSupabase();
      
      // Update order status to 'paid'
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'paid',
          stripe_charge_id: typeof paymentIntent.latest_charge === 'string' 
            ? paymentIntent.latest_charge 
            : null
        })
        .eq('pi_id', paymentIntent.id);

      if (error) {
        console.error('Failed to update order status:', error);
      } else {
        console.log(`Order updated to paid for PaymentIntent: ${paymentIntent.id}`);
        
        // Send order confirmation email
        if (paymentIntent.receipt_email && paymentIntent.metadata) {
          try {
            const metadata = paymentIntent.metadata;
            await sendOrderConfirmation(paymentIntent.receipt_email, {
              orderId: paymentIntent.id,
              name: metadata.customer_name || 'Customer',
              items: [{
                title: metadata.product_name || 'Product',
                size: metadata.size_name || undefined,
                qty: parseInt(metadata.quantity || '1'),
                price: parseFloat(metadata.subtotal_cents || '0') / 100,
                sku: metadata.sku || ''
              }],
              subtotal: parseFloat(metadata.subtotal_cents || '0') / 100,
              tax: parseFloat(metadata.tax_cents || '0') / 100,
              shipping: parseFloat(metadata.shipping_cents || '0') / 100,
              total: paymentIntent.amount / 100
            });
            console.log(`Order confirmation email sent to ${paymentIntent.receipt_email}`);
          } catch (emailError) {
            console.error('Failed to send order confirmation email:', emailError);
          }
        }
      }
    } catch (err) {
      console.error('Webhook processing error:', err);
    }
  }

  res.status(200).json({ received: true });
}