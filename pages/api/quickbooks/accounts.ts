import type { NextApiRequest, NextApiResponse } from 'next';
import { adminAuthorized, getLatestConnection, qboRequest } from '../../../lib/quickbooks';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const secret = req.headers['x-quickbooks-admin-secret'] || req.query.secret;
  if (!adminAuthorized(secret)) return res.status(401).json({ error: 'Unauthorized' });

  const connection = await getLatestConnection();
  if (!connection) return res.status(409).json({ error: 'QuickBooks is not connected' });

  try {
    const query = encodeURIComponent('select * from Account maxresults 1000');
    const data = await qboRequest(
      '/v3/company/' + encodeURIComponent(connection.realm_id) +
      '/query?query=' + query + '&minorversion=75'
    );
    const accounts = data?.QueryResponse?.Account || [];

    return res.status(200).json({
      connected: true,
      realmId: connection.realm_id,
      count: accounts.length,
      accounts: accounts.map((a: any) => ({
        id: a.Id,
        name: a.Name,
        accountNumber: a.AcctNum || null,
        fullyQualifiedName: a.FullyQualifiedName,
        accountType: a.AccountType,
        accountSubType: a.AccountSubType,
        active: a.Active,
        classification: a.Classification,
        currentBalance: a.CurrentBalance,
      })),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
