import { getServiceSupabase } from './supabase';
import { quickBooksApi } from './quickbooks';

export type ChartAccount = {
  key: string;
  name: string;
  accountType: string;
  description: string;
};

// Purpose-built chart for Nature's Way Soil & Vermicompost LLC.
// We intentionally avoid creating QuickBooks system-controlled accounts such as
// Accounts Receivable, Accounts Payable, Undeposited Funds, and Sales Tax Payable.
// Those are discovered and used when available rather than duplicated.
export const NATURES_WAY_CHART: ChartAccount[] = [
  { key: 'checking', name: 'Operating Checking', accountType: 'Bank', description: 'Primary operating bank account.' },
  { key: 'savings', name: 'Business Savings', accountType: 'Bank', description: 'Business savings and reserve cash.' },
  { key: 'stripe_clearing', name: 'Stripe Clearing', accountType: 'Other Current Asset', description: 'Website sales awaiting Stripe payout.' },
  { key: 'amazon_clearing', name: 'Amazon Clearing', accountType: 'Other Current Asset', description: 'Amazon sales awaiting settlement payout.' },
  { key: 'walmart_clearing', name: 'Walmart Clearing', accountType: 'Other Current Asset', description: 'Walmart sales awaiting settlement payout.' },
  { key: 'inventory_asset', name: 'Inventory Asset - Finished Goods and Materials', accountType: 'Other Current Asset', description: 'Finished products, ingredients, bottles, labels, packaging and other inventory on hand.' },
  { key: 'prepaid', name: 'Prepaid Expenses', accountType: 'Other Current Asset', description: 'Expenses paid before the related period.' },
  { key: 'equipment', name: 'Machinery and Equipment', accountType: 'Fixed Asset', description: 'Production, farm and material-handling equipment.' },
  { key: 'vehicles', name: 'Vehicles', accountType: 'Fixed Asset', description: 'Business vehicles and capitalized mobile equipment.' },
  { key: 'accum_depr', name: 'Accumulated Depreciation', accountType: 'Fixed Asset', description: 'Accumulated depreciation contra-asset; accountant review recommended.' },

  { key: 'credit_card', name: 'Business Credit Card', accountType: 'Credit Card', description: 'Primary business credit-card liability.' },
  { key: 'sales_tax', name: 'Sales Tax Payable - Manual/Marketplace', accountType: 'Other Current Liability', description: 'Sales tax liability only when not handled by QuickBooks automated sales tax or marketplace facilitator.' },
  { key: 'payroll_liab', name: 'Payroll Liabilities', accountType: 'Other Current Liability', description: 'Payroll withholding and payroll-related liabilities.' },
  { key: 'loan', name: 'Business Loans Payable', accountType: 'Long Term Liability', description: 'Long-term business borrowing.' },

  { key: 'owner_equity', name: "Owner's Equity", accountType: 'Equity', description: 'Owner capital and retained business equity.' },
  { key: 'owner_draw', name: "Owner's Draw", accountType: 'Equity', description: 'Owner distributions/draws.' },

  { key: 'website_sales', name: 'Sales - Website', accountType: 'Income', description: 'NatureWaySoil.com product revenue before refunds and discounts.' },
  { key: 'amazon_sales', name: 'Sales - Amazon', accountType: 'Income', description: 'Amazon product revenue before marketplace fees.' },
  { key: 'walmart_sales', name: 'Sales - Walmart', accountType: 'Income', description: 'Walmart Marketplace product revenue before marketplace fees.' },
  { key: 'wholesale_sales', name: 'Sales - Wholesale and Retail', accountType: 'Income', description: 'Wholesale, reseller and retail account product revenue.' },
  { key: 'government_sales', name: 'Sales - Government', accountType: 'Income', description: 'Federal, state, municipal and institutional contract revenue.' },
  { key: 'farm_sales', name: 'Sales - Farm and Other', accountType: 'Income', description: 'Other farm and direct product revenue.' },
  { key: 'shipping_income', name: 'Shipping Income', accountType: 'Income', description: 'Shipping and delivery amounts charged to customers.' },
  { key: 'discounts_refunds', name: 'Sales Discounts and Refunds', accountType: 'Income', description: 'Contra-revenue tracking for refunds, discounts and allowances.' },

  { key: 'cogs_ingredients', name: 'COGS - Ingredients and Raw Materials', accountType: 'Cost of Goods Sold', description: 'Fertilizer ingredients, amendments, biological inputs and other raw materials consumed in products sold.' },
  { key: 'cogs_packaging', name: 'COGS - Bottles, Caps, Labels and Packaging', accountType: 'Cost of Goods Sold', description: 'Direct containers, caps, sprayers, labels, bags, boxes and packaging for products sold.' },
  { key: 'cogs_direct_labor', name: 'COGS - Direct Production Labor', accountType: 'Cost of Goods Sold', description: 'Direct labor used to blend, fill, package and prepare finished goods.' },
  { key: 'cogs_inbound_freight', name: 'COGS - Inbound Freight', accountType: 'Cost of Goods Sold', description: 'Inbound freight directly attributable to inventory and production materials.' },
  { key: 'cogs_outbound_shipping', name: 'COGS - Customer Shipping and Fulfillment', accountType: 'Cost of Goods Sold', description: 'UPS, USPS, FedEx, Amazon inbound/fulfillment and other direct fulfillment costs.' },
  { key: 'cogs_amazon_fba', name: 'COGS - Amazon FBA Fulfillment', accountType: 'Cost of Goods Sold', description: 'Amazon FBA fulfillment and direct fulfillment-related charges.' },

  { key: 'amazon_fees', name: 'Marketplace Fees - Amazon', accountType: 'Expense', description: 'Amazon referral, subscription and other marketplace fees not classified as fulfillment COGS.' },
  { key: 'walmart_fees', name: 'Marketplace Fees - Walmart', accountType: 'Expense', description: 'Walmart Marketplace referral and marketplace fees.' },
  { key: 'stripe_fees', name: 'Merchant Processing Fees - Stripe', accountType: 'Expense', description: 'Stripe payment-processing fees.' },
  { key: 'other_processing', name: 'Merchant Processing Fees - Other', accountType: 'Expense', description: 'Other payment-processing fees.' },
  { key: 'amazon_ads', name: 'Advertising - Amazon', accountType: 'Expense', description: 'Amazon Advertising spend.' },
  { key: 'google_ads', name: 'Advertising - Google', accountType: 'Expense', description: 'Google Ads spend.' },
  { key: 'social_ads', name: 'Advertising - Social Media', accountType: 'Expense', description: 'Facebook, Instagram, Pinterest and other social advertising.' },
  { key: 'marketing', name: 'Marketing and Promotion', accountType: 'Expense', description: 'Non-media marketing, promotions, samples and promotional materials.' },
  { key: 'supplies', name: 'Production Supplies', accountType: 'Expense', description: 'Production consumables not capitalized or included in inventory.' },
  { key: 'repairs', name: 'Repairs and Maintenance', accountType: 'Expense', description: 'Repairs and maintenance for equipment, production systems and facilities.' },
  { key: 'fuel', name: 'Fuel and Vehicle Expense', accountType: 'Expense', description: 'Business fuel and non-capital vehicle operating costs.' },
  { key: 'utilities', name: 'Utilities', accountType: 'Expense', description: 'Electricity, water, internet and other business utilities.' },
  { key: 'software', name: 'Software and Online Services', accountType: 'Expense', description: 'Software subscriptions, web hosting, cloud services and online tools.' },
  { key: 'professional', name: 'Professional Fees', accountType: 'Expense', description: 'Accounting, bookkeeping, legal and consulting fees.' },
  { key: 'insurance', name: 'Business Insurance', accountType: 'Expense', description: 'Business insurance premiums.' },
  { key: 'licenses', name: 'Licenses, Permits and Regulatory Fees', accountType: 'Expense', description: 'Registrations, licenses, permits and regulatory fees.' },
  { key: 'office', name: 'Office Expense', accountType: 'Expense', description: 'Office supplies and administrative expenses.' },
  { key: 'telephone', name: 'Telephone and Communications', accountType: 'Expense', description: 'Business phone and communications services.' },
  { key: 'travel', name: 'Travel', accountType: 'Expense', description: 'Business travel excluding meals.' },
  { key: 'meals', name: 'Business Meals', accountType: 'Expense', description: 'Business meals; tax deductibility should be reviewed at year end.' },
  { key: 'payroll', name: 'Payroll Expense', accountType: 'Expense', description: 'Wages and payroll expenses not classified as direct production labor.' },
  { key: 'payroll_tax', name: 'Payroll Tax Expense', accountType: 'Expense', description: 'Employer payroll taxes.' },
  { key: 'rent', name: 'Rent and Lease Expense', accountType: 'Expense', description: 'Business rent and operating lease expense.' },
  { key: 'bank_fees', name: 'Bank Fees', accountType: 'Expense', description: 'Bank service charges and account fees.' },
  { key: 'interest', name: 'Interest Expense', accountType: 'Other Expense', description: 'Interest on business debt.' },
  { key: 'depreciation', name: 'Depreciation Expense', accountType: 'Other Expense', description: 'Depreciation expense; normally posted from accountant-approved schedules.' },
  { key: 'misc', name: 'Other Business Expense', accountType: 'Expense', description: 'Infrequent business expenses that do not fit another account.' },
];

function escapeQboQuery(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

export async function queryQuickBooks(query: string) {
  const encoded = encodeURIComponent(query);
  return quickBooksApi(`/query?query=${encoded}&minorversion=75`);
}

export async function findAccountByName(name: string): Promise<any | null> {
  const payload = await queryQuickBooks(`select * from Account where Name = '${escapeQboQuery(name)}' maxresults 1`);
  return payload?.QueryResponse?.Account?.[0] || null;
}

export async function ensureAccount(definition: ChartAccount) {
  const existing = await findAccountByName(definition.name);
  if (existing) return { account: existing, created: false };

  const payload = await quickBooksApi('/account?minorversion=75', {
    method: 'POST',
    body: JSON.stringify({
      Name: definition.name,
      AccountType: definition.accountType,
      Description: definition.description,
    }),
  });
  return { account: payload?.Account, created: true };
}

export async function installNatureWayChartOfAccounts() {
  const results: Array<{ key: string; name: string; id?: string; created: boolean }> = [];
  for (const definition of NATURES_WAY_CHART) {
    const result = await ensureAccount(definition);
    results.push({
      key: definition.key,
      name: definition.name,
      id: result.account?.Id,
      created: result.created,
    });
  }
  return results;
}

export async function getAccountMap(): Promise<Record<string, any>> {
  const map: Record<string, any> = {};
  for (const definition of NATURES_WAY_CHART) {
    const account = await findAccountByName(definition.name);
    if (account) map[definition.key] = account;
  }
  return map;
}

export async function getOrCreateCustomer(input: { name?: string; email?: string }) {
  const displayName = (input.name || input.email || 'Website Customer').trim().slice(0, 100);
  const email = (input.email || '').trim().toLowerCase();

  if (email) {
    const payload = await queryQuickBooks(`select * from Customer where PrimaryEmailAddr = '${escapeQboQuery(email)}' maxresults 1`);
    const existing = payload?.QueryResponse?.Customer?.[0];
    if (existing) return existing;
  }

  const byName = await queryQuickBooks(`select * from Customer where DisplayName = '${escapeQboQuery(displayName)}' maxresults 1`);
  if (byName?.QueryResponse?.Customer?.[0]) return byName.QueryResponse.Customer[0];

  const createPayload = await quickBooksApi('/customer?minorversion=75', {
    method: 'POST',
    body: JSON.stringify({
      DisplayName: displayName,
      ...(email ? { PrimaryEmailAddr: { Address: email } } : {}),
    }),
  });
  return createPayload?.Customer;
}

export async function getOrCreateSalesItem(input: { sku?: string; name: string; channel?: 'website' | 'amazon' | 'walmart' | 'wholesale' | 'government' }) {
  const sku = (input.sku || '').trim();
  const itemName = (sku ? `${sku} - ${input.name}` : input.name).slice(0, 100);
  const existingPayload = await queryQuickBooks(`select * from Item where Name = '${escapeQboQuery(itemName)}' maxresults 1`);
  const existing = existingPayload?.QueryResponse?.Item?.[0];
  if (existing) return existing;

  const accountMap = await getAccountMap();
  const incomeKey = input.channel === 'amazon' ? 'amazon_sales'
    : input.channel === 'walmart' ? 'walmart_sales'
    : input.channel === 'wholesale' ? 'wholesale_sales'
    : input.channel === 'government' ? 'government_sales'
    : 'website_sales';
  const income = accountMap[incomeKey];
  const expense = accountMap.cogs_ingredients;
  if (!income) throw new Error(`QuickBooks income account ${incomeKey} is missing. Install the chart of accounts first.`);

  const createPayload = await quickBooksApi('/item?minorversion=75', {
    method: 'POST',
    body: JSON.stringify({
      Name: itemName,
      Type: 'NonInventory',
      IncomeAccountRef: { value: income.Id, name: income.Name },
      ...(expense ? { ExpenseAccountRef: { value: expense.Id, name: expense.Name } } : {}),
      ...(sku ? { Sku: sku } : {}),
    }),
  });
  return createPayload?.Item;
}

export async function wasSynced(source: string, sourceId: string) {
  const supabase = getServiceSupabase();
  const { data } = await supabase
    .from('quickbooks_sync_log')
    .select('*')
    .eq('source', source)
    .eq('source_id', sourceId)
    .eq('status', 'posted')
    .maybeSingle();
  return data || null;
}

export async function recordSync(input: {
  source: string;
  sourceId: string;
  entity: string;
  qboId?: string;
  status: 'posted' | 'failed';
  amount?: number;
  payload?: unknown;
  error?: string;
}) {
  const supabase = getServiceSupabase();
  const { error } = await supabase.from('quickbooks_sync_log').upsert({
    source: input.source,
    source_id: input.sourceId,
    qbo_entity: input.entity,
    qbo_id: input.qboId || null,
    status: input.status,
    amount: input.amount ?? null,
    payload: input.payload || null,
    error_message: input.error || null,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'source,source_id' });
  if (error) throw new Error(`Could not save QuickBooks sync record: ${error.message}`);
}
