import Head from 'next/head';
import Layout from '../components/Layout';

export default function Returns() {
  return (
    <>
      <Head>
        <title>Returns & Refunds - Nature's Way Soil</title>
        <meta name="description" content="Return and refund policy for Nature's Way Soil products. Learn how to request a return or exchange." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Returns & Refunds</h1>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Effective Date:</strong> October 17, 2025
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Return Policy</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We stand behind the quality of every product we ship from our farm. If you are not satisfied
                with your purchase for any reason, you may request a return or exchange within
                <strong> 30 days</strong> of the delivery date.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Items must be in their original, unopened packaging to be eligible for a full refund.
                Opened products may be eligible for a partial refund or store credit at our discretion,
                particularly if there is a product quality concern.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">How to Start a Return</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                To initiate a return, please contact us within 30 days of delivery:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Email <a href="mailto:support@natureswaysoil.com" className="text-green-700 underline">support@natureswaysoil.com</a> with your order number and reason for return</li>
                <li>Or call us at <a href="tel:+12525607390" className="text-green-700 underline">(252) 560-7390</a> during business hours</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                We will respond within one business day with return instructions and a return shipping address.
                Please do not ship items back without contacting us first.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Refund Processing</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Once we receive and inspect your returned item, we will notify you of the approval or status
                of your refund. Approved refunds are processed to the original payment method within
                <strong> 5–7 business days</strong>.
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Original shipping charges are non-refundable unless the return is due to our error</li>
                <li>Return shipping costs are the responsibility of the customer unless the item arrived damaged or incorrect</li>
                <li>Bulk and pallet orders: please contact us directly to discuss return arrangements</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Damaged or Incorrect Items</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                If you received a damaged, defective, or incorrect item, please contact us within
                <strong> 5 business days</strong> of delivery. We will arrange a replacement or full refund
                at no cost to you, including return shipping.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Photos of the damaged item and packaging are helpful and may be requested to assist with
                carrier claims.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Non-Returnable Items</h2>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Custom blend orders formulated to your specifications</li>
                <li>Items marked as final sale</li>
                <li>Products returned more than 30 days after delivery</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Government & Institutional Orders</h2>
              <p className="text-gray-600 leading-relaxed">
                For returns or issues with government purchase orders or institutional contracts,
                please contact our government sales team directly at{' '}
                <a href="mailto:government@natureswaysoil.com" className="text-green-700 underline">government@natureswaysoil.com</a>.
                We will work with your procurement office to resolve any issues promptly.
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
