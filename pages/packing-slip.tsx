import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type InvoiceOrder = {
  paymentIntentId?: string;
  status?: string;
  paid?: boolean;
  amount?: number;
  subtotal?: number;
  discount?: number;
  shipping?: number;
  tax?: number;
  productName?: string;
  sizeName?: string;
  sku?: string;
  quantity?: number;
};

type ShippingInfo = {
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    phone?: string;
  };
};

const ORDER_KEY = 'nws-last-paid-order';
const SHIPPING_KEY = 'nws-checkout-shipping';

const currency = (value?: number) => `$${Number(value || 0).toFixed(2)}`;

export default function PackingSlipPage() {
  const [order, setOrder] = useState<InvoiceOrder | null>(null);
  const [shipping, setShipping] = useState<ShippingInfo | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const storedOrder = window.sessionStorage.getItem(ORDER_KEY);
      const storedShipping = window.sessionStorage.getItem(SHIPPING_KEY);
      if (storedOrder) setOrder(JSON.parse(storedOrder));
      if (storedShipping) setShipping(JSON.parse(storedShipping));
    } catch (error) {
      console.warn('Unable to load packing slip data', error);
    }
  }, []);

  const today = new Date().toLocaleDateString('en-US');
  const address = shipping?.address;
  const customer = shipping?.customer;

  return (
    <>
      <Head>
        <title>Packing Slip - Nature&apos;s Way Soil</title>
        <meta name="robots" content="noindex" />
      </Head>

      <main className="max-w-4xl mx-auto p-8 text-gray-900 print:p-0 print:max-w-none">
        <div className="print:hidden mb-6 flex gap-3">
          <button onClick={() => window.print()} className="px-4 py-2 bg-green-700 text-white rounded-lg font-semibold">
            Print Packing Slip
          </button>
          <Link href="/shop" className="px-4 py-2 border border-gray-300 rounded-lg font-semibold">
            Back to Shop
          </Link>
        </div>

        <section className="bg-white border border-gray-300 rounded-xl p-8 print:border-0 print:rounded-none">
          <header className="flex justify-between gap-8 border-b border-gray-300 pb-6 mb-6">
            <div>
              <h1 className="text-3xl font-bold">Nature&apos;s Way Soil</h1>
              <p className="text-sm text-gray-600 mt-1">Packing Slip / Ship-By Invoice</p>
              <p className="text-sm text-gray-600">natureswaysoil.com</p>
              <p className="text-sm text-gray-600">support@natureswaysoil.com</p>
            </div>
            <div className="text-right text-sm">
              <p><strong>Date:</strong> {today}</p>
              <p><strong>Order Ref:</strong> {order?.paymentIntentId || 'Not available'}</p>
              <p><strong>Status:</strong> {order?.paid ? 'Paid' : order?.status || 'Pending'}</p>
            </div>
          </header>

          {!order && (
            <div className="border border-yellow-300 bg-yellow-50 text-yellow-900 rounded-lg p-4 mb-6">
              No order data was found in this browser session. Open this page from the thank-you page right after checkout.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-lg font-bold border-b border-gray-200 pb-2 mb-3">Ship To</h2>
              <p className="font-semibold">{customer?.name || 'Customer Name'}</p>
              <p>{address?.line1 || 'Address line 1'}</p>
              {address?.line2 && <p>{address.line2}</p>}
              <p>
                {address?.city || 'City'}, {address?.state || 'State'} {address?.postal_code || 'ZIP'}
              </p>
              <p>{address?.country || 'US'}</p>
              {customer?.phone && <p className="mt-2">Phone: {customer.phone}</p>}
              {customer?.email && <p>Email: {customer.email}</p>}
            </div>

            <div>
              <h2 className="text-lg font-bold border-b border-gray-200 pb-2 mb-3">Seller</h2>
              <p className="font-semibold">Nature&apos;s Way Soil &amp; Vermicompost LLC</p>
              <p>Family Farm Soil Products</p>
              <p>United States</p>
              <p className="mt-2">Pack carefully. Check cap tightness and leakage before shipping.</p>
            </div>
          </div>

          <table className="w-full border-collapse mb-8">
            <thead>
              <tr className="border-b-2 border-gray-900 text-left">
                <th className="py-2 pr-3">Qty</th>
                <th className="py-2 pr-3">SKU</th>
                <th className="py-2 pr-3">Product</th>
                <th className="py-2 pr-3">Size</th>
                <th className="py-2 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="py-3 pr-3">{order?.quantity || 1}</td>
                <td className="py-3 pr-3">{order?.sku || '-'}</td>
                <td className="py-3 pr-3">{order?.productName || 'Nature’s Way Soil Product'}</td>
                <td className="py-3 pr-3">{order?.sizeName || '-'}</td>
                <td className="py-3 text-right">{currency(order?.subtotal)}</td>
              </tr>
            </tbody>
          </table>

          <div className="ml-auto max-w-sm space-y-2 text-sm mb-8">
            <div className="flex justify-between"><span>Subtotal</span><span>{currency(order?.subtotal)}</span></div>
            {(order?.discount || 0) > 0 && <div className="flex justify-between"><span>Discount</span><span>-{currency(order?.discount)}</span></div>}
            <div className="flex justify-between"><span>Shipping</span><span>{currency(order?.shipping)}</span></div>
            <div className="flex justify-between"><span>Tax</span><span>{currency(order?.tax)}</span></div>
            <div className="flex justify-between border-t border-gray-300 pt-2 text-lg font-bold"><span>Total Paid</span><span>{currency(order?.amount)}</span></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm border-t border-gray-300 pt-6">
            <div>
              <h3 className="font-bold mb-2">Packing Checklist</h3>
              <label className="block"><input type="checkbox" /> Correct product and size</label>
              <label className="block"><input type="checkbox" /> Cap tightened</label>
              <label className="block"><input type="checkbox" /> Seal/leak check complete</label>
              <label className="block"><input type="checkbox" /> Label readable</label>
            </div>
            <div>
              <h3 className="font-bold mb-2">Shipping Notes</h3>
              <p>Use approved liquid shipping box/liner when applicable. Add padding to prevent cap damage.</p>
            </div>
            <div>
              <h3 className="font-bold mb-2">Tracking</h3>
              <p>Carrier: ____________________</p>
              <p>Tracking #: _________________</p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
