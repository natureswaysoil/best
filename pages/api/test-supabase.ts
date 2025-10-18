import type { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = getServiceSupabase();

    // Test connection by checking if tables exist
    const { error: ordersError } = await supabase
      .from('orders')
      .select('id')
      .limit(1);

    const { error: customersError } = await supabase
      .from('customers')
      .select('id')
      .limit(1);

    const { error: orderItemsError } = await supabase
      .from('order_items')
      .select('id')
      .limit(1);

    return res.status(200).json({
      success: true,
      message: 'Supabase connection successful',
      tables: {
        orders: {
          exists: !ordersError,
          error: ordersError?.message || null
        },
        customers: {
          exists: !customersError,
          error: customersError?.message || null
        },
        order_items: {
          exists: !orderItemsError,
          error: orderItemsError?.message || null
        }
      },
      environment: {
        supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing',
        supabase_anon_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'configured' : 'missing',
        supabase_service_key: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'configured' : 'missing',
      }
    });

  } catch (error) {
    console.error('Supabase test error:', error);
    return res.status(500).json({
      error: 'Supabase connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}