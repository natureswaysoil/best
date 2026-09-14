import type { NextApiRequest, NextApiResponse } from 'next';
import { adminAuthorized } from '../../../lib/quickbooks';
import { getServiceSupabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const secret =
    req.headers['x-quickbooks-admin-secret'] ||
    (typeof req.body === 'object' && req.body ? req.body.secret : undefined);

  if (!adminAuthorized(secret)) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  try {
    const { error, count } = await getServiceSupabase()
      .from('quickbooks_connections')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    return res.status(200).json({
      ok: true,
      supabase: 'connected',
      quickbooks_connections_count: count ?? 0,
      server_key_type: process.env.SUPABASE_SECRET_KEY ? 'secret' : 'service_role',
    });
  } catch (error: any) {
    console.error('QuickBooks Supabase health check failed:', {
      message: error?.message || String(error),
      hint: error?.hint,
      code: error?.code,
    });

    return res.status(500).json({
      ok: false,
      supabase: 'error',
      error: error?.message || 'Supabase server connection failed',
    });
  }
}
