import type { GetStaticProps } from 'next';
import { getLatestConnection, qboRequest } from '../lib/quickbooks';
import { getServiceSupabase } from '../lib/supabase';

type Props = { ok:boolean; posted:number; held:number };

const RULES:Record<string,{kind:'expense'|'self_stripe'; accountNumber?:string; accountNames?:string[]; note:string}> = {
  'bank_29cb2f33eb20c53ad0aa22a1': {kind:'expense',accountNames:['Building & land rent'],note:'Source CSV categorized as Building & land rent'},
  'bank_ccdfcfec558247da5283543b': {kind:'expense',accountNames:['Building & land rent'],note:'Source CSV categorized as Building & land rent'},
  'bank_a5a47f7d9888b6d83cad4c38': {kind:'expense',accountNames:['Commissions & fees'],note:'Source CSV categorized as Commissions & fees'},
  'bank_24894afbe160ef0942d484a1': {kind:'expense',accountNames:['Commissions & fees'],note:'Source CSV categorized as Commissions & fees'},
  'bank_d7c6a54b43708b1635628414': {kind:'expense',accountNames:['Commissions & fees'],note:'Source CSV categorized as Commissions & fees'},
  'bank_893e3573f5eb0fb502803e7d': {kind:'expense',accountNames:['Commissions & fees'],note:'Source CSV categorized as Commissions & fees'},
  'bank_04636d0b3084b1778066e7f5': {kind:'expense',accountNumber:'6400',accountNames:['Software & Online Services','Office expenses'],note:'Source CSV categorized Google charge as Office expenses; mapped to Software & Online Services'},
  'bank_0f535b92a7acc1a625c4ff4f': {kind:'expense',accountNumber:'6400',accountNames:['Software & Online Services','Office expenses'],note:'Source CSV categorized Google charge as Office expenses; mapped to Software & Online Services'},
  'bank_e18140942f535daf607cf3b7': {kind:'expense',accountNames:['Professional Services'],note:'Source CSV categorized as Professional Services'},
  'bank_ff21b953363d89041da7df63': {kind:'expense',accountNames:['Supplies'],note:'Harbor Freight small-tool purchase; expensed to existing Supplies account'},
  'bank_e6058f4b4c252ed9d6e05827': {kind:'expense',accountNames:['Supplies'],note:'Source CSV categorized Amazon charge as Supplies'},
  'bank_c3d1be5cfaf51d7abb7415cf': {kind:'expense',accountNumber:'6400',accountNames:['Software & Online Services'],note:'X Corp paid subscription mapped to Software & Online Services'},
  'bank_68bc3887470a40ef3998538c': {kind:'self_stripe',note:'Matched to own-email Stripe $49.99 transaction py_3UCgliIwQKMqOanf1pSXqGp6'},
};

function findAccount(accounts:any[], number?:string, names:string[]=[]){
  if(number){
    const a=accounts.find((x:any)=>String(x.AcctNum||'')===number);
    if(a) return a;
  }
  const wanted=names.map(n=>n.toLowerCase());
  return accounts.find((x:any)=>wanted.includes(String(x.FullyQualifiedName||x.Name||'').toLowerCase()) || wanted.includes(String(x.Name||'').toLowerCase()));
}

async function existingJE(realmId:string, doc:string){
  const q="select * from JournalEntry where DocNumber = '"+doc.replace(/'/g,"\\'")+"' maxresults 1";
  const data=await qboRequest('/v3/company/'+encodeURIComponent(realmId)+'/query?query='+encodeURIComponent(q)+'&minorversion=75');
  return (data?.QueryResponse?.JournalEntry||[])[0]||null;
}

export const getStaticProps:GetStaticProps<Props>=async()=>{
  if(process.env.VERCEL_ENV && process.env.VERCEL_ENV!=='production') return {props:{ok:true,posted:0,held:0}};

  const connection=await getLatestConnection();
  if(!connection) throw new Error('QuickBooks is not connected');
  const supabase=getServiceSupabase();

  const q=encodeURIComponent('select * from Account maxresults 1000');
  const data=await qboRequest('/v3/company/'+encodeURIComponent(connection.realm_id)+'/query?query='+q+'&minorversion=75');
  const accounts=data?.QueryResponse?.Account||[];

  const bank=findAccount(accounts,'1000',['Operating Checking']);
  const stripeClearing=findAccount(accounts,'1030',['Stripe Clearing']);
  const stripeFees=findAccount(accounts,'6110',['Stripe Processing Fees']);
  if(!bank||!stripeClearing||!stripeFees) throw new Error('Required bank/Stripe accounts are missing');

  const ids=Object.keys(RULES);
  const {data:rows,error}=await supabase.from('accounting_import_staging')
    .select('id,external_id,txn_date,description,net_amount,status')
    .eq('source','truist_bank')
    .in('external_id',ids);
  if(error) throw error;

  let posted=0,held=0;
  for(const row of rows||[]){
    if(row.status==='posted') continue;
    const rule=RULES[String(row.external_id)];
    if(!rule){held++;continue;}

    const doc='RV-'+String(row.external_id).replace(/^bank_/,'').slice(0,18);
    const existing=await existingJE(connection.realm_id,doc);
    if(existing?.Id){
      await supabase.from('accounting_import_staging').update({
        status:'posted',qbo_txn_id:existing.Id,posted_at:new Date().toISOString(),updated_at:new Date().toISOString(),
        notes:rule.note
      }).eq('id',row.id);
      posted++; continue;
    }

    const amount=Math.abs(Number(row.net_amount||0));
    if(amount<=0){held++;continue;}

    let lines:any[]=[];
    if(rule.kind==='self_stripe'){
      if(Math.abs(amount-49.99)>0.001){held++;continue;}
      lines=[
        {Amount:48.39,DetailType:'JournalEntryLineDetail',Description:'Internal Stripe self/test transfer net',JournalEntryLineDetail:{PostingType:'Debit',AccountRef:{value:stripeClearing.Id,name:stripeClearing.Name}}},
        {Amount:1.60,DetailType:'JournalEntryLineDetail',Description:'Stripe fee on internal self/test transaction',JournalEntryLineDetail:{PostingType:'Debit',AccountRef:{value:stripeFees.Id,name:stripeFees.Name}}},
        {Amount:49.99,DetailType:'JournalEntryLineDetail',Description:row.description,JournalEntryLineDetail:{PostingType:'Credit',AccountRef:{value:bank.Id,name:bank.Name}}},
      ];
    }else{
      const target=findAccount(accounts,rule.accountNumber,rule.accountNames||[]);
      if(!target){console.warn('Review posting held: target account unresolved',{externalId:row.external_id,rule});held++;continue;}
      lines=[
        {Amount:amount,DetailType:'JournalEntryLineDetail',Description:row.description,JournalEntryLineDetail:{PostingType:'Debit',AccountRef:{value:target.Id,name:target.Name}}},
        {Amount:amount,DetailType:'JournalEntryLineDetail',Description:row.description,JournalEntryLineDetail:{PostingType:'Credit',AccountRef:{value:bank.Id,name:bank.Name}}},
      ];
    }

    const created=await qboRequest('/v3/company/'+encodeURIComponent(connection.realm_id)+'/journalentry?minorversion=75',{
      method:'POST',
      body:JSON.stringify({TxnDate:row.txn_date,DocNumber:doc,PrivateNote:'NWS reviewed Truist import '+row.external_id+' | '+rule.note,Line:lines})
    });
    const qboId=created?.JournalEntry?.Id;
    if(!qboId) throw new Error('QuickBooks did not return JournalEntry ID for '+row.external_id);

    const {error:updateError}=await supabase.from('accounting_import_staging').update({
      status:'posted',qbo_txn_id:qboId,posted_at:new Date().toISOString(),updated_at:new Date().toISOString(),notes:rule.note
    }).eq('id',row.id);
    if(updateError) throw updateError;

    if(rule.kind==='self_stripe'){
      const {error:selfError}=await supabase.from('accounting_import_staging').update({
        status:'resolved_internal',qbo_txn_id:qboId,posted_at:new Date().toISOString(),updated_at:new Date().toISOString(),
        notes:'Matched to bank self-charge; excluded from revenue. Net $48.39 to Stripe Clearing and $1.60 Stripe fee.'
      }).eq('source','stripe_charge').eq('external_id','py_3UCgliIwQKMqOanf1pSXqGp6');
      if(selfError) throw selfError;
    }

    posted++;
  }

  console.info('Reviewed Truist posting completed',{posted,held});
  return {props:{ok:true,posted,held}};
};

export default function ReviewedTruistPost({posted,held}:Props){return <main><h1>Reviewed Truist posting</h1><p>Posted {posted}; held {held}</p></main>;}
