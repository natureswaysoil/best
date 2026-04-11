import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

// Uses your existing RESEND_FROM variable
// Notifications go to JAMES_TO (owner) + SALES_TO — same pattern as rest of site
const DEFAULT_FROM = "Nature's Way Soil <no-reply@natureswaysoil.com>";
const FROM = process.env.RESEND_FROM as string;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const NOTIFY_TO = [
  process.env.JAMES_TO,
  process.env.SALES_TO,
].filter(Boolean) as string[];

function getFromAddress() {
  const trimmed = FROM?.trim();

  if (!trimmed) {
    return null;
  }

  const isPlainEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  const isNamedEmail = /^[^<>\n]+<[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+>$/.test(trimmed);

  if (isPlainEmail || isNamedEmail) {
    return trimmed;
  }

  console.warn('[government-rfq] Invalid RESEND_FROM value, falling back to default sender');
  return DEFAULT_FROM;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { agency, name, email, phone, agencyType, useCase, message } = req.body;

  if (!agency || !email || !name || !message) {
    return res.status(400).json({ error: 'Missing required fields: agency, name, email, message' });
  }

  const fromAddress = getFromAddress();

  if (!fromAddress) {
    console.error('[government-rfq] RESEND_FROM env var not set');
    return res.status(500).json({ error: 'Email service not configured' });
  }

  if (!RESEND_API_KEY) {
    console.error('[government-rfq] RESEND_API_KEY env var not set');
    return res.status(500).json({ error: 'Email service not configured' });
  }

  const resend = new Resend(RESEND_API_KEY);

  try {
    // ── 1. Internal notification ──
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
                <tr><td style="padding:7px 0;color:#6b7280;width:150px;vertical-align:top;">Agency / Org</td><td style="padding:7px 0;font-weight:700;">${agency}</td></tr>
                <tr><td style="padding:7px 0;color:#6b7280;vertical-align:top;">Agency Type</td><td style="padding:7px 0;">${agencyType || 'Not specified'}</td></tr>
                <tr><td style="padding:7px 0;color:#6b7280;vertical-align:top;">Contact</td><td style="padding:7px 0;">${name}</td></tr>
                <tr><td style="padding:7px 0;color:#6b7280;vertical-align:top;">Email</td><td style="padding:7px 0;"><a href="mailto:${email}" style="color:#1a5c42;">${email}</a></td></tr>
                <tr><td style="padding:7px 0;color:#6b7280;vertical-align:top;">Phone</td><td style="padding:7px 0;">${phone || 'Not provided'}</td></tr>
                <tr><td style="padding:7px 0;color:#6b7280;vertical-align:top;">Use Case</td><td style="padding:7px 0;">${useCase || 'Not specified'}</td></tr>
              </table>
              <div style="margin-top:24px;padding:16px;background:#f7f3ec;border-left:4px solid #0d3522;">
                <p style="margin:0 0 8px;color:#6b7280;font-size:0.72rem;text-transform:uppercase;letter-spacing:0.08em;font-family:sans-serif;">Project Requirements</p>
                <p style="margin:0;line-height:1.75;font-size:0.9rem;">${message}</p>
              </div>
            </div>
            <div style="background:#0d3522;padding:14px 32px;text-align:center;color:rgba(255,255,255,0.5);font-size:0.72rem;font-family:sans-serif;">
              Reply to this email to respond directly to ${name} at ${email}
            </div>
          </div>
        </body></html>
      `,
    });

    if (err1) throw err1;

    // ── 2. Auto-reply to buyer ──
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
              <h2 style="margin:0;font-size:1.3rem;font-weight:700;">Thank you, ${name.split(' ')[0]}.</h2>
              <p style="margin:8px 0 0;opacity:0.7;font-size:0.85rem;">Nature's Way Soil — Government &amp; Institutional Sales</p>
            </div>
            <div style="background:white;padding:32px;border:1px solid #ede7da;">
              <p style="line-height:1.8;margin:0 0 16px;">We have received your procurement inquiry from <strong>${agency}</strong>. A member of our government sales team will respond within <strong>one business day</strong> with:</p>
              <ul style="padding-left:1.2rem;line-height:2.2;color:#1e2022;font-size:0.9rem;">
                <li>Itemized pricing and volume discount schedule</li>
                <li>Full product specifications</li>
                <li>Safety Data Sheets (SDS) and Technical Data Sheets (TDS)</li>
                <li>USDA BioPreferred designation documentation</li>
                <li>Purchase order and Net-30 terms information</li>
              </ul>
              <p style="line-height:1.8;margin:20px 0 0;font-size:0.9rem;">For urgent requirements, reply to this email directly.</p>
              <div style="margin-top:24px;padding:18px 20px;background:#f7f3ec;border:1px solid #ede7da;border-radius:3px;">
                <p style="margin:0 0 3px;font-weight:700;color:#0d3522;font-size:0.9rem;">Nature's Way Soil — Government Sales</p>
                <p style="margin:5px 0 0;font-size:0.75rem;color:#6b7280;font-family:sans-serif;letter-spacing:0.03em;">USDA BioPreferred Partner · SAM.gov Registered · Buy American Compliant · Made in USA</p>
              </div>
            </div>
            <div style="background:#0d3522;padding:14px 32px;text-align:center;color:rgba(255,255,255,0.4);font-size:0.72rem;font-family:sans-serif;">
              Nature's Way Soil · natureswaysoil.com
            </div>
          </div>
        </body></html>
      `,
    });

    if (err2) throw err2;

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('[government-rfq] Resend error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    });
  }
}
