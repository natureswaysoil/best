import { FormEvent, useMemo, useState } from 'react';

const SAFE_ACCOUNTS = [
  ['1030', 'Stripe Clearing', 'Other Current Asset'],
  ['2300', 'Customer Deposits / Unearned Revenue', 'Other Current Liability'],
  ['2400', 'Loans Payable', 'Long Term Liability'],
  ['3010', 'Owner Contributions', 'Equity'],
  ['3020', 'Owner Draws / Distributions', 'Equity'],
  ['4000', 'Product Sales - Website / Stripe', 'Income'],
  ['4020', 'Wholesale / Retail Sales', 'Income'],
  ['4030', 'Government / B2B Sales', 'Income'],
  ['4040', 'Shipping Income', 'Income'],
  ['5000', 'COGS - Ingredients', 'Cost of Goods Sold'],
  ['5010', 'COGS - Packaging', 'Cost of Goods Sold'],
  ['5090', 'Inventory Adjustments / Shrinkage', 'Cost of Goods Sold'],
  ['6010', 'Advertising - Google', 'Expense'],
  ['6020', 'Advertising - Meta / Social', 'Expense'],
  ['6110', 'Stripe Processing Fees', 'Expense'],
  ['6210', 'Shipping Supplies', 'Expense'],
  ['6320', 'Fuel & Equipment Operating Costs', 'Expense'],
  ['6340', 'Waste / Disposal', 'Expense'],
  ['6400', 'Software & Online Services', 'Expense'],
  ['6410', 'Website & Hosting', 'Expense'],
  ['6430', 'Telephone & Internet', 'Expense'],
  ['6540', 'Dues, Subscriptions & Memberships', 'Expense'],
  ['6550', 'Education & Training', 'Expense'],
] as const;

type Result = {
  number: string;
  name: string;
  action: string;
  existingName?: string;
  accountType?: string;
  accountSubType?: string | null;
};

export default function QuickBooksCreateAccountsPage() {
  const [secret, setSecret] = useState('');
  const [selected, setSelected] = useState<string[]>(SAFE_ACCOUNTS.map((a) => a[0]));
  const [results, setResults] = useState<Result[]>([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  function toggle(number: string) {
    setSelected((current) =>
      current.includes(number)
        ? current.filter((n) => n !== number)
        : [...current, number]
    );
  }

  async function run(confirm: boolean) {
    setBusy(true);
    setMessage('');
    setResults([]);

    try {
      const response = await fetch('/api/quickbooks/create-accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-quickbooks-admin-secret': secret,
        },
        body: JSON.stringify({
          accountNumbers: selected,
          confirm,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'QuickBooks account operation failed');

      setResults(data.results || []);
      setMessage(
        confirm
          ? 'Creation run completed. Existing accounts were skipped automatically.'
          : 'Preview completed. Nothing was written to QuickBooks.'
      );
    } catch (error: any) {
      setMessage(error?.message || 'QuickBooks account operation failed');
    } finally {
      setBusy(false);
    }
  }

  function submitPreview(event: FormEvent) {
    event.preventDefault();
    run(false);
  }

  return (
    <main style={{ maxWidth: 1000, margin: '40px auto', padding: 24, fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#2d5016' }}>Create Missing QuickBooks Accounts</h1>
      <p>
        Only the low-risk accounts listed below are eligible. Existing accounts are rechecked immediately
        before creation and skipped if a matching account number or name already exists.
      </p>
      <p>
        Bank accounts, Accounts Receivable, Accounts Payable, sales-tax accounts, inventory asset splits,
        Opening Balance Equity, and existing Amazon/channel accounts are intentionally excluded.
      </p>

      <form onSubmit={submitPreview}>
        <label htmlFor="adminSecret" style={{ display: 'block', fontWeight: 700, marginTop: 20, marginBottom: 8 }}>
          QuickBooks admin secret
        </label>
        <input
          id="adminSecret"
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          required
          autoComplete="off"
          style={{ width: '100%', maxWidth: 560, padding: 12, border: '1px solid #aaa', borderRadius: 6 }}
        />

        <div style={{ marginTop: 24, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr>
                {['Create', 'Account #', 'Account name', 'Type'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: 8, borderBottom: '2px solid #444' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SAFE_ACCOUNTS.map(([number, name, type]) => (
                <tr key={number}>
                  <td style={{ padding: 8, borderBottom: '1px solid #ddd' }}>
                    <input
                      type="checkbox"
                      checked={selectedSet.has(number)}
                      onChange={() => toggle(number)}
                    />
                  </td>
                  <td style={{ padding: 8, borderBottom: '1px solid #ddd' }}>{number}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #ddd' }}>{name}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #ddd' }}>{type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
          <button
            type="submit"
            disabled={busy || !selected.length}
            style={{ padding: '12px 18px', borderRadius: 6, border: 0, background: '#555', color: '#fff', fontWeight: 700 }}
          >
            {busy ? 'Working…' : 'Preview Selected'}
          </button>
          <button
            type="button"
            disabled={busy || !selected.length}
            onClick={() => run(true)}
            style={{ padding: '12px 18px', borderRadius: 6, border: 0, background: '#2d5016', color: '#fff', fontWeight: 700 }}
          >
            Create Selected Accounts
          </button>
        </div>
      </form>

      {message ? <p style={{ marginTop: 18, fontWeight: 700 }}>{message}</p> : null}

      {results.length ? (
        <div style={{ marginTop: 24, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr>
                {['#', 'Name', 'Result', 'Existing / Type'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: 8, borderBottom: '2px solid #444' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.number}>
                  <td style={{ padding: 8, borderBottom: '1px solid #ddd' }}>{r.number}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #ddd' }}>{r.name}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #ddd', fontWeight: 700 }}>{r.action}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #ddd' }}>
                    {r.existingName || [r.accountType, r.accountSubType].filter(Boolean).join(' / ') || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </main>
  );
}
