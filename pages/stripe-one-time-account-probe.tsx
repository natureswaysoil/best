import { adminAuthorized } from '../lib/quickbooks';
import type { GetServerSideProps } from 'next';
import Stripe from 'stripe';

type Props = { accountId: string | null; ok: boolean };

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  // Diagnostics run only on authorized requests, never during static builds.
  ctx.res.setHeader('Cache-Control', 'private, no-store');
  ctx.res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  const secret = ctx.req.headers['x-quickbooks-admin-secret'] || ctx.query.secret;
  if (!adminAuthorized(secret)) return { notFound: true };

  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production') {
    return { props: { accountId: null, ok: true } };
  }

  try {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY is not configured');
    const stripe = new Stripe(key, { apiVersion: '2023-10-16' });
    const account = await stripe.accounts.retrieve();
    console.info('Production website Stripe account probe', { accountId: account.id });
    return { props: { accountId: account.id, ok: true } };
  } catch (error: any) {
    console.error('Production website Stripe account probe failed', String(error?.message || error));
    return { props: { accountId: null, ok: false } };
  }
};

export default function StripeAccountProbe(props: Props) {
  return <main><h1>Stripe account probe</h1><p>{props.ok ? 'ok' : 'failed'}</p></main>;
}
