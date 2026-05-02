import { useState } from 'react';

export default function EmailCapture({ productId }: { productId?: string }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!email.includes('@')) return;

    await fetch('/api/lead-capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, productId }),
    });

    setSubmitted(true);
  };

  if (submitted) {
    return <p className="text-green-600">Thanks! Your discount is ready at checkout.</p>;
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
    </div>
  );
}
