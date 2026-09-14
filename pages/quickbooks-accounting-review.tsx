import { FormEvent, useState } from 'react';

type Row = {
  id: string;
  source: string;
  external_id: string;
  txn_date: string;
  description: string;
  gross_amount: number;
  fee_amount: number;
  net_amount: number;
  suggested_account_number?: string | null;
  status: string;
  confidence?: number | null;
  notes?: string | null;
  qbo_txn_id?: string | null;
  posted_at?: string | null;
};

export default function QuickBooksAccountingReviewPage() {
  const [secret, setSecret] = useState('');
  const [rows, setRows] = useState<Row[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState('all');

  async function load(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch('/api/quickbooks/accounting-staging', {
        headers: { 'x-quickbooks-admin-secret': secret },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Unable to load accounting staging');
      setRows(data.rows || []);
      setSummary(data.summary || null);
      setMessage('Loaded staged accounting records. No QuickBooks transactions were changed.');
    } catch (error: any) {
      setMessage(error?.message || 'Unable to load accounting staging');
    } finally {
      setBusy(false);
    }
  }

  const visible = filter === 'all' ? rows : rows.filter((r) => r.status === filter);

  return (
    <main style={{ maxWidth: 1180, margin: '40px auto', padding: 24, fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#2d5016' }}>Accounting Import Review</h1>
      <p>
        Historical Truist and Stripe activity staged for bookkeeping. Records marked <b>auto_ready</b>
        have a high-confidence account mapping; <b>review</b> records are intentionally held back.
      </p>

      <form onSubmit={load} style={{ maxWidth: 560 }}>
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
        <button
          type="submit"
          disabled={busy}
          style={{ marginTop: 14, padding: '12px 18px', border: 0, borderRadius: 6, background: '#2d5016', color: 'white', fontWeight: 700 }}
        >
          {busy ? 'Loading…' : 'Load Staged Transactions'}
        </button>
      </form>

      {message ? <p style={{ marginTop: 16 }}>{message}</p> : null}

      {summary ? (
        <>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '24px 0' }}>
            <strong>Total: {summary.total}</strong>
            <strong>Ready: {summary.auto_ready}</strong>
            <strong>Review: {summary.review}</strong>
            <strong>Posted: {summary.posted}</strong>
            <strong>Skipped: {summary.skipped}</strong>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 700, marginRight: 8 }}>Show:</label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="auto_ready">Ready</option>
              <option value="review">Review</option>
              <option value="posted">Posted</option>
              <option value="skipped">Skipped</option>
            </select>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  {['Date','Source','Description','Gross','Fee','Net','Acct #','Status','Confidence','Notes'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', borderBottom: '2px solid #444', padding: 7 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => (
                  <tr key={r.id}>
                    <td style={{ padding: 7, borderBottom: '1px solid #ddd' }}>{r.txn_date}</td>
                    <td style={{ padding: 7, borderBottom: '1px solid #ddd' }}>{r.source}</td>
                    <td style={{ padding: 7, borderBottom: '1px solid #ddd' }}>{r.description}</td>
                    <td style={{ padding: 7, borderBottom: '1px solid #ddd' }}>{Number(r.gross_amount).toFixed(2)}</td>
                    <td style={{ padding: 7, borderBottom: '1px solid #ddd' }}>{Number(r.fee_amount).toFixed(2)}</td>
                    <td style={{ padding: 7, borderBottom: '1px solid #ddd' }}>{Number(r.net_amount).toFixed(2)}</td>
                    <td style={{ padding: 7, borderBottom: '1px solid #ddd' }}>{r.suggested_account_number || '—'}</td>
                    <td style={{ padding: 7, borderBottom: '1px solid #ddd', fontWeight: 700 }}>{r.status}</td>
                    <td style={{ padding: 7, borderBottom: '1px solid #ddd' }}>{r.confidence == null ? '—' : Number(r.confidence).toFixed(2)}</td>
                    <td style={{ padding: 7, borderBottom: '1px solid #ddd' }}>{r.notes || '—'}</td>
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
