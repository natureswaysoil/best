import type { GetServerSideProps } from 'next';
import { getServiceSupabase } from '../../../lib/supabase';

type Props = {
  order: any | null;
};

export default function PackingSlip({ order }: Props) {
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
      <p>(Pull items from order_items table if needed)</p>

      <h3>Total</h3>
      <p>${order.total}</p>

      <button onClick={() => window.print()} style={{ marginTop: 20 }}>Print</button>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const id = ctx.params?.id as string;
  const supabase = getServiceSupabase();

  const { data } = await supabase
    .from('orders')
    .select('*')
    .eq('pi_id', id)
    .single();

  return { props: { order: data || null } };
};
