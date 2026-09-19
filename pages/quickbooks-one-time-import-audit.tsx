import type { GetServerSideProps } from 'next';
import { adminAuthorized, getLatestConnection, qboRequest } from '../lib/quickbooks';

type Props = { ok: boolean };

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  // Diagnostics run only on authorized requests, never during static builds.
  ctx.res.setHeader('Cache-Control', 'private, no-store');
  ctx.res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  const secret = ctx.req.headers['x-quickbooks-admin-secret'] || ctx.query.secret;
  if (!adminAuthorized(secret)) return { notFound: true };

  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production') return { props: { ok: true } };

  const connection = await getLatestConnection();
  if (!connection) throw new Error('QuickBooks is not connected');

  const q = "select * from JournalEntry where TxnDate >= '2025-01-01' maxresults 1000";
  const data = await qboRequest(
    '/v3/company/' + encodeURIComponent(connection.realm_id) +
    '/query?query=' + encodeURIComponent(q) + '&minorversion=75'
  );

  const jes = data?.QueryResponse?.JournalEntry || [];
  const imported = jes.filter((j:any) => {
    const d = String(j.DocNumber || '');
    const note = String(j.PrivateNote || '');
    return d.startsWith('ST-') || d.startsWith('BK-') || note.includes('NWS Stripe import') || note.includes('NWS Truist import');
  });

  const byDoc:Record<string, any[]> = {};
  for (const j of imported) {
    const key = String(j.DocNumber || '(none)');
    if (!byDoc[key]) byDoc[key] = [];
    byDoc[key].push({
      id:j.Id,
      txnDate:j.TxnDate,
      docNumber:j.DocNumber || null,
      privateNote:j.PrivateNote || null,
      totalAmt:j.TotalAmt == null ? null : Number(j.TotalAmt),
      lines:(j.Line || []).map((l:any) => ({
        amount:Number(l.Amount || 0),
        postingType:l?.JournalEntryLineDetail?.PostingType || null,
        accountId:l?.JournalEntryLineDetail?.AccountRef?.value || null,
        accountName:l?.JournalEntryLineDetail?.AccountRef?.name || null,
        description:l.Description || null,
      })),
    });
  }

  const duplicates = Object.entries(byDoc)
    .filter(([,items]) => items.length > 1)
    .map(([doc,items]) => ({doc,count:items.length,ids:items.map((x:any)=>x.id)}));

  const stripeDocs = imported.filter((j:any)=>String(j.DocNumber||'').startsWith('ST-'));
  const bankDocs = imported.filter((j:any)=>String(j.DocNumber||'').startsWith('BK-'));

  console.info('QBO imported journal audit', {
    totalJournalEntries:jes.length,
    importedCount:imported.length,
    stripeCount:stripeDocs.length,
    bankCount:bankDocs.length,
    duplicateCount:duplicates.length,
    duplicates,
    imported: imported.map((j:any)=>({
      id:j.Id,
      txnDate:j.TxnDate,
      docNumber:j.DocNumber || null,
      privateNote:j.PrivateNote || null,
      totalAmt:j.TotalAmt == null ? null : Number(j.TotalAmt),
      lines:(j.Line || []).map((l:any)=>({
        amount:Number(l.Amount || 0),
        postingType:l?.JournalEntryLineDetail?.PostingType || null,
        accountId:l?.JournalEntryLineDetail?.AccountRef?.value || null,
        accountName:l?.JournalEntryLineDetail?.AccountRef?.name || null,
      })),
    })),
  });

  return { props: { ok: true } };
};

export default function ImportedJournalAudit() {
  return <main><h1>Imported journal audit generated</h1></main>;
}
