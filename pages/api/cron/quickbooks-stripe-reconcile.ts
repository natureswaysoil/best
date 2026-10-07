import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { reconcileRecentStripePayments } from '../../../lib/quickbooks-stripe-auto';

// Hourly safety net for automatic QuickBooks posting: stages successful Stripe
// payments the webhook missed and retries rows still waiting to post.
// No-op unless QUICKBOOKS_AUTO_POST=true.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '') || String(req.query.secret || '');
  if (!process.env.CRON_SECRET || token !== process.env.CRON_SECRET) return res.status(401).json({ error: 'Unauthorized' });
  if (!process.env.STRIPE_SECRET_KEY) return res.status(500).json({ error: 'STRIPE_SECRET_KEY is not configured' });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });
  try {
    const summary = await reconcileRecentStripePayments(stripe);
    console.info('QuickBooks Stripe reconciliation', summary);
    return res.status(200).json(summary);
  } catch (error: any) {
    console.error('QuickBooks Stripe reconciliation failed:', error);
    return res.status(500).json({ error: error?.message || 'Reconciliation failed' });
  }
}
