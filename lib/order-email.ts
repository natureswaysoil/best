import { Resend } from 'resend';

export interface OrderEmailItem {
  name: string;
  sku?: string;
  quantity: number;
  unitPrice?: number;
}

export interface OrderEmailData {
  orderNumber: string;
  paymentIntentId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country?: string;
  };
  items: OrderEmailItem[];
  subtotal?: number;
  shipping?: number;
  tax?: number;
  discount?: number;
  total?: number;
  packingSlipUrl?: string;
}

const money = (value?: number) =>
  typeof value === 'number' && Number.isFinite(value)
    ? value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    : '—';

const safe = (value?: string | null) => value || '';

const addressText = (order: OrderEmailData) =>
  [
    order.shippingAddress.line1,
    order.shippingAddress.line2,
    `${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}`,
    order.shippingAddress.country || 'US',
  ]
    .filter(Boolean)
    .join('\n');

const itemRows = (items: OrderEmailItem[]) =>
  items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${safe(item.name)}</td>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${safe(item.sku)}</td>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right;">${money(item.unitPrice)}</td>
        </tr>`,
    )
    .join('');

export function buildOrderNotificationHtml(order: OrderEmailData) {
  const printButton = order.packingSlipUrl
    ? `<p><a href="${order.packingSlipUrl}" style="background:#14532d;color:white;padding:12px 18px;border-radius:8px;text-decoration:none;display:inline-block;font-weight:700;">Print Packing Slip</a></p>`
    : '';

  return `
    <div style="font-family:Arial,sans-serif;color:#172019;line-height:1.5;max-width:720px;margin:0 auto;">
      <h1 style="color:#14532d;margin-bottom:4px;">New Website Order</h1>
      <p style="margin-top:0;color:#4b5563;">Nature's Way Soil order paid successfully.</p>
      ${printButton}

      <h2 style="font-size:18px;color:#14532d;border-bottom:2px solid #d1fae5;padding-bottom:6px;">Order Details</h2>
      <p><strong>Order #:</strong> ${order.orderNumber}<br />
      <strong>Stripe PaymentIntent:</strong> ${order.paymentIntentId}<br />
      <strong>Total Paid:</strong> ${money(order.total)}</p>

      <h2 style="font-size:18px;color:#14532d;border-bottom:2px solid #d1fae5;padding-bottom:6px;">Customer</h2>
      <p><strong>${safe(order.customerName)}</strong><br />
      ${safe(order.customerEmail)}<br />
      ${safe(order.customerPhone)}</p>

      <h2 style="font-size:18px;color:#14532d;border-bottom:2px solid #d1fae5;padding-bottom:6px;">Ship To</h2>
      <pre style="font-family:Arial,sans-serif;background:#f9fafb;border:1px solid #e5e7eb;padding:12px;border-radius:8px;white-space:pre-wrap;">${addressText(order)}</pre>

      <h2 style="font-size:18px;color:#14532d;border-bottom:2px solid #d1fae5;padding-bottom:6px;">Items</h2>
      <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;">
        <thead>
          <tr style="background:#f3f4f6;">
            <th style="padding:8px;text-align:left;">Product</th>
            <th style="padding:8px;text-align:left;">SKU</th>
            <th style="padding:8px;text-align:center;">Qty</th>
            <th style="padding:8px;text-align:right;">Each</th>
          </tr>
        </thead>
        <tbody>${itemRows(order.items)}</tbody>
      </table>

      <p style="text-align:right;margin-top:16px;">
        Subtotal: ${money(order.subtotal)}<br />
        Discount: ${money(order.discount)}<br />
        Shipping: ${money(order.shipping)}<br />
        Tax: ${money(order.tax)}<br />
        <strong>Total: ${money(order.total)}</strong>
      </p>
    </div>`;
}

export async function sendOrderNotification(order: OrderEmailData) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ORDER_NOTIFICATION_EMAIL || process.env.NWS_ORDER_EMAIL;
  const from = process.env.ORDER_NOTIFICATION_FROM || 'Nature\'s Way Soil <orders@natureswaysoil.com>';

  if (!apiKey || !to) {
    console.warn('Order notification email skipped: RESEND_API_KEY or ORDER_NOTIFICATION_EMAIL is missing.');
    return { skipped: true };
  }

  const resend = new Resend(apiKey);
  return resend.emails.send({
    from,
    to,
    subject: `New Website Order ${order.orderNumber} - ${money(order.total)}`,
    html: buildOrderNotificationHtml(order),
  });
}
