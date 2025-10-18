import type { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = getServiceSupabase();

    // Check basic connection
    const { data, error } = await supabase
      .from('orders')
      .select('count')
      .limit(1);

    return res.status(200).json({
      success: true,
      connection_test: {
        error: error?.message || null,
        data: data || null,
        error_details: error ? {
          code: error.code,
          details: error.details,
          hint: error.hint
        } : null
      },
      environment: {
        supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
        service_key_length: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
        service_key_start: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 10) + '...',
        service_key_end: '...' + process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(-10)
      }
    });

  } catch (error) {
    console.error('Supabase debug error:', error);
    return res.status(500).json({
      error: 'Supabase connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}