import { useState } from 'react';
import { useRouter } from 'next/router';
import { trackLeadCapture } from '../lib/ga4';

export default function EmailCapture({ productId }: { productId?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email.includes('@')) return;

    setError(null);
    const searchParams = typeof window === 'undefined'
      ? new URLSearchParams()
      : new URLSearchParams(window.location.search);

    const payload = {
      email,
      productId,
      source: 'inline_email_capture',
      pagePath: router.asPath,
      utmSource: searchParams.get('utm_source') || undefined,
      utmMedium: searchParams.get('utm_medium') || undefined,
      utmCampaign: searchParams.get('utm_campaign') || undefined,
    };

    try {
      const response = await fetch('/api/lead-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        setError('Unable to submit your email right now. Please try again.');
        return;
      }

      trackLeadCapture({
        source: payload.source,
        page_path: payload.pagePath,
        product_id: productId,
        utm_source: payload.utmSource,
        utm_medium: payload.utmMedium,
        utm_campaign: payload.utmCampaign,
      });
      setSubmitted(true);
    } catch (submitError) {
      console.warn('Email capture submit failed', submitError);
      setError('Unable to submit your email right now. Please try again.');
    }
  };

  if (submitted) {
    return (
      <div className="rounded-xl border-2 border-dashed border-green-300 bg-green-50 p-4 text-center">
        <p className="font-semibold text-green-800">Your 15% discount code is:</p>
        <p className="mt-1 text-2xl font-mono font-bold tracking-wider text-green-900">SAVE15</p>
        <p className="mt-1 text-sm text-green-700">Enter it at checkout on your first direct website order.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-xl p-4 space-y-2">
      <p className="font-semibold">Get 15% Off Your First Order</p>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="flex-1 border px-3 py-2 rounded"
        />
        <button onClick={handleSubmit} className="bg-green-600 text-white px-4 rounded">
          Get Code
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
