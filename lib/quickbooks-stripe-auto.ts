import crypto from 'crypto';
import type Stripe from 'stripe';
import { getLatestConnection } from './quickbooks';
import { getServiceSupabase } from './supabase';
import {
  REQUIRED_STRIPE_ACCOUNTS,
  STRIPE_ACCOUNT_NUMBERS,
  StripeStagingRow,
  getAccountsByNumber,
  postStripeStagingRow,
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
const LOCK_PREFIX = 'AUTO_POST_LOCK:';

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

/**
 * Stage a successful Stripe payment and post it to QuickBooks when it is safe to.
 * Never throws: accounting problems must not break order processing.
 */
export async function autoPostStripePayment(stripe: Stripe, paymentIntent: Stripe.PaymentIntent) {
  if (!quickBooksAutoPostEnabled()) return { action: 'disabled' };

  try {
    const staged = await buildStagingRow(stripe, paymentIntent);
    if (!staged) return { action: 'no_charge' };

    const supabase = getServiceSupabase();

    // ignoreDuplicates leaves rows that already exist (e.g. already posted) untouched.
    const { error: insertError } = await supabase
      .from('accounting_import_staging')
      .upsert(staged, { onConflict: 'source,external_id', ignoreDuplicates: true });
    if (insertError) throw insertError;

    // Claim the row so concurrent webhook deliveries can't post it twice.
    const lock = LOCK_PREFIX + crypto.randomUUID();
    const { data: claimed, error: claimError } = await supabase
      .from('accounting_import_staging')
      .update({ notes: lock, updated_at: new Date().toISOString() })
      .eq('source', SOURCE)
      .eq('external_id', staged.external_id)
      .eq('status', 'auto_ready')
      .is('notes', null)
      .select('id,external_id,txn_date,description,gross_amount,fee_amount,net_amount,status,metadata');
    if (claimError) throw claimError;

    const row = (claimed || [])[0] as StripeStagingRow | undefined;
    if (!row) return { action: 'not_posted', externalId: staged.external_id, reason: staged.notes || 'already handled' };

    const releaseWithNote = (note: string | null) => supabase
      .from('accounting_import_staging')
      .update({ notes: note, updated_at: new Date().toISOString() })
      .eq('id', row.id)
      .eq('notes', lock);

    try {
      const connection = await getLatestConnection();
      if (!connection) {
        await releaseWithNote('Auto-post skipped: QuickBooks is not connected');
        return { action: 'not_connected', externalId: row.external_id };
      }

      const accountMap = await getAccountsByNumber(connection.realm_id, STRIPE_ACCOUNT_NUMBERS);
      const missing = REQUIRED_STRIPE_ACCOUNTS.filter((n) => !accountMap[n]);
      if (missing.length) {
        await releaseWithNote('Auto-post skipped: missing QuickBooks accounts ' + missing.join(', '));
        return { action: 'missing_accounts', externalId: row.external_id, missing };
      }

      const result = await postStripeStagingRow(connection.realm_id, row, accountMap, true);
      if (result.action === 'posted' || result.action === 'skipped_existing') {
        await releaseWithNote(null);
      } else {
        await releaseWithNote('Auto-post held: ' + result.action);
      }
      console.info('QuickBooks auto-post', result);
      return result;
    } catch (error: any) {
      await releaseWithNote('Auto-post failed: ' + String(error?.message || error).slice(0, 500));
      throw error;
    }
  } catch (error) {
    console.error('QuickBooks auto-post failed for payment', paymentIntent.id, error);
    return { action: 'error', paymentIntent: paymentIntent.id };
  }
}
