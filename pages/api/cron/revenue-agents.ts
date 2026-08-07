import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { Resend } from 'resend';

const site = (process.env.NEXT_PUBLIC_SITE_URL || 'https://natureswaysoil.com').replace(/\/$/, '');
const from = process.env.RESEND_FROM || "Nature's Way Soil <no-reply@natureswaysoil.com>";
const email = (pi: Stripe.PaymentIntent) => pi.receipt_email || pi.metadata?.email || '';
const product = (pi: Stripe.PaymentIntent) => ({ id: pi.metadata?.product_id || '', name: pi.metadata?.product_name || pi.description || 'your soil-care product' });
const checkout = (pi: Stripe.PaymentIntent, coupon = '') => {
  const p = new URLSearchParams();
  if (product(pi).id) p.set('productId', product(pi).id);
  if (coupon) p.set('coupon', coupon);
  return `${site}/checkout?${p}`;
};

async function send(resend: Resend, pi: Stripe.PaymentIntent, kind: string, subject: string, message: string, href: string, dry: boolean) {
  if (!email(pi)) return false;
  if (dry) return true;
  const { error } = await resend.emails.send({
    from, to: [email(pi)], subject,
    html: `<div style="font-family:Arial;max-width:620px;margin:auto"><h2 style="color:#2d5016">${subject}</h2><p>${message}</p><p><a href="${href}" style="background:#2d5016;color:#fff;padding:12px 20px;text-decoration:none;border-radius:6px">Continue</a></p><small>Nature's Way Soil</small></div>`,
  }, { idempotencyKey: `revenue-agent/${kind}/${pi.id}` });
  if (error) throw error;
  return true;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '') || String(req.query.secret || '');
  if (!process.env.CRON_SECRET || token !== process.env.CRON_SECRET) return res.status(401).json({ error: 'Unauthorized' });
  if (!process.env.STRIPE_SECRET_KEY || !process.env.RESEND_API_KEY) return res.status(503).json({ error: 'Revenue agents are not configured' });
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });
  const resend = new Resend(process.env.RESEND_API_KEY);
  const dry = req.query.dry_run === 'true';
  const now = Math.floor(Date.now() / 1000);
  const intents = (await stripe.paymentIntents.list({ limit: 100, created: { gte: now - 100 * 86400 } })).data;
  const result: Record<string, number> = { cart: 0, failed: 0, upsell: 0, review: 0, reorder: 0, errors: 0 };
  for (const pi of intents) {
    const h = (now - pi.created) / 3600;
    const p = product(pi);
    const tasks: Array<[string,string,string,string]> = [];
    if (['requires_payment_method','requires_confirmation','requires_action'].includes(pi.status) && h >= 1 && h < 25) tasks.push(['cart', `Still interested in ${p.name}?`, `Your order is waiting. Use SAVE15 if this is your first direct purchase.`, checkout(pi, 'SAVE15')]);
    if (pi.status === 'requires_payment_method' && pi.last_payment_error && h < 48) tasks.push(['failed','Your payment needs attention',`Stripe could not complete payment for ${p.name}. No additional charge was made.`,checkout(pi)]);
    if (pi.status === 'succeeded' && h >= 72 && h < 96) tasks.push(['upsell','Build a stronger soil-care routine',`Liquid biochar, kelp, and humic support can complement ${p.name}.`,`${site}/shop`]);
    if (pi.status === 'succeeded' && h >= 240 && h < 288) tasks.push(['review','How is your soil responding?',`We hope ${p.name} is working well. Share honest feedback or ask for application help.`,`${site}/contact?topic=review`]);
    if (pi.status === 'succeeded' && h >= 720 && h < 768) tasks.push(['reorder',`Time to check your ${p.name} supply`,'If your supply is running low, you can reorder directly.',checkout(pi)]);
    for (const [kind,subject,message,href] of tasks) {
      try { if (await send(resend, pi, kind, subject, message, href, dry)) result[kind] += 1; }
      catch (error) { result.errors += 1; console.error('[revenue-agent]', kind, pi.id, error); }
    }
  }
  return res.status(200).json({ success: true, dry_run: dry, scanned: intents.length, result });
}
