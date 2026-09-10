import crypto from 'crypto';
import type { NextApiRequest, NextApiResponse } from 'next';
import { quickBooksApi } from '../../../lib/quickbooks';

function authorized(req: NextApiRequest): boolean {
  const expected = process.env.QUICKBOOKS_ADMIN_TOKEN || '';
  const provided = typeof req.query.token === 'string' ? req.query.token : '';
  if (!expected || !provided || expected.length !== provided.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(provided));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method Not Allowed');
  }

  if (!authorized(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const company = await quickBooksApi('/companyinfo/1');
    return res.status(200).json({
      connected: true,
      company: company?.CompanyInfo?.CompanyName || company?.CompanyInfo?.LegalName || 'QuickBooks company',
    });
  } catch (error) {
    console.error('QuickBooks status error:', error);
    return res.status(200).json({
      connected: false,
      message: 'QuickBooks is not connected yet.',
    });
  }
}
