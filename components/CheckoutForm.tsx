import { FormEvent, useState } from 'react';
import { PaymentElement, LinkAuthenticationElement, useElements, useStripe } from '@stripe/react-stripe-js';

interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country?: string;
  phone?: string;
}

interface CheckoutFormProps {
  intentId: string;
  name: string;
  email: string;
  address: Address;
  onSuccess?: () => void;
}

export default function CheckoutForm({ intentId, name, email, address, onSuccess }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [linkEmail, setLinkEmail] = useState(email);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        receipt_email: linkEmail || email,
        payment_method_data: {
          billing_details: {
            name,
            email: linkEmail || email,
            phone: address.phone,
            address: {
              line1: address.line1,
              line2: address.line2,
              city: address.city,
              state: address.state,
              postal_code: address.postal_code,
              country: address.country || 'US',
            },
          },
        },
        shipping: {
          name,
          phone: address.phone,
          address: {
            line1: address.line1,
            line2: address.line2,
            city: address.city,
            state: address.state,
            postal_code: address.postal_code,
            country: address.country || 'US',
          },
        },
        return_url: `${window.location.origin}/shop?checkout=success&pi=${intentId}`,
      },
    });

    if (error) {
      setErrorMessage(error.message || 'We could not complete the payment. Please try again.');
      setIsSubmitting(false);
      return;
    }

    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="border border-gray-200 rounded-lg p-3">
              <LinkAuthenticationElement
                onChange={(event) => {
                  setLinkEmail(event.value.email ?? '');
                }}
                options={{ defaultValues: { email } }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Details</label>
            <div className="border border-gray-200 rounded-lg p-3">
              <PaymentElement
                options={{
                  layout: 'tabs',
                  paymentMethodOrder: ['link', 'card'],
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || !elements || isSubmitting}
        className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-nature-green-600 hover:bg-nature-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Processing…' : 'Pay Now'}
      </button>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
          {errorMessage}
        </div>
      )}
    </form>
  );
}
