import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { adminAuthorized, buildAuthorizationUrl } from '../../../lib/quickbooks';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });

  const secret = req.headers['x-quickbooks-admin-secret'] || req.body?.secret;
  if (!adminAuthorized(secret)) return res.status(401).json({ error: 'Unauthorized' });

  const state = crypto.randomBytes(32).toString('base64url');
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    'qbo_oauth_state=' + state + '; Path=/; HttpOnly; SameSite=Lax; Max-Age=600' + secure
  );

  return res.status(200).json({ authorizationUrl: buildAuthorizationUrl(state) });
}
