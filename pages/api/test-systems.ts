/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';
import { getServiceSupabase } from '../../lib/supabase';

const TEST_SECRET = 'nws-test-2026';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Allow GET or POST, check secret in query or header
  const secret = req.query.secret || req.headers['x-test-secret'];
  if (secret !== TEST_SECRET) {
    return res.status(401).json({ error: 'Unauthorized — add ?secret=nws-test-2026 to the URL' });
  }

  // CORS headers so browser console works
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');

  const results: any = { timestamp: new Date().toISOString(), env: {}, email: {}, supabase: {} };

  // 1. Check env vars
  results.env = {
    RESEND_API_KEY: process.env.RESEND_API_KEY ? '✅ set' : '❌ MISSING',
    RESEND_FROM: process.env.RESEND_FROM || '(not set — using default)',
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder') ? '✅ set' : '❌ MISSING/placeholder',
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? (process.env.SUPABASE_SERVICE_ROLE_KEY.includes('placeholder') ? '❌ still placeholder' : `✅ set (starts: ${process.env.SUPABASE_SERVICE_ROLE_KEY.slice(0,12)}...)`) : '❌ NOT SET — variable missing entirely',
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ? '✅ set' : '❌ MISSING',
  };

  // 2. Send real test emails
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const from = "Nature's Way Soil <no-reply@natureswaysoil.com>";
    const html = `
      <h2 style="color:#2d5016;">🧪 Email System Test</h2>
      <p>This is a live test from Nature's Way Soil order notification system.</p>
      <table style="font-size:15px;line-height:1.8;border-collapse:collapse;">
        <tr><td style="padding:4px 12px 4px 0"><strong>Customer:</strong></td><td>Test Customer</td></tr>
        <tr><td style="padding:4px 12px 4px 0"><strong>Product:</strong></td><td>Bio-Active Fertilizer — 1 Gallon</td></tr>
        <tr><td style="padding:4px 12px 4px 0"><strong>Total:</strong></td><td><strong>$50.99</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0"><strong>Ship to:</strong></td><td>123 Test St, Snow Hill NC 28580</td></tr>
      </table>
      <p style="color:#666;font-size:13px;margin-top:16px;">✅ If you received this, order notifications are working correctly.</p>
    `;

    for (const [key, addr] of [
      ['natureswaysoil', 'natureswaysoil@natureswaysoil.com'],
      ['james', 'james@natureswaysoil.com'],
      ['sales', 'sales@natureswaysoil.com'],
    ]) {
      try {
        const r = await resend.emails.send({
          from,
          to: addr as string,
          subject: '🧪 TEST: New Order Notification — System Check',
          html,
        });
        results.email[key] = r.error ? `❌ ${r.error.message}` : `✅ Delivered (id: ${r.data?.id})`;
      } catch (e: any) {
        results.email[key] = `❌ ${e.message}`;
      }
      await new Promise(resolve => setTimeout(resolve, 600));
    }
  } else {
    results.email = { error: '❌ RESEND_API_KEY not set on Vercel — no emails sent' };
  }

  // 3. Test Supabase + show recent orders
  try {
    const supabase = getServiceSupabase();
    const { data, error, count } = await supabase
      .from('orders')
      .select('id, total, tax, shipping_city, shipping_state, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      results.supabase.orders = `❌ ${error.message} (code: ${error.code})`;
    } else {
      results.supabase.connection = '✅ Connected';
      results.supabase.total_orders = count;
      results.supabase.recent_orders = data?.map(o => ({
        id: o.id?.slice(0, 8) + '...',
        email: o.email,
        name: o.name,
        total: `$${o.total}`,
        status: o.status,
        date: o.created_at?.slice(0, 10),
      }));
    }
  } catch (e: any) {
    results.supabase.connection = `❌ Failed: ${e.message}`;
  }

  // Return as pretty HTML if browser, JSON otherwise
  const acceptsHtml = req.headers.accept?.includes('text/html');
  if (acceptsHtml) {
    const html = `<!DOCTYPE html><html><head><title>NWS System Test</title>
    <style>body{font-family:monospace;padding:20px;background:#f5f5f5}
    pre{background:white;padding:20px;border-radius:8px;border:1px solid #ddd;font-size:14px;line-height:1.6;white-space:pre-wrap}
    h2{color:#2d5016}</style></head><body>
    <h2>🌱 Nature's Way Soil — System Diagnostic</h2>
    <pre>${JSON.stringify(results, null, 2)}</pre>
    </body></html>`;
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);
  }

  return res.status(200).json(results);
}

// This won't append correctly, use view first
