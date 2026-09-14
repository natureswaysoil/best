import type { GetStaticProps } from 'next';
import { getLatestConnection, qboRequest } from '../lib/quickbooks';
import { getServiceSupabase } from '../lib/supabase';

type Props = {
  ok: boolean;
  posted: number;
  skipped: number;
  held: number;
  error?: string;
};

function esc(value: string) {
  return value.replace(/'/g, "\\'");
}

async function fetchAccounts(realmId: string) {
  const q = encodeURIComponent('select * from Account maxresults 1000');
  const data = await qboRequest(
    '/v3/company/' + encodeURIComponent(realmId) + '/query?query=' + q + '&minorversion=75'
  );
  return data?.QueryResponse?.Account || [];
}

async function ensureShippingIncome(realmId: string, accounts: any[]) {
  const existing = accounts.find((a: any) =>
    String(a.AcctNum || '') === '4040' ||
    String(a.Name || '').toLowerCase() === 'shipping income'
  );
  if (existing) return existing;

  const created = await qboRequest(
    '/v3/company/' + encodeURIComponent(realmId) + '/account?minorversion=75',
    {
      method: 'POST',
      body: JSON.stringify({
        Name: 'Shipping Income',
        AcctNum: '4040',
        AccountType: 'Income',
        AccountSubType: 'OtherPrimaryIncome',
      }),
    }
  );
  if (!created?.Account?.Id) throw new Error('QuickBooks did not return Shipping Income account ID');
  return created.Account;
}

function accountByNumber(accounts: any[], number: string) {
  return accounts.find((a: any) => String(a.AcctNum || '') === number);
}

async function existingJournalEntry(realmId: string, docNumber: string) {
  const q = "select * from JournalEntry where DocNumber = '" + esc(docNumber) + "' maxresults 1";
  const data = await qboRequest(
    '/v3/company/' + encodeURIComponent(realmId) + '/query?query=' + encodeURIComponent(q) + '&minorversion=75'
  );
  return (data?.QueryResponse?.JournalEntry || [])[0] || null;
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  // One-time production accounting job. Preview/non-production builds never write to QuickBooks.
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production') {
    return { props: { ok: true, posted: 0, skipped: 0, held: 0 } };
  }

  const supabase = getServiceSupabase();

  try {
    const connection = await getLatestConnection();
    if (!connection) throw new Error('QuickBooks is not connected');

    let accounts = await fetchAccounts(connection.realm_id);
    const shippingIncome = await ensureShippingIncome(connection.realm_id, accounts);
    accounts = await fetchAccounts(connection.realm_id);

    const stripeClearing = accountByNumber(accounts, '1030');
    const productSales = accountByNumber(accounts, '4000');
    const stripeFees = accountByNumber(accounts, '6110');
    const shipping = accountByNumber(accounts, '4040') || shippingIncome;

    if (!stripeClearing || !productSales || !stripeFees || !shipping) {
      throw new Error('Required QuickBooks accounts 1030, 4000, 4040, or 6110 are missing');
    }

    const { data: rows, error } = await supabase
      .from('accounting_import_staging')
      .select('id,external_id,txn_date,description,gross_amount,fee_amount,net_amount,status,metadata')
      .eq('source', 'stripe_charge')
      .eq('status', 'auto_ready')
      .order('txn_date', { ascending: true });

    if (error) throw error;

    let posted = 0;
    let skipped = 0;
    let held = 0;

    for (const row of rows || []) {
      const docNumber = 'STRIPE-' + String(row.external_id).slice(-20);
      const existing = await existingJournalEntry(connection.realm_id, docNumber);

      if (existing?.Id) {
        await supabase
          .from('accounting_import_staging')
          .update({
            status: 'posted',
            qbo_txn_id: existing.Id,
            posted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', row.id);
        skipped += 1;
        continue;
      }

      const gross = Number(row.gross_amount || 0);
      const fee = Number(row.fee_amount || 0);
      const net = Number(row.net_amount || 0);
      const metadata: any = row.metadata || {};
      const shippingAmount = Math.max(0, Number(metadata.shipping || 0));
      const productRevenue = Number((gross - shippingAmount).toFixed(2));
      const debit = Number((net + fee).toFixed(2));
      const credit = Number((productRevenue + shippingAmount).toFixed(2));

      if (
        gross <= 0 ||
        fee < 0 ||
        net <= 0 ||
        productRevenue < 0 ||
        Math.abs(debit - credit) > 0.009
      ) {
        held += 1;
        continue;
      }

      const lines: any[] = [
        {
          Amount: net,
          DetailType: 'JournalEntryLineDetail',
          Description: 'Stripe net proceeds ' + row.external_id,
          JournalEntryLineDetail: {
            PostingType: 'Debit',
            AccountRef: { value: stripeClearing.Id, name: stripeClearing.Name },
          },
        },
        {
          Amount: fee,
          DetailType: 'JournalEntryLineDetail',
          Description: 'Stripe processing fee ' + row.external_id,
          JournalEntryLineDetail: {
            PostingType: 'Debit',
            AccountRef: { value: stripeFees.Id, name: stripeFees.Name },
          },
        },
        {
          Amount: productRevenue,
          DetailType: 'JournalEntryLineDetail',
          Description: row.description,
          JournalEntryLineDetail: {
            PostingType: 'Credit',
            AccountRef: { value: productSales.Id, name: productSales.Name },
          },
        },
      ];

      if (shippingAmount > 0) {
        lines.push({
          Amount: shippingAmount,
          DetailType: 'JournalEntryLineDetail',
          Description: 'Shipping income ' + row.external_id,
          JournalEntryLineDetail: {
            PostingType: 'Credit',
            AccountRef: { value: shipping.Id, name: shipping.Name },
          },
        });
      }

      const created = await qboRequest(
        '/v3/company/' + encodeURIComponent(connection.realm_id) + '/journalentry?minorversion=75',
        {
          method: 'POST',
          body: JSON.stringify({
            TxnDate: row.txn_date,
            DocNumber: docNumber,
            PrivateNote: 'NWS Stripe import ' + row.external_id,
            Line: lines,
          }),
        }
      );

      const qboId = created?.JournalEntry?.Id;
      if (!qboId) throw new Error('QuickBooks did not return JournalEntry ID for ' + row.external_id);

      const { error: updateError } = await supabase
        .from('accounting_import_staging')
        .update({
          status: 'posted',
          qbo_txn_id: qboId,
          posted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', row.id);

      if (updateError) throw updateError;
      posted += 1;
    }

    console.info('One-time Stripe accounting import completed', { posted, skipped, held });
    return { props: { ok: true, posted, skipped, held } };
  } catch (error: any) {
    console.error('One-time Stripe accounting import failed', error);
    // Fail the build so a bad accounting run never silently becomes production.
    throw error;
  }
};

export default function OneTimeStripePostResult(props: Props) {
  return (
    <main style={{ maxWidth: 720, margin: '60px auto', padding: 24, fontFamily: 'Arial, sans-serif' }}>
      <h1>Stripe accounting import</h1>
      <p>Completed server-side during production deployment.</p>
      <p>Posted: {props.posted} · Existing/skipped: {props.skipped} · Held: {props.held}</p>
    </main>
  );
}
