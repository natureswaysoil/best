import type { NextApiRequest, NextApiResponse } from 'next';
import { quickBooksApi } from '../../../lib/quickbooks';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const company = await quickBooksApi('/companyinfo/1?minorversion=75');
    return res.status(200).json({
      connected: true,
      company: company?.CompanyInfo?.CompanyName || company?.CompanyInfo?.LegalName || 'QuickBooks company',
      realmId: company?.CompanyInfo?.Id || null,
    });
  } catch (error) {
    console.error('QuickBooks status error:', error);
    return res.status(200).json({
      connected: false,
      connectUrl: '/api/quickbooks/connect',
      message: 'QuickBooks is not connected yet.',
    });
  }
}
