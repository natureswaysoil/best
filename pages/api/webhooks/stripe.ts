import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { Resend } from 'resend';
import { getServiceSupabase } from '../../../lib/supabase';
import { sendOrderConfirmation } from '../../../lib/resend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://natureswaysoil.com';
const printSlipToken = process.env.PRINT_SLIP_TOKEN || process.env.PRINT_QUEUE_SECRET || '';
const INTERNAL_EMAIL_RECIPIENTS = Array.from(
  new Set([
    'natureswaysoil@natureswaysoil.com',
    'james@natureswaysoil.com',
    'sales@natureswaysoil.com',
    'natureswaysoil@gmail.com',
  ])
);

export const config = {
  api: {
    bodyParser: false,
  },
};

async function readRawBody(req: NextApiRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

function money(cents: number | null | undefined): string {
  return `$${((cents || 0) / 100).toFixed(2)}`;
}

function safe(value: unknown): string {
  if (value === undefined || value === null || value === '') return 'N/A';
  return String(value);
}

function addressHtml(address?: Stripe.Address | null): string {
  if (!address) return 'See Stripe order details';
  return [
    address.line1,
    address.line2,
    [address.city, address.state, address.postal_code].filter(Boolean).join(', '),
    address.country,
  ].filter(Boolean).join('<br>');
}

function addressText(address?: Stripe.Address | null): string {
  if (!address) return 'See Stripe order details';
  return [
    address.line1,
    address.line2,
    [address.city, address.state, address.postal_code].filter(Boolean).join(', '),
    address.country,
  ].filter(Boolean).join(', ');
}

/**
 * Handles orders placed through Stripe *Checkout Sessions*.
 * Kept for forward-compatibility; the site currently does NOT use Checkout
 * Sessions (it uses the PaymentIntent flow below), so in practice this event
 * will not fire today. Left in place in case Checkout is reintroduced.
 */
async function processCheckoutSessionCompleted(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items.data.price.product'],
  });

  const lineItem = session.line_items?.data?.[0];
  const metadata = session.metadata || {};
  const productName = metadata.productName || metadata.product_name || lineItem?.description || 'Nature’s Way Soil Product';
  const sizeName = metadata.sizeName || metadata.size_name || '';
  const quantity = lineItem?.quantity || Number(metadata.quantity || 1);
  const sku = metadata.sku || '';
  const customerEmail = session.customer_details?.email || session.customer_email || '';
  const customerName = session.customer_details?.name || session.shipping_details?.name || 'Customer';
  const shippingAddress = session.shipping_details?.address || session.customer_details?.address || null;
  const printableUrl = `${siteUrl}/api/packing-slip/${session.id}${printSlipToken ? `?token=${encodeURIComponent(printSlipToken)}` : ''}`;
  const stripePaymentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.id;

  try {
    const supabase = getServiceSupabase();
    const customerRow = await supabase
      .from('customers')
      .upsert({ name: customerName, email: customerEmail || `stripe-${session.id}@example.local` }, { onConflict: 'email' })
      .select('id')
      .single();

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .upsert({
        customer_id: customerRow.data?.id || null,
        status: 'paid',
        pi_id: stripePaymentId,
        subtotal: (session.amount_subtotal || 0) / 100,
        tax: (session.total_details?.amount_tax || 0) / 100,
        shipping: (session.total_details?.amount_shipping || 0) / 100,
        total: (session.amount_total || 0) / 100,
        email: customerEmail,
        name: customerName,
        billing: session.customer_details || null,
        shipping_address: shippingAddress || null,
      }, { onConflict: 'pi_id' })
      .select('id')
      .single();

    if (orderError) console.error('Failed to save Stripe order:', orderError);
    if (order?.id && lineItem) {
      await supabase.from('order_items').insert({
        order_id: order.id,
        sku,
        qty: lineItem.quantity || Number(metadata.quantity || 1),
        unit_price: (lineItem.amount_subtotal || Number(metadata.subtotal_cents || 0)) / 100,
      });
    }
  } catch (error) {
    console.error('Supabase order save skipped or failed:', error);
  }

  await sendOrderEmails({
    orderId: session.id,
    stripePaymentId,
    customerEmail,
    customerName,
    productName,
    sizeName,
    sku,
    quantity,
    shippingAddress,
    amountTotal: session.amount_total,
    amountSubtotal: session.amount_subtotal,
    amountTax: session.total_details?.amount_tax,
    amountShipping: session.total_details?.amount_shipping,
    lineItemAmount: lineItem?.amount_subtotal ?? Number(metadata.subtotal_cents || session.amount_subtotal || 0),
    printableUrl,
  });
}

/**
 * Handles orders placed through the site's actual checkout flow:
 * pages/api/create-payment-intent.ts creates a raw Stripe PaymentIntent
 * (no Checkout Session), so this is the event that really fires for every
 * live order. This is the primary path.
 */
async function processPaymentIntentSucceeded(paymentIntentId: string) {
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  const metadata = paymentIntent.metadata || {};

  const productName = metadata.product_name || 'Nature’s Way Soil Product';
  const sizeName = metadata.size_name || '';
  const sku = metadata.sku || '';
  const quantity = Number(metadata.quantity || 1);
  const customerEmail = paymentIntent.receipt_email || '';
  const customerName = paymentIntent.shipping?.name || 'Customer';
  const shippingAddress = paymentIntent.shipping?.address || null;
  const printableUrl = `${siteUrl}/api/packing-slip/${paymentIntent.id}${printSlipToken ? `?token=${encodeURIComponent(printSlipToken)}` : ''}`;

  const subtotalCents = Number(metadata.subtotal_cents || 0);
  const shippingCents = Number(metadata.shipping_cents || 0);
  const taxCents = Number(metadata.tax_cents || 0);

  // Idempotency guard: Stripe can and will retry webhook delivery, and this
  // event can also race with the client calling /api/confirm-payment. Only
  // send emails once per order, gated on the Supabase order row's status.
  let alreadyProcessed = false;
  let orderId: string | null = null;
  try {
    const supabase = getServiceSupabase();
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id, status')
      .eq('pi_id', paymentIntent.id)
      .maybeSingle();

    alreadyProcessed = existingOrder?.status === 'paid';
    orderId = existingOrder?.id || null;

    const { data: upserted, error: orderError } = await supabase
      .from('orders')
      .upsert({
        id: orderId || undefined,
        status: 'paid',
        pi_id: paymentIntent.id,
        subtotal: subtotalCents / 100,
        tax: taxCents / 100,
        shipping: shippingCents / 100,
        total: (paymentIntent.amount || 0) / 100,
        email: customerEmail,
        name: customerName,
        shipping_address: shippingAddress || null,
      }, { onConflict: 'pi_id' })
      .select('id')
      .single();

    if (orderError) console.error('Failed to upsert PaymentIntent order:', orderError);
    orderId = upserted?.id || orderId;
  } catch (error) {
    console.error('Supabase order upsert skipped or failed:', error);
  }

  if (alreadyProcessed) {
    console.log(`[stripe-webhook] Order ${paymentIntent.id} already processed, skipping duplicate emails.`);
    return;
  }

  await sendOrderEmails({
    orderId: paymentIntent.id,
    stripePaymentId: paymentIntent.id,
    customerEmail,
    customerName,
    productName,
    sizeName,
    sku,
    quantity,
    shippingAddress,
    amountTotal: paymentIntent.amount,
    amountSubtotal: subtotalCents,
    amountTax: taxCents,
    amountShipping: shippingCents,
    lineItemAmount: subtotalCents,
    printableUrl,
  });
}

interface OrderEmailArgs {
  orderId: string;
  stripePaymentId: string;
  customerEmail: string;
  customerName: string;
  productName: string;
  sizeName: string;
  sku: string;
  quantity: number;
  shippingAddress: Stripe.Address | null;
  amountTotal: number | null | undefined;
  amountSubtotal: number | null | undefined;
  amountTax: number | null | undefined;
  amountShipping: number | null | undefined;
  lineItemAmount: number;
  printableUrl: string;
}

async function sendOrderEmails(args: OrderEmailArgs) {
  const {
    orderId, stripePaymentId, customerEmail, customerName, productName, sizeName, sku,
    quantity, shippingAddress, amountTotal, amountSubtotal, amountTax, amountShipping,
    lineItemAmount, printableUrl,
  } = args;

  if (process.env.RESEND_API_KEY) {
    const resendClient = new Resend(process.env.RESEND_API_KEY);
    await resendClient.emails.send({
      from: "Nature's Way Soil <no-reply@natureswaysoil.com>",
      to: INTERNAL_EMAIL_RECIPIENTS,
      subject: `🛒 New Website Order — ${money(amountTotal)} — ${customerName}`,
      html: `
        <h2 style="color:#2d5016;">New Website Order</h2>
        <table style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;border-collapse:collapse;">
          <tr><td style="padding:4px 12px 4px 0;"><strong>Customer:</strong></td><td>${safe(customerName)}</td></tr>
          <tr><td style="padding:4px 12px 4px 0;"><strong>Email:</strong></td><td>${safe(customerEmail)}</td></tr>
          <tr><td style="padding:4px 12px 4px 0;"><strong>Product:</strong></td><td>${safe(productName)}${sizeName ? ' — ' + safe(sizeName) : ''}</td></tr>
          <tr><td style="padding:4px 12px 4px 0;"><strong>SKU:</strong></td><td>${safe(sku)}</td></tr>
          <tr><td style="padding:4px 12px 4px 0;"><strong>Qty:</strong></td><td>${safe(quantity)}</td></tr>
          <tr><td style="padding:4px 12px 4px 0;"><strong>Total:</strong></td><td><strong>${money(amountTotal)}</strong></td></tr>
          <tr><td style="padding:4px 12px 4px 0;"><strong>Stripe Payment:</strong></td><td>${stripePaymentId}</td></tr>
          <tr><td style="padding:4px 12px 4px 0;vertical-align:top;"><strong>Ship to:</strong></td><td>${addressHtml(shippingAddress)}</td></tr>
        </table>
        <p style="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap;">
          <a href="${printableUrl}" style="background:#2d5016;color:white;padding:10px 20px;text-decoration:none;border-radius:4px;">Open / Print Packing Slip</a>
          <a href="https://dashboard.stripe.com/payments/${stripePaymentId}" style="background:#111827;color:white;padding:10px 20px;text-decoration:none;border-radius:4px;">View in Stripe</a>
        </p>
        <p style="font-size:12px;color:#666;">Shipping address: ${addressText(shippingAddress)}</p>
      `,
    });
  } else {
    console.warn('RESEND_API_KEY not configured; internal order email was not sent.');
  }

  if (customerEmail) {
    await sendOrderConfirmation(customerEmail, {
      orderId,
      name: customerName,
      items: [{
        title: productName,
        size: sizeName || undefined,
        qty: quantity,
        price: lineItemAmount / 100,
        sku,
      }],
      subtotal: (amountSubtotal || 0) / 100,
      tax: (amountTax || 0) / 100,
      shipping: (amountShipping || 0) / 100,
      total: (amountTotal || 0) / 100,
      shippingAddress: shippingAddress ? {
        address1: shippingAddress.line1 || undefined,
        address2: shippingAddress.line2 || undefined,
        city: shippingAddress.city || undefined,
        state: shippingAddress.state || undefined,
        zip: shippingAddress.postal_code || undefined,
      } : undefined,
    });
  } else {
    console.warn(`[stripe-webhook] No customer email on order ${orderId}; confirmation email not sent.`);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const sig = req.headers['stripe-signature'];
  if (!sig || Array.isArray(sig)) {
    return res.status(400).send('Missing Stripe signature');
  }

  let event: Stripe.Event;

  try {
    const rawBody = await readRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send('Webhook signature verification failed');
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      await processCheckoutSessionCompleted(session.id);
    } else if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await processPaymentIntentSucceeded(paymentIntent.id);
    }
  } catch (err) {
    console.error('Webhook processing error:', err);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }

  return res.status(200).json({ received: true });
}
