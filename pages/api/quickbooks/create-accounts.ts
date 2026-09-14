import type { NextApiRequest, NextApiResponse } from 'next';
import { adminAuthorized, getLatestConnection, qboRequest } from '../../../lib/quickbooks';

type AccountSpec = {
  number: string;
  name: string;
  accountType: string;
  accountSubType?: string;
};

const SAFE_CREATE: Record<string, AccountSpec> = {
  '1030': { number: '1030', name: 'Stripe Clearing', accountType: 'Other Current Asset', accountSubType: 'OtherCurrentAssets' },

  '2300': { number: '2300', name: 'Customer Deposits / Unearned Revenue', accountType: 'Other Current Liability', accountSubType: 'OtherCurrentLiabilities' },
  '2400': { number: '2400', name: 'Loans Payable', accountType: 'Long Term Liability', accountSubType: 'NotesPayable' },

  '3010': { number: '3010', name: 'Owner Contributions', accountType: 'Equity', accountSubType: 'OwnersEquity' },
  '3020': { number: '3020', name: 'Owner Draws / Distributions', accountType: 'Equity', accountSubType: 'OwnersEquity' },

  '4000': { number: '4000', name: 'Product Sales - Website / Stripe', accountType: 'Income', accountSubType: 'SalesOfProductIncome' },
  '4020': { number: '4020', name: 'Wholesale / Retail Sales', accountType: 'Income', accountSubType: 'SalesOfProductIncome' },
  '4030': { number: '4030', name: 'Government / B2B Sales', accountType: 'Income', accountSubType: 'SalesOfProductIncome' },
  '4040': { number: '4040', name: 'Shipping Income', accountType: 'Income', accountSubType: 'OtherPrimaryIncome' },

  '5000': { number: '5000', name: 'COGS - Ingredients', accountType: 'Cost of Goods Sold', accountSubType: 'SuppliesMaterialsCogs' },
  '5010': { number: '5010', name: 'COGS - Packaging', accountType: 'Cost of Goods Sold', accountSubType: 'SuppliesMaterialsCogs' },
  '5090': { number: '5090', name: 'Inventory Adjustments / Shrinkage', accountType: 'Cost of Goods Sold', accountSubType: 'OtherCostsOfServiceCos' },

  '6010': { number: '6010', name: 'Advertising - Google', accountType: 'Expense', accountSubType: 'AdvertisingPromotional' },
  '6020': { number: '6020', name: 'Advertising - Meta / Social', accountType: 'Expense', accountSubType: 'AdvertisingPromotional' },
  '6110': { number: '6110', name: 'Stripe Processing Fees', accountType: 'Expense', accountSubType: 'BankCharges' },
  '6210': { number: '6210', name: 'Shipping Supplies', accountType: 'Expense', accountSubType: 'SuppliesMaterials' },
  '6320': { number: '6320', name: 'Fuel & Equipment Operating Costs', accountType: 'Expense', accountSubType: 'OtherMiscellaneousExpense' },
  '6340': { number: '6340', name: 'Waste / Disposal', accountType: 'Expense', accountSubType: 'OtherMiscellaneousExpense' },
  '6400': { number: '6400', name: 'Software & Online Services', accountType: 'Expense', accountSubType: 'OtherMiscellaneousExpense' },
  '6410': { number: '6410', name: 'Website & Hosting', accountType: 'Expense', accountSubType: 'OtherMiscellaneousExpense' },
  '6430': { number: '6430', name: 'Telephone & Internet', accountType: 'Expense', accountSubType: 'Utilities' },
  '6540': { number: '6540', name: 'Dues, Subscriptions & Memberships', accountType: 'Expense', accountSubType: 'DuesSubscriptions' },
  '6550': { number: '6550', name: 'Education & Training', accountType: 'Expense', accountSubType: 'OtherMiscellaneousExpense' },
};

function normalize(value: unknown) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
}

async function fetchAccounts(realmId: string) {
  const query = encodeURIComponent('select * from Account maxresults 1000');
  const data = await qboRequest(
    '/v3/company/' + encodeURIComponent(realmId) + '/query?query=' + query + '&minorversion=75'
  );
  return data?.QueryResponse?.Account || [];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });

  const secret = req.headers['x-quickbooks-admin-secret'] || req.body?.secret;
  if (!adminAuthorized(secret)) return res.status(401).json({ error: 'Unauthorized' });

  const requested = Array.isArray(req.body?.accountNumbers) ? req.body.accountNumbers.map(String) : [];
  const confirm = req.body?.confirm === true;

  const specs = requested.map((number: string) => SAFE_CREATE[number]).filter(Boolean);
  if (!specs.length) {
    return res.status(400).json({ error: 'No approved account numbers were selected' });
  }

  const connection = await getLatestConnection();
  if (!connection) return res.status(409).json({ error: 'QuickBooks is not connected' });

  try {
    let live = await fetchAccounts(connection.realm_id);
    const results: any[] = [];

    for (const spec of specs) {
      const duplicate = live.find((a: any) =>
        (a.AcctNum && String(a.AcctNum) === spec.number) ||
        normalize(a.Name) === normalize(spec.name) ||
        normalize(a.FullyQualifiedName) === normalize(spec.name)
      );

      if (duplicate) {
        results.push({
          number: spec.number,
          name: spec.name,
          action: 'skipped_existing',
          existingId: duplicate.Id,
          existingName: duplicate.FullyQualifiedName || duplicate.Name,
        });
        continue;
      }

      if (!confirm) {
        results.push({
          number: spec.number,
          name: spec.name,
          action: 'would_create',
          accountType: spec.accountType,
          accountSubType: spec.accountSubType || null,
        });
        continue;
      }

      const payload: any = {
        Name: spec.name,
        AcctNum: spec.number,
        AccountType: spec.accountType,
      };
      if (spec.accountSubType) payload.AccountSubType = spec.accountSubType;

      const created = await qboRequest(
        '/v3/company/' + encodeURIComponent(connection.realm_id) + '/account?minorversion=75',
        { method: 'POST', body: JSON.stringify(payload) }
      );

      const account = created?.Account;
      results.push({
        number: spec.number,
        name: spec.name,
        action: 'created',
        id: account?.Id || null,
        accountType: account?.AccountType || spec.accountType,
        accountSubType: account?.AccountSubType || spec.accountSubType || null,
      });

      live = await fetchAccounts(connection.realm_id);
    }

    return res.status(200).json({
      confirmed: confirm,
      requested: specs.length,
      results,
    });
  } catch (error: any) {
    console.error('QuickBooks create accounts failed:', error);
    return res.status(500).json({ error: error?.message || 'QuickBooks account creation failed' });
  }
}
