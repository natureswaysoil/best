import type { NextApiRequest, NextApiResponse } from 'next';
import {
  exchangeAuthorizationCode,
  fetchCompanyInfo,
  saveConnection,
} from '../../../lib/quickbooks';

function cookieValue(cookieHeader: string | undefined, name: string) {
  const match = cookieHeader
    ?.split(';')
    .map((v) => v.trim())
    .find((v) => v.startsWith(name + '='));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code, realmId, state, error } = req.query;

  if (error) {
    return res.status(400).send('QuickBooks authorization failed: ' + String(error));
  }

  if (
    typeof code !== 'string' ||
    typeof realmId !== 'string' ||
    typeof state !== 'string'
  ) {
    return res.status(400).send('Missing QuickBooks authorization parameters.');
  }

  const expectedState = cookieValue(req.headers.cookie, 'qbo_oauth_state');
  if (!expectedState || expectedState !== state) {
    return res.status(400).send('Invalid or expired QuickBooks OAuth state.');
  }

  try {
    const token = await exchangeAuthorizationCode(code);
    const company = await fetchCompanyInfo(realmId, token.access_token);
    const companyName = company?.CompanyInfo?.CompanyName || null;

    await saveConnection({
      realmId,
      companyName,
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      expiresIn: token.expires_in,
      refreshExpiresIn: token.x_refresh_token_expires_in,
      tokenType: token.token_type,
    });

    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    res.setHeader(
      'Set-Cookie',
      'qbo_oauth_state=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0' + secure
    );

    return res.status(200).send(
      '<html><body style="font-family:Arial;padding:24px"><h2>QuickBooks connected</h2>' +
      '<p>Connected company: <strong>' + (companyName || realmId) + '</strong></p>' +
      '<p>You can return to ChatGPT now.</p></body></html>'
    );
  } catch (err: any) {
    console.error('QuickBooks OAuth callback failed:', err);
    return res.status(500).send('QuickBooks connection failed. Check server logs for details.');
  }
}
