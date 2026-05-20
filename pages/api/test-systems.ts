/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

const TEST_SECRET = process.env.NWS_TEST_SYSTEMS_SECRET;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!TEST_SECRET) {
    return res.status(503).json({ error: 'NWS_TEST_SYSTEMS_SECRET is not configured.' });
  }

  const secret = req.query.secret || req.headers['x-test-secret'];
  if (secret !== TEST_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');

  const results: any = { timestamp: new Date().toISOString(), env: {}, email: {}, supabase: {} };

  results.env = {
    RESEND_API_KEY: process.env.RESEND_API_KEY ? 'set' : 'MISSING',
    RESEND_FROM: process.env.RESEND_FROM || '(not set)',
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'MISSING',
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'set' : 'MISSING',
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ? 'set' : 'MISSING',
  };

  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const from = process.env.RESEND_FROM || "Nature's Way Soil <no-reply@natureswaysoil.com>";
    const html = `
      <h2 style="color:#2d5016;">Email System Test</h2>
      <p>This is a live test from Nature's Way Soil order notification system.</p>
      <table style="font-size:15px;line-height:1.8;border-collapse:collapse;">
        <tr><td style="padding:4px 12px 4px 0"><strong>Customer:</strong></td><td>Test Customer</td></tr>
        <tr><td style="padding:4px 12px 4px 0"><strong>Product:</strong></td><td>Bio-Active Fertilizer — 1 Gallon</td></tr>
        <tr><td style="padding:4px 12px 4px 0"><strong>Total:</strong></td><td><strong>$50.99</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0"><strong>Ship to:</strong></td><td>123 Test St, Snow Hill NC 28580</td></tr>
      </table>
      <p style="color:#666;font-size:13px;margin-top:16px;">If you received this, order notifications are working correctly.</p>
    `;

    const recipients = (process.env.NWS_TEST_EMAIL_RECIPIENTS || 'support@natureswaysoil.com')
      .split(',')
      .map((addr) => addr.trim())
      .filter(Boolean);

    for (const addr of recipients) {
      try {
        const r = await resend.emails.send({
          from,
          to: addr,
          subject: 'TEST: New Order Notification — System Check',
          html,
        });
        results.email[addr] = r.error ? `failed: ${r.error.message}` : `delivered: ${r.data?.id}`;
      } catch (e: any) {
        results.email[addr] = `failed: ${e.message}`;
      }
      await new Promise(resolve => setTimeout(resolve, 600));
    }
  } else {
    results.email = { error: 'RESEND_API_KEY is not set.' };
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      results.supabase.connection = 'Skipped: Supabase environment variables are missing.';
    } else {
      const resp = await fetch(`${supabaseUrl}/rest/v1/orders?select=id,total,created_at&order=created_at.desc&limit=5`, {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
        },
      });
      const text = await resp.text();
      if (resp.ok) {
        const data = JSON.parse(text);
        results.supabase.connection = 'Connected';
        results.supabase.status = resp.status;
        results.supabase.total_orders = data.length;
        results.supabase.recent_orders = data.map((o: any) => ({
          id: o.id?.slice(0, 8) + '...',
          total: `$${o.total}`,
          date: o.created_at?.slice(0, 10),
        }));
      } else {
        results.supabase.connection = `HTTP ${resp.status}`;
        results.supabase.error = text.slice(0, 300);
      }
    }
  } catch (e: any) {
    results.supabase.connection = `Fetch failed: ${e.message}`;
  }

  const acceptsHtml = req.headers.accept?.includes('text/html');
  if (acceptsHtml) {
    const html = `<!DOCTYPE html><html><head><title>NWS System Test</title>
    <style>body{font-family:monospace;padding:20px;background:#f5f5f5}
    pre{background:white;padding:20px;border-radius:8px;border:1px solid #ddd;font-size:14px;line-height:1.6;white-space:pre-wrap}
    h2{color:#2d5016}</style></head><body>
    <h2>Nature's Way Soil — System Diagnostic</h2>
    <pre>${JSON.stringify(results, null, 2)}</pre>
    </body></html>`;
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);
  }

  return res.status(200).json(results);
}
