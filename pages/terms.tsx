import Head from 'next/head';
import Layout from '../components/Layout';

export default function Terms() {
  return (
    <>
      <Head>
        <title>Terms of Service - Nature's Way Soil</title>
        <meta name="description" content="Terms of service for Nature's Way Soil website and products." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Effective Date:</strong> October 17, 2025
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Acceptance of Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                By accessing and using Nature's Way Soil website and services, you accept and agree 
                to be bound by the terms and provision of this agreement. If you do not agree to 
                abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Product Information</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We strive to provide accurate product descriptions, images, and pricing. However:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Product colors may vary due to monitor settings</li>
                <li>We reserve the right to correct pricing errors</li>
                <li>Product availability is subject to change</li>
                <li>All products are intended for agricultural and gardening use only</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Orders and Payment</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                By placing an order, you agree to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Provide accurate billing and shipping information</li>
                <li>Pay all charges at the prices in effect when charges are incurred</li>
                <li>Pay applicable taxes and shipping charges</li>
                <li>Accept that we may cancel or refuse orders at our discretion</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Shipping and Delivery</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Shipping terms:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Free shipping on orders over $50 to the contiguous United States</li>
                <li>Delivery times are estimates and not guaranteed</li>
                <li>Risk of loss transfers to you upon delivery to the carrier</li>
                <li>You are responsible for providing accurate shipping addresses</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Returns and Refunds</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Our return policy:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>30-day return policy for unused products in original packaging</li>
                <li>Customer responsible for return shipping costs unless product is defective</li>
                <li>Refunds processed within 5-7 business days of receiving returned items</li>
                <li>Some products may not be eligible for return due to their natural nature</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Product Use and Safety</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Important safety information:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Use products only as directed on product labels</li>
                <li>Keep products away from children and pets during application</li>
                <li>Follow all application rates and safety instructions</li>
                <li>We are not responsible for misuse or over-application of products</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
              <p className="text-gray-600 leading-relaxed">
                Nature's Way Soil shall not be liable for any indirect, incidental, special, 
                consequential, or punitive damages, including without limitation, loss of profits, 
                data, use, goodwill, or other intangible losses, resulting from your use of our 
                products or services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Intellectual Property</h2>
              <p className="text-gray-600 leading-relaxed">
                All content on this website, including text, graphics, logos, images, and software, 
                is the property of Nature's Way Soil and is protected by copyright and trademark laws. 
                You may not reproduce, distribute, or create derivative works without our written consent.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibent text-gray-900 mb-4">Governing Law</h2>
              <p className="text-gray-600 leading-relaxed">
                These terms shall be governed by and construed in accordance with the laws of the 
                State of California, without regard to its conflict of law provisions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <p className="text-gray-600 leading-relaxed">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">
                  <strong>Nature's Way Soil</strong><br />
                  Email: hello@naturesway.com<br />
                  Phone: (555) 123-4567<br />
                  Address: 123 Farm Road, Green Valley, CA 95945
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                We reserve the right to modify these terms at any time. Changes will be effective 
                immediately upon posting to this page. Your continued use of our services after 
                changes are posted constitutes acceptance of the modified terms.
              </p>
            </section>
          </div>
        </div>
      </Layout>
    </>
  );
}