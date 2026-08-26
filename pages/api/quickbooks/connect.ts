import type { NextApiRequest, NextApiResponse } from 'next';
import { getQuickBooksAuthorizationUrl } from '../../../lib/quickbooks';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    return res.redirect(302, getQuickBooksAuthorizationUrl());
  } catch (error) {
    console.error('QuickBooks connect error:', error);
    return res.status(500).json({ error: 'QuickBooks connection is not configured.' });
  }
}
