import type { GetServerSideProps } from 'next';
import { adminAuthorized, getLatestConnection, qboRequest } from '../lib/quickbooks';

type Props = { ok:boolean };

export const getServerSideProps:GetServerSideProps<Props>=async(ctx) => {
  // Diagnostics run only on authorized requests, never during static builds.
  ctx.res.setHeader('Cache-Control', 'private, no-store');
  ctx.res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  const secret = ctx.req.headers['x-quickbooks-admin-secret'] || ctx.query.secret;
  if (!adminAuthorized(secret)) return { notFound: true };

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
      const entityName = String(row?.EntityRef?.name || '').toLowerCase();
      const departmentName = String(row?.DepartmentRef?.name || '').toLowerCase();
      const note = String(row?.PrivateNote || '').toLowerCase();
      const isAmazonConnector =
        entityName === 'amazon' ||
        departmentName.includes("nature's way soil us") ||
        note.includes('sellercentral.amazon.com/payments/event/details') ||
        note.includes('order id:');
      if(isAmazonConnector){
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
  const byEntity:Record<string,{count:number,total:number,first:string|null,last:string|null}> = {};
  for(const h of hits){
    const key=h.entity;
    const cur=byEntity[key]||{count:0,total:0,first:null,last:null};
    cur.count += 1;
    cur.total += Number(h.totalAmt||0);
    cur.first = !cur.first || h.txnDate < cur.first ? h.txnDate : cur.first;
    cur.last = !cur.last || h.txnDate > cur.last ? h.txnDate : cur.last;
    byEntity[key]=cur;
  }
  for(const k of Object.keys(byEntity)) byEntity[k].total=Number(byEntity[k].total.toFixed(2));

  const accountFlow:Record<string,{debit:number,credit:number,count:number}> = {};
  for(const h of hits){
    for(const line of h.lines||[]){
      const d=line.SalesItemLineDetail||line.AccountBasedExpenseLineDetail||line.DepositLineDetail||{};
      const ref=d.AccountRef||d.ItemAccountRef||line?.SalesItemLineDetail?.ItemAccountRef||null;
      if(!ref) continue;
      const name=String(ref.name||ref.value||'UNKNOWN');
      const cur=accountFlow[name]||{debit:0,credit:0,count:0};
      cur.count += 1;
      const amt=Number(line.Amount||0);
      if(h.entity==='SalesReceipt') cur.credit += amt;
      else cur.debit += amt;
      accountFlow[name]=cur;
    }
  }
  for(const k of Object.keys(accountFlow)){
    accountFlow[k].debit=Number(accountFlow[k].debit.toFixed(2));
    accountFlow[k].credit=Number(accountFlow[k].credit.toFixed(2));
  }

  console.info('QBO Amazon connector concise audit JSON',JSON.stringify({
    count:hits.length,
    earliestDate:hits[0]?.txnDate||null,
    latestDate:hits[hits.length-1]?.txnDate||null,
    byEntity,
    accountFlow
  }));

  return {props:{ok:true}};
};

export default function AmazonConnectorAudit(){return <main><h1>Amazon connector audit</h1></main>;};
