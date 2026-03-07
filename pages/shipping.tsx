import Head from 'next/head';
import Layout from '../components/Layout';

export default function Shipping() {
  return (
    <>
      <Head>
        <title>Shipping Policy - Nature's Way Soil</title>
        <meta name="description" content="Shipping information for Nature's Way Soil orders including delivery times, rates, and bulk order freight details." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Shipping Policy</h1>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Effective Date:</strong> October 17, 2025
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Processing Time</h2>
              <p className="text-gray-600 leading-relaxed">
                Orders are typically processed and shipped within <strong>1–3 business days</strong> of
                payment confirmation. Orders placed on weekends or holidays will begin processing the
                next business day. You will receive a shipping confirmation email with tracking
                information once your order has shipped.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Standard Orders</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Shipping rates are calculated at checkout based on the weight of your order and your
                delivery address. We ship to all 48 contiguous United States.
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Standard ground shipping: estimated 3–7 business days after processing</li>
                <li>Expedited options available at checkout where applicable</li>
                <li>We do not currently ship to Alaska, Hawaii, or US territories</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Bulk & Pallet Orders — FOB Origin, Freight Collect</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                All bulk and pallet-quantity orders ship <strong>FOB Origin, Freight Collect</strong>.
                Title and risk of loss transfer to the buyer at our facility in Snow Hill, NC at the
                time of carrier pickup. The buyer is responsible for arranging freight and all
                associated shipping charges.
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Buyer may designate their preferred freight carrier</li>
                <li>We will coordinate with your carrier for scheduling and loading</li>
                <li>Liftgate, inside delivery, and appointment services are the buyer's responsibility to arrange with their carrier</li>
                <li>Government agencies and institutional buyers may use their own contract carriers</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                To arrange a bulk or pallet order, contact us at{' '}
                <a href="mailto:sales@natureswaysoil.com" className="text-green-700 underline">sales@natureswaysoil.com</a>{' '}
                or call <a href="tel:+12525607390" className="text-green-700 underline">(252) 560-7390</a>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Order Tracking</h2>
              <p className="text-gray-600 leading-relaxed">
                Once your order ships, you will receive a confirmation email with your tracking number.
                If you have not received tracking information within 4 business days of placing your
                order, please contact us at{' '}
                <a href="mailto:support@natureswaysoil.com" className="text-green-700 underline">support@natureswaysoil.com</a>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Damaged or Lost Shipments</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                If your order arrives damaged, please contact us within <strong>5 business days</strong> of
                delivery. Retain all original packaging and photograph any damage before reaching out —
                this helps us file carrier claims quickly.
              </p>
              <p className="text-gray-600 leading-relaxed">
                For FOB Origin shipments, claims for loss or damage in transit are the responsibility
                of the buyer to file directly with the freight carrier, as title transfers at origin.
                We will provide all necessary documentation to support your claim.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-600 mt-3">
                Email: <a href="mailto:support@natureswaysoil.com" className="text-green-700 underline">support@natureswaysoil.com</a><br />
                Phone: <a href="tel:+12525607390" className="text-green-700 underline">(252) 560-7390</a><br />
                Address: 533 Eden Church Rd., Snow Hill, NC 28580
              </p>
            </section>
          </div>
        </div>
      </Layout>
    </>
  );
}
