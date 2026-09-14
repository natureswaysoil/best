import { FormEvent, useState } from 'react';

export default function QuickBooksConnectPage() {
  const [secret, setSecret] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function connect(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage('');

    try {
      const response = await fetch('/api/quickbooks/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-quickbooks-admin-secret': secret,
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Unable to start QuickBooks connection');
      }

      window.location.href = data.authorizationUrl;
    } catch (error: any) {
      setMessage(error.message || 'Unable to start QuickBooks connection');
      setBusy(false);
    }
  }

  return (
    <main style={{ maxWidth: 640, margin: '60px auto', padding: 24, fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#2d5016' }}>Connect QuickBooks Online</h1>
      <p>
        This page starts the secure Intuit authorization flow for Nature&apos;s Way Soil.
        Your QuickBooks password and Intuit credentials are never entered here.
      </p>

      <form onSubmit={connect} style={{ marginTop: 28 }}>
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
            marginTop: 16,
            padding: '12px 18px',
            border: 0,
            borderRadius: 6,
            background: '#2d5016',
            color: 'white',
            fontWeight: 700,
            cursor: busy ? 'wait' : 'pointer',
          }}
        >
          {busy ? 'Opening Intuit…' : 'Connect to QuickBooks'}
        </button>
      </form>

      {message ? <p style={{ color: '#a00', marginTop: 18 }}>{message}</p> : null}

      <p style={{ marginTop: 30, color: '#666', fontSize: 14 }}>
        After Intuit approves the connection, the tokens are encrypted before being stored in Supabase.
      </p>
    </main>
  );
}
