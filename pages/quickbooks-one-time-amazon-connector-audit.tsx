import type { GetStaticProps } from 'next';
import { getLatestConnection, qboRequest } from '../lib/quickbooks';

type Props = { ok:boolean };

export const getStaticProps:GetStaticProps<Props>=async()=>{
  if(process.env.VERCEL_ENV && process.env.VERCEL_ENV!=='production') return {props:{ok:true}};
  const connection=await getLatestConnection();
  if(!connection) throw new Error('QuickBooks is not connected');

  const realm=encodeURIComponent(connection.realm_id);
  const queries = [
    "select * from Deposit where TxnDate >= '2026-01-01' maxresults 1000",
    "select * from SalesReceipt where TxnDate >= '2026-01-01' maxresults 1000",
    "select * from JournalEntry where TxnDate >= '2026-01-01' maxresults 1000",
    "select * from Purchase where TxnDate >= '2026-01-01' maxresults 1000",
    "select * from Bill where TxnDate >= '2026-01-01' maxresults 1000",
    "select * from Payment where TxnDate >= '2026-01-01' maxresults 1000"
  ];

  const results:any = {};
  for (const q of queries) {
    const entity = q.split(' ')[3];
    try {
      const data = await qboRequest('/v3/company/'+realm+'/query?query='+encodeURIComponent(q)+'&minorversion=75');
      results[entity] = data?.QueryResponse?.[entity] || [];
    } catch (e:any) {
      results[entity] = {error:String(e?.message||e)};
    }
  }

  const hits:any[]=[];
  for(const [entity,rows] of Object.entries(results)){
    if(!Array.isArray(rows)) continue;
    for(const row of rows as any[]){
      const blob = JSON.stringify(row).toLowerCase();
      if(blob.includes('amazon') || blob.includes('intuit') || blob.includes('marketplace') || blob.includes('seller')){
        hits.push({
          entity,
          id:row.Id,
          txnDate:row.TxnDate||null,
          docNumber:row.DocNumber||null,
          privateNote:row.PrivateNote||null,
          totalAmt:row.TotalAmt==null?null:Number(row.TotalAmt),
          depositTo:row.DepositToAccountRef||null,
          lines:row.Line||null,
          raw:row
        });
      }
    }
  }

  hits.sort((a,b)=>String(a.txnDate||'').localeCompare(String(b.txnDate||'')));
  console.info('QBO Amazon/Intuit historical connector audit JSON',JSON.stringify({
    count:hits.length,
    first:hits[0]||null,
    last:hits[hits.length-1]||null,
    hits
  }));

  return {props:{ok:true}};
};

export default function AmazonConnectorAudit(){return <main><h1>Amazon connector audit</h1></main>;};
