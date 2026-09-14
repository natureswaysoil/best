import type { GetStaticProps } from 'next';
import { getLatestConnection, qboRequest } from '../lib/quickbooks';

export const getStaticProps:GetStaticProps=async()=>{
  if(process.env.VERCEL_ENV && process.env.VERCEL_ENV!=='production') return {props:{}};
  const connection=await getLatestConnection();
  if(!connection) throw new Error('QuickBooks is not connected');
  const q=encodeURIComponent('select * from Account maxresults 1000');
  const data=await qboRequest('/v3/company/'+encodeURIComponent(connection.realm_id)+'/query?query='+q+'&minorversion=75');
  const accounts=data?.QueryResponse?.Account||[];
  const candidates=accounts.filter((a:any)=>{
    const name=String(a.FullyQualifiedName||a.Name||'').toLowerCase();
    return a.AccountType==='Credit Card' || name.includes('chase') || name.includes('credit card') || String(a.AcctNum||'')==='2100';
  }).map((a:any)=>({id:a.Id,name:a.FullyQualifiedName||a.Name,number:a.AcctNum||null,type:a.AccountType,subtype:a.AccountSubType,active:a.Active,balance:a.CurrentBalance}));
  console.info('QBO credit card candidates JSON',JSON.stringify(candidates));
  return {props:{}};
};
export default function CreditCardAudit(){return <main><h1>Credit card audit</h1></main>;}
