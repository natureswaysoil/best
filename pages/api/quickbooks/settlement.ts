import type { NextApiRequest, NextApiResponse } from 'next';
import { postMarketplaceSettlement } from '../../../lib/quickbooks-transactions';

function authorized(req: NextApiRequest) {
  const configured = process.env.QUICKBOOKS_ADMIN_TOKEN;
  const supplied = req.headers['x-quickbooks-admin-token'];
  return Boolean(configured && typeof supplied === 'string' && supplied === configured);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }
  if (!authorized(req)) return res.status(401).json({ error: 'Unauthorized' });

  const body = req.body || {};
  if (!['amazon', 'walmart'].includes(body.marketplace)) {
    return res.status(400).json({ error: 'marketplace must be amazon or walmart' });
  }
  if (!body.settlementId || !Number.isFinite(Number(body.grossSales)) || !Number.isFinite(Number(body.payout))) {
    return res.status(400).json({ error: 'settlementId, grossSales and payout are required' });
  }

  try {
    const result = await postMarketplaceSettlement({
      marketplace: body.marketplace,
      settlementId: String(body.settlementId),
      grossSales: Number(body.grossSales),
      refunds: Number(body.refunds || 0),
      marketplaceFees: Number(body.marketplaceFees || 0),
      fulfillmentFees: Number(body.fulfillmentFees || 0),
      advertising: Number(body.advertising || 0),
      otherAdjustments: Number(body.otherAdjustments || 0),
      payout: Number(body.payout),
    });
    return res.status(200).json({ ok: true, ...result });
  } catch (error) {
    console.error('QuickBooks marketplace settlement posting failed:', error);
    return res.status(500).json({ ok: false, error: error instanceof Error ? error.message : String(error) });
  }
}
