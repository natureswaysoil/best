import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

function verifyQueueSecret(req: NextApiRequest): boolean {
  const configuredSecret = process.env.PRINT_QUEUE_SECRET || process.env.PRINT_SLIP_TOKEN;
  if (!configuredSecret) return false;
  const secret = Array.isArray(req.query.secret) ? req.query.secret[0] : req.query.secret;
  return secret === configuredSecret;
}

function getSiteUrl(req: NextApiRequest): string {
  return process.env.NEXT_PUBLIC_SITE_URL || `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!verifyQueueSecret(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const limitParam = Array.isArray(req.query.limit) ? req.query.limit[0] : req.query.limit;
  const limit = Math.min(50, Math.max(1, Number(limitParam || 20)));
  const siteUrl = getSiteUrl(req);
  const token = process.env.PRINT_SLIP_TOKEN || process.env.PRINT_QUEUE_SECRET || '';

  try {
    const [sessions, paymentIntents] = await Promise.all([stripe.checkout.sessions.list({
      limit,
      expand: ['data.line_items'],
    }), stripe.paymentIntents.list({ limit })]);

    const sessionOrders = sessions.data
      .filter((session) => session.payment_status === 'paid')
      .map((session) => {
        const metadata = session.metadata || {};
        const firstLine = session.line_items?.data?.[0];
        const printableUrl = `${siteUrl}/api/packing-slip/${session.id}?token=${encodeURIComponent(token)}&auto=1`;
        return {
          sessionId: session.id,
          paymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : null,
          created: session.created,
          customerName: session.customer_details?.name || session.shipping_details?.name || null,
          customerEmail: session.customer_details?.email || session.customer_email || null,
          productName: metadata.productName || metadata.product_name || firstLine?.description || 'Nature’s Way Soil Product',
          sizeName: metadata.sizeName || metadata.size_name || '',
          sku: metadata.sku || '',
          quantity: firstLine?.quantity || Number(metadata.quantity || 1),
          amountTotal: (session.amount_total || 0) / 100,
          printableUrl,
        };
      });

    const sessionPaymentIds = new Set(sessionOrders.map((order) => order.paymentIntentId).filter(Boolean));
    const paymentOrders = paymentIntents.data
      .filter((pi) => pi.status === 'succeeded' && !sessionPaymentIds.has(pi.id))
      .map((pi) => {
        const metadata = pi.metadata || {};
        const printableUrl = `${siteUrl}/api/packing-slip/payment/${pi.id}?token=${encodeURIComponent(token)}&auto=1`;
        return {
          sessionId: pi.id,
          paymentIntentId: pi.id,
          created: pi.created,
          customerName: pi.shipping?.name || null,
          customerEmail: pi.receipt_email || null,
          productName: metadata.product_name || pi.description || 'Nature’s Way Soil Product',
          sizeName: metadata.size_name || '',
          sku: metadata.sku || '',
          quantity: Number(metadata.quantity || 1),
          amountTotal: (pi.amount_received || pi.amount || 0) / 100,
          printableUrl,
        };
      });

    const orders = [...sessionOrders, ...paymentOrders]
      .sort((a, b) => b.created - a.created)
      .slice(0, limit);

    return res.status(200).json({ orders });
  } catch (error) {
    console.error('Print queue failed:', error);
    return res.status(500).json({ error: 'Unable to load print queue' });
  }
}
