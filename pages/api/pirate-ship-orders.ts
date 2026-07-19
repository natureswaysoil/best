import type { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '../../lib/supabase';
import { getShippingPreset } from '../../lib/shipping-weights';

function normalizeSecret(value: unknown): string {
  return String(value || '').trim();
}

function verifySecret(req: NextApiRequest): boolean {
  const allowedSecrets = [
    process.env.PRINT_QUEUE_SECRET,
    process.env.PRINT_SLIP_TOKEN,
  ].map(normalizeSecret).filter(Boolean);

  const secret = normalizeSecret(Array.isArray(req.query.secret) ? req.query.secret[0] : req.query.secret);
  return Boolean(secret && allowedSecrets.includes(secret));
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

interface OrderRow {
  id: string;
  pi_id: string | null;
  name: string | null;
  email: string | null;
  shipping_address1: string | null;
  shipping_address2: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_zip: string | null;
  shipping_phone: string | null;
}

interface OrderItemRow {
  order_id: string;
  sku: string | null;
  qty: number | null;
  price: number | null;
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
  const limit = Math.min(200, Math.max(1, Number(limitParam || 50)));

  try {
    const supabase = getServiceSupabase();

    // Source of truth is Supabase, not Stripe Checkout Sessions - the site's
    // real checkout flow (pages/api/create-payment-intent.ts) creates raw
    // PaymentIntents, so most paid orders never had a Checkout Session at
    // all. Every paid order (either flow) lands in `orders` via the webhook.
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, pi_id, name, email, shipping_address1, shipping_address2, shipping_city, shipping_state, shipping_zip, shipping_phone')
      .eq('status', 'paid')
      .order('created_at', { ascending: false })
      .limit(limit) as { data: OrderRow[] | null; error: unknown };

    if (ordersError) {
      console.error('Pirate Ship CSV: failed to load orders:', ordersError);
      return res.status(500).send('Unable to export Pirate Ship CSV');
    }

    const orderIds = (orders || []).map((o) => o.id);
    const itemsByOrder = new Map<string, OrderItemRow[]>();

    if (orderIds.length > 0) {
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('order_id, sku, qty, price')
        .in('order_id', orderIds) as { data: OrderItemRow[] | null; error: unknown };

      if (itemsError) {
        console.error('Pirate Ship CSV: failed to load order_items:', itemsError);
      } else {
        for (const item of items || []) {
          const list = itemsByOrder.get(item.order_id) || [];
          list.push(item);
          itemsByOrder.set(item.order_id, list);
        }
      }
    }

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

    const rows = (orders || []).flatMap((order) => {
      const items = itemsByOrder.get(order.id) || [];
      const printableItems = items.length > 0 ? items : [null];

      return printableItems.map((item) => {
        const sku = item?.sku || '';
        const quantity = item?.qty || 1;
        const preset = getShippingPreset('', sku, sku);
        const totalWeight = preset.weightLbs * Math.max(1, quantity);
        const { pounds, ounces } = splitWeight(totalWeight);

        return [
          order.name || '',
          order.shipping_address1 || '',
          order.shipping_address2 || '',
          order.shipping_city || '',
          order.shipping_state || '',
          order.shipping_zip || '',
          'US',
          order.email || '',
          order.shipping_phone || '',
          order.pi_id || order.id,
          sku || 'Nature\u2019s Way Soil Product',
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
