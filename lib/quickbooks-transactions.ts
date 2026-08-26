import Stripe from 'stripe';
import { quickBooksApi } from './quickbooks';
import {
  getAccountMap,
  getOrCreateCustomer,
  getOrCreateSalesItem,
  queryQuickBooks,
  recordSync,
  wasSynced,
} from './quickbooks-accounting';

function qboRef(entity: any) {
  if (!entity?.Id) throw new Error('QuickBooks entity reference is missing an Id');
  return { value: String(entity.Id), ...(entity.Name ? { name: entity.Name } : {}) };
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

async function ensureServiceItem(name: string, incomeAccount: any) {
  const safe = name.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const existingPayload = await queryQuickBooks(`select * from Item where Name = '${safe}' maxresults 1`);
  const existing = existingPayload?.QueryResponse?.Item?.[0];
  if (existing) return existing;

  const payload = await quickBooksApi('/item?minorversion=75', {
    method: 'POST',
    body: JSON.stringify({
      Name: name,
      Type: 'Service',
      IncomeAccountRef: qboRef(incomeAccount),
    }),
  });
  return payload?.Item;
}

async function createJournalEntry(input: {
  privateNote: string;
  docNumber?: string;
  lines: Array<{ account: any; amount: number; postingType: 'Debit' | 'Credit'; description?: string }>;
}) {
  const payload = await quickBooksApi('/journalentry?minorversion=75', {
    method: 'POST',
    body: JSON.stringify({
      PrivateNote: input.privateNote,
      ...(input.docNumber ? { DocNumber: input.docNumber.slice(0, 21) } : {}),
      Line: input.lines.map((line, index) => ({
        Id: String(index + 1),
        Amount: roundMoney(line.amount),
        ...(line.description ? { Description: line.description } : {}),
        DetailType: 'JournalEntryLineDetail',
        JournalEntryLineDetail: {
          PostingType: line.postingType,
          AccountRef: qboRef(line.account),
        },
      })),
    }),
  });
  return payload?.JournalEntry;
}

export async function postWebsiteCheckoutToQuickBooks(session: Stripe.Checkout.Session, productLineItems: Stripe.LineItem[]) {
  const sourceId = session.id;
  const existing = await wasSynced('stripe_checkout', sourceId);
  if (existing) return { skipped: true, qboId: existing.qbo_id };

  const accountMap = await getAccountMap();
  if (!accountMap.stripe_clearing || !accountMap.website_sales || !accountMap.shipping_income) {
    throw new Error('QuickBooks chart of accounts has not been installed completely.');
  }

  const customerName = session.customer_details?.name || session.shipping_details?.name || 'Website Customer';
  const customerEmail = session.customer_details?.email || session.customer_email || '';
  const customer = await getOrCreateCustomer({ name: customerName, email: customerEmail });
  const metadata = session.metadata || {};

  const productLines: any[] = [];
  for (const lineItem of productLineItems) {
    const description = lineItem.description || metadata.productName || metadata.product_name || 'Nature’s Way Soil Product';
    const sku = metadata.sku || '';
    const item = await getOrCreateSalesItem({ sku, name: description, channel: 'website' });
    const quantity = Number(lineItem.quantity || 1);
    const amount = roundMoney((lineItem.amount_subtotal || 0) / 100);
    const unitPrice = quantity > 0 ? roundMoney(amount / quantity) : amount;
    productLines.push({
      Amount: amount,
      Description: description,
      DetailType: 'SalesItemLineDetail',
      SalesItemLineDetail: {
        ItemRef: qboRef(item),
        Qty: quantity,
        UnitPrice: unitPrice,
      },
    });
  }

  const shipping = roundMoney((session.total_details?.amount_shipping || 0) / 100);
  if (shipping > 0) {
    const shippingItem = await ensureServiceItem('Website Shipping', accountMap.shipping_income);
    productLines.push({
      Amount: shipping,
      Description: 'Shipping charged to customer',
      DetailType: 'SalesItemLineDetail',
      SalesItemLineDetail: { ItemRef: qboRef(shippingItem), Qty: 1, UnitPrice: shipping },
    });
  }

  const salesTax = roundMoney((session.total_details?.amount_tax || 0) / 100);
  const accountingSalesTotal = roundMoney(productLines.reduce((sum, line) => sum + Number(line.Amount || 0), 0));

  try {
    const receiptPayload = await quickBooksApi('/salesreceipt?minorversion=75', {
      method: 'POST',
      body: JSON.stringify({
        CustomerRef: qboRef(customer),
        DepositToAccountRef: qboRef(accountMap.stripe_clearing),
        PrivateNote: `Stripe checkout ${session.id}`,
        PaymentRefNum: typeof session.payment_intent === 'string' ? session.payment_intent : session.id,
        Line: productLines,
        ...(session.customer_details?.email ? { BillEmail: { Address: session.customer_details.email } } : {}),
      }),
    });
    const salesReceipt = receiptPayload?.SalesReceipt;

    // Stripe-collected tax is kept out of revenue. Because this integration is not
    // asking QuickBooks to calculate the tax, we add the tax amount to the Stripe
    // clearing balance and credit a dedicated liability account with a journal entry.
    // Marketplace-facilitator tax should be handled from marketplace settlements instead.
    if (salesTax > 0 && accountMap.sales_tax) {
      const taxSyncId = `${session.id}:tax`;
      if (!(await wasSynced('stripe_tax', taxSyncId))) {
        const taxJe = await createJournalEntry({
          privateNote: `Stripe sales tax collected for checkout ${session.id}`,
          docNumber: `ST-${session.id}`,
          lines: [
            { account: accountMap.stripe_clearing, amount: salesTax, postingType: 'Debit', description: 'Tax included in Stripe customer payment' },
            { account: accountMap.sales_tax, amount: salesTax, postingType: 'Credit', description: 'Sales tax liability' },
          ],
        });
        await recordSync({ source: 'stripe_tax', sourceId: taxSyncId, entity: 'JournalEntry', qboId: taxJe?.Id, status: 'posted', amount: salesTax, payload: taxJe });
      }
    }

    await recordSync({
      source: 'stripe_checkout',
      sourceId,
      entity: 'SalesReceipt',
      qboId: salesReceipt?.Id,
      status: 'posted',
      amount: accountingSalesTotal + salesTax,
      payload: salesReceipt,
    });
    return { skipped: false, qboId: salesReceipt?.Id };
  } catch (error) {
    await recordSync({
      source: 'stripe_checkout',
      sourceId,
      entity: 'SalesReceipt',
      status: 'failed',
      amount: roundMoney((session.amount_total || 0) / 100),
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

export async function postStripeProcessingFee(input: { balanceTransactionId: string; fee: number; net: number; gross: number; paymentId?: string }) {
  const sourceId = input.balanceTransactionId;
  const existing = await wasSynced('stripe_fee', sourceId);
  if (existing || input.fee <= 0) return { skipped: true, qboId: existing?.qbo_id };

  const accountMap = await getAccountMap();
  if (!accountMap.stripe_clearing || !accountMap.stripe_fees) throw new Error('Stripe QuickBooks accounts are missing.');

  try {
    const je = await createJournalEntry({
      privateNote: `Stripe processing fee ${sourceId}${input.paymentId ? ` for ${input.paymentId}` : ''}`,
      docNumber: `SF-${sourceId}`,
      lines: [
        { account: accountMap.stripe_fees, amount: input.fee, postingType: 'Debit', description: 'Stripe processing fee' },
        { account: accountMap.stripe_clearing, amount: input.fee, postingType: 'Credit', description: 'Fee withheld from Stripe proceeds' },
      ],
    });
    await recordSync({ source: 'stripe_fee', sourceId, entity: 'JournalEntry', qboId: je?.Id, status: 'posted', amount: input.fee, payload: { ...input, qbo: je } });
    return { skipped: false, qboId: je?.Id };
  } catch (error) {
    await recordSync({ source: 'stripe_fee', sourceId, entity: 'JournalEntry', status: 'failed', amount: input.fee, payload: input, error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
}

export async function postStripePayout(input: { payoutId: string; amount: number; bankAccountKey?: string }) {
  const existing = await wasSynced('stripe_payout', input.payoutId);
  if (existing) return { skipped: true, qboId: existing.qbo_id };

  const accountMap = await getAccountMap();
  const bank = accountMap[input.bankAccountKey || 'checking'];
  if (!bank || !accountMap.stripe_clearing) throw new Error('Stripe payout accounts are missing.');

  const je = await createJournalEntry({
    privateNote: `Stripe payout ${input.payoutId}`,
    docNumber: `SP-${input.payoutId}`,
    lines: [
      { account: bank, amount: input.amount, postingType: 'Debit', description: 'Stripe payout deposited to bank' },
      { account: accountMap.stripe_clearing, amount: input.amount, postingType: 'Credit', description: 'Clear Stripe receivable' },
    ],
  });
  await recordSync({ source: 'stripe_payout', sourceId: input.payoutId, entity: 'JournalEntry', qboId: je?.Id, status: 'posted', amount: input.amount, payload: je });
  return { skipped: false, qboId: je?.Id };
}

export async function postMarketplaceSettlement(input: {
  marketplace: 'amazon' | 'walmart';
  settlementId: string;
  grossSales: number;
  refunds?: number;
  marketplaceFees?: number;
  fulfillmentFees?: number;
  advertising?: number;
  otherAdjustments?: number;
  payout: number;
}) {
  const source = `${input.marketplace}_settlement`;
  const existing = await wasSynced(source, input.settlementId);
  if (existing) return { skipped: true, qboId: existing.qbo_id };

  const accounts = await getAccountMap();
  const sales = accounts[input.marketplace === 'amazon' ? 'amazon_sales' : 'walmart_sales'];
  const fees = accounts[input.marketplace === 'amazon' ? 'amazon_fees' : 'walmart_fees'];
  const clearing = accounts[input.marketplace === 'amazon' ? 'amazon_clearing' : 'walmart_clearing'];
  const advertising = input.marketplace === 'amazon' ? accounts.amazon_ads : accounts.marketing;
  const fulfillment = accounts.cogs_amazon_fba || accounts.cogs_outbound_shipping;
  const refundsAccount = accounts.discounts_refunds;
  const bank = accounts.checking;
  if (!sales || !fees || !clearing || !bank) throw new Error(`QuickBooks ${input.marketplace} settlement accounts are missing.`);

  const refund = Math.abs(input.refunds || 0);
  const marketplaceFees = Math.abs(input.marketplaceFees || 0);
  const fulfillmentFees = Math.abs(input.fulfillmentFees || 0);
  const adSpend = Math.abs(input.advertising || 0);
  const adjustment = input.otherAdjustments || 0;

  // Settlement journal entry books gross channel economics and the actual payout in one balanced entry.
  const lines: Array<{ account: any; amount: number; postingType: 'Debit' | 'Credit'; description?: string }> = [];
  if (input.payout > 0) lines.push({ account: bank, amount: input.payout, postingType: 'Debit', description: `${input.marketplace} settlement deposit` });
  if (refund > 0 && refundsAccount) lines.push({ account: refundsAccount, amount: refund, postingType: 'Debit', description: `${input.marketplace} refunds` });
  if (marketplaceFees > 0) lines.push({ account: fees, amount: marketplaceFees, postingType: 'Debit', description: `${input.marketplace} marketplace fees` });
  if (fulfillmentFees > 0 && fulfillment) lines.push({ account: fulfillment, amount: fulfillmentFees, postingType: 'Debit', description: `${input.marketplace} fulfillment fees` });
  if (adSpend > 0 && advertising) lines.push({ account: advertising, amount: adSpend, postingType: 'Debit', description: `${input.marketplace} advertising` });
  if (adjustment > 0) lines.push({ account: fees, amount: Math.abs(adjustment), postingType: 'Debit', description: `${input.marketplace} other charges/adjustments` });
  if (adjustment < 0) lines.push({ account: clearing, amount: Math.abs(adjustment), postingType: 'Debit', description: `${input.marketplace} positive adjustment` });
  if (input.grossSales > 0) lines.push({ account: sales, amount: input.grossSales, postingType: 'Credit', description: `${input.marketplace} gross sales` });

  const debits = roundMoney(lines.filter((l) => l.postingType === 'Debit').reduce((s, l) => s + l.amount, 0));
  const credits = roundMoney(lines.filter((l) => l.postingType === 'Credit').reduce((s, l) => s + l.amount, 0));
  const difference = roundMoney(credits - debits);
  if (difference > 0) lines.push({ account: clearing, amount: difference, postingType: 'Debit', description: 'Settlement timing/receivable balance' });
  if (difference < 0) lines.push({ account: clearing, amount: Math.abs(difference), postingType: 'Credit', description: 'Settlement timing/receivable balance' });

  const je = await createJournalEntry({ privateNote: `${input.marketplace} settlement ${input.settlementId}`, docNumber: `${input.marketplace === 'amazon' ? 'AMZ' : 'WMT'}-${input.settlementId}`, lines });
  await recordSync({ source, sourceId: input.settlementId, entity: 'JournalEntry', qboId: je?.Id, status: 'posted', amount: input.payout, payload: { ...input, qbo: je } });
  return { skipped: false, qboId: je?.Id };
}
