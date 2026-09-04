import type { NextApiRequest, NextApiResponse } from 'next';
import { installNatureWayChartOfAccounts, NATURES_WAY_CHART } from '../../../lib/quickbooks-accounting';

function authorized(req: NextApiRequest) {
  const configured = process.env.QUICKBOOKS_ADMIN_TOKEN;
  if (!configured) return false;
  const supplied = typeof req.query.token === 'string'
    ? req.query.token
    : (req.headers['x-quickbooks-admin-token'] as string | undefined);
  return supplied === configured;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }
  if (!authorized(req)) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const results = await installNatureWayChartOfAccounts();
    return res.status(200).json({
      ok: true,
      chartVersion: 1,
      total: NATURES_WAY_CHART.length,
      created: results.filter((r) => r.created).length,
      alreadyExisted: results.filter((r) => !r.created).length,
      accounts: results,
    });
  } catch (error) {
    console.error('QuickBooks chart installation failed:', error);
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
