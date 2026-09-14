import type { GetStaticProps } from 'next';
import { getLatestConnection, qboRequest } from '../lib/quickbooks';

type Props = { ok: boolean };

export const getStaticProps: GetStaticProps<Props> = async () => {
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production') {
    return { props: { ok: true } };
  }

  const connection = await getLatestConnection();
  if (!connection) throw new Error('QuickBooks is not connected');

  const end = new Date().toISOString().slice(0,10);
  const start = end.slice(0,4) + '-01-01';

  const accountsData = await qboRequest(
    '/v3/company/' + encodeURIComponent(connection.realm_id) +
    '/query?query=' + encodeURIComponent('select * from Account maxresults 1000') +
    '&minorversion=75'
  );
  const accounts = accountsData?.QueryResponse?.Account || [];

  const targets = accounts.filter((a: any) => {
    const n = String(a.AcctNum || '');
    const name = String(a.FullyQualifiedName || a.Name || '').toLowerCase();
    return n === '1030' || name.includes('stripe clearing') || name.includes('channel clearing') || name.includes('amazon clearing');
  });

  const ledgers:any[] = [];
  for (const a of targets) {
    const report = await qboRequest(
      '/v3/company/' + encodeURIComponent(connection.realm_id) +
      '/reports/GeneralLedger?start_date=' + encodeURIComponent(start) +
      '&end_date=' + encodeURIComponent(end) +
      '&account=' + encodeURIComponent(String(a.Id)) +
      '&minorversion=75'
    );
    ledgers.push({
      id: a.Id,
      number: a.AcctNum || null,
      name: a.FullyQualifiedName || a.Name,
      currentBalance: a.CurrentBalance == null ? null : Number(a.CurrentBalance),
      report,
    });
  }

  console.info('QBO clearing account ledger detail', {
    period: { start, end },
    targets: targets.map((a:any) => ({
      id:a.Id,
      number:a.AcctNum || null,
      name:a.FullyQualifiedName || a.Name,
      balance:a.CurrentBalance == null ? null : Number(a.CurrentBalance),
      type:a.AccountType,
      subtype:a.AccountSubType,
    })),
    ledgers,
  });

  return { props: { ok: true } };
};

export default function ClearingDetail() {
  return <main><h1>Clearing ledger detail generated</h1></main>;
}
