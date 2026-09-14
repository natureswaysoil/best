import type { NextApiRequest, NextApiResponse } from 'next';
import { adminAuthorized, getLatestConnection, qboRequest } from '../../../lib/quickbooks';
import { getServiceSupabase } from '../../../lib/supabase';

function esc(value: string) {
  return value.replace(/'/g, "\\'");
}

async function getAccountsByNumber(realmId: string, numbers: string[]) {
  const query = encodeURIComponent('select * from Account maxresults 1000');
  const data = await qboRequest(
    '/v3/company/' + encodeURIComponent(realmId) + '/query?query=' + query + '&minorversion=75'
  );
  const accounts = data?.QueryResponse?.Account || [];
  const map: Record<string, any> = {};
  for (const number of numbers) {
    const found = accounts.find((a: any) => String(a.AcctNum || '') === number);
    if (found) map[number] = found;
  }
  return map;
}

async function existingJournalEntry(realmId: string, privateNote: string) {
  const q = "select * from JournalEntry where PrivateNote = '" + esc(privateNote) + "' maxresults 1";
  const data = await qboRequest(
    '/v3/company/' + encodeURIComponent(realmId) + '/query?query=' + encodeURIComponent(q) + '&minorversion=75'
  );
  return (data?.QueryResponse?.JournalEntry || [])[0] || null;
}

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

  const accountMap = await getAccountsByNumber(connection.realm_id, ['1030','4000','4040','6110']);
  const missing = ['1030','4000','6110'].filter((n) => !accountMap[n]);
  if (missing.length) {
    return res.status(409).json({ error: 'Required QuickBooks accounts are missing', missing });
  }

  const results: any[] = [];

  for (const row of rows || []) {
    const privateNote = 'NWS-STRIPE-' + row.external_id;
    const existing = await existingJournalEntry(connection.realm_id, privateNote);

    if (existing) {
      await supabase
        .from('accounting_import_staging')
        .update({ status: 'posted', qbo_txn_id: existing.Id, posted_at: new Date().toISOString() })
        .eq('id', row.id);

      results.push({ id: row.id, externalId: row.external_id, action: 'skipped_existing', qboTxnId: existing.Id });
      continue;
    }

    const gross = Number(row.gross_amount || 0);
    const fee = Number(row.fee_amount || 0);
    const net = Number(row.net_amount || 0);
    const metadata: any = row.metadata || {};
    const shipping = Math.max(0, Number(metadata.shipping || 0));
    const productRevenue = Math.max(0, Number((gross - shipping).toFixed(2)));

    if (!confirm) {
      results.push({
        id: row.id,
        externalId: row.external_id,
        action: 'would_post',
        date: row.txn_date,
        netToStripeClearing: net,
        feeToStripeFees: fee,
        productSales: productRevenue,
        shippingIncome: shipping,
      });
      continue;
    }

    const lines: any[] = [
      {
        Amount: net,
        DetailType: 'JournalEntryLineDetail',
        Description: 'Stripe net proceeds ' + row.external_id,
        JournalEntryLineDetail: {
          PostingType: 'Debit',
          AccountRef: { value: accountMap['1030'].Id, name: accountMap['1030'].Name },
        },
      },
      {
        Amount: fee,
        DetailType: 'JournalEntryLineDetail',
        Description: 'Stripe processing fee ' + row.external_id,
        JournalEntryLineDetail: {
          PostingType: 'Debit',
          AccountRef: { value: accountMap['6110'].Id, name: accountMap['6110'].Name },
        },
      },
      {
        Amount: productRevenue,
        DetailType: 'JournalEntryLineDetail',
        Description: row.description,
        JournalEntryLineDetail: {
          PostingType: 'Credit',
          AccountRef: { value: accountMap['4000'].Id, name: accountMap['4000'].Name },
        },
      },
    ];

    if (shipping > 0) {
      if (!accountMap['4040']) {
        results.push({ id: row.id, externalId: row.external_id, action: 'held_missing_shipping_income_account' });
        continue;
      }
      lines.push({
        Amount: shipping,
        DetailType: 'JournalEntryLineDetail',
        Description: 'Shipping income ' + row.external_id,
        JournalEntryLineDetail: {
          PostingType: 'Credit',
          AccountRef: { value: accountMap['4040'].Id, name: accountMap['4040'].Name },
        },
      });
    }

    const debit = Number((net + fee).toFixed(2));
    const credit = Number((productRevenue + shipping).toFixed(2));
    if (Math.abs(debit - credit) > 0.009) {
      results.push({ id: row.id, externalId: row.external_id, action: 'held_unbalanced', debit, credit });
      continue;
    }

    const payload = {
      TxnDate: row.txn_date,
      PrivateNote: privateNote,
      Line: lines,
    };

    const created = await qboRequest(
      '/v3/company/' + encodeURIComponent(connection.realm_id) + '/journalentry?minorversion=75',
      { method: 'POST', body: JSON.stringify(payload) }
    );

    const je = created?.JournalEntry;
    if (!je?.Id) throw new Error('QuickBooks did not return a JournalEntry ID for ' + row.external_id);

    await supabase
      .from('accounting_import_staging')
      .update({ status: 'posted', qbo_txn_id: je.Id, posted_at: new Date().toISOString() })
      .eq('id', row.id);

    results.push({ id: row.id, externalId: row.external_id, action: 'posted', qboTxnId: je.Id });
  }

  return res.status(200).json({
    confirmed: confirm,
    count: results.length,
    results,
  });
}
