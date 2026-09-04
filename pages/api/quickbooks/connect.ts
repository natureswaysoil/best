import crypto from 'crypto';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getQuickBooksAuthorizationUrl } from '../../../lib/quickbooks';

function authorized(req: NextApiRequest): boolean {
  const expected = process.env.QUICKBOOKS_ADMIN_TOKEN || '';
  const provided = typeof req.query.token === 'string' ? req.query.token : '';
  if (!expected || !provided || expected.length !== provided.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(provided));
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method Not Allowed');
  }

  if (!authorized(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    return res.redirect(302, getQuickBooksAuthorizationUrl());
  } catch (error) {
    console.error('QuickBooks connect error:', error);
    return res.status(500).json({ error: 'QuickBooks connection is not configured.' });
  }
}
