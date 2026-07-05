import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { getShippingPreset } from '../../lib/shipping-weights';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

function verifySecret(req: NextApiRequest): boolean {
  const configuredSecret = process.env.PRINT_QUEUE_SECRET || process.env.PRINT_SLIP_TOKEN;
  if (!configuredSecret) return false;
  const secret = Array.isArray(req.query.secret) ? req.query.secret[0] : req.query.secret;
  return secret === configuredSecret;
}

function csv(value: unknown): string {
  const normalized = String(value ?? '').replace(/\r?\n/g, ' ').trim();
  return `"${normalized.replace(/"/g, '""')}"`;
}

function splitWeight(weightLbs: number) {
  const pounds = Math.floor(weightLbs);
  const ounces = Math.round((weightLbs - pounds) * 16);
  return { pounds, ounces };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).send('Method not allowed');
  }

  if (!verifySecret(req)) {
    return res.status(401).send('Unauthorized');
  }

  const limitParam = Array.isArray(req.query.limit) ? req.query.limit[0] : req.query.limit;
  const limit = Math.min(100, Math.max(1, Number(limitParam || 50)));

  try {
    const sessions = await stripe.checkout.sessions.list({
      limit,
      expand: ['data.line_items'],
    });

    const header = [
      'Name',
      'Address 1',
      'Address 2',
      'City',
      'State',
      'Zip',
      'Country',
      'Email',
      'Phone',
      'Order ID',
      'Item',
      'SKU',
      'Quantity',
      'Weight Pounds',
      'Weight Ounces',
      'Length',
      'Width',
      'Height',
    ];

    const rows = sessions.data
      .filter((session) => session.payment_status === 'paid')
      .flatMap((session) => {
        const metadata = session.metadata || {};
        const customer = session.customer_details;
        const shipping = session.shipping_details;
        const address = shipping?.address || customer?.address;
        const name = shipping?.name || customer?.name || '';
        const email = customer?.email || session.customer_email || '';
        const phone = customer?.phone || '';
        const lineItems = session.line_items?.data?.filter((item) => !item.description?.toLowerCase().includes('shipping')) || [];
        const printableLineItems = lineItems.length > 0 ? lineItems : [undefined];

        return printableLineItems.map((item) => {
          const itemName = item?.description || metadata.productName || metadata.product_name || 'Nature’s Way Soil Product';
          const sizeName = metadata.sizeName || metadata.size_name || '';
          const sku = metadata.sku || '';
          const quantity = item?.quantity || Number(metadata.quantity || 1);
          const preset = getShippingPreset(sizeName, sku, itemName);
          const totalWeight = preset.weightLbs * Math.max(1, quantity || 1);
          const { pounds, ounces } = splitWeight(totalWeight);

          return [
            name,
            address?.line1 || '',
            address?.line2 || '',
            address?.city || '',
            address?.state || '',
            address?.postal_code || '',
            address?.country || 'US',
            email,
            phone,
            session.id,
            sizeName ? `${itemName} - ${sizeName}` : itemName,
            sku,
            quantity,
            pounds,
            ounces,
            preset.lengthIn || '',
            preset.widthIn || '',
            preset.heightIn || '',
          ].map(csv).join(',');
        });
      });

    const csvBody = [header.map(csv).join(','), ...rows].join('\n');
    const date = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="pirate-ship-orders-${date}.csv"`);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(csvBody);
  } catch (error) {
    console.error('Pirate Ship CSV export failed:', error);
    return res.status(500).send('Unable to export Pirate Ship CSV');
  }
}
