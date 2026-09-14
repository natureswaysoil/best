import crypto from 'crypto';
import { getServiceSupabase } from './supabase';

const AUTH_URL = 'https://appcenter.intuit.com/connect/oauth2';
const TOKEN_URL = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';
const API_BASE = 'https://quickbooks.api.intuit.com';

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(name + ' is not configured');
  return value;
}

function encryptionKey(): Buffer {
  return crypto.createHash('sha256').update(required('QUICKBOOKS_TOKEN_ENCRYPTION_KEY')).digest();
}

function intuitTid(response: Response): string | null {
  return response.headers.get('intuit_tid');
}

function logIntuitFailure(context: string, response: Response, body: unknown) {
  const tid = intuitTid(response);
  console.error('QuickBooks API error', {
    context,
    status: response.status,
    intuit_tid: tid,
    body,
  });
  return tid;
}

export function encryptSecret(value: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, encrypted].map((part) => part.toString('base64url')).join('.');
}

export function decryptSecret(value: string): string {
  const [ivPart, tagPart, encryptedPart] = value.split('.');
  if (!ivPart || !tagPart || !encryptedPart) throw new Error('Invalid encrypted token');
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    encryptionKey(),
    Buffer.from(ivPart, 'base64url')
  );
  decipher.setAuthTag(Buffer.from(tagPart, 'base64url'));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedPart, 'base64url')),
    decipher.final(),
  ]).toString('utf8');
}

export function quickBooksRedirectUri(): string {
  return process.env.QUICKBOOKS_REDIRECT_URI || 'https://natureswaysoil.com/api/quickbooks/callback';
}

export function buildAuthorizationUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: required('QUICKBOOKS_CLIENT_ID'),
    response_type: 'code',
    scope: 'com.intuit.quickbooks.accounting',
    redirect_uri: quickBooksRedirectUri(),
    state,
  });
  return AUTH_URL + '?' + params.toString();
}

async function tokenRequest(params: URLSearchParams) {
  const credentials = Buffer.from(
    required('QUICKBOOKS_CLIENT_ID') + ':' + required('QUICKBOOKS_CLIENT_SECRET')
  ).toString('base64');

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + credentials,
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  const body = await response.json().catch(() => ({}));
  const tid = intuitTid(response);

  if (!response.ok) {
    logIntuitFailure('oauth_token', response, body);
    throw new Error(
      'QuickBooks token request failed (' + response.status + ')' +
      (tid ? ' intuit_tid=' + tid : '') +
      ': ' + JSON.stringify(body)
    );
  }

  return body as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    x_refresh_token_expires_in?: number;
    token_type?: string;
  };
}

export async function exchangeAuthorizationCode(code: string) {
  return tokenRequest(new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: quickBooksRedirectUri(),
  }));
}

export async function refreshAccessToken(refreshToken: string) {
  return tokenRequest(new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  }));
}

type ConnectionRow = {
  realm_id: string;
  company_name: string | null;
  access_token_encrypted: string;
  refresh_token_encrypted: string;
  access_token_expires_at: string;
  refresh_token_expires_at: string | null;
  scope: string | null;
  token_type: string | null;
  connected_at: string;
  updated_at: string;
};

export async function saveConnection(input: {
  realmId: string;
  companyName?: string | null;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn?: number;
  tokenType?: string;
  scope?: string | null;
}) {
  const now = Date.now();
  const accessExpires = new Date(now + input.expiresIn * 1000).toISOString();
  const refreshExpires = input.refreshExpiresIn
    ? new Date(now + input.refreshExpiresIn * 1000).toISOString()
    : null;

  const { error } = await getServiceSupabase()
    .from('quickbooks_connections')
    .upsert({
      provider: 'quickbooks_online',
      realm_id: input.realmId,
      company_name: input.companyName || null,
      access_token_encrypted: encryptSecret(input.accessToken),
      refresh_token_encrypted: encryptSecret(input.refreshToken),
      access_token_expires_at: accessExpires,
      refresh_token_expires_at: refreshExpires,
      scope: input.scope || 'com.intuit.quickbooks.accounting',
      token_type: input.tokenType || 'bearer',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'realm_id' });

  if (error) throw error;
}

export async function getLatestConnection(): Promise<ConnectionRow | null> {
  const { data, error } = await getServiceSupabase()
    .from('quickbooks_connections')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as ConnectionRow | null;
}

export async function getValidAccessToken(row: ConnectionRow): Promise<string> {
  const expiresAt = new Date(row.access_token_expires_at).getTime();
  if (expiresAt - Date.now() > 5 * 60 * 1000) {
    return decryptSecret(row.access_token_encrypted);
  }

  const refreshed = await refreshAccessToken(decryptSecret(row.refresh_token_encrypted));
  await saveConnection({
    realmId: row.realm_id,
    companyName: row.company_name,
    accessToken: refreshed.access_token,
    refreshToken: refreshed.refresh_token,
    expiresIn: refreshed.expires_in,
    refreshExpiresIn: refreshed.x_refresh_token_expires_in,
    tokenType: refreshed.token_type,
  });
  return refreshed.access_token;
}

export async function qboRequest(path: string, init: RequestInit = {}) {
  const connection = await getLatestConnection();
  if (!connection) throw new Error('QuickBooks is not connected');

  const accessToken = await getValidAccessToken(connection);
  const response = await fetch(API_BASE + path, {
    ...init,
    headers: {
      Authorization: 'Bearer ' + accessToken,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });

  const text = await response.text();
  let body: any = text;
  try { body = JSON.parse(text); } catch {}

  const tid = intuitTid(response);

  if (!response.ok) {
    logIntuitFailure('qbo_request', response, body);
    throw new Error(
      'QuickBooks API failed (' + response.status + ')' +
      (tid ? ' intuit_tid=' + tid : '') +
      ': ' + (typeof body === 'string' ? body : JSON.stringify(body))
    );
  }

  if (tid) {
    console.info('QuickBooks API response', {
      path,
      status: response.status,
      intuit_tid: tid,
    });
  }

  return body;
}

export async function fetchCompanyInfo(realmId: string, accessToken?: string) {
  const row = await getLatestConnection();
  const token = accessToken || (row ? await getValidAccessToken(row) : null);
  if (!token) throw new Error('QuickBooks is not connected');

  const response = await fetch(
    API_BASE + '/v3/company/' + encodeURIComponent(realmId) +
      '/companyinfo/' + encodeURIComponent(realmId) + '?minorversion=75',
    { headers: { Authorization: 'Bearer ' + token, Accept: 'application/json' } }
  );
  const body = await response.json().catch(() => ({}));
  const tid = intuitTid(response);

  if (!response.ok) {
    logIntuitFailure('company_info', response, body);
    throw new Error(
      'CompanyInfo failed (' + response.status + ')' +
      (tid ? ' intuit_tid=' + tid : '') +
      ': ' + JSON.stringify(body)
    );
  }

  if (tid) {
    console.info('QuickBooks CompanyInfo response', {
      realmId,
      status: response.status,
      intuit_tid: tid,
    });
  }

  return body;
}

export function adminAuthorized(secret: unknown): boolean {
  const expected = process.env.QUICKBOOKS_ADMIN_SECRET;
  if (!expected || typeof secret !== 'string') return false;
  const left = Buffer.from(secret);
  const right = Buffer.from(expected);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}
