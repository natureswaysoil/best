import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, productId, value } = req.body;
  if (!email || !String(email).includes('@')) return res.status(400).json({ error: 'Valid email required' });
  if (!process.env.RESEND_API_KEY) return res.status(503).json({ error: 'Recovery email is not configured' });
  const resend = new Resend(process.env.RESEND_API_KEY);
  const site = (process.env.NEXT_PUBLIC_SITE_URL || 'https://natureswaysoil.com').replace(/\/$/, '');
  const params = new URLSearchParams({ coupon: 'SAVE15' });
  if (productId) params.set('productId', String(productId));
  const bucket = Math.floor(Date.now() / 3600000);
  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM || "Nature's Way Soil <no-reply@natureswaysoil.com>",
    to: [String(email).trim().toLowerCase()],
    subject: 'Your Nature?s Way Soil cart is saved',
    html: `<h2>Your cart is waiting</h2><p>Return when you are ready to complete your soil-care order${value ? ` valued at $${Number(value).toFixed(2)}` : ''}. First-time direct customers can use SAVE15.</p><p><a href="${site}/checkout?${params}">Return to checkout</a></p>`,
    scheduledAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  }, { idempotencyKey: `abandoned-cart/${productId || 'shop'}/${bucket}/${Buffer.from(String(email)).toString('base64url').slice(0, 40)}` });
  if (error) return res.status(502).json({ error: 'Unable to schedule recovery email' });
  return res.status(200).json({ ok: true, scheduled: true });
}
