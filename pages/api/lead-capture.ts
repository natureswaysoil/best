import type { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    email,
    source = 'funnel',
    productId,
    couponCode = 'SAVE15',
    pagePath,
    utmSource,
    utmMedium,
    utmCampaign,
  } = req.body as {
    email?: string;
    source?: string;
    productId?: string;
    couponCode?: string;
    pagePath?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
  };

  const cleanEmail = email?.trim().toLowerCase();

  if (!cleanEmail || !cleanEmail.includes('@')) {
    return res.status(400).json({ error: 'Valid email is required' });
  }

  try {
    const supabase = getServiceSupabase();
    const sourceParts = [
      source,
      utmSource ? `utm_source:${utmSource}` : null,
      utmMedium ? `utm_medium:${utmMedium}` : null,
      utmCampaign ? `utm_campaign:${utmCampaign}` : null,
      pagePath ? `path:${pagePath}` : null,
    ].filter(Boolean);

    const normalizedSource = sourceParts.join('|').slice(0, 250);

    const { error } = await supabase
      .from('marketing_leads')
      .upsert({
        email: cleanEmail,
        source: normalizedSource || source,
        product_id: productId || null,
        coupon_code: couponCode,
        status: 'new',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });

    if (error) {
      console.warn('Lead capture failed:', error);
      return res.status(200).json({ ok: true, warning: 'Lead table may need to be created in Supabase.' });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.warn('Lead capture error:', error);
    return res.status(200).json({ ok: true, warning: 'Lead capture skipped.' });
  }
}
