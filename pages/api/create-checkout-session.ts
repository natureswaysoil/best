import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

let stripe: Stripe | null = null;

function getStripeClient(): Stripe {
  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }

  if (!stripe) {
    stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });
  }

  return stripe;
}

interface CheckoutRequestBody {
  productId?: string;
  productName?: string;
  sizeName?: string;
  quantity?: number;
  price?: number;
  sku?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const stripeClient = getStripeClient();

    const {
      productId,
      productName,
      sizeName,
      quantity = 1,
      price,
      sku,
    } = req.body as CheckoutRequestBody;

    if (!productId || !productName || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const sanitizedQuantity = Math.max(1, Math.floor(quantity));
    const unitAmount = Math.round(price * 100);

    if (!Number.isFinite(unitAmount) || unitAmount <= 0) {
      return res.status(400).json({ error: 'Invalid price provided' });
    }

    const origin = req.headers.origin || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const session = await stripeClient.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card', 'link'],
      billing_address_collection: 'auto',
      customer_creation: 'if_required',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: unitAmount,
            product_data: {
              name: sizeName ? `${productName} – ${sizeName}` : productName,
              metadata: {
                productId,
                sizeName: sizeName || '',
                sku: sku || '',
              },
            },
          },
          quantity: sanitizedQuantity,
        },
      ],
      allow_promotion_codes: true,
      metadata: {
        productId,
        sizeName: sizeName || '',
        sku: sku || '',
      },
      success_url: `${origin}/shop?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/product/${productId}`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout session error:', error);
    if (error instanceof Error && error.message.includes('STRIPE_SECRET_KEY')) {
      return res.status(500).json({ error: 'Stripe secret key is not configured.' });
    }
    return res.status(500).json({ error: 'Unable to create checkout session.' });
  }
}
