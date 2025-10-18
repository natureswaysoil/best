import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { getServiceSupabase } from '../../lib/supabase';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

const readEnv = (keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = process.env[key];
    if (value !== undefined) {
      return value;
    }
  }
  return undefined;
};

const readNumber = (keys: string[], fallback: number): number => {
  const raw = readEnv(keys);
  if (raw === undefined) {
    return fallback;
  }
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
};

const readBoolean = (keys: string[], fallback: boolean): boolean => {
  const raw = readEnv(keys);
  if (raw === undefined) {
    return fallback;
  }
  const normalized = raw.trim().toLowerCase();
  return !['false', '0', 'no', 'off'].includes(normalized);
};

const readNumberMap = (
  keys: string[],
  normalizer: (value: number) => number = (value) => value,
): Record<string, number> => {
  const raw = readEnv(keys);
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return Object.entries(parsed).reduce<Record<string, number>>((acc, [key, value]) => {
      const numeric = Number(value);
      if (Number.isFinite(numeric)) {
        acc[key.toUpperCase()] = normalizer(numeric);
      }
      return acc;
    }, {});
  } catch (error) {
    console.warn('Unable to parse numeric map from environment variable:', error);
    return {};
  }
};

const normalizeRate = (value: number): number => {
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }
  return value > 1 ? value / 100 : value;
};

const FREE_SHIPPING_THRESHOLD_CENTS = Math.max(
  0,
  Math.round(
    readNumber(
      ['NWS_FREE_SHIPPING_THRESHOLD_CENTS', 'NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD_CENTS'],
      5000,
    ),
  ),
);

const BASE_SHIPPING_CENTS = Math.max(
  0,
  Math.round(readNumber(['NWS_BASE_SHIPPING_CENTS', 'NEXT_PUBLIC_BASE_SHIPPING_CENTS'], 995)),
);

const STATE_SHIPPING_SURCHARGES = readNumberMap(
  ['NWS_STATE_SHIPPING_CENTS', 'NEXT_PUBLIC_STATE_SHIPPING_CENTS'],
  (value) => Math.max(0, Math.round(value)),
);

const DEFAULT_TAX_RATE = normalizeRate(
  readNumber(['NWS_DEFAULT_TAX_RATE', 'NEXT_PUBLIC_DEFAULT_TAX_RATE'], 0),
);

const NC_FALLBACK_TAX_RATE = normalizeRate(
  readNumber(['NWS_NC_TAX_RATE', 'NEXT_PUBLIC_NC_TAX_RATE'], 0.0475),
);

const STATE_TAX_RATES = readNumberMap(
  ['NWS_STATE_TAX_RATES', 'NEXT_PUBLIC_STATE_TAX_RATES'],
  normalizeRate,
);

const TAX_APPLIES_TO_SHIPPING = readBoolean(
  ['NWS_TAX_APPLY_TO_SHIPPING', 'NEXT_PUBLIC_TAX_APPLY_TO_SHIPPING'],
  true,
);

let stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }

  if (!stripe) {
    stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' });
  }

  return stripe;
}

const calculateShipping = (subtotalCents: number, state?: string): number => {
  if (subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS && FREE_SHIPPING_THRESHOLD_CENTS > 0) {
    return 0;
  }

  const stateKey = state?.trim().toUpperCase() ?? '';
  const override = stateKey ? STATE_SHIPPING_SURCHARGES[stateKey] : undefined;
  const shipping = override ?? BASE_SHIPPING_CENTS;
  return Math.max(0, Math.round(shipping));
};

const calculateTax = (subtotalCents: number, shippingCents: number, state?: string) => {
  const stateKey = state?.trim().toUpperCase() ?? '';
  let rate = stateKey ? STATE_TAX_RATES[stateKey] : undefined;

  if (rate === undefined) {
    rate = stateKey === 'NC' ? NC_FALLBACK_TAX_RATE : DEFAULT_TAX_RATE;
  }

  if (!Number.isFinite(rate) || rate <= 0) {
    return { taxCents: 0, taxRate: 0 };
  }

  const taxableBase = subtotalCents + (TAX_APPLIES_TO_SHIPPING ? shippingCents : 0);
  const taxCents = Math.max(0, Math.round(taxableBase * rate));
  return { taxCents, taxRate: rate };
};

interface CustomerDetails {
  name?: string;
  email?: string;
  phone?: string;
}

interface AddressDetails {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country?: string;
  phone?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const stripeClient = getStripe();

    const {
      productId,
      productName,
      sizeName,
      sku,
      price,
      quantity = 1,
      customer,
      address,
    } = req.body as {
      productId?: string;
      productName?: string;
      sizeName?: string;
      sku?: string;
      price?: number;
      quantity?: number;
      customer?: CustomerDetails;
      address?: AddressDetails;
    };

    if (!productId || !productName || typeof price !== 'number') {
      return res.status(400).json({ error: 'Missing required product information' });
    }

    if (!address) {
      return res.status(400).json({ error: 'Shipping address is required' });
    }

    if (!address.line1 || !address.city || !address.state || !address.postal_code) {
      return res.status(400).json({ error: 'Incomplete shipping address' });
    }

    const sanitizedQuantity = Math.max(1, Math.floor(quantity));
    const unitAmount = Math.round(price * 100);

    if (!Number.isFinite(unitAmount) || unitAmount <= 0) {
      return res.status(400).json({ error: 'Invalid price provided' });
    }

    const stateCode = (address.state || '').trim().toUpperCase();
    const subtotalCents = unitAmount * sanitizedQuantity;
    const shippingCents = calculateShipping(subtotalCents, stateCode);
    const { taxCents, taxRate } = calculateTax(subtotalCents, shippingCents, stateCode);
    const totalCents = subtotalCents + shippingCents + taxCents;
    const taxRatePercent = Number.isFinite(taxRate)
      ? Number((taxRate * 100).toFixed(4))
      : 0;

    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: totalCents,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      receipt_email: customer?.email,
      metadata: {
        product_id: productId,
        product_name: productName,
        size_name: sizeName || '',
        sku: sku || '',
        quantity: String(sanitizedQuantity),
        subtotal_cents: String(subtotalCents),
        shipping_cents: String(shippingCents),
        tax_cents: String(taxCents),
        tax_rate_percent: taxRatePercent.toFixed(4),
        state: stateCode,
      },
      description: sizeName ? `${productName} – ${sizeName}` : productName,
    });

    // Save order to Supabase
    try {
      const supabase = getServiceSupabase();
      
      const orderData = {
        pi_id: paymentIntent.id,
        status: 'pending',
        email: customer?.email || null,
        name: customer?.name || null,
        subtotal: Number((subtotalCents / 100).toFixed(2)),
        tax: Number((taxCents / 100).toFixed(2)),
        shipping: Number((shippingCents / 100).toFixed(2)),
        total: Number((totalCents / 100).toFixed(2)),
        billing: {
          name: customer?.name,
          email: customer?.email,
          phone: customer?.phone,
          address1: address.line1,
          address2: address.line2,
          city: address.city,
          state: address.state,
          zip: address.postal_code,
        },
        shipping_address: {
          name: customer?.name,
          address1: address.line1,
          address2: address.line2,
          city: address.city,
          state: address.state,
          zip: address.postal_code,
          phone: address.phone || customer?.phone,
        },
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select('id')
        .single();

      if (orderError) {
        console.warn('Failed to save order to Supabase:', orderError);
      } else if (order?.id) {
        // Save order item
        const orderItemData = {
          order_id: order.id,
          sku: sku || `${productId}-${sizeName || 'default'}`,
          qty: sanitizedQuantity,
          unit_price: Number((unitAmount / 100).toFixed(2)),
        };

        const { error: itemError } = await supabase
          .from('order_items')
          .insert(orderItemData);

        if (itemError) {
          console.warn('Failed to save order item to Supabase:', itemError);
        }
      }
    } catch (supabaseError) {
      console.warn('Supabase integration error:', supabaseError);
      // Don't fail the payment intent creation if Supabase is down
    }

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      intentId: paymentIntent.id,
      breakdown: {
        subtotal: subtotalCents,
        shipping: shippingCents,
        tax: taxCents,
        total: totalCents,
        taxRatePercent,
      },
    });
  } catch (error) {
    console.error('Payment intent error:', error);

    if (error instanceof Error && error.message.includes('STRIPE_SECRET_KEY')) {
      return res.status(500).json({ error: 'Stripe secret key is not configured.' });
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ 
      error: 'Unable to create payment intent.',
      details: errorMessage 
    });
  }
}
