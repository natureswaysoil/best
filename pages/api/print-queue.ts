import type { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '../../lib/supabase';

function verifyQueueSecret(req: NextApiRequest): boolean {
  const configuredSecret = process.env.PRINT_QUEUE_SECRET || process.env.PRINT_SLIP_TOKEN;
  if (!configuredSecret) return false;
  const secret = Array.isArray(req.query.secret) ? req.query.secret[0] : req.query.secret;
  return secret === configuredSecret;
}

function getSiteUrl(req: NextApiRequest): string {
  return process.env.NEXT_PUBLIC_SITE_URL || `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}`;
}

interface OrderRow {
  id: string;
  pi_id: string | null;
  name: string | null;
  email: string | null;
  total: number | null;
  created_at: string | null;
}

interface OrderItemRow {
  order_id: string;
  sku: string | null;
  qty: number | null;
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
    const supabase = getServiceSupabase();

    // Source of truth is Supabase, not Stripe Checkout Sessions - see
    // pirate-ship-orders.ts for why (most orders are raw PaymentIntents,
    // never Checkout Sessions).
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, pi_id, name, email, total, created_at')
      .eq('status', 'paid')
      .order('created_at', { ascending: false })
      .limit(limit) as { data: OrderRow[] | null; error: unknown };

    if (ordersError) {
      console.error('Print queue: failed to load orders:', ordersError);
      return res.status(500).json({ error: 'Unable to load print queue' });
    }

    const orderIds = (orders || []).map((o) => o.id);
    const itemsByOrder = new Map<string, OrderItemRow[]>();

    if (orderIds.length > 0) {
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('order_id, sku, qty')
        .in('order_id', orderIds) as { data: OrderItemRow[] | null; error: unknown };

      if (itemsError) {
        console.error('Print queue: failed to load order_items:', itemsError);
      } else {
        for (const item of items || []) {
          const list = itemsByOrder.get(item.order_id) || [];
          list.push(item);
          itemsByOrder.set(item.order_id, list);
        }
      }
    }

    const result = (orders || []).map((order) => {
      const items = itemsByOrder.get(order.id) || [];
      const firstItem = items[0];
      const printId = order.pi_id || order.id;
      const printableUrl = `${siteUrl}/api/packing-slip/${printId}?token=${encodeURIComponent(token)}&auto=1`;

      return {
        orderId: order.id,
        paymentIntentId: order.pi_id,
        created: order.created_at,
        customerName: order.name || null,
        customerEmail: order.email || null,
        sku: firstItem?.sku || '',
        quantity: firstItem?.qty || 1,
        itemCount: items.length,
        amountTotal: order.total || 0,
        printableUrl,
      };
    });

    return res.status(200).json({ orders: result });
  } catch (error) {
    console.error('Print queue failed:', error);
    return res.status(500).json({ error: 'Unable to load print queue' });
  }
}
