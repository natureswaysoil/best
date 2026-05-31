import Head from 'next/head';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import Layout from '../components/Layout';
import DirectCheckoutButton from '../components/DirectCheckoutButton';
import { getProductById } from '../data/products';

export default function DogUrineNeutralizerPage() {
  const product = getProductById('NWS_014');
  const lawnClusterProduct = getProductById('NWS_023');
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0]);

  const checkoutProduct = useMemo(() => {
    if (!product || !selectedSize) return null;
    return {
      productId: product.id,
      productName: product.name,
      sizeName: selectedSize.name,
      quantity: 1,
      price: selectedSize.price,
      sku: selectedSize.sku,
    };
  }, [product, selectedSize]);

  const lawnCheckoutProduct = lawnClusterProduct?.sizes?.[0]
    ? {
        productId: lawnClusterProduct.id,
        productName: lawnClusterProduct.name,
        sizeName: lawnClusterProduct.sizes[0].name,
        quantity: 1,
        price: lawnClusterProduct.sizes[0].price,
        sku: lawnClusterProduct.sizes[0].sku,
      }
    : null;

  if (!product || !selectedSize || !checkoutProduct) return null;

  return (
    <Layout>
      <Head>
        <title>Dog Urine Neutralizer | Nature&apos;s Way Soil</title>
        <meta
          name="description"
          content="Dog Urine Neutralizer & Lawn Revitalizer helps repair yellow spots at the soil level. Secure direct checkout with Stripe and Link."
        />
        <link rel="canonical" href="https://natureswaysoil.com/dog-urine-neutralizer" />
      </Head>

      <main className="bg-stone-50 text-gray-900">
        <section className="bg-gradient-to-br from-nature-green-900 via-nature-green-800 to-green-700 py-16 text-white">
          <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="font-bold uppercase tracking-wide text-green-100">Pet Lawn Recovery</p>
              <h1 className="text-4xl md:text-5xl font-black mt-2 mb-4">Dog Urine Neutralizer & Lawn Revitalizer</h1>
              <p className="text-lg text-green-50 mb-6">Targets urine-stressed zones with enzymes plus humic support to help your lawn recover naturally without temporary dye coverups.</p>
              <div className="grid sm:grid-cols-2 gap-3 mb-6">
                {product.sizes?.map((size) => (
                  <button
                    key={size.name}
                    onClick={() => setSelectedSize(size)}
                    className={`rounded-xl border px-4 py-3 text-left ${selectedSize.name === size.name ? 'border-white bg-white/20' : 'border-white/30 bg-black/10'}`}
                  >
                    <p className="font-bold">{size.name}</p>
                    <p>${size.price.toFixed(2)}</p>
                  </button>
                ))}
              </div>
              <DirectCheckoutButton product={checkoutProduct}>Buy {selectedSize.name} with Stripe + Link</DirectCheckoutButton>
            </div>
            <img src="https://m.media-amazon.com/images/I/713iTO1P5OL._AC_SL1500_.jpg" alt={product.name} className="w-full rounded-2xl shadow-xl bg-white" />
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-14 grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-2xl font-black mb-4">Product Highlights</h2>
            <ul className="space-y-3">
              {product.features.map((feature) => (
                <li key={feature} className="flex gap-2"><span className="text-nature-green-700">•</span><span>{feature}</span></li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-2xl border p-6">
            <h3 className="text-xl font-bold mb-3">How to Use</h3>
            <ul className="space-y-3 text-gray-700">
              {product.usage?.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          </div>
        </section>

        {lawnCheckoutProduct && (
          <section className="max-w-6xl mx-auto px-4 pb-14">
            <div className="rounded-2xl border bg-white p-6 md:p-8">
              <h3 className="text-2xl font-black">Lawn Care Cluster Add-On</h3>
              <p className="text-gray-700 mt-2 mb-4">Need full-yard nutrition too? Pair this with our Liquid Lawn Fertilizer for ongoing lawn recovery beyond pet spots.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <DirectCheckoutButton product={lawnCheckoutProduct} secondary>
                  Add Liquid Lawn Fertilizer
                </DirectCheckoutButton>
                <Link href="/shop" className="inline-flex items-center justify-center rounded-xl border-2 border-nature-green-700 px-6 py-4 font-extrabold text-nature-green-700">View all lawn products</Link>
              </div>
            </div>
          </section>
        )}
      </main>
    </Layout>
  );
}
