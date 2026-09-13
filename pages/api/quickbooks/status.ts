import type { NextApiRequest, NextApiResponse } from 'next';
import {
  adminAuthorized,
  fetchCompanyInfo,
  getLatestConnection,
  getValidAccessToken,
} from '../../../lib/quickbooks';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const secret = req.headers['x-quickbooks-admin-secret'] || req.query.secret;
  if (!adminAuthorized(secret)) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const connection = await getLatestConnection();
    if (!connection) return res.status(200).json({ connected: false });

    const token = await getValidAccessToken(connection);
    const company = await fetchCompanyInfo(connection.realm_id, token);

    return res.status(200).json({
      connected: true,
      realmId: connection.realm_id,
      companyName: company?.CompanyInfo?.CompanyName || connection.company_name,
      legalName: company?.CompanyInfo?.LegalName || null,
      country: company?.CompanyInfo?.Country || null,
      connectedAt: connection.connected_at,
      updatedAt: connection.updated_at,
    });
  } catch (err: any) {
    return res.status(500).json({ connected: false, error: err.message });
  }
}
