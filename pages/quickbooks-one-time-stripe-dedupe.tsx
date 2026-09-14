import type { GetStaticProps } from 'next';
import { getLatestConnection, qboRequest } from '../lib/quickbooks';
import { getServiceSupabase } from '../lib/supabase';

type Props = { ok: boolean; deleted: number; skipped: number };

function normalizeLines(j:any) {
  return JSON.stringify((j.Line || []).map((l:any) => ({
    amount:Number(l.Amount || 0),
    postingType:l?.JournalEntryLineDetail?.PostingType || null,
    accountId:l?.JournalEntryLineDetail?.AccountRef?.value || null,
    description:l.Description || null,
  })).sort((a:any,b:any) =>
    String(a.accountId).localeCompare(String(b.accountId)) ||
    String(a.postingType).localeCompare(String(b.postingType)) ||
    a.amount-b.amount
  ));
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production') {
    return { props: { ok:true, deleted:0, skipped:0 } };
  }

  const connection = await getLatestConnection();
  if (!connection) throw new Error('QuickBooks is not connected');

  const q = "select * from JournalEntry where TxnDate >= '2025-01-01' maxresults 1000";
  const data = await qboRequest(
    '/v3/company/' + encodeURIComponent(connection.realm_id) +
    '/query?query=' + encodeURIComponent(q) + '&minorversion=75'
  );
  const jes = data?.QueryResponse?.JournalEntry || [];

  const supabase = getServiceSupabase();
  const { data: staged, error } = await supabase
    .from('accounting_import_staging')
    .select('external_id,qbo_txn_id')
    .eq('source','stripe_charge')
    .eq('status','posted');
  if (error) throw error;

  const preferredByExternal = new Map<string,string>();
  for (const row of staged || []) {
    if (row.external_id && row.qbo_txn_id) preferredByExternal.set(String(row.external_id), String(row.qbo_txn_id));
  }

  const groups = new Map<string, any[]>();
  for (const j of jes) {
    const doc = String(j.DocNumber || '');
    if (!doc.startsWith('ST-')) continue;
    const arr = groups.get(doc) || [];
    arr.push(j);
    groups.set(doc, arr);
  }

  let deleted = 0;
  let skipped = 0;
  const actions:any[] = [];

  for (const [doc, items] of Array.from(groups.entries())) {
    if (items.length <= 1) continue;

    const signatures = new Set(items.map((j:any) =>
      JSON.stringify({
        txnDate:j.TxnDate,
        privateNote:j.PrivateNote || '',
        lines:normalizeLines(j),
      })
    ));

    if (signatures.size !== 1) {
      skipped += items.length;
      actions.push({doc, action:'skipped_nonidentical', ids:items.map((j:any)=>j.Id)});
      continue;
    }

    const externalId = String(items[0].PrivateNote || '').replace(/^NWS Stripe import\s+/,'').trim();
    const preferredId = preferredByExternal.get(externalId);
    const keep = items.find((j:any)=>String(j.Id)===preferredId)
      || [...items].sort((a:any,b:any)=>Number(a.Id)-Number(b.Id))[0];

    for (const j of items) {
      if (String(j.Id) === String(keep.Id)) continue;

      await qboRequest(
        '/v3/company/' + encodeURIComponent(connection.realm_id) +
        '/journalentry?operation=delete&minorversion=75',
        {
          method:'POST',
          body:JSON.stringify({ Id:String(j.Id), SyncToken:String(j.SyncToken) }),
        }
      );
      deleted += 1;
      actions.push({doc, action:'deleted_duplicate', deletedId:j.Id, keptId:keep.Id});
    }
  }

  console.info('QBO Stripe duplicate cleanup completed', { deleted, skipped, actions });
  return { props: { ok:true, deleted, skipped } };
};

export default function StripeDuplicateCleanup({deleted,skipped}:Props) {
  return <main><h1>Stripe duplicate cleanup</h1><p>Deleted: {deleted} · Skipped: {skipped}</p></main>;
}
