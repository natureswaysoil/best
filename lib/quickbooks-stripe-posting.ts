import { qboRequest } from './quickbooks';
import { getServiceSupabase } from './supabase';

// Shared by the manual posting endpoint (/api/quickbooks/post-stripe-staging)
// and automatic posting from the Stripe webhook, so both use the same journal
// entry layout and the same duplicate checks.

export const REQUIRED_STRIPE_ACCOUNTS = ['1030', '4000', '6110'];
export const STRIPE_ACCOUNT_NUMBERS = ['1030', '4000', '4040', '6110'];

export type StripeStagingRow = {
  id: string;
  external_id: string;
  txn_date: string;
  description: string;
  gross_amount: number | string | null;
  fee_amount: number | string | null;
  net_amount: number | string | null;
  status: string;
  metadata: any;
};

export type StripePostResult = {
  id: string;
  externalId: string;
  action: string;
  [key: string]: unknown;
};

function esc(value: string) {
  return value.replace(/'/g, "\\'");
}

export function stripePrivateNote(externalId: string) {
  return 'NWS-STRIPE-' + externalId;
}

export async function getAccountsByNumber(realmId: string, numbers: string[]) {
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

// Checks the current note format and the one used by the historical Stripe import.
async function existingJournalEntry(realmId: string, externalId: string) {
  for (const note of [stripePrivateNote(externalId), 'NWS Stripe import ' + externalId]) {
    const q = "select * from JournalEntry where PrivateNote = '" + esc(note) + "' maxresults 1";
    const data = await qboRequest(
      '/v3/company/' + encodeURIComponent(realmId) + '/query?query=' + encodeURIComponent(q) + '&minorversion=75'
    );
    const found = (data?.QueryResponse?.JournalEntry || [])[0];
    if (found) return found;
  }
  return null;
}

export async function postStripeStagingRow(
  realmId: string,
  row: StripeStagingRow,
  accountMap: Record<string, any>,
  confirm: boolean,
): Promise<StripePostResult> {
  const supabase = getServiceSupabase();
  const existing = await existingJournalEntry(realmId, row.external_id);

  if (existing) {
    await supabase
      .from('accounting_import_staging')
      .update({ status: 'posted', qbo_txn_id: existing.Id, posted_at: new Date().toISOString() })
      .eq('id', row.id);

    return { id: row.id, externalId: row.external_id, action: 'skipped_existing', qboTxnId: existing.Id };
  }

  const gross = Number(row.gross_amount || 0);
  const fee = Number(row.fee_amount || 0);
  const net = Number(row.net_amount || 0);
  const metadata: any = row.metadata || {};
  const shipping = Math.max(0, Number(metadata.shipping || 0));
  const productRevenue = Math.max(0, Number((gross - shipping).toFixed(2)));

  if (!confirm) {
    return {
      id: row.id,
      externalId: row.external_id,
      action: 'would_post',
      date: row.txn_date,
      netToStripeClearing: net,
      feeToStripeFees: fee,
      productSales: productRevenue,
      shippingIncome: shipping,
    };
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
      return { id: row.id, externalId: row.external_id, action: 'held_missing_shipping_income_account' };
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
    return { id: row.id, externalId: row.external_id, action: 'held_unbalanced', debit, credit };
  }

  const payload = {
    TxnDate: row.txn_date,
    PrivateNote: stripePrivateNote(row.external_id),
    Line: lines,
  };

  const created = await qboRequest(
    '/v3/company/' + encodeURIComponent(realmId) + '/journalentry?minorversion=75',
    { method: 'POST', body: JSON.stringify(payload) }
  );

  const je = created?.JournalEntry;
  if (!je?.Id) throw new Error('QuickBooks did not return a JournalEntry ID for ' + row.external_id);

  await supabase
    .from('accounting_import_staging')
    .update({ status: 'posted', qbo_txn_id: je.Id, posted_at: new Date().toISOString() })
    .eq('id', row.id);

  return { id: row.id, externalId: row.external_id, action: 'posted', qboTxnId: je.Id };
}
