import { FormEvent, useState } from 'react';

type Result = {
  id: string;
  externalId: string;
  action: string;
  date?: string;
  netToStripeClearing?: number;
  feeToStripeFees?: number;
  productSales?: number;
  shippingIncome?: number;
  qboTxnId?: string;
  debit?: number;
  credit?: number;
};

export default function QuickBooksPostStripePage() {
  const [secret, setSecret] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function run(confirm: boolean) {
    setBusy(true);
    setMessage('');
    setResults([]);

    try {
      const response = await fetch('/api/quickbooks/post-stripe-staging', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-quickbooks-admin-secret': secret,
        },
        body: JSON.stringify({ confirm }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data?.missing
            ? (data.error + ': ' + data.missing.join(', '))
            : (data?.error || 'Stripe posting failed')
        );
      }

      setResults(data.results || []);
      setMessage(
        confirm
          ? 'Stripe posting run completed. Existing journal entries were skipped automatically.'
          : 'Preview completed. Nothing was written to QuickBooks.'
      );
    } catch (error: any) {
      setMessage(error?.message || 'Stripe posting failed');
    } finally {
      setBusy(false);
    }
  }

  function preview(event: FormEvent) {
    event.preventDefault();
    run(false);
  }

  return (
    <main style={{ maxWidth: 1100, margin: '40px auto', padding: 24, fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#2d5016' }}>Post Clean Stripe History to QuickBooks</h1>
      <p>
        This posts only Stripe records marked <b>auto_ready</b>. Each journal entry uses the Stripe payment
        ID in a private note so rerunning the process cannot duplicate the same transaction.
      </p>
      <p>
        Debits: Stripe Clearing (net) + Stripe Processing Fees. Credits: Website/Stripe Product Sales and
        Shipping Income when shipping was charged.
      </p>

      <form onSubmit={preview} style={{ maxWidth: 620 }}>
        <label htmlFor="adminSecret" style={{ display: 'block', fontWeight: 700, marginBottom: 8 }}>
          QuickBooks admin secret
        </label>
        <input
          id="adminSecret"
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          required
          autoComplete="off"
          style={{ width: '100%', padding: 12, border: '1px solid #aaa', borderRadius: 6 }}
        />

        <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
          <button
            type="submit"
            disabled={busy}
            style={{ padding: '12px 18px', border: 0, borderRadius: 6, background: '#555', color: 'white', fontWeight: 700 }}
          >
            {busy ? 'Working…' : 'Preview Stripe Entries'}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => run(true)}
            style={{ padding: '12px 18px', border: 0, borderRadius: 6, background: '#2d5016', color: 'white', fontWeight: 700 }}
          >
            Post Clean Stripe Entries
          </button>
        </div>
      </form>

      {message ? <p style={{ marginTop: 18, fontWeight: 700 }}>{message}</p> : null}

      {results.length ? (
        <div style={{ marginTop: 24, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Date','Stripe ID','Result','Stripe Clearing','Stripe Fee','Product Sales','Shipping','QBO ID'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', borderBottom: '2px solid #444', padding: 7 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.id + r.externalId}>
                  <td style={{ padding: 7, borderBottom: '1px solid #ddd' }}>{r.date || '—'}</td>
                  <td style={{ padding: 7, borderBottom: '1px solid #ddd' }}>{r.externalId}</td>
                  <td style={{ padding: 7, borderBottom: '1px solid #ddd', fontWeight: 700 }}>{r.action}</td>
                  <td style={{ padding: 7, borderBottom: '1px solid #ddd' }}>{r.netToStripeClearing == null ? '—' : Number(r.netToStripeClearing).toFixed(2)}</td>
                  <td style={{ padding: 7, borderBottom: '1px solid #ddd' }}>{r.feeToStripeFees == null ? '—' : Number(r.feeToStripeFees).toFixed(2)}</td>
                  <td style={{ padding: 7, borderBottom: '1px solid #ddd' }}>{r.productSales == null ? '—' : Number(r.productSales).toFixed(2)}</td>
                  <td style={{ padding: 7, borderBottom: '1px solid #ddd' }}>{r.shippingIncome == null ? '—' : Number(r.shippingIncome).toFixed(2)}</td>
                  <td style={{ padding: 7, borderBottom: '1px solid #ddd' }}>{r.qboTxnId || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </main>
  );
}
