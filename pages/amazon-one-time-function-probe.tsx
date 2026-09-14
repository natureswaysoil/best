import type { GetStaticProps } from 'next';

type Props = { ok: boolean; status: number; body: string };

export const getStaticProps: GetStaticProps<Props> = async () => {
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production') {
    return { props: { ok: true, status: 0, body: 'preview skipped' } };
  }

  const url = 'https://us-central1-amazon-ppc-474902.cloudfunctions.net/amazonSalesData';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'health' }),
    });
    const text = await response.text();
    console.info('Amazon existing function probe', {
      status: response.status,
      body: text.slice(0, 2000),
    });
    return {
      props: {
        ok: response.ok,
        status: response.status,
        body: text.slice(0, 500),
      },
    };
  } catch (error: any) {
    console.error('Amazon existing function probe failed', error);
    return {
      props: {
        ok: false,
        status: 0,
        body: String(error?.message || error),
      },
    };
  }
};

export default function AmazonFunctionProbe(props: Props) {
  return (
    <main style={{ maxWidth: 720, margin: '60px auto', padding: 24, fontFamily: 'Arial, sans-serif' }}>
      <h1>Amazon function probe</h1>
      <p>Status: {props.status}</p>
    </main>
  );
}
