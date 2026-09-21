import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

const DEFAULT_FROM = "Nature's Way Soil <no-reply@natureswaysoil.com>";
const GOVERNMENT_RFQ_CC = 'natureswaysoil@gmail.com';
const FROM = process.env.RESEND_FROM as string;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const NOTIFY_TO = Array.from(
  new Set([
    process.env.JAMES_TO,
    process.env.SALES_TO,
    GOVERNMENT_RFQ_CC,
  ].filter(Boolean))
) as string[];

const FOLLOWUP_TO = process.env.SALES_TO || process.env.JAMES_TO || GOVERNMENT_RFQ_CC;
const ALLOWED_ORIGINS = new Set([
  'https://natureswaysoil.com',
  'https://www.natureswaysoil.com',
]);

const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT = 5;
const MIN_FILL_MS = 3000;
const MAX_FILL_MS = 2 * 60 * 60 * 1000;

type RateBucket = { count: number; resetAt: number };
const globalForRfq = globalThis as typeof globalThis & {
  __governmentRfqRate?: Map<string, RateBucket>;
};
const rateBuckets = globalForRfq.__governmentRfqRate ?? new Map<string, RateBucket>();
globalForRfq.__governmentRfqRate = rateBuckets;

function getFromAddress() {
  const trimmed = FROM?.trim();

  if (!trimmed) return null;

  const isPlainEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  const isNamedEmail = /^[^<>\n]+<[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+>$/.test(trimmed);

  if (isPlainEmail || isNamedEmail) return trimmed;

  console.warn('[government-rfq] Invalid RESEND_FROM value, falling back to default sender');
  return DEFAULT_FROM;
}

function firstHeader(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function requestIp(req: NextApiRequest) {
  const forwarded = firstHeader(req.headers['x-forwarded-for']);
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.socket.remoteAddress || 'unknown';
}

function sameSiteRequest(req: NextApiRequest) {
  const origin = firstHeader(req.headers.origin);
  const referer = firstHeader(req.headers.referer);

  if (process.env.NODE_ENV !== 'production') return true;
  if (origin && ALLOWED_ORIGINS.has(origin)) return true;
  if (referer) {
    try {
      return ALLOWED_ORIGINS.has(new URL(referer).origin);
    } catch {
      return false;
    }
  }
  return false;
}

function withinRateLimit(ip: string) {
  const now = Date.now();
  const current = rateBuckets.get(ip);

  if (!current || current.resetAt <= now) {
    rateBuckets.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }

  if (current.count >= RATE_LIMIT) return false;
  current.count += 1;
  rateBuckets.set(ip, current);
  return true;
}

function asText(value: unknown, maxLength: number) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

function looksLikeRandomToken(value: string) {
  if (value.includes(' ') || value.length < 14) return false;
  const letters = value.replace(/[^A-Za-z]/g, '');
  if (letters.length < 14) return false;
  const hasUpper = /[A-Z]/.test(letters);
  const hasLower = /[a-z]/.test(letters);
  return hasUpper && hasLower;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    agency: rawAgency,
    name: rawName,
    email: rawEmail,
    phone: rawPhone,
    agencyType: rawAgencyType,
    useCase: rawUseCase,
    message: rawMessage,
    website,
    formStartedAt,
  } = req.body ?? {};

  // Honeypot: bots commonly fill every field. Return success so they do not adapt.
  if (typeof website === 'string' && website.trim()) {
    return res.status(200).json({ success: true });
  }

  if (!sameSiteRequest(req)) {
    return res.status(403).json({ error: 'Invalid form origin' });
  }

  const started = Number(formStartedAt);
  const elapsed = Date.now() - started;
  if (!Number.isFinite(started) || elapsed < MIN_FILL_MS || elapsed > MAX_FILL_MS) {
    return res.status(400).json({ error: 'Please reload the page and submit the form again.' });
  }

  const ip = requestIp(req);
  if (!withinRateLimit(ip)) {
    res.setHeader('Retry-After', String(Math.ceil(RATE_WINDOW_MS / 1000)));
    return res.status(429).json({ error: 'Too many quote requests. Please try again later.' });
  }

  const agency = asText(rawAgency, 120);
  const name = asText(rawName, 100);
  const email = asText(rawEmail, 254).toLowerCase();
  const phone = asText(rawPhone, 40);
  const agencyType = asText(rawAgencyType, 80);
  const useCase = asText(rawUseCase, 1000);
  const message = asText(rawMessage, 3000);

  if (!agency || !email || !name || !message) {
    return res.status(400).json({ error: 'Missing required fields: agency, name, email, message' });
  }

  if (!validEmail(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  if (name.length < 3 || agency.length < 2 || message.length < 10) {
    return res.status(400).json({ error: 'Please provide complete quote-request details.' });
  }

  if (looksLikeRandomToken(name) || looksLikeRandomToken(useCase)) {
    return res.status(400).json({ error: 'Please provide recognizable contact and project details.' });
  }

  const fromAddress = getFromAddress();

  if (!fromAddress || !RESEND_API_KEY) {
    console.error('[government-rfq] Email service not configured');
    return res.status(500).json({ error: 'Email service not configured' });
  }

  const safeAgency = escapeHtml(agency);
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safePhone = escapeHtml(phone);
  const safeAgencyType = escapeHtml(agencyType || 'Not specified');
  const safeUseCase = escapeHtml(useCase || 'Not specified');
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br/>');

  const resend = new Resend(RESEND_API_KEY);

  try {
    const { error: err1 } = await resend.emails.send({
      from: fromAddress,
      to: NOTIFY_TO.length > 0 ? NOTIFY_TO : [fromAddress],
      replyTo: email,
      subject: `[GOV RFQ] ${agencyType || 'Agency'} — ${agency}`,
      html: `
        <!DOCTYPE html>
        <html><head><meta charset="utf-8"/></head>
        <body style="margin:0;padding:0;background:#f7f3ec;font-family:Georgia,serif;">
          <div style="max-width:600px;margin:0 auto;">
            <div style="background:#0d3522;color:white;padding:24px 32px;">
              <h2 style="margin:0;font-size:1.3rem;font-weight:700;">New Government RFQ</h2>
              <p style="margin:6px 0 0;opacity:0.7;font-size:0.85rem;">Nature's Way Soil — Government Procurement</p>
            </div>
            <div style="background:white;padding:32px;border:1px solid #ede7da;">
              <table style="width:100%;border-collapse:collapse;font-size:0.88rem;">
                <tr><td style="padding:7px 0;color:#6b7280;width:150px;vertical-align:top;">Agency / Org</td><td style="padding:7px 0;font-weight:700;">${safeAgency}</td></tr>
                <tr><td style="padding:7px 0;color:#6b7280;vertical-align:top;">Agency Type</td><td style="padding:7px 0;">${safeAgencyType}</td></tr>
                <tr><td style="padding:7px 0;color:#6b7280;vertical-align:top;">Contact</td><td style="padding:7px 0;">${safeName}</td></tr>
                <tr><td style="padding:7px 0;color:#6b7280;vertical-align:top;">Email</td><td style="padding:7px 0;"><a href="mailto:${safeEmail}" style="color:#1a5c42;">${safeEmail}</a></td></tr>
                <tr><td style="padding:7px 0;color:#6b7280;vertical-align:top;">Phone</td><td style="padding:7px 0;">${safePhone || 'Not provided'}</td></tr>
                <tr><td style="padding:7px 0;color:#6b7280;vertical-align:top;">Use Case</td><td style="padding:7px 0;">${safeUseCase}</td></tr>
              </table>
              <div style="margin-top:24px;padding:16px;background:#f7f3ec;border-left:4px solid #0d3522;">
                <p style="margin:0 0 8px;color:#6b7280;font-size:0.72rem;text-transform:uppercase;letter-spacing:0.08em;font-family:sans-serif;">Project Requirements</p>
                <p style="margin:0;line-height:1.75;font-size:0.9rem;">${safeMessage}</p>
              </div>
            </div>
          </div>
        </body></html>
      `,
    });

    if (err1) throw err1;

    const { error: err2 } = await resend.emails.send({
      from: fromAddress,
      to: [email],
      subject: `RFQ Received — Nature's Way Soil Government Sales`,
      html: `
        <!DOCTYPE html>
        <html><head><meta charset="utf-8"/></head>
        <body style="margin:0;padding:0;background:#f7f3ec;font-family:Georgia,serif;">
          <div style="max-width:600px;margin:0 auto;">
            <div style="background:#0d3522;color:white;padding:24px 32px;">
              <h2 style="margin:0;font-size:1.3rem;font-weight:700;">Thank you, ${escapeHtml(name.split(' ')[0])}.</h2>
              <p style="margin:8px 0 0;opacity:0.7;font-size:0.85rem;">Nature's Way Soil — Government &amp; Institutional Sales</p>
            </div>
            <div style="background:white;padding:32px;border:1px solid #ede7da;">
              <p style="line-height:1.8;margin:0 0 16px;">We have received your procurement inquiry from <strong>${safeAgency}</strong>. A member of our government sales team will respond within <strong>one business day</strong>.</p>
              <p style="line-height:1.8;margin:20px 0 0;font-size:0.9rem;">For urgent requirements, reply to this email directly.</p>
            </div>
          </div>
        </body></html>
      `,
    });

    if (err2) throw err2;

    // One internal reminder destination instead of three, reducing quota use.
    const rfqKey = Buffer.from(`${agency}|${email}`).toString('base64url').slice(0, 80);
    for (const delayHours of [24, 72]) {
      const { error: reminderError } = await resend.emails.send({
        from: fromAddress,
        to: [FOLLOWUP_TO],
        replyTo: email,
        subject: `[RFQ FOLLOW-UP] ${agency} — ${delayHours === 24 ? '1 day' : '3 days'}`,
        html: `<h2>Government lead follow-up</h2><p>Confirm that <strong>${safeName}</strong> at <strong>${safeAgency}</strong> received a personal response and quote.</p><p>Reply directly to contact ${safeEmail}${safePhone ? ` or ${safePhone}` : ''}.</p><p>Use case: ${safeUseCase}</p>`,
        scheduledAt: new Date(Date.now() + delayHours * 60 * 60 * 1000).toISOString(),
      }, { idempotencyKey: `rfq-followup/${rfqKey}/${delayHours}h` });

      if (reminderError) throw reminderError;
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('[government-rfq] Resend error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    });
  }
}
