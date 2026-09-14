import { FormEvent, useMemo, useState } from 'react';

type LiveAccount = {
  id: string;
  name: string;
  accountNumber: string | null;
  fullyQualifiedName?: string;
  accountType?: string;
  accountSubType?: string;
  active?: boolean;
  classification?: string;
  currentBalance?: number;
};

type TargetAccount = {
  number: string;
  name: string;
  group: string;
};

const TARGET_ACCOUNTS: TargetAccount[] = [
  { number: '1000', name: 'Operating Checking', group: 'Assets' },
  { number: '1010', name: 'Savings / Reserve', group: 'Assets' },
  { number: '1020', name: 'Undeposited Funds', group: 'Assets' },
  { number: '1030', name: 'Stripe Clearing', group: 'Assets' },
  { number: '1040', name: 'Amazon Clearing', group: 'Assets' },
  { number: '1100', name: 'Accounts Receivable', group: 'Assets' },
  { number: '1200', name: 'Inventory - Raw Materials', group: 'Assets' },
  { number: '1210', name: 'Inventory - Packaging', group: 'Assets' },
  { number: '1220', name: 'Inventory - Finished Goods', group: 'Assets' },
  { number: '1300', name: 'Prepaid Expenses', group: 'Assets' },
  { number: '1500', name: 'Farm & Production Equipment', group: 'Assets' },
  { number: '1510', name: 'Vehicles & Trailers', group: 'Assets' },
  { number: '1520', name: 'Computers & Office Equipment', group: 'Assets' },
  { number: '1530', name: 'Land Improvements & Irrigation', group: 'Assets' },
  { number: '1590', name: 'Accumulated Depreciation', group: 'Assets' },

  { number: '2000', name: 'Accounts Payable', group: 'Liabilities' },
  { number: '2100', name: 'Credit Card Payable', group: 'Liabilities' },
  { number: '2200', name: 'Sales Tax Payable', group: 'Liabilities' },
  { number: '2250', name: 'Payroll Liabilities', group: 'Liabilities' },
  { number: '2300', name: 'Customer Deposits / Unearned Revenue', group: 'Liabilities' },
  { number: '2400', name: 'Loans Payable', group: 'Liabilities' },

  { number: '3000', name: "Owner's Equity", group: 'Equity' },
  { number: '3010', name: 'Owner Contributions', group: 'Equity' },
  { number: '3020', name: 'Owner Draws / Distributions', group: 'Equity' },
  { number: '3090', name: 'Opening Balance Equity', group: 'Equity' },

  { number: '4000', name: 'Product Sales - Website / Stripe', group: 'Income' },
  { number: '4010', name: 'Product Sales - Amazon', group: 'Income' },
  { number: '4020', name: 'Wholesale / Retail Sales', group: 'Income' },
  { number: '4030', name: 'Government / B2B Sales', group: 'Income' },
  { number: '4040', name: 'Shipping Income', group: 'Income' },
  { number: '4050', name: 'Discounts & Promotions', group: 'Income' },
  { number: '4060', name: 'Returns & Refunds', group: 'Income' },
  { number: '4090', name: 'Other Operating Income', group: 'Income' },

  { number: '5000', name: 'COGS - Ingredients', group: 'COGS' },
  { number: '5010', name: 'COGS - Packaging', group: 'COGS' },
  { number: '5020', name: 'COGS - Direct Production Supplies', group: 'COGS' },
  { number: '5030', name: 'COGS - Inbound Freight', group: 'COGS' },
  { number: '5040', name: 'COGS - Contract / Direct Labor', group: 'COGS' },
  { number: '5090', name: 'Inventory Adjustments / Shrinkage', group: 'COGS' },

  { number: '6000', name: 'Advertising - Amazon PPC', group: 'Expenses' },
  { number: '6010', name: 'Advertising - Google', group: 'Expenses' },
  { number: '6020', name: 'Advertising - Meta / Social', group: 'Expenses' },
  { number: '6030', name: 'Advertising - Other', group: 'Expenses' },
  { number: '6100', name: 'Amazon Selling Fees', group: 'Expenses' },
  { number: '6110', name: 'Stripe Processing Fees', group: 'Expenses' },
  { number: '6120', name: 'Payment / Marketplace Fees - Other', group: 'Expenses' },
  { number: '6200', name: 'Outbound Shipping & Postage', group: 'Expenses' },
  { number: '6210', name: 'Shipping Supplies', group: 'Expenses' },
  { number: '6300', name: 'Supplies - Farm & Production', group: 'Expenses' },
  { number: '6310', name: 'Repairs & Maintenance - Equipment', group: 'Expenses' },
  { number: '6320', name: 'Fuel & Equipment Operating Costs', group: 'Expenses' },
  { number: '6330', name: 'Utilities', group: 'Expenses' },
  { number: '6340', name: 'Waste / Disposal', group: 'Expenses' },
  { number: '6400', name: 'Software & Online Services', group: 'Expenses' },
  { number: '6410', name: 'Website & Hosting', group: 'Expenses' },
  { number: '6420', name: 'Office Supplies', group: 'Expenses' },
  { number: '6430', name: 'Telephone & Internet', group: 'Expenses' },
  { number: '6500', name: 'Professional Fees - Accounting & Legal', group: 'Expenses' },
  { number: '6510', name: 'Bank Charges', group: 'Expenses' },
  { number: '6520', name: 'Insurance', group: 'Expenses' },
  { number: '6530', name: 'Licenses, Permits & Registrations', group: 'Expenses' },
  { number: '6540', name: 'Dues, Subscriptions & Memberships', group: 'Expenses' },
  { number: '6550', name: 'Education & Training', group: 'Expenses' },
  { number: '6600', name: 'Vehicle Expense', group: 'Expenses' },
  { number: '6610', name: 'Travel', group: 'Expenses' },
  { number: '6620', name: 'Meals - Business', group: 'Expenses' },
  { number: '6700', name: 'Property Taxes', group: 'Expenses' },
  { number: '6710', name: 'Interest Expense', group: 'Expenses' },
  { number: '6720', name: 'Rent / Lease Expense', group: 'Expenses' },
  { number: '6800', name: 'Payroll / Wages', group: 'Expenses' },
  { number: '6810', name: 'Payroll Taxes', group: 'Expenses' },
  { number: '6900', name: 'Bad Debt Expense', group: 'Expenses' },
  { number: '6990', name: 'Miscellaneous Business Expense', group: 'Expenses' },
];

function normalizeName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

const SUGGESTED_ALIASES: Record<string, string[]> = {
  '1040': ['Channel clearing account'],
  '2200': ['Channel sales tax payable'],
  '4010': ['Channel sales:Amazon sales'],
  '4040': ['Channel shipping income', 'Channel shipping income:Amazon shipping income'],
  '4050': ['Channel discount', 'Channel discount:Amazon discount'],
  '4060': ['Channel refund', 'Channel refund:Amazon refund'],
  '5020': ['Cost of goods sold:Direct supplies & materials'],
  '5030': ['Freight & Delivery Costs'],
  '5040': ['Cost of goods sold:Direct subcontractor expenses'],
  '6000': ['Channel Advertising Fee:Amazon advertising fees'],
  '6030': ['Advertising & marketing'],
  '6100': ['Channel selling fees:Amazon fees'],
  '6120': ['Commissions & fees'],
  '6200': ['Fulfillment and Warehouse Fees', 'Freight & Delivery Costs'],
  '6300': ['Supplies'],
  '6310': ['Repairs & maintenance'],
  '6500': ['Professional Fees', 'Professional Services', 'Professional Services:Accounting fees', 'Professional Services:Legal fees'],
  '6510': ['Bank Fees', 'Other business expenses:Bank and credit card fees'],
  '6530': ['Taxes and Licenses'],
  '6600': ['Vehicle expenses'],
  '6620': ['Meals'],
  '6700': ['Taxes and Licenses:Property taxes'],
  '6720': ['Rent or Lease', 'Building & land rent'],
  '6800': ['Payroll expenses:Wages'],
  '6990': ['Other business expenses'],
  '4090': ['Other income'],
};

function findSuggestedAlias(targetNumber: string, liveAccounts: LiveAccount[]) {
  const aliases = SUGGESTED_ALIASES[targetNumber] || [];
  for (const alias of aliases) {
    const found = liveAccounts.find(
      (account) =>
        normalizeName(account.fullyQualifiedName || account.name) === normalizeName(alias)
    );
    if (found) return found;
  }
  return undefined;
}

function groupMatchesType(group: string, accountType?: string) {
  const type = (accountType || '').toLowerCase();
  if (group === 'Assets') return type.includes('asset') || type.includes('bank') || type.includes('receivable');
  if (group === 'Liabilities') return type.includes('liability') || type.includes('payable') || type.includes('credit card');
  if (group === 'Equity') return type.includes('equity');
  if (group === 'Income') return type === 'income' || type.includes('other income');
  if (group === 'COGS') return type.includes('cost of goods sold');
  if (group === 'Expenses') return type === 'expense' || type === 'other expense';
  return true;
}


export default function QuickBooksAccountsReviewPage() {
  const [secret, setSecret] = useState('');
  const [liveAccounts, setLiveAccounts] = useState<LiveAccount[]>([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function loadAccounts(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage('');

    try {
      const response = await fetch('/api/quickbooks/accounts', {
        headers: { 'x-quickbooks-admin-secret': secret },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Unable to load QuickBooks accounts');
      setLiveAccounts(data.accounts || []);
      setMessage('Loaded ' + (data.count || 0) + ' live QuickBooks accounts.');
    } catch (error: any) {
      setMessage(error.message || 'Unable to load QuickBooks accounts');
    } finally {
      setBusy(false);
    }
  }

  const comparison = useMemo(() => {
    return TARGET_ACCOUNTS.map((target) => {
      const byNumber = liveAccounts.find(
        (account) => account.accountNumber && account.accountNumber === target.number
      );
      const preferredAlias = !byNumber ? findSuggestedAlias(target.number, liveAccounts) : undefined;
      const byName = !byNumber && !preferredAlias
        ? liveAccounts.find(
            (account) => normalizeName(account.name) === normalizeName(target.name)
          )
        : undefined;
      const match = byNumber || preferredAlias || byName;

      let status = 'Missing';
      if (match) {
        const numberMatches = match.accountNumber === target.number;
        const nameMatches = normalizeName(match.name) === normalizeName(target.name);
        const typeMatches = groupMatchesType(target.group, match.accountType);
        if (numberMatches && nameMatches && typeMatches) status = 'Exact match';
        else if (preferredAlias && typeMatches) status = 'Suggested reuse';
        else if (preferredAlias && !typeMatches) status = 'Suggested reuse - type review';
        else if (!typeMatches) status = 'Review match - type review';
        else status = 'Review match';
      }

      return { target, match, status };
    });
  }, [liveAccounts]);

  const exact = comparison.filter((row) => row.status === 'Exact match').length;
  const review = comparison.filter((row) => row.status === 'Review match').length;
  const suggestedReuse = comparison.filter((row) => row.status === 'Suggested reuse').length;
  const typeReview = comparison.filter((row) => row.status.includes('type review')).length;
  const missing = comparison.filter((row) => row.status === 'Missing').length;

  const matchedIds = new Set(comparison.filter((r) => r.match).map((r) => r.match!.id));
  const existingOnly = liveAccounts.filter((account) => !matchedIds.has(account.id));

  return (
    <main style={{ maxWidth: 1180, margin: '40px auto', padding: 24, fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#2d5016' }}>QuickBooks Chart of Accounts Review</h1>
      <p>
        This page compares the live QuickBooks chart against the proposed Nature&apos;s Way Soil
        accounting structure. Suggested reuses identify likely existing accounts with different names.
        It does not create, rename, deactivate, or delete accounts.
      </p>

      <form onSubmit={loadAccounts} style={{ maxWidth: 560, marginTop: 24 }}>
        <label htmlFor="adminSecret" style={{ display: 'block', fontWeight: 700, marginBottom: 8 }}>
          QuickBooks admin secret
        </label>
        <input
          id="adminSecret"
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          autoComplete="off"
          required
          style={{ width: '100%', padding: 12, border: '1px solid #aaa', borderRadius: 6 }}
        />
        <button
          type="submit"
          disabled={busy}
          style={{
            marginTop: 14,
            padding: '12px 18px',
            border: 0,
            borderRadius: 6,
            background: '#2d5016',
            color: 'white',
            fontWeight: 700,
          }}
        >
          {busy ? 'Loading…' : 'Load & Compare Live Accounts'}
        </button>
      </form>

      {message ? <p style={{ marginTop: 16 }}>{message}</p> : null}

      {liveAccounts.length > 0 ? (
        <>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '24px 0' }}>
            <strong>Exact matches: {exact}</strong>
            <strong>Review matches: {review}</strong>
            <strong>Suggested reuses: {suggestedReuse}</strong>
            <strong>Type reviews: {typeReview}</strong>
            <strong>Missing: {missing}</strong>
            <strong>Existing unmatched: {existingOnly.length}</strong>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr>
                  {['Target #', 'Target name', 'Group', 'Status', 'Live #', 'Live name', 'QBO type'].map((heading) => (
                    <th key={heading} style={{ textAlign: 'left', borderBottom: '2px solid #444', padding: 8 }}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.map(({ target, match, status }) => (
                  <tr key={target.number}>
                    <td style={{ padding: 8, borderBottom: '1px solid #ddd' }}>{target.number}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #ddd' }}>{target.name}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #ddd' }}>{target.group}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #ddd', fontWeight: 700 }}>{status}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #ddd' }}>{match?.accountNumber || '—'}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #ddd' }}>{match?.name || '—'}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #ddd' }}>
                      {match ? [match.accountType, match.accountSubType].filter(Boolean).join(' / ') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 style={{ marginTop: 36 }}>Existing QuickBooks accounts not matched to the proposed chart</h2>
          <p>These should be reviewed before anything is renamed or deactivated.</p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr>
                  {['Live #', 'Live name', 'Type', 'Subtype', 'Active', 'Balance'].map((heading) => (
                    <th key={heading} style={{ textAlign: 'left', borderBottom: '2px solid #444', padding: 8 }}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {existingOnly.map((account) => (
                  <tr key={account.id}>
                    <td style={{ padding: 8, borderBottom: '1px solid #ddd' }}>{account.accountNumber || '—'}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #ddd' }}>{account.fullyQualifiedName || account.name}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #ddd' }}>{account.accountType || '—'}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #ddd' }}>{account.accountSubType || '—'}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #ddd' }}>{account.active === false ? 'No' : 'Yes'}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #ddd' }}>{account.currentBalance ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </main>
  );
}
