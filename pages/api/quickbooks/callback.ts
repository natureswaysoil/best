import type { NextApiRequest, NextApiResponse } from 'next';
import {
  exchangeQuickBooksCode,
  saveQuickBooksConnection,
  verifyQuickBooksState,
} from '../../../lib/quickbooks';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method Not Allowed');
  }

  const code = typeof req.query.code === 'string' ? req.query.code : '';
  const state = typeof req.query.state === 'string' ? req.query.state : '';
  const realmId = typeof req.query.realmId === 'string' ? req.query.realmId : '';

  if (!code || !state || !realmId || !verifyQuickBooksState(state)) {
    return res.status(400).send('Invalid QuickBooks authorization response.');
  }

  try {
    const tokens = await exchangeQuickBooksCode(code);
    await saveQuickBooksConnection(realmId, tokens);
    return res.redirect(302, '/api/quickbooks/status?connected=1');
  } catch (error) {
    console.error('QuickBooks callback error:', error);
    return res.status(500).send('QuickBooks connection failed. Check server logs for details.');
  }
}
