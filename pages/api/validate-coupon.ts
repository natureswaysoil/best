import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, subtotal } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ 
        valid: false, 
        error: 'Coupon code is required' 
      });
    }

    if (!subtotal || typeof subtotal !== 'number' || subtotal <= 0) {
      return res.status(400).json({ 
        valid: false, 
        error: 'Valid subtotal is required' 
      });
    }

    const couponCode = code.toUpperCase().trim();

    // Check if it's a valid SAVE15 coupon from exit intent popup
    if (couponCode.startsWith('SAVE15') && couponCode.length >= 8) {
      // 15% discount on subtotal (in cents)
      const discountAmount = Math.round(subtotal * 0.15);
      
      return res.status(200).json({
        valid: true,
        discount: discountAmount,
        discountPercent: 15,
        code: couponCode,
        description: '15% off your order'
      });
    }

    // Check for other valid coupon codes
    const validCoupons: Record<string, { percent: number; description: string }> = {
      'WELCOME10': { percent: 10, description: '10% off your first order' },
      'GARDEN15': { percent: 15, description: '15% off garden products' },
      'SOIL20': { percent: 20, description: '20% off soil products' },
    };

    if (validCoupons[couponCode]) {
      const coupon = validCoupons[couponCode];
      const discountAmount = Math.round(subtotal * (coupon.percent / 100));
      
      return res.status(200).json({
        valid: true,
        discount: discountAmount,
        discountPercent: coupon.percent,
        code: couponCode,
        description: coupon.description
      });
    }

    // Invalid coupon code
    return res.status(200).json({
      valid: false,
      error: 'Invalid coupon code'
    });

  } catch (error) {
    console.error('Error validating coupon:', error);
    return res.status(500).json({ 
      valid: false, 
      error: 'Unable to validate coupon. Please try again.' 
    });
  }
}