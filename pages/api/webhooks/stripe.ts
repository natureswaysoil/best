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
        
        // Send order confirmation email to customer + owner notification
        if (paymentIntent.receipt_email && paymentIntent.metadata) {
          try {
            const metadata = paymentIntent.metadata;

            // Notify James immediately
            const { Resend } = await import('resend');
            const resendClient = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
            if (resendClient) {
              await resendClient.emails.send({
                from: "Nature's Way Soil <no-reply@natureswaysoil.com>",
                to: ['natureswaysoil@natureswaysoil.com', 'james@natureswaysoil.com', 'sales@natureswaysoil.com'],
                subject: `🛒 New Order — $${(paymentIntent.amount / 100).toFixed(2)} from ${metadata.customer_name || paymentIntent.receipt_email}`,
                html: `
                  <h2 style="color:#2d5016;">New Website Order!</h2>
                  <table style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;">
                    <tr><td><strong>Customer:</strong></td><td>${metadata.customer_name || 'N/A'}</td></tr>
                    <tr><td><strong>Email:</strong></td><td>${paymentIntent.receipt_email}</td></tr>
                    <tr><td><strong>Product:</strong></td><td>${metadata.product_name || 'N/A'}${metadata.size_name ? ' — ' + metadata.size_name : ''}</td></tr>
                    <tr><td><strong>Qty:</strong></td><td>${metadata.quantity || 1}</td></tr>
                    <tr><td><strong>Total:</strong></td><td><strong>$${(paymentIntent.amount / 100).toFixed(2)}</strong></td></tr>
                    <tr><td><strong>Order ID:</strong></td><td>${paymentIntent.id}</td></tr>
                    <tr><td><strong>Ship to:</strong></td><td>${[metadata.address1, metadata.city, metadata.state, metadata.zip].filter(Boolean).join(', ') || 'See Stripe'}</td></tr>
                  </table>
                  <p style="margin-top:20px;">
                    <a href="https://dashboard.stripe.com/payments/${paymentIntent.id}" style="background:#2d5016;color:white;padding:10px 20px;text-decoration:none;border-radius:4px;">View in Stripe</a>
                  </p>
                `
              });
              console.log('Owner notification sent to james@, sales@, and gmail');
            }

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