/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';
import { getServiceSupabase } from '../../lib/supabase';

const TEST_SECRET = process.env.TEST_SECRET || 'nws-test-2026';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  if (req.headers['x-test-secret'] !== TEST_SECRET) return res.status(401).json({ error: 'Unauthorized' });

  const results: any = { timestamp: new Date().toISOString(), env: {}, email: {}, supabase: {} };

  results.env = {
    RESEND_API_KEY: process.env.RESEND_API_KEY ? '✅ set' : '❌ MISSING',
    RESEND_FROM: process.env.RESEND_FROM || '(not set)',
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder') ? '✅ set' : '❌ MISSING',
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY.includes('placeholder') ? '✅ set' : '❌ MISSING',
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? '✅ set' : '❌ MISSING',
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ? '✅ set' : '❌ MISSING',
  };

  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const from = process.env.RESEND_FROM || "Nature's Way Soil <no-reply@natureswaysoil.com>";
    const html = `
      <h2 style="color:#2d5016;">🧪 Email Test — System Verification</h2>
      <p>This is a live test from the Nature's Way Soil order notification system.</p>
      <table style="font-size:15px;line-height:1.8;">
        <tr><td><strong>Customer:</strong></td><td>Test Customer</td></tr>
        <tr><td><strong>Product:</strong></td><td>Bio-Active Fertilizer — 1 Gallon</td></tr>
        <tr><td><strong>Total:</strong></td><td><strong>$50.99</strong></td></tr>
        <tr><td><strong>Ship to:</strong></td><td>123 Test St, Snow Hill NC 28580</td></tr>
      </table>
      <p style="color:#666;font-size:13px;margin-top:16px;">✅ If you received this, order notifications are working.</p>
    `;

    for (const [key, addr] of [['james', 'james@natureswaysoil.com'], ['sales', 'sales@natureswaysoil.com'], ['gmail', 'natureswaysoil@gmail.com']]) {
      try {
        const r = await resend.emails.send({ from, to: addr, subject: '🧪 TEST: Order Notification — System Check', html });
        results.email[key] = r.error ? `❌ ${r.error.message}` : `✅ Delivered (id: ${r.data?.id})`;
      } catch (e: any) {
        results.email[key] = `❌ ${e.message}`;
      }
    }
  } else {
    results.email = { error: '❌ RESEND_API_KEY not configured' };
  }

  try {
    const supabase = getServiceSupabase();
    const { data, error, count } = await supabase
      .from('orders')
      .select('id, email, total, status, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      results.supabase.orders = `❌ ${error.message} (code: ${error.code})`;
    } else {
      results.supabase.orders = { status: '✅ Connected', total_orders: count, recent: data };
    }
  } catch (e: any) {
    results.supabase.orders = `❌ ${e.message}`;
  }

  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from('order_items')
      .select('id, order_id, sku, qty, price, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    results.supabase.order_items = error ? `❌ ${error.message}` : (data?.length ? `✅ ${data.length} items` : '⚠️ Table empty');
    if (data?.length) results.supabase.recent_items = data;
  } catch (e: any) {
    results.supabase.order_items = `❌ ${e.message}`;
  }

  return res.status(200).json(results);
}
