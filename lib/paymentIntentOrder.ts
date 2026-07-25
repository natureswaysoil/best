import Stripe from 'stripe';
import { Resend } from 'resend';

const DEFAULT_RECIPIENT = 'natureswaysoil@gmail.com';

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function money(cents: number | null | undefined): string {
  return `$${((cents || 0) / 100).toFixed(2)}`;
}

export function paymentIntentPackingSlipUrl(paymentIntentId: string): string {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://natureswaysoil.com').replace(/\/$/, '');
  const token = process.env.PRINT_SLIP_TOKEN || process.env.PRINT_QUEUE_SECRET || '';
  return `${siteUrl}/api/packing-slip/payment/${encodeURIComponent(paymentIntentId)}${
    token ? `?token=${encodeURIComponent(token)}` : ''
  }`;
}

function addressHtml(address: Stripe.Address | null | undefined): string {
  if (!address) return 'See Stripe payment details';
  return [
    address.line1,
    address.line2,
    [address.city, address.state, address.postal_code].filter(Boolean).join(', '),
    address.country,
  ].filter(Boolean).map(escapeHtml).join('<br>');
}

export async function sendPaymentIntentOrderNotification(
  paymentIntent: Stripe.PaymentIntent,
  stripeEventId: string,
) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  const metadata = paymentIntent.metadata || {};
  const customerName = paymentIntent.shipping?.name || 'Customer';
  const customerEmail = paymentIntent.receipt_email || '';
  const productName = metadata.product_name || paymentIntent.description || 'Nature’s Way Soil Product';
  const sizeName = metadata.size_name || '';
  const quantity = Number(metadata.quantity || 1);
  const sku = metadata.sku || '';
  const packingSlipUrl = paymentIntentPackingSlipUrl(paymentIntent.id);
  const recipient = process.env.ORDER_NOTIFICATION_EMAIL || DEFAULT_RECIPIENT;
  const from = process.env.RESEND_FROM || "Nature's Way Soil <no-reply@natureswaysoil.com>";
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { data, error } = await resend.emails.send({
    from,
    to: [recipient],
    replyTo: customerEmail || undefined,
    subject: `New website order — ${money(paymentIntent.amount_received || paymentIntent.amount)} — ${customerName}`,
    html: `
      <h2 style="color:#2d5016">New Website Order</h2>
      <table style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;border-collapse:collapse">
        <tr><td><strong>Customer:</strong></td><td>${escapeHtml(customerName)}</td></tr>
        <tr><td><strong>Email:</strong></td><td>${escapeHtml(customerEmail || 'N/A')}</td></tr>
        <tr><td><strong>Product:</strong></td><td>${escapeHtml(productName)}${sizeName ? ` — ${escapeHtml(sizeName)}` : ''}</td></tr>
        <tr><td><strong>SKU:</strong></td><td>${escapeHtml(sku || 'N/A')}</td></tr>
        <tr><td><strong>Quantity:</strong></td><td>${escapeHtml(quantity)}</td></tr>
        <tr><td><strong>Total:</strong></td><td><strong>${money(paymentIntent.amount_received || paymentIntent.amount)}</strong></td></tr>
        <tr><td><strong>Payment:</strong></td><td>${escapeHtml(paymentIntent.id)}</td></tr>
        <tr><td style="vertical-align:top"><strong>Ship to:</strong></td><td>${addressHtml(paymentIntent.shipping?.address)}</td></tr>
      </table>
      <p style="margin-top:20px">
        <a href="${escapeHtml(packingSlipUrl)}" style="background:#2d5016;color:white;padding:10px 20px;text-decoration:none;border-radius:4px">Open / Print Packing Slip</a>
        &nbsp;
        <a href="https://dashboard.stripe.com/payments/${encodeURIComponent(paymentIntent.id)}" style="background:#111827;color:white;padding:10px 20px;text-decoration:none;border-radius:4px">View in Stripe</a>
      </p>
    `,
  }, { idempotencyKey: `stripe-order/${stripeEventId}` });

  if (error) throw error;
  return data;
}
