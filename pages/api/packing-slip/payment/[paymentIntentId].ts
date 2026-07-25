import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { escapeHtml, money } from '../../../../lib/paymentIntentOrder';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });

function authorized(req: NextApiRequest): boolean {
  const expected = process.env.PRINT_SLIP_TOKEN || process.env.PRINT_QUEUE_SECRET;
  if (!expected) return false;
  const supplied = Array.isArray(req.query.token) ? req.query.token[0] : req.query.token;
  return supplied === expected;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');
  if (!authorized(req)) return res.status(401).send('Unauthorized');
  const id = Array.isArray(req.query.paymentIntentId) ? req.query.paymentIntentId[0] : req.query.paymentIntentId;
  if (!id?.startsWith('pi_')) return res.status(400).send('Invalid payment ID');

  try {
    const pi = await stripe.paymentIntents.retrieve(id);
    const metadata = pi.metadata || {};
    const address = pi.shipping?.address;
    const addressLines = address ? [address.line1, address.line2, [address.city, address.state, address.postal_code].filter(Boolean).join(', '), address.country].filter(Boolean) : [];
    const autoPrint = req.query.auto === '1';
    const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Packing Slip ${escapeHtml(pi.id)}</title><style>
      *{box-sizing:border-box}body{font-family:Arial,sans-serif;margin:0;padding:24px;background:#f3f4f6;color:#111827}.toolbar,.page{max-width:850px;margin:0 auto}.toolbar{margin-bottom:14px}button{background:#2d5016;color:#fff;border:0;padding:10px 16px;border-radius:5px;font-weight:700}.page{background:#fff;border:1px solid #d1d5db;padding:32px}header{display:flex;justify-content:space-between;border-bottom:2px solid #111827;padding-bottom:18px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin:24px 0}.box{border:1px solid #d1d5db;padding:16px}table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:10px;border-bottom:1px solid #d1d5db}.right{text-align:right}.check{margin-top:30px;border-top:1px solid #d1d5db;padding-top:18px}@media print{body{background:#fff;padding:0}.toolbar{display:none}.page{border:0;max-width:none;padding:.25in}@page{margin:.35in}}
    </style></head><body><div class="toolbar"><button onclick="window.print()">Print Packing Slip</button></div><main class="page">
      <header><div><h1>Nature's Way Soil</h1><div>Packing Slip</div><div>natureswaysoil.com</div></div><div><strong>Payment:</strong> ${escapeHtml(pi.id)}<br><strong>Status:</strong> ${escapeHtml(pi.status)}</div></header>
      <section class="grid"><div class="box"><h2>Ship To</h2><strong>${escapeHtml(pi.shipping?.name || 'Customer')}</strong>${addressLines.map(line => `<div>${escapeHtml(line)}</div>`).join('') || '<div>See Stripe order details</div>'}${pi.receipt_email ? `<div>${escapeHtml(pi.receipt_email)}</div>` : ''}</div><div class="box"><h2>Seller</h2><strong>Nature's Way Soil &amp; Vermicompost LLC</strong><p>Pack carefully and verify the product, size, seal, and label.</p></div></section>
      <table><thead><tr><th>Qty</th><th>SKU</th><th>Product</th><th>Size</th><th class="right">Total</th></tr></thead><tbody><tr><td>${escapeHtml(metadata.quantity || 1)}</td><td>${escapeHtml(metadata.sku || '')}</td><td>${escapeHtml(metadata.product_name || pi.description || 'Nature’s Way Soil Product')}</td><td>${escapeHtml(metadata.size_name || '')}</td><td class="right">${money(pi.amount_received || pi.amount)}</td></tr></tbody></table>
      <div class="check"><h2>Packing Checklist</h2><p>☐ Correct product and size &nbsp; ☐ Cap tightened &nbsp; ☐ Seal/leak checked &nbsp; ☐ Label readable</p><p>Carrier: ____________________ &nbsp; Tracking #: ____________________</p></div>
    </main>${autoPrint ? '<script>addEventListener("load",()=>setTimeout(()=>print(),500))</script>' : ''}</body></html>`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'private, no-store');
    return res.status(200).send(html);
  } catch (error) {
    console.error('Payment packing slip failed:', error);
    return res.status(500).send('Unable to generate packing slip');
  }
}
