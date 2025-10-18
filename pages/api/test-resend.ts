import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const hasApiKey = Boolean(process.env.RESEND_API_KEY);
  const fromAddress = process.env.RESEND_FROM || null;
  
  return res.status(200).json({
    success: true,
    resend: {
      configured: hasApiKey,
      from: fromAddress,
      apiKeyPresent: hasApiKey ? 'Yes' : 'No'
    },
    environment: {
      resend_api_key: hasApiKey ? 'configured' : 'missing',
      resend_from: fromAddress ? 'configured' : 'missing'
    },
    next_steps: hasApiKey 
      ? 'Resend is configured and ready to send emails'
      : 'Add RESEND_API_KEY and RESEND_FROM environment variables in Vercel'
  });
}