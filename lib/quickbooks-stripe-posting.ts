import crypto from 'crypto';
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
  notes?: string | null;
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

// ---------------------------------------------------------------------------
// Per-row posting lock.
//
// The manual endpoint and the Stripe webhook can both try to post the same
// staging row. Before either one checks QuickBooks or creates an entry it must
// win this claim: an atomic compare-and-swap on the row's `notes` column (the
// table's status check constraint has no "posting" value). Only the claim owner
// posts. A claim left behind by a crashed run expires after LOCK_TTL_MS.
// ---------------------------------------------------------------------------

const LOCK_PREFIX = 'AUTO_POST_LOCK:';
const LOCK_TTL_MS = 10 * 60 * 1000;
const STAGING_COLUMNS = 'id,external_id,txn_date,description,gross_amount,fee_amount,net_amount,status,metadata,notes';

type ParsedLock = { lockedAt: number; original: string | null };

// Lock format: AUTO_POST_LOCK:<uuid>:<epoch ms>|<original notes>
function parseLock(notes: string | null): ParsedLock | null {
  if (!notes || !notes.startsWith(LOCK_PREFIX)) return null;
  const bar = notes.indexOf('|');
  const head = bar === -1 ? notes : notes.slice(0, bar);
  const lockedAt = Number(head.split(':')[2]);
  const original = bar === -1 ? '' : notes.slice(bar + 1);
  return { lockedAt: Number.isFinite(lockedAt) ? lockedAt : 0, original: original || null };
}

export type StagingClaim = {
  row: StripeStagingRow;
  /** Release the claim, restoring the row's original notes or replacing them with `note`. */
  release: (note?: string | null) => Promise<void>;
};

export async function claimStagingRow(rowId: string): Promise<StagingClaim | null> {
  const supabase = getServiceSupabase();
  const { data: current, error } = await supabase
    .from('accounting_import_staging')
    .select(STAGING_COLUMNS)
    .eq('id', rowId)
    .maybeSingle();
  if (error) throw error;
  if (!current || current.status !== 'auto_ready') return null;

  const existingLock = parseLock(current.notes);
  if (existingLock && Date.now() - existingLock.lockedAt < LOCK_TTL_MS) return null;

  const original = existingLock ? existingLock.original : (current.notes as string | null);
  const lock = LOCK_PREFIX + crypto.randomUUID() + ':' + Date.now() + '|' + (original || '');

  let claim = supabase
    .from('accounting_import_staging')
    .update({ notes: lock, updated_at: new Date().toISOString() })
    .eq('id', rowId)
    .eq('status', 'auto_ready');
  claim = current.notes === null ? claim.is('notes', null) : claim.eq('notes', current.notes);
  const { data: won, error: claimError } = await claim.select(STAGING_COLUMNS);
  if (claimError) throw claimError;
  if (!won || !won.length) return null;

  return {
    row: won[0] as StripeStagingRow,
    release: async (note?: string | null) => {
      await supabase
        .from('accounting_import_staging')
        .update({ notes: note === undefined ? original : note, updated_at: new Date().toISOString() })
        .eq('id', rowId)
        .eq('notes', lock);
    },
  };
}

/**
 * Post one staging row while holding its claim. Returns `in_progress` when
 * another run holds the claim or the row is no longer ready to post.
 */
export async function postStagingRowExclusively(
  realmId: string,
  rowId: string,
  accountMap: Record<string, any>,
): Promise<StripePostResult> {
  const claim = await claimStagingRow(rowId);
  if (!claim) return { id: rowId, externalId: '', action: 'in_progress_or_not_ready' };

  try {
    const result = await postStripeStagingRow(realmId, claim.row, accountMap, true);
    if (result.action === 'posted' || result.action === 'skipped_existing') {
      await claim.release();
    } else {
      await claim.release('Auto-post held: ' + result.action);
    }
    return result;
  } catch (error: any) {
    await claim.release('Posting failed: ' + String(error?.message || error).slice(0, 500));
    throw error;
  }
}
