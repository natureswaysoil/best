import type { GetServerSideProps } from 'next';
import { getServiceSupabase } from '../../../lib/supabase';

type Props = {
  order: any | null;
  items: any[];
};

export default function PackingSlip({ order, items }: Props) {
  if (!order) return <p style={{ padding: 40 }}>Order not found.</p>;

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: 30 }}>
      <h1>Nature's Way Soil</h1>
      <h2>Packing Slip</h2>

      <p><strong>Order ID:</strong> {order.id}</p>
      <p><strong>Stripe:</strong> {order.pi_id}</p>

      <h3>Ship To</h3>
      <p>
        {order.shipping_address1}<br />
        {order.shipping_city}, {order.shipping_state} {order.shipping_zip}
      </p>

      <h3>Items</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ borderBottom: '1px solid #000', textAlign: 'left' }}>SKU</th>
            <th style={{ borderBottom: '1px solid #000', textAlign: 'left' }}>Qty</th>
            <th style={{ borderBottom: '1px solid #000', textAlign: 'left' }}>Price</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i}>
              <td>{item.sku}</td>
              <td>{item.qty}</td>
              <td>${item.price}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Total</h3>
      <p>${order.total}</p>

      <button onClick={() => window.print()} style={{ marginTop: 20 }}>Print</button>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const id = ctx.params?.id as string;
  const supabase = getServiceSupabase();

  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('pi_id', id)
    .single();

  const { data: items } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', order?.id);

  return { props: { order: order || null, items: items || [] } };
};
