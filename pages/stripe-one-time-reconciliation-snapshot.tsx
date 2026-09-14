import type { GetStaticProps } from 'next';
import Stripe from 'stripe';

type Props = { ok: boolean };

export const getStaticProps: GetStaticProps<Props> = async () => {
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production') return { props: { ok: true } };

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured');
  const stripe = new Stripe(key, { apiVersion: '2023-10-16' });

  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
  const gte = Math.floor(start.getTime() / 1000);
  const lte = Math.floor(now.getTime() / 1000);

  const balance = await stripe.balance.retrieve();

  let payouts:any[] = [];
  let startingAfter:string|undefined;
  do {
    const page = await stripe.payouts.list({ created: { gte, lte }, limit: 100, ...(startingAfter ? { starting_after: startingAfter } : {}) });
    payouts = payouts.concat(page.data);
    if (!page.has_more || !page.data.length) break;
    startingAfter = page.data[page.data.length - 1].id;
  } while (true);

  let txns:any[] = [];
  startingAfter = undefined;
  do {
    const page = await stripe.balanceTransactions.list({ created: { gte, lte }, limit: 100, ...(startingAfter ? { starting_after: startingAfter } : {}) });
    txns = txns.concat(page.data);
    if (!page.has_more || !page.data.length) break;
    startingAfter = page.data[page.data.length - 1].id;
  } while (true);

  const byType:Record<string,{count:number,gross:number,fee:number,net:number}> = {};
  for (const t of txns) {
    const cur = byType[t.type] || { count: 0, gross: 0, fee: 0, net: 0 };
    cur.count += 1;
    cur.gross += t.amount / 100;
    cur.fee += t.fee / 100;
    cur.net += t.net / 100;
    byType[t.type] = cur;
  }
  for (const k of Object.keys(byType)) {
    byType[k] = {
      count: byType[k].count,
      gross: Number(byType[k].gross.toFixed(2)),
      fee: Number(byType[k].fee.toFixed(2)),
      net: Number(byType[k].net.toFixed(2)),
    };
  }

  const payoutSummary = {
    count: payouts.length,
    paid: Number((payouts.filter(p => p.status === 'paid').reduce((s,p)=>s+p.amount,0)/100).toFixed(2)),
    pending: Number((payouts.filter(p => p.status !== 'paid').reduce((s,p)=>s+p.amount,0)/100).toFixed(2)),
    items: payouts.map(p => ({
      id:p.id,
      amount:Number((p.amount/100).toFixed(2)),
      arrival_date:new Date(p.arrival_date*1000).toISOString().slice(0,10),
      status:p.status,
      description:p.description || null,
    })),
  };

  const balanceSummary = {
    available: balance.available.map(b => ({currency:b.currency, amount:Number((b.amount/100).toFixed(2))})),
    pending: balance.pending.map(b => ({currency:b.currency, amount:Number((b.amount/100).toFixed(2))})),
    instantAvailable: (balance.instant_available || []).map((b:any)=>({currency:b.currency, amount:Number((b.amount/100).toFixed(2))})),
  };

  console.info('Historical Stripe reconciliation snapshot', {
    accountId: balance.livemode ? 'live' : 'test',
    period: { start: start.toISOString().slice(0,10), end: now.toISOString().slice(0,10) },
    balanceSummary,
    payoutSummary,
    byType,
  });

  return { props: { ok: true } };
};

export default function StripeReconciliationSnapshot() {
  return <main><h1>Stripe reconciliation snapshot generated</h1></main>;
}
