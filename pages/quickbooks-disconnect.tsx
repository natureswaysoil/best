import Head from 'next/head';

export default function QuickBooksDisconnectPage() {
  return (
    <>
      <Head>
        <title>QuickBooks Disconnected | Nature&apos;s Way Soil</title>
      </Head>
      <main style={{ maxWidth: 700, margin: '60px auto', padding: 24, fontFamily: 'Arial, sans-serif' }}>
        <h1 style={{ color: '#2d5016' }}>QuickBooks Disconnected</h1>
        <p>
          Your QuickBooks Online connection to Nature&apos;s Way Soil has been disconnected.
        </p>
        <p>
          If you want to reconnect, return to the QuickBooks connection page.
        </p>
        <a href="/quickbooks-connect" style={{ color: '#2d5016', fontWeight: 700 }}>
          Reconnect QuickBooks
        </a>
      </main>
    </>
  );
}
