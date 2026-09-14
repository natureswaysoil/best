import type { NextApiRequest, NextApiResponse } from 'next';
import { adminAuthorized } from '../../../lib/quickbooks';
import { getServiceSupabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const secret = req.headers['x-quickbooks-admin-secret'] || req.query.secret;
  if (!adminAuthorized(secret)) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method !== 'GET') return res.status(405).json({ error: 'GET required' });

  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from('accounting_import_staging')
    .select('id,source,external_id,txn_date,description,gross_amount,fee_amount,net_amount,suggested_account_number,status,confidence,notes,qbo_txn_id,posted_at')
    .order('txn_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  const rows = data || [];
  const summary = rows.reduce((acc: any, row: any) => {
    acc.total += 1;
    acc[row.status] = (acc[row.status] || 0) + 1;
    return acc;
  }, { total: 0, auto_ready: 0, review: 0, posted: 0, skipped: 0 });

  return res.status(200).json({ summary, rows });
}
