import type { NextApiRequest, NextApiResponse } from 'next';
import { adminAuthorized, getLatestConnection } from '../../../lib/quickbooks';
import { getServiceSupabase } from '../../../lib/supabase';
import {
  REQUIRED_STRIPE_ACCOUNTS,
  STRIPE_ACCOUNT_NUMBERS,
  getAccountsByNumber,
  postStagingRowExclusively,
  postStripeStagingRow,
} from '../../../lib/quickbooks-stripe-posting';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });

  const secret = req.headers['x-quickbooks-admin-secret'] || req.body?.secret;
  if (!adminAuthorized(secret)) return res.status(401).json({ error: 'Unauthorized' });

  const confirm = req.body?.confirm === true;
  const selectedIds = Array.isArray(req.body?.ids) ? req.body.ids.map(String) : [];

  const connection = await getLatestConnection();
  if (!connection) return res.status(409).json({ error: 'QuickBooks is not connected' });

  const supabase = getServiceSupabase();
  let query = supabase
    .from('accounting_import_staging')
    .select('id,external_id,txn_date,description,gross_amount,fee_amount,net_amount,status,metadata')
    .eq('source', 'stripe_charge')
    .eq('status', 'auto_ready')
    .order('txn_date', { ascending: true });

  if (selectedIds.length) query = query.in('id', selectedIds);

  const { data: rows, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  const accountMap = await getAccountsByNumber(connection.realm_id, STRIPE_ACCOUNT_NUMBERS);
  const missing = REQUIRED_STRIPE_ACCOUNTS.filter((n) => !accountMap[n]);
  if (missing.length) {
    return res.status(409).json({ error: 'Required QuickBooks accounts are missing', missing });
  }

  const results: any[] = [];
  for (const row of rows || []) {
    // Confirmed posts take the same per-row claim as the Stripe webhook so the
    // two paths can never post one charge twice. Previews don't write.
    results.push(confirm
      ? await postStagingRowExclusively(connection.realm_id, row.id, accountMap)
      : await postStripeStagingRow(connection.realm_id, row, accountMap, false));
  }

  return res.status(200).json({
    confirmed: confirm,
    count: results.length,
    results,
  });
}
