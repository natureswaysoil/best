import type { GetServerSideProps } from 'next';
import { adminAuthorized, getLatestConnection, qboRequest } from '../lib/quickbooks';
import { getServiceSupabase } from '../lib/supabase';

type Row = {
  label: string;
  value: string;
};

type Props = {
  ok: boolean;
  asOf: string;
  pnlRows: Row[];
  accountBalances: Array<{ number: string; name: string; balance: number | null; type: string }>;
  stagingSummary: any[];
};

function flattenReportRows(rows: any[], out: Row[] = [], depth = 0): Row[] {
  for (const row of rows || []) {
    const header = row?.Header?.ColData;
    if (header?.length) {
      out.push({
        label: String(header[0]?.value || '').trim(),
        value: String(header[1]?.value || '').trim(),
      });
    }
    const summary = row?.Summary?.ColData;
    if (summary?.length) {
      out.push({
        label: String(summary[0]?.value || '').trim(),
        value: String(summary[1]?.value || '').trim(),
      });
    }
    const cols = row?.ColData;
    if (cols?.length) {
      out.push({
        label: String(cols[0]?.value || '').trim(),
        value: String(cols[1]?.value || '').trim(),
      });
    }
    if (row?.Rows?.Row) flattenReportRows(row.Rows.Row, out, depth + 1);
  }
  return out;
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  // Diagnostics run only on authorized requests, never during static builds.
  ctx.res.setHeader('Cache-Control', 'private, no-store');
  ctx.res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  const secret = ctx.req.headers['x-quickbooks-admin-secret'] || ctx.query.secret;
  if (!adminAuthorized(secret)) return { notFound: true };

  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production') {
    return { props: { ok: true, asOf: new Date().toISOString(), pnlRows: [], accountBalances: [], stagingSummary: [] } };
  }

  const connection = await getLatestConnection();
  if (!connection) throw new Error('QuickBooks is not connected');

  const today = new Date();
  const end = today.toISOString().slice(0, 10);
  const start = end.slice(0, 4) + '-01-01';

  const [pnl, accountsData] = await Promise.all([
    qboRequest(
      '/v3/company/' + encodeURIComponent(connection.realm_id) +
      '/reports/ProfitAndLoss?start_date=' + encodeURIComponent(start) +
      '&end_date=' + encodeURIComponent(end) +
      '&accounting_method=Accrual&minorversion=75'
    ),
    qboRequest(
      '/v3/company/' + encodeURIComponent(connection.realm_id) +
      '/query?query=' + encodeURIComponent('select * from Account maxresults 1000') +
      '&minorversion=75'
    ),
  ]);

  const accounts = accountsData?.QueryResponse?.Account || [];
  const wanted = ['1000','1030','1040','4000','4010','4040','6000','6100','6110','6200','6210','6400','6410','6510','6520'];
  const accountBalances = wanted.map((number) => {
    const a = accounts.find((x: any) => String(x.AcctNum || '') === number);
    return a ? {
      number,
      name: String(a.FullyQualifiedName || a.Name || ''),
      balance: a.CurrentBalance == null ? null : Number(a.CurrentBalance),
      type: String(a.AccountType || ''),
    } : { number, name: 'MISSING', balance: null, type: '' };
  });

  const supabase = getServiceSupabase();
  const { data: stagingSummary, error } = await supabase.rpc('get_accounting_import_summary');
  let summary = stagingSummary;

  if (error) {
    const { data, error: fallbackError } = await supabase
      .from('accounting_import_staging')
      .select('source,status,gross_amount,fee_amount,net_amount');
    if (fallbackError) throw fallbackError;
    const map = new Map<string, any>();
    for (const r of data || []) {
      const key = r.source + '|' + r.status;
      const cur = map.get(key) || { source: r.source, status: r.status, count: 0, gross: 0, fees: 0, net: 0 };
      cur.count += 1;
      cur.gross += Number(r.gross_amount || 0);
      cur.fees += Number(r.fee_amount || 0);
      cur.net += Number(r.net_amount || 0);
      map.set(key, cur);
    }
    summary = Array.from(map.values()).map((x: any) => ({
      ...x,
      gross: Number(x.gross.toFixed(2)),
      fees: Number(x.fees.toFixed(2)),
      net: Number(x.net.toFixed(2)),
    }));
  }

  const pnlRows = flattenReportRows(pnl?.Rows?.Row || []);

  console.info('QBO YTD Profit and Loss snapshot', {
    period: { start, end },
    rows: pnlRows,
    accountBalances,
    stagingSummary: summary,
  });

  return {
    props: {
      ok: true,
      asOf: new Date().toISOString(),
      pnlRows,
      accountBalances,
      stagingSummary: summary || [],
    },
  };
};

export default function AccountingSnapshot({ asOf, pnlRows, accountBalances, stagingSummary }: Props) {
  return (
    <main style={{ maxWidth: 1000, margin: '40px auto', padding: 24, fontFamily: 'Arial, sans-serif' }}>
      <h1>QuickBooks Accounting Snapshot</h1>
      <p>Generated {asOf}</p>
      <h2>Profit & Loss</h2>
      <table><tbody>{pnlRows.map((r, i) => <tr key={i}><td>{r.label}</td><td>{r.value}</td></tr>)}</tbody></table>
      <h2>Key account balances</h2>
      <table><tbody>{accountBalances.map((a) => <tr key={a.number}><td>{a.number}</td><td>{a.name}</td><td>{a.balance}</td></tr>)}</tbody></table>
      <h2>Import staging</h2>
      <pre>{JSON.stringify(stagingSummary, null, 2)}</pre>
    </main>
  );
}
