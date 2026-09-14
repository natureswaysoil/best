import type { GetStaticProps } from 'next';
import { getLatestConnection, qboRequest } from '../lib/quickbooks';

type BankAccount = {
  id: string;
  name: string;
  accountNumber: string | null;
  accountType: string;
  accountSubType: string | null;
  currentBalance: number | null;
};

type Props = { accounts: BankAccount[] };

export const getStaticProps: GetStaticProps<Props> = async () => {
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production') {
    return { props: { accounts: [] } };
  }

  const connection = await getLatestConnection();
  if (!connection) throw new Error('QuickBooks is not connected');

  const q = encodeURIComponent('select * from Account maxresults 1000');
  const data = await qboRequest(
    '/v3/company/' + encodeURIComponent(connection.realm_id) + '/query?query=' + q + '&minorversion=75'
  );

  const accounts = (data?.QueryResponse?.Account || [])
    .filter((a: any) => a.AccountType === 'Bank')
    .map((a: any) => ({
      id: String(a.Id),
      name: String(a.FullyQualifiedName || a.Name || ''),
      accountNumber: a.AcctNum ? String(a.AcctNum) : null,
      accountType: String(a.AccountType || ''),
      accountSubType: a.AccountSubType ? String(a.AccountSubType) : null,
      currentBalance: a.CurrentBalance == null ? null : Number(a.CurrentBalance),
    }));

  console.info('QuickBooks bank account discovery', accounts);
  return { props: { accounts } };
};

export default function QuickBooksBankDiscovery({ accounts }: Props) {
  return (
    <main style={{ maxWidth: 720, margin: '60px auto', padding: 24, fontFamily: 'Arial, sans-serif' }}>
      <h1>QuickBooks bank account discovery</h1>
      <p>Discovered {accounts.length} bank account(s).</p>
    </main>
  );
}
