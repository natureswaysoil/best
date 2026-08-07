import type { NextApiRequest,NextApiResponse } from 'next';
import Stripe from 'stripe';
import { Resend } from 'resend';
import economics from '../../../config/product-economics.json';
import { getServiceSupabase } from '../../../lib/supabase';

const owner=process.env.SALES_TO||process.env.JAMES_TO||'natureswaysoil@gmail.com';
const from=process.env.RESEND_FROM||"Nature's Way Soil <no-reply@natureswaysoil.com>";
const safe=(v:unknown)=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const seasonal=(month:number)=> month<=2?'Prepare spring lawn, garden, and pasture campaigns.':month<=5?'Prioritize lawns, transplants, tomatoes, and pet-lawn recovery.':month<=8?'Prioritize drought stress, water retention, kelp, humic, and biochar.':month<=10?'Prioritize overseeding, lawn recovery, compost, and soil rebuilding.':'Prioritize giftable garden products and next-season soil preparation.';

export default async function handler(req:NextApiRequest,res:NextApiResponse){
  const token=req.headers.authorization?.replace(/^Bearer\s+/i,'')||String(req.query.secret||'');
  if(!process.env.CRON_SECRET||token!==process.env.CRON_SECRET)return res.status(401).json({error:'Unauthorized'});
  if(!process.env.STRIPE_SECRET_KEY)return res.status(503).json({error:'Stripe not configured'});
  const dry=req.query.dry_run==='true',stripe=new Stripe(process.env.STRIPE_SECRET_KEY,{apiVersion:'2023-10-16'}),now=Math.floor(Date.now()/1000);
  const intents=(await stripe.paymentIntents.list({limit:100,created:{gte:now-30*86400}})).data.filter(x=>x.status==='succeeded');
  const byProduct=new Map<string,{name:string,revenue:number,orders:number}>();
  for(const pi of intents){const id=pi.metadata?.product_id||'unknown',name=pi.metadata?.product_name||pi.description||id,current=byProduct.get(id)||{name,revenue:0,orders:0};current.revenue+=(pi.amount_received||pi.amount)/100;current.orders++;byProduct.set(id,current);}
  const marginRates=(economics.marginRates||{}) as Record<string,number>,defaultRate=Number(economics.defaultMarginRate||0);
  const rows=Array.from(byProduct.entries()).map(([id,x])=>({...x,id,margin:marginRates[id],estimatedProfit:x.revenue*(marginRates[id]??defaultRate)})).sort((a,b)=>b.estimatedProfit-a.estimatedProfit);
  const notes=[seasonal(new Date().getUTCMonth()+1),Object.keys(marginRates).length?'Verified product margin overrides are active.':'COGS is missing; profit uses the configured estimated default margin and must not drive automatic price changes.'];
  let inventory={tracked:0,out_of_stock:0,note:'Inventory quantities are not configured; only in-stock status can be monitored.'};
  try{const db=getServiceSupabase();const {data}=await db.from('products').select('id,in_stock');const records=data||[];inventory={tracked:records.length,out_of_stock:records.filter((x:any)=>x.in_stock===false).length,note:records.length?'Product availability status loaded from Supabase.':'No inventory records found in Supabase.'};}catch{notes.push('Supabase inventory status was unavailable for this run.');}
  notes.push(`Inventory: ${inventory.tracked} products tracked, ${inventory.out_of_stock} marked out of stock. ${inventory.note}`);
  if(!dry&&process.env.RESEND_API_KEY){const resend=new Resend(process.env.RESEND_API_KEY),day=new Date().toISOString().slice(0,10);await resend.emails.send({from,to:[owner],subject:`[Revenue Brief] ${intents.length} paid orders in the last 30 days`,html:`<h2>Nature's Way Soil revenue intelligence</h2><p>${safe(notes.join(' '))}</p><table cellpadding="7"><tr><th>Product</th><th>Orders</th><th>Revenue</th><th>Estimated profit</th></tr>${rows.map(x=>`<tr><td>${safe(x.name)}</td><td>${x.orders}</td><td>$${x.revenue.toFixed(2)}</td><td>$${x.estimatedProfit.toFixed(2)}${x.margin===undefined?' (estimated)':''}</td></tr>`).join('')}</table>`},{idempotencyKey:`business-intelligence/${day}`});}
  return res.status(200).json({success:true,dry_run:dry,paid_orders:intents.length,revenue:Number(rows.reduce((s,x)=>s+x.revenue,0).toFixed(2)),estimated_profit:Number(rows.reduce((s,x)=>s+x.estimatedProfit,0).toFixed(2)),verified_margin_products:Object.keys(marginRates).length,inventory,notes,products:dry?rows:undefined});
}
