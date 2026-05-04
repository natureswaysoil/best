import Link from 'next/link';
import type { GetServerSideProps } from 'next';
import { getServiceSupabase } from '../../lib/supabase';

type OrderRow = {
  id: string;
  pi_id: string | null;
  status: string | null;
  total: number | null;
  tax: number | null;
  shipping_state: string | null;
  shipping_city: string | null;
  shipping_zip: string | null;
  shipping_address1: string | null;
  shipping_phone: string | null;
  created_at: string | null;
};

type Props = {
  orders: OrderRow[];
  error?: string;
};

const money = (value: number | null) =>
  typeof value === 'number'
    ? value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    : '—';

export default function AdminOrders({ orders, error }: Props) {
  const handleShipOrder = (piId: string | null) => {
    if (!piId) return;

    window.open(`/admin/packing-slip/${piId}`, '_blank', 'noopener,noreferrer');
    window.open(`https://ss.shipstation.com/#/orders/all?quickSearch=${encodeURIComponent(piId)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <main style={{ maxWidth: 1240, margin: '0 auto', padding: '32px 20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, color: '#14532d' }}>Website Orders</h1>
          <p style={{ marginTop: 6, color: '#4b5563' }}>Print packing slips and open ShipStation in one click.</p>
        </div>
        <button onClick={() => window.print()} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #14532d', background: '#14532d', color: 'white', fontWeight: 700 }}>
          Print Page
        </button>
      </div>

      {error ? <p style={{ padding: 12, background: '#fef2f2', color: '#991b1b', borderRadius: 8 }}>{error}</p> : null}

      <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: 12 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1000 }}>
          <thead style={{ background: '#f3f4f6' }}>
            <tr>
              <th style={th}>Date</th>
              <th style={th}>Order / Payment</th>
              <th style={th}>Ship To</th>
              <th style={th}>Status</th>
              <th style={th}>Total</th>
              <th style={th}>Packing Slip</th>
              <th style={th}>One-Click Ship</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td style={td}>{order.created_at ? new Date(order.created_at).toLocaleString() : '—'}</td>
                <td style={td}>
                  <strong>{order.id}</strong>
                  <br />
                  <span style={{ color: '#6b7280' }}>{order.pi_id || 'No Stripe PI saved'}</span>
                </td>
                <td style={td}>
                  {order.shipping_address1 || '—'}
                  <br />
                  {[order.shipping_city, order.shipping_state, order.shipping_zip].filter(Boolean).join(', ')}
                  <br />
                  <span style={{ color: '#6b7280' }}>{order.shipping_phone || ''}</span>
                </td>
                <td style={td}>{order.status || '—'}</td>
                <td style={td}>{money(order.total)}</td>
                <td style={td}>
                  {order.pi_id ? (
                    <Link href={`/admin/packing-slip/${order.pi_id}`} style={{ color: '#14532d', fontWeight: 700 }}>
                      Print Slip
                    </Link>
                  ) : (
                    '—'
                  )}
                </td>
                <td style={td}>
                  {order.pi_id ? (
                    <button
                      onClick={() => handleShipOrder(order.pi_id)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #14532d',
                        background: '#14532d',
                        color: 'white',
                        fontWeight: 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Ship Order
                    </button>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!orders.length && !error ? <p style={{ marginTop: 20 }}>No orders found yet.</p> : null}
    </main>
  );
}

const th: React.CSSProperties = { textAlign: 'left', padding: 12, borderBottom: '1px solid #e5e7eb', color: '#374151' };
const td: React.CSSProperties = { padding: 12, borderBottom: '1px solid #e5e7eb', verticalAlign: 'top' };

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from('orders')
      .select('id, pi_id, status, total, tax, shipping_state, shipping_city, shipping_zip, shipping_address1, shipping_phone, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      return { props: { orders: [], error: error.message } };
    }

    return { props: { orders: (data || []) as OrderRow[] } };
  } catch (error) {
    return {
      props: {
        orders: [],
        error: error instanceof Error ? error.message : 'Unable to load orders.',
      },
    };
  }
};
