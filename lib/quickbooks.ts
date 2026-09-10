import crypto from 'crypto';
import { getServiceSupabase } from './supabase';

const AUTH_URL = 'https://appcenter.intuit.com/connect/oauth2';
const TOKEN_URL = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';
const QBO_PROD_BASE = 'https://quickbooks.api.intuit.com/v3/company';
const QBO_SANDBOX_BASE = 'https://sandbox-quickbooks.api.intuit.com/v3/company';
const SCOPE = 'com.intuit.quickbooks.accounting';

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

function stateSecret(): string {
  return process.env.QUICKBOOKS_STATE_SECRET || required('QUICKBOOKS_CLIENT_SECRET');
}

export function quickBooksRedirectUri(): string {
  return process.env.QUICKBOOKS_REDIRECT_URI || `${process.env.NEXT_PUBLIC_SITE_URL || 'https://natureswaysoil.com'}/api/quickbooks/callback`;
}

export function createQuickBooksState(): string {
  const nonce = crypto.randomBytes(24).toString('hex');
  const issuedAt = Math.floor(Date.now() / 1000).toString();
  const payload = `${issuedAt}.${nonce}`;
  const signature = crypto.createHmac('sha256', stateSecret()).update(payload).digest('hex');
  return Buffer.from(`${payload}.${signature}`, 'utf8').toString('base64url');
}

export function verifyQuickBooksState(state: string): boolean {
  try {
    const decoded = Buffer.from(state, 'base64url').toString('utf8');
    const [issuedAt, nonce, signature] = decoded.split('.');
    if (!issuedAt || !nonce || !signature) return false;
    const payload = `${issuedAt}.${nonce}`;
    const expected = crypto.createHmac('sha256', stateSecret()).update(payload).digest('hex');
    if (signature.length !== expected.length) return false;
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
    const ageSeconds = Math.floor(Date.now() / 1000) - Number(issuedAt);
    return Number.isFinite(ageSeconds) && ageSeconds >= 0 && ageSeconds <= 600;
  } catch {
    return false;
  }
}

export function getQuickBooksAuthorizationUrl(): string {
  const params = new URLSearchParams({
    client_id: required('QUICKBOOKS_CLIENT_ID'),
    response_type: 'code',
    scope: SCOPE,
    redirect_uri: quickBooksRedirectUri(),
    state: createQuickBooksState(),
  });
  return `${AUTH_URL}?${params.toString()}`;
}

type TokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  x_refresh_token_expires_in?: number;
  token_type?: string;
};

async function tokenRequest(body: URLSearchParams): Promise<TokenResponse> {
  const credentials = Buffer.from(`${required('QUICKBOOKS_CLIENT_ID')}:${required('QUICKBOOKS_CLIENT_SECRET')}`).toString('base64');
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(`QuickBooks token request failed: ${response.status} ${JSON.stringify(payload)}`);
  return payload as TokenResponse;
}

export async function exchangeQuickBooksCode(code: string): Promise<TokenResponse> {
  return tokenRequest(new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: quickBooksRedirectUri(),
  }));
}

export async function refreshQuickBooksToken(refreshToken: string): Promise<TokenResponse> {
  return tokenRequest(new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  }));
}

function encryptionKey(): Buffer {
  return crypto.createHash('sha256').update(required('QUICKBOOKS_TOKEN_ENCRYPTION_KEY')).digest();
}

function encrypt(value: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('base64url')}.${tag.toString('base64url')}.${encrypted.toString('base64url')}`;
}

function decrypt(value: string): string {
  const [ivRaw, tagRaw, dataRaw] = value.split('.');
  const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(ivRaw, 'base64url'));
  decipher.setAuthTag(Buffer.from(tagRaw, 'base64url'));
  return Buffer.concat([decipher.update(Buffer.from(dataRaw, 'base64url')), decipher.final()]).toString('utf8');
}

export async function saveQuickBooksConnection(realmId: string, tokens: TokenResponse) {
  const supabase = getServiceSupabase();
  const now = Date.now();
  const { error } = await supabase.from('quickbooks_connections').upsert({
    realm_id: realmId,
    access_token_encrypted: encrypt(tokens.access_token),
    refresh_token_encrypted: encrypt(tokens.refresh_token),
    access_token_expires_at: new Date(now + tokens.expires_in * 1000).toISOString(),
    refresh_token_expires_at: tokens.x_refresh_token_expires_in
      ? new Date(now + tokens.x_refresh_token_expires_in * 1000).toISOString()
      : null,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'realm_id' });
  if (error) throw new Error(`Could not save QuickBooks connection: ${error.message}`);
}

export async function getQuickBooksAccess(): Promise<{ realmId: string; accessToken: string }> {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from('quickbooks_connections')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();
  if (error || !data) throw new Error('QuickBooks is not connected');

  const realmId = String(data.realm_id);
  const expiresAt = new Date(data.access_token_expires_at).getTime();
  if (expiresAt > Date.now() + 5 * 60 * 1000) {
    return { realmId, accessToken: decrypt(data.access_token_encrypted) };
  }

  const refreshed = await refreshQuickBooksToken(decrypt(data.refresh_token_encrypted));
  await saveQuickBooksConnection(realmId, refreshed);
  return { realmId, accessToken: refreshed.access_token };
}

export async function quickBooksApi(path: string, init: RequestInit = {}) {
  const { realmId, accessToken } = await getQuickBooksAccess();
  const base = process.env.QUICKBOOKS_ENVIRONMENT === 'sandbox' ? QBO_SANDBOX_BASE : QBO_PROD_BASE;
  const response = await fetch(`${base}/${encodeURIComponent(realmId)}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init.headers || {}),
    },
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(`QuickBooks API failed: ${response.status} ${JSON.stringify(payload)}`);
  return payload;
}
