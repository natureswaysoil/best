import type Stripe from 'stripe';
import { getLatestConnection } from './quickbooks';
import { getServiceSupabase } from './supabase';
import {
  REQUIRED_STRIPE_ACCOUNTS,
  STRIPE_ACCOUNT_NUMBERS,
  getAccountsByNumber,
  postStagingRowExclusively,
} from './quickbooks-stripe-posting';

// Automatic QuickBooks posting for website (Stripe) sales.
//
// Off unless QUICKBOOKS_AUTO_POST=true. Each successful payment is written to
// accounting_import_staging (the same table the manual posting page uses) and,
// when the amounts are unambiguous, posted with the same journal entry layout
// as /api/quickbooks/post-stripe-staging. Anything unusual (sales tax, missing
// fee or shipping data, amounts that don't add up) is staged as 'review' for
// manual handling instead of being posted.

const SOURCE = 'stripe_charge';

export function quickBooksAutoPostEnabled() {
  return process.env.QUICKBOOKS_AUTO_POST === 'true';
}

function cents(value: unknown): number | null {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n) : null;
}

function dollars(value: number) {
  return Number((value / 100).toFixed(2));
}

function businessDate(unixSeconds: number) {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date(unixSeconds * 1000));
}

type StagingInsert = {
  source: string;
  external_id: string;
  txn_date: string;
  description: string;
  gross_amount: number;
  fee_amount: number;
  net_amount: number;
  suggested_account_number: string;
  status: 'auto_ready' | 'review';
  confidence: number;
  notes: string | null;
  metadata: Record<string, unknown>;
};

async function buildStagingRow(stripe: Stripe, paymentIntent: Stripe.PaymentIntent): Promise<StagingInsert | null> {
  const chargeRef = paymentIntent.latest_charge;
  const chargeId = typeof chargeRef === 'string' ? chargeRef : chargeRef?.id;
  if (!chargeId) return null;

  const charge = await stripe.charges.retrieve(chargeId, { expand: ['balance_transaction'] });
  const bt = charge.balance_transaction && typeof charge.balance_transaction === 'object'
    ? (charge.balance_transaction as Stripe.BalanceTransaction)
    : null;

  const sessions = await stripe.checkout.sessions.list({ payment_intent: paymentIntent.id, limit: 1 });
  const session = sessions.data[0];

  const md = paymentIntent.metadata || {};
  const grossCents = charge.amount_captured || charge.amount;
  const shippingCents = cents(md.shipping_cents);
  const subtotalCents = cents(md.subtotal_cents);
  const taxCents = session ? (session.total_details?.amount_tax || 0) : (cents(md.tax_cents) || 0);
  const discountCents = session ? (session.total_details?.amount_discount || 0) : (cents(md.discount_cents) || 0);

  const reasons: string[] = [];
  if (charge.currency !== 'usd') reasons.push('non-USD charge');
  if (!bt) reasons.push('Stripe fee not available yet');
  if (shippingCents === null) reasons.push('shipping amount not recorded on payment');
  if (taxCents > 0) reasons.push('sales tax collected; needs a sales tax liability line');
  if (subtotalCents !== null && shippingCents !== null) {
    const expected = subtotalCents - discountCents + (shippingCents || 0) + taxCents;
    if (Math.abs(expected - grossCents) > 1) {
      reasons.push('amounts do not add up (expected ' + dollars(expected) + ', charged ' + dollars(grossCents) + ')');
    }
  } else if (subtotalCents === null) {
    reasons.push('subtotal not recorded on payment');
  }

  const productName = md.product_name || md.productName || paymentIntent.description || 'Website order';

  return {
    source: SOURCE,
    external_id: charge.id,
    txn_date: businessDate(charge.created),
    description: String(productName).slice(0, 500),
    gross_amount: dollars(grossCents),
    fee_amount: bt ? dollars(bt.fee) : 0,
    net_amount: bt ? dollars(bt.net) : dollars(grossCents),
    suggested_account_number: '4000',
    status: reasons.length ? 'review' : 'auto_ready',
    confidence: reasons.length ? 0.5 : 1,
    notes: reasons.length ? 'Auto-post held: ' + reasons.join('; ') : null,
    metadata: {
      tax: dollars(taxCents),
      discount: dollars(discountCents),
      shipping: dollars(shippingCents || 0),
      subtotal: subtotalCents === null ? null : dollars(subtotalCents),
      product_name: productName,
      payment_intent: paymentIntent.id,
      checkout_session: session?.id || null,
      staged_by: 'stripe_webhook',
    },
  };
}

function chargeIdOf(paymentIntent: Stripe.PaymentIntent) {
  const ref = paymentIntent.latest_charge;
  return typeof ref === 'string' ? ref : ref?.id || null;
}

// Used when the Stripe lookups fail: record the sale from the payment itself so
// it still shows up for review instead of being lost.
function fallbackStagingRow(paymentIntent: Stripe.PaymentIntent, chargeId: string, reason: string): StagingInsert {
  const md = paymentIntent.metadata || {};
  const grossCents = paymentIntent.amount_received || paymentIntent.amount;
  const productName = md.product_name || md.productName || paymentIntent.description || 'Website order';
  return {
    source: SOURCE,
    external_id: chargeId,
    txn_date: businessDate(paymentIntent.created),
    description: String(productName).slice(0, 500),
    gross_amount: dollars(grossCents),
    fee_amount: 0,
    net_amount: dollars(grossCents),
    suggested_account_number: '4000',
    status: 'review',
    confidence: 0.3,
    notes: ('Auto-post held: Stripe lookup failed (' + reason + ')').slice(0, 1000),
    metadata: { payment_intent: paymentIntent.id, product_name: productName, staged_by: 'stripe_webhook_fallback' },
  };
}

/**
 * Write the payment to accounting_import_staging (never overwriting an existing
 * row). Throws only if the row can't be saved; the hourly reconciliation job
 * picks those payments up again.
 */
async function stageStripePayment(stripe: Stripe, paymentIntent: Stripe.PaymentIntent) {
  const chargeId = chargeIdOf(paymentIntent);
  if (!chargeId) return null;

  let staged: StagingInsert | null;
  try {
    staged = await buildStagingRow(stripe, paymentIntent);
  } catch (error: any) {
    staged = fallbackStagingRow(paymentIntent, chargeId, String(error?.message || error).slice(0, 300));
  }
  if (!staged) return null;

  const supabase = getServiceSupabase();
  const { error: insertError } = await supabase
    .from('accounting_import_staging')
    .upsert(staged, { onConflict: 'source,external_id', ignoreDuplicates: true });
  if (insertError) throw insertError;

  const { data: row, error: readError } = await supabase
    .from('accounting_import_staging')
    .select('id,status,notes')
    .eq('source', SOURCE)
    .eq('external_id', staged.external_id)
    .maybeSingle();
  if (readError) throw readError;
  return row ? { id: row.id as string, status: row.status as string, externalId: staged.external_id, notes: row.notes as string | null } : null;
}

async function postIfReady(rowId: string) {
  const connection = await getLatestConnection();
  if (!connection) return { action: 'not_connected' };

  const accountMap = await getAccountsByNumber(connection.realm_id, STRIPE_ACCOUNT_NUMBERS);
  const missing = REQUIRED_STRIPE_ACCOUNTS.filter((n) => !accountMap[n]);
  if (missing.length) return { action: 'missing_accounts', missing };

  // Same claim as the manual endpoint: only the claim owner checks and posts.
  return postStagingRowExclusively(connection.realm_id, rowId, accountMap);
}

/**
 * Stage a successful Stripe payment and post it to QuickBooks when it is safe to.
 * Never throws: accounting problems must not break order processing.
 */
export async function autoPostStripePayment(stripe: Stripe, paymentIntent: Stripe.PaymentIntent) {
  if (!quickBooksAutoPostEnabled()) return { action: 'disabled' };

  try {
    const staged = await stageStripePayment(stripe, paymentIntent);
    if (!staged) return { action: 'no_charge' };
    if (staged.status !== 'auto_ready') {
      return { action: 'not_posted', externalId: staged.externalId, reason: staged.notes || staged.status };
    }

    const result = await postIfReady(staged.id);
    console.info('QuickBooks auto-post', staged.externalId, result);
    return result;
  } catch (error) {
    console.error('QuickBooks auto-post failed for payment', paymentIntent.id, error);
    return { action: 'error', paymentIntent: paymentIntent.id };
  }
}

/**
 * Safety net for anything the webhook missed (Supabase or QuickBooks down,
 * a webhook that never arrived). Looks at successful payments from the last
 * `days` days: stages any that have no staging row and retries posting rows
 * still marked auto_ready. Idempotent, so it is safe to run on a schedule.
 */
export async function reconcileRecentStripePayments(stripe: Stripe, days = 3, maxPayments = 200) {
  if (!quickBooksAutoPostEnabled()) return { action: 'disabled' };

  const since = Math.floor(Date.now() / 1000) - days * 86400;
  const summary = { checked: 0, staged: 0, posted: 0, held: 0, errors: [] as string[] };

  for await (const paymentIntent of stripe.paymentIntents.list({ created: { gte: since }, limit: 100 })) {
    if (summary.checked >= maxPayments) break;
    if (paymentIntent.status !== 'succeeded') continue;
    summary.checked += 1;

    try {
      const chargeId = chargeIdOf(paymentIntent);
      if (!chargeId) continue;

      const { data: existing, error } = await getServiceSupabase()
        .from('accounting_import_staging')
        .select('id,status')
        .eq('source', SOURCE)
        .eq('external_id', chargeId)
        .maybeSingle();
      if (error) throw error;
      if (existing && existing.status !== 'auto_ready') continue;

      const staged = existing ? { id: existing.id as string, status: existing.status as string } : await stageStripePayment(stripe, paymentIntent);
      if (!existing && staged) summary.staged += 1;
      if (!staged || staged.status !== 'auto_ready') { if (staged) summary.held += 1; continue; }

      const result: any = await postIfReady(staged.id);
      if (result.action === 'posted') summary.posted += 1;
      else if (result.action === 'not_connected' || result.action === 'missing_accounts') {
        summary.errors.push(result.action);
        break; // nothing else can post either
      }
    } catch (error: any) {
      summary.errors.push(paymentIntent.id + ': ' + String(error?.message || error).slice(0, 200));
    }
  }

  return summary;
}
