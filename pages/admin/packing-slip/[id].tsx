import type { GetServerSideProps } from 'next';
import { getServiceSupabase } from '../../../lib/supabase';

type PackingSlipItem = {
  id?: string;
  sku: string;
  qty: number;
  price: number;
  product_name?: string | null;
  size_name?: string | null;
};

type Props = {
  order: any | null;
  items: PackingSlipItem[];
};

const money = (value: number | string | null | undefined) => {
  const numeric = Number(value);
  return Number.isFinite(numeric)
    ? numeric.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    : '—';
};

const itemDisplayName = (item: PackingSlipItem) => {
  const product = item.product_name?.trim();
  const size = item.size_name?.trim();

  if (product && size) return `${product} - ${size}`;
  if (product) return product;
  if (size) return size;
  return item.sku || 'Product';
};

export default function PackingSlip({ order, items }: Props) {
  if (!order) return <p style={{ padding: 40 }}>Order not found.</p>;

  return (
    <main style={{ fontFamily: 'Arial, sans-serif', padding: 30, maxWidth: 850, margin: '0 auto' }}>
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; }
        }
      `}</style>

      <section style={{ display: 'flex', justifyContent: 'space-between', gap: 20, borderBottom: '2px solid #14532d', paddingBottom: 16 }}>
        <div>
          <h1 style={{ margin: 0, color: '#14532d' }}>Nature's Way Soil</h1>
          <p style={{ margin: '6px 0 0' }}>Naturally Stronger Soil Starts Here</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h2 style={{ margin: 0 }}>Packing Slip</h2>
          <p style={{ margin: '6px 0 0' }}><strong>Status:</strong> {order.status || '—'}</p>
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }}>
        <div>
          <h3 style={{ marginBottom: 8 }}>Order</h3>
          <p style={{ margin: 0 }}>
            <strong>Order ID:</strong> {order.id}<br />
            <strong>Stripe:</strong> {order.pi_id}<br />
            <strong>Date:</strong> {order.created_at ? new Date(order.created_at).toLocaleString() : '—'}
          </p>
        </div>

        <div>
          <h3 style={{ marginBottom: 8 }}>Ship To</h3>
          <p style={{ margin: 0 }}>
            {order.shipping_address1}<br />
            {order.shipping_address2 ? <>{order.shipping_address2}<br /></> : null}
            {order.shipping_city}, {order.shipping_state} {order.shipping_zip}<br />
            {order.shipping_phone || ''}
          </p>
        </div>
      </section>

      <h3 style={{ marginTop: 30 }}>Items to Pack</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #d1d5db' }}>
        <thead>
          <tr style={{ background: '#f3f4f6' }}>
            <th style={th}>Product Name</th>
            <th style={th}>SKU</th>
            <th style={{ ...th, textAlign: 'center' }}>Qty</th>
            <th style={{ ...th, textAlign: 'right' }}>Price</th>
          </tr>
        </thead>
        <tbody>
          {items.length ? (
            items.map((item, i) => (
              <tr key={item.id || i}>
                <td style={td}><strong>{itemDisplayName(item)}</strong></td>
                <td style={td}>{item.sku}</td>
                <td style={{ ...td, textAlign: 'center', fontWeight: 700 }}>{item.qty}</td>
                <td style={{ ...td, textAlign: 'right' }}>{money(item.price)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td style={td} colSpan={4}>No line items found for this order.</td>
            </tr>
          )}
        </tbody>
      </table>

      <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginTop: 28 }}>
        <p style={{ margin: 0 }}>Thank you for supporting our family farm.</p>
        <p style={{ textAlign: 'right', fontSize: 18, margin: 0 }}>
          <strong>Total:</strong> {money(order.total)}
        </p>
      </section>

      <button className="no-print" onClick={() => window.print()} style={{ marginTop: 28, padding: '10px 16px', borderRadius: 8, background: '#14532d', color: 'white', border: 0, fontWeight: 700 }}>
        Print Packing Slip
      </button>
    </main>
  );
}

const th: React.CSSProperties = { padding: 10, borderBottom: '1px solid #d1d5db', textAlign: 'left' };
const td: React.CSSProperties = { padding: 10, borderBottom: '1px solid #e5e7eb', verticalAlign: 'top' };

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const id = ctx.params?.id as string;
  const supabase = getServiceSupabase();

  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('pi_id', id)
    .single();

  if (!order?.id) {
    return { props: { order: null, items: [] } };
  }

  const { data: orderItems } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', order.id);

  const skus = Array.from(new Set((orderItems || []).map((item: any) => item.sku).filter(Boolean)));

  let sizeLookup: Record<string, { product_name?: string | null; size_name?: string | null }> = {};

  if (skus.length) {
    const { data: sizes } = await supabase
      .from('product_sizes')
      .select('sku, name, products(name)')
      .in('sku', skus);

    sizeLookup = (sizes || []).reduce((acc: Record<string, { product_name?: string | null; size_name?: string | null }>, size: any) => {
      acc[size.sku] = {
        product_name: size.products?.name || null,
        size_name: size.name || null,
      };
      return acc;
    }, {});
  }

  const items = (orderItems || []).map((item: any) => ({
    ...item,
    product_name: sizeLookup[item.sku]?.product_name || null,
    size_name: sizeLookup[item.sku]?.size_name || null,
  }));

  return { props: { order, items } };
};
