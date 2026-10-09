import Stripe from 'stripe';

// Stripe coupon behind the public SAVE15 code (15% off the first direct website order).
export const FIRST_ORDER_COUPON_ID = 'nws-first-order-15';

export async function getFirstOrderCoupon(stripe: Stripe) {
  try {
    return await stripe.coupons.retrieve(FIRST_ORDER_COUPON_ID);
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError && error.code === 'resource_missing') {
      return stripe.coupons.create({
        id: FIRST_ORDER_COUPON_ID,
        percent_off: 15,
        duration: 'once',
        name: '15% off first direct website order',
        metadata: { public_code: 'SAVE15', source: 'natureswaysoil.com' },
      });
    }
    throw error;
  }
}
