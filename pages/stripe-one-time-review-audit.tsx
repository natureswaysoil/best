import type { GetStaticProps } from 'next';
import Stripe from 'stripe';

type Props = { ok: boolean };

const IDS = [
  'py_3S3704IwQKMqOanf24Eke8i5',
  'py_3S6gK4IwQKMqOanf0Ga7Qu9n',
  'py_3SJdIlIwQKMqOanf1AOmsMkP',
  'py_3SMrFkIwQKMqOanf0ytuTHTA',
  'ch_3STVzQIwQKMqOanf042YLiF0',
  'py_3Shfr4IwQKMqOanf1RSj9ANQ',
  'py_3TZKkEIwQKMqOanf4L6rNdZ4',
  'py_3UCgliIwQKMqOanf1pSXqGp6',
];

export const getStaticProps: GetStaticProps<Props> = async () => {
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production') {
    return { props: { ok: true } };
  }

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured');
  const stripe = new Stripe(key, { apiVersion: '2023-10-16' });

  const start = Math.floor(new Date('2025-09-01T00:00:00Z').getTime()/1000);
  const end = Math.floor(new Date('2026-09-15T00:00:00Z').getTime()/1000);

  let txns:any[] = [];
  let startingAfter:string|undefined;
  do {
    const page: Stripe.ApiList<Stripe.BalanceTransaction> = await stripe.balanceTransactions.list({
      created:{gte:start,lte:end},
      limit:100,
      ...(startingAfter ? {starting_after:startingAfter} : {}),
    });
    txns = txns.concat(page.data);
    if (!page.has_more || !page.data.length) break;
    startingAfter = page.data[page.data.length-1].id;
  } while (true);

  const matched:any[] = [];
  for (const t of txns) {
    const sourceId = typeof t.source === 'string' ? t.source : t.source?.id;
    if (!sourceId || !IDS.includes(sourceId)) continue;

    let source:any = null;
    try {
      const expanded:any = await stripe.balanceTransactions.retrieve(t.id, { expand: ['source'] });
      source = typeof expanded.source === 'string' ? null : expanded.source;
    } catch {}

    matched.push({
      balanceTxnId:t.id,
      sourceId,
      created:new Date(t.created*1000).toISOString(),
      type:t.type,
      amount:t.amount/100,
      fee:t.fee/100,
      net:t.net/100,
      description:t.description || null,
      source: source ? {
        id:source.id,
        status:source.status,
        paid:source.paid,
        amount:source.amount/100,
        refunded:source.refunded,
        amountRefunded:source.amount_refunded/100,
        description:source.description || null,
        receiptEmail:source.receipt_email || null,
        billingEmail:source.billing_details?.email || null,
        billingName:source.billing_details?.name || null,
        customer:typeof source.customer === 'string' ? source.customer : source.customer?.id || null,
        invoice:typeof source.invoice === 'string' ? source.invoice : source.invoice?.id || null,
        paymentIntent:typeof source.payment_intent === 'string' ? source.payment_intent : source.payment_intent?.id || null,
        statementDescriptor:source.statement_descriptor || null,
        metadata:source.metadata || {},
        customerEmail:source.customer_email || source.email || null,
        customerName:source.customer_name || source.name || null,
        cardLast4:source.card?.last4 || source.payment_method_details?.card?.last4 || null,
        cardBrand:source.card?.brand || source.payment_method_details?.card?.brand || null,
      } : null,
    });
  }

  console.info('Stripe review-source audit', { matched });
  return { props:{ok:true} };
};

export default function StripeReviewAudit(){ return <main><h1>Stripe review audit</h1></main>; }
