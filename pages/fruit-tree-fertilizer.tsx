import Head from 'next/head';
import { useMemo, useState } from 'react';
import Layout from '../components/Layout';
import DirectCheckoutButton from '../components/DirectCheckoutButton';
import { getProductById } from '../data/products';

export default function FruitTreeFertilizerPage() {
  const product = getProductById('NWS_022');
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

  if (!product || !selectedSize || !checkoutProduct) return null;

  return (
    <Layout>
      <Head>
        <title>Fruit Tree Fertilizer | Nature&apos;s Way Soil</title>
        <meta
          name="description"
          content="Fruit Tree Fertilizer liquid concentrate for orchard vigor, bloom support, and fruit set. Buy direct with Stripe + Link."
        />
        <link rel="canonical" href="https://natureswaysoil.com/fruit-tree-fertilizer" />
      </Head>

      <main className="bg-stone-50 text-gray-900">
        <section className="bg-gradient-to-br from-nature-green-900 via-nature-green-800 to-green-700 py-16 text-white">
          <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="font-bold uppercase tracking-wide text-green-100">Orchard Nutrition</p>
              <h1 className="text-4xl md:text-5xl font-black mt-2 mb-4">Fruit Tree Fertilizer - Liquid Concentrate</h1>
              <p className="text-lg text-green-50 mb-6">Supports apple, peach, pear, citrus, banana, and more with a concentrated feed program for stronger roots, better bloom support, and seasonal vigor.</p>
              <div className="grid sm:grid-cols-1 gap-3 mb-6 max-w-xs">
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
              <DirectCheckoutButton product={checkoutProduct}>Buy with Stripe + Link</DirectCheckoutButton>
            </div>
            <img src="https://m.media-amazon.com/images/I/61roJuVvQ7L._SL1500_.jpg" alt={product.name} className="w-full rounded-2xl shadow-xl bg-white" />
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-14 grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-2xl font-black mb-4">Why Growers Use It</h2>
            <ul className="space-y-3">
              {product.features.map((feature) => (
                <li key={feature} className="flex gap-2"><span className="text-nature-green-700">•</span><span>{feature}</span></li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-2xl border p-6">
            <h3 className="text-xl font-bold mb-3">How to Feed Fruit Trees</h3>
            <ul className="space-y-3 text-gray-700">
              {product.usage?.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </Layout>
  );
}
