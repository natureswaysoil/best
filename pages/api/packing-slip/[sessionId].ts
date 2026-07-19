import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function money(cents: number | null | undefined): string {
  return `$${((cents || 0) / 100).toFixed(2)}`;
}

function verifyToken(req: NextApiRequest): boolean {
  const configuredToken = process.env.PRINT_SLIP_TOKEN || process.env.PRINT_QUEUE_SECRET;
  if (!configuredToken) return true;
  const token = Array.isArray(req.query.token) ? req.query.token[0] : req.query.token;
  return token === configuredToken;
}

function addressLines(address?: Stripe.Address | null): string[] {
  if (!address) return [];
  return [
    address.line1 || '',
    address.line2 || '',
    [address.city, address.state, address.postal_code].filter(Boolean).join(', '),
    address.country || '',
  ].filter(Boolean);
}

interface SlipData {
  id: string;
  paymentId: string;
  paymentStatus: string;
  shippingName: string;
  shippingAddress: Stripe.Address | null;
  customerEmail: string;
  customerPhone: string;
  rows: Array<{ qty: number | string; sku: string; description: string; size: string; amountCents: number | null | undefined }>;
  subtotalCents: number | null | undefined;
  shippingCents: number | null | undefined;
  taxCents: number | null | undefined;
  totalCents: number | null | undefined;
}

// The site's real checkout flow creates a raw Stripe PaymentIntent (pi_...),
// not a Checkout Session (cs_...) - see pages/api/create-payment-intent.ts.
// This handler supports both so old/new links and any future Checkout usage
// keep working.
async function loadFromPaymentIntent(id: string): Promise<SlipData> {
  const paymentIntent = await stripe.paymentIntents.retrieve(id);
  const metadata = paymentIntent.metadata || {};
  const shippingAddress = paymentIntent.shipping?.address || null;

  return {
    id: paymentIntent.id,
    paymentId: paymentIntent.id,
    paymentStatus: paymentIntent.status,
    shippingName: paymentIntent.shipping?.name || 'Customer',
    shippingAddress,
    customerEmail: paymentIntent.receipt_email || '',
    customerPhone: paymentIntent.shipping?.phone || '',
    rows: [{
      qty: metadata.quantity || 1,
      sku: metadata.sku || '',
      description: metadata.product_name || 'Nature’s Way Soil Product',
      size: metadata.size_name || '',
      amountCents: Number(metadata.subtotal_cents || paymentIntent.amount || 0),
    }],
    subtotalCents: Number(metadata.subtotal_cents || 0),
    shippingCents: Number(metadata.shipping_cents || 0),
    taxCents: Number(metadata.tax_cents || 0),
    totalCents: paymentIntent.amount,
  };
}

async function loadFromCheckoutSession(id: string): Promise<SlipData> {
  const session = await stripe.checkout.sessions.retrieve(id, {
    expand: ['line_items.data.price.product'],
  });
  const metadata = session.metadata || {};
  const lineItems = session.line_items?.data || [];
  const shippingAddress = session.shipping_details?.address || session.customer_details?.address || null;
  const paymentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.id;

  const rows = lineItems.length > 0
    ? lineItems.map((item) => {
        const isShipping = item.description?.toLowerCase().includes('shipping');
        return {
          qty: item.quantity || 1,
          sku: isShipping ? 'shipping' : (metadata.sku || ''),
          description: item.description || metadata.productName || metadata.product_name || 'Nature’s Way Soil Product',
          size: isShipping ? '' : (metadata.sizeName || metadata.size_name || ''),
          amountCents: item.amount_subtotal,
        };
      })
    : [{
        qty: metadata.quantity || 1,
        sku: metadata.sku || '',
        description: metadata.productName || metadata.product_name || 'Nature’s Way Soil Product',
        size: metadata.sizeName || metadata.size_name || '',
        amountCents: session.amount_subtotal,
      }];

  return {
    id: session.id,
    paymentId,
    paymentStatus: session.payment_status,
    shippingName: session.shipping_details?.name || session.customer_details?.name || 'Customer',
    shippingAddress,
    customerEmail: session.customer_details?.email || session.customer_email || '',
    customerPhone: session.customer_details?.phone || '',
    rows,
    subtotalCents: session.amount_subtotal,
    shippingCents: session.total_details?.amount_shipping,
    taxCents: session.total_details?.amount_tax,
    totalCents: session.amount_total,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).send('Method Not Allowed');
  }

  if (!verifyToken(req)) {
    return res.status(401).send('Unauthorized');
  }

  const rawId = Array.isArray(req.query.sessionId) ? req.query.sessionId[0] : req.query.sessionId;
  if (!rawId || (!rawId.startsWith('cs_') && !rawId.startsWith('pi_'))) {
    return res.status(400).send('Missing or invalid Stripe order ID (expected a cs_... or pi_... ID)');
  }

  try {
    const data = rawId.startsWith('pi_')
      ? await loadFromPaymentIntent(rawId)
      : await loadFromCheckoutSession(rawId);

    const today = new Date().toLocaleDateString('en-US');
    const autoPrint = req.query.auto === '1';

    const rowsHtml = data.rows.map((item) => `
      <tr>
        <td>${escapeHtml(item.qty)}</td>
        <td>${escapeHtml(item.sku)}</td>
        <td>${escapeHtml(item.description)}</td>
        <td>${escapeHtml(item.size)}</td>
        <td class="right">${money(item.amountCents)}</td>
      </tr>
    `).join('');

    const addressBlock = addressLines(data.shippingAddress)
      .map((line) => `<div>${escapeHtml(line)}</div>`)
      .join('') || '<div>See Stripe order details</div>';

    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="robots" content="noindex" />
  <title>Packing Slip ${escapeHtml(data.id)}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Arial, sans-serif; color: #111827; margin: 0; padding: 24px; background: #f3f4f6; }
    .page { max-width: 900px; margin: 0 auto; background: white; padding: 32px; border: 1px solid #d1d5db; }
    .toolbar { max-width: 900px; margin: 0 auto 16px; display: flex; gap: 10px; }
    button { background: #2d5016; color: white; border: 0; padding: 10px 16px; border-radius: 6px; font-weight: 700; cursor: pointer; }
    header { display: flex; justify-content: space-between; gap: 24px; border-bottom: 2px solid #111827; padding-bottom: 18px; margin-bottom: 24px; }
    h1 { margin: 0; font-size: 30px; }
    h2 { margin: 0 0 10px; font-size: 17px; }
    .muted { color: #4b5563; font-size: 13px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; margin-bottom: 24px; }
    .box { border: 1px solid #d1d5db; padding: 16px; min-height: 150px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { border-bottom: 2px solid #111827; text-align: left; padding: 9px; }
    td { border-bottom: 1px solid #e5e7eb; padding: 9px; vertical-align: top; }
    .right { text-align: right; }
    .totals { margin-left: auto; max-width: 320px; }
    .totals div { display: flex; justify-content: space-between; padding: 5px 0; }
    .total { border-top: 2px solid #111827; font-size: 18px; font-weight: 800; margin-top: 6px; padding-top: 10px !important; }
    .checklist { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; border-top: 1px solid #d1d5db; padding-top: 20px; margin-top: 28px; font-size: 14px; }
    label { display: block; margin: 7px 0; }
    @media print {
      body { background: white; padding: 0; }
      .toolbar { display: none; }
      .page { border: 0; max-width: none; padding: 0.25in; }
      @page { margin: 0.35in; }
    }
  </style>
</head>
<body>
  <div class="toolbar"><button onclick="window.print()">Print Packing Slip</button></div>
  <main class="page">
    <header>
      <div>
        <h1>Nature&apos;s Way Soil</h1>
        <div class="muted">Packing Slip / Shipping Invoice</div>
        <div class="muted">natureswaysoil.com</div>
        <div class="muted">support@natureswaysoil.com</div>
      </div>
      <div class="muted" style="text-align:right;line-height:1.6;">
        <div><strong>Date:</strong> ${escapeHtml(today)}</div>
        <div><strong>Order ID:</strong> ${escapeHtml(data.id)}</div>
        <div><strong>Payment:</strong> ${escapeHtml(data.paymentId)}</div>
        <div><strong>Status:</strong> ${escapeHtml(data.paymentStatus)}</div>
      </div>
    </header>

    <section class="grid">
      <div class="box">
        <h2>Ship To</h2>
        <strong>${escapeHtml(data.shippingName)}</strong>
        ${addressBlock}
        ${data.customerPhone ? `<div style="margin-top:8px;">Phone: ${escapeHtml(data.customerPhone)}</div>` : ''}
        ${data.customerEmail ? `<div>Email: ${escapeHtml(data.customerEmail)}</div>` : ''}
      </div>
      <div class="box">
        <h2>Seller</h2>
        <strong>Nature&apos;s Way Soil &amp; Vermicompost LLC</strong>
        <div>Family Farm Soil Products</div>
        <div>United States</div>
        <p class="muted">Pack carefully. Check cap tightness and leakage before shipping.</p>
      </div>
    </section>

    <table>
      <thead>
        <tr><th>Qty</th><th>SKU</th><th>Product</th><th>Size</th><th class="right">Line Total</th></tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>

    <section class="totals">
      <div><span>Subtotal</span><span>${money(data.subtotalCents)}</span></div>
      <div><span>Shipping</span><span>${money(data.shippingCents)}</span></div>
      <div><span>Tax</span><span>${money(data.taxCents)}</span></div>
      <div class="total"><span>Total Paid</span><span>${money(data.totalCents)}</span></div>
    </section>

    <section class="checklist">
      <div>
        <h2>Packing Checklist</h2>
        <label><input type="checkbox" /> Correct product and size</label>
        <label><input type="checkbox" /> Cap tightened</label>
        <label><input type="checkbox" /> Seal/leak check complete</label>
        <label><input type="checkbox" /> Label readable</label>
      </div>
      <div>
        <h2>Shipping Notes</h2>
        <p>Use approved liquid shipping box/liner when applicable. Add padding to prevent cap damage.</p>
      </div>
      <div>
        <h2>Tracking</h2>
        <p>Carrier: ____________________</p>
        <p>Tracking #: _________________</p>
      </div>
    </section>
  </main>
  ${autoPrint ? '<script>window.addEventListener("load", () => setTimeout(() => window.print(), 500));</script>' : ''}
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(html);
  } catch (error) {
    console.error('Packing slip generation failed:', error);
    return res.status(500).send('Unable to generate packing slip');
  }
}
