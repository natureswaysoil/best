import type { GetStaticProps } from 'next';
import { getLatestConnection, qboRequest } from '../lib/quickbooks';
import { getServiceSupabase } from '../lib/supabase';

type Props = { ok: boolean; posted: number; skipped: number; held: number };

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

async function ensureAccount(realmId: string, accounts: any[], spec: any) {
  const existing = accounts.find((a: any) =>
    (a.AcctNum && String(a.AcctNum) === spec.AcctNum) ||
    String(a.Name || '').toLowerCase() === String(spec.Name).toLowerCase()
  );
  if (existing) return existing;

  const created = await qboRequest(
    '/v3/company/' + encodeURIComponent(realmId) + '/account?minorversion=75',
    { method: 'POST', body: JSON.stringify(spec) }
  );
  if (!created?.Account?.Id) throw new Error('QuickBooks did not return Account ID for ' + spec.Name);
  return created.Account;
}

function findAccount(accounts: any[], number: string | null, names: string[]) {
  if (number) {
    const byNumber = accounts.find((a: any) => String(a.AcctNum || '') === number);
    if (byNumber) return byNumber;
  }
  const wanted = names.map((n) => n.toLowerCase());
  return accounts.find((a: any) =>
    wanted.includes(String(a.FullyQualifiedName || a.Name || '').toLowerCase()) ||
    wanted.includes(String(a.Name || '').toLowerCase())
  );
}

async function existingJournalEntry(realmId: string, docNumber: string) {
  const q = "select * from JournalEntry where DocNumber = '" + esc(docNumber) + "' maxresults 1";
  const data = await qboRequest(
    '/v3/company/' + encodeURIComponent(realmId) + '/query?query=' + encodeURIComponent(q) + '&minorversion=75'
  );
  return (data?.QueryResponse?.JournalEntry || [])[0] || null;
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production') {
    return { props: { ok: true, posted: 0, skipped: 0, held: 0 } };
  }

  const supabase = getServiceSupabase();
  const connection = await getLatestConnection();
  if (!connection) throw new Error('QuickBooks is not connected');

  let accounts = await fetchAccounts(connection.realm_id);

  await ensureAccount(connection.realm_id, accounts, {
    Name: 'Operating Checking',
    AcctNum: '1000',
    AccountType: 'Bank',
    AccountSubType: 'Checking',
  });

  accounts = await fetchAccounts(connection.realm_id);

  await ensureAccount(connection.realm_id, accounts, {
    Name: 'Outbound Shipping & Postage',
    AcctNum: '6200',
    AccountType: 'Expense',
    AccountSubType: 'ShippingFreightDelivery',
  });

  accounts = await fetchAccounts(connection.realm_id);

  const bank = findAccount(accounts, '1000', ['Operating Checking']);
  if (!bank) throw new Error('Operating Checking account could not be resolved');

  const accountAliases: Record<string, string[]> = {
    '1030': ['Stripe Clearing'],
    '1040': ['Channel clearing account', 'Amazon Clearing'],
    '6010': ['Advertising - Google'],
    '6200': ['Outbound Shipping & Postage'],
    '6210': ['Shipping Supplies'],
    '6330': ['Utilities'],
    '6400': ['Software & Online Services'],
    '6410': ['Website & Hosting'],
    '6510': ['Bank Fees', 'Bank Charges'],
    '6520': ['Insurance'],
  };

  const { data: rows, error } = await supabase
    .from('accounting_import_staging')
    .select('id,external_id,txn_date,description,gross_amount,net_amount,suggested_account_number,status,notes')
    .eq('source', 'truist_bank')
    .eq('status', 'auto_ready')
    .order('txn_date', { ascending: true });

  if (error) throw error;

  let posted = 0;
  let skipped = 0;
  let held = 0;

  for (const row of rows || []) {
    const amount = Number(row.net_amount || 0);
    const targetNumber = row.suggested_account_number ? String(row.suggested_account_number) : null;
    const target = targetNumber ? findAccount(accounts, targetNumber, accountAliases[targetNumber] || []) : null;

    if (!target) {
      console.warn('Holding Truist row because target account is unresolved', {
        externalId: row.external_id,
        targetNumber,
        description: row.description,
      });
      held += 1;
      continue;
    }

    const docNumber = 'BK-' + String(row.external_id).replace(/^bank_/, '').slice(0, 18);
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

    if (Math.abs(amount) < 0.005) {
      held += 1;
      continue;
    }

    const isDeposit = amount > 0;
    const absolute = Math.abs(amount);

    const lines = isDeposit
      ? [
          {
            Amount: absolute,
            DetailType: 'JournalEntryLineDetail',
            Description: row.description,
            JournalEntryLineDetail: {
              PostingType: 'Debit',
              AccountRef: { value: bank.Id, name: bank.Name },
            },
          },
          {
            Amount: absolute,
            DetailType: 'JournalEntryLineDetail',
            Description: row.description,
            JournalEntryLineDetail: {
              PostingType: 'Credit',
              AccountRef: { value: target.Id, name: target.Name },
            },
          },
        ]
      : [
          {
            Amount: absolute,
            DetailType: 'JournalEntryLineDetail',
            Description: row.description,
            JournalEntryLineDetail: {
              PostingType: 'Debit',
              AccountRef: { value: target.Id, name: target.Name },
            },
          },
          {
            Amount: absolute,
            DetailType: 'JournalEntryLineDetail',
            Description: row.description,
            JournalEntryLineDetail: {
              PostingType: 'Credit',
              AccountRef: { value: bank.Id, name: bank.Name },
            },
          },
        ];

    const created = await qboRequest(
      '/v3/company/' + encodeURIComponent(connection.realm_id) + '/journalentry?minorversion=75',
      {
        method: 'POST',
        body: JSON.stringify({
          TxnDate: row.txn_date,
          DocNumber: docNumber,
          PrivateNote: 'NWS Truist import ' + row.external_id,
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

  console.info('One-time Truist accounting import completed', { posted, skipped, held });
  return { props: { ok: true, posted, skipped, held } };
};

export default function QuickBooksBankPostResult(props: Props) {
  return (
    <main style={{ maxWidth: 720, margin: '60px auto', padding: 24, fontFamily: 'Arial, sans-serif' }}>
      <h1>Truist accounting import</h1>
      <p>Posted: {props.posted} · Existing/skipped: {props.skipped} · Held: {props.held}</p>
    </main>
  );
}
