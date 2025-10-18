import type { NextApiRequest, NextApiResponse } from 'next';
import { sendFollowUpEmail } from '../../lib/resend';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, name } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: 'Email and name are required' });
  }

  try {
    const result = await sendFollowUpEmail(email, name);
    
    if (result.success) {
      return res.status(200).json({ success: true, message: 'Follow-up email sent' });
    } else {
      return res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Follow-up email error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}