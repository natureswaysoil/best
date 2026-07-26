import Head from 'next/head';
import ProductDetail from '../../components/ProductDetail';

const product = {
  id: 'NWS_006',
  asin: 'B0F8R45FJ2',
  name: "Nature's Way Soil Liquid Kelp Fertilizer - Cold-Processed Seaweed Plant Food",
  price: 34.99,
  image: '/images/products/NWS_006/main.jpg',
  description: 'Cold-processed liquid kelp concentrate for lawns, gardens, flowers, and vegetables. Supports root development, plant vigor, and recovery from environmental stress.',
  category: 'Fertilizer',
  tags: ['kelp', 'seaweed', 'root-development', 'plant-vigor', 'lawn', 'garden', 'transplant'],
  features: [
    'Provides naturally occurring seaweed compounds and trace minerals',
    'Supports strong root development and plant vigor',
    'Useful during transplant establishment',
    'Cold-processed to preserve kelp compounds',
    'Suitable for lawns, gardens, flowers, and vegetables',
    'Concentrated formula for economical application',
    'Works as a soil drench or foliar spray',
    'Supports recovery from heat, drought, and transplant stress'
  ],
  images: [
    '/images/products/NWS_006/main.jpg',
    '/images/products/NWS_006/thumb.jpg'
  ],
  video: '/videos/NWS_006.mp4',
  videoWebm: '/videos/NWS_006.webm',
  videoPoster: '/videos/NWS_006.jpg',
  inStock: true,
  sizes: [
    { name: '32 oz', price: 29.99, sku: 'XX-XBWB-DF03' },
    { name: '1 Gallon', price: 34.99, sku: '8K-DBU9-JA4K' },
    { name: '2.5 Gallon', price: 64.99, sku: '3L-41WW-8JVG' }
  ],
  usage: [
    'Shake well before each application to redistribute settled kelp solids.',
    'Mix 1-2 ounces with 1 gallon of water for soil drenches or foliar sprays.',
    'Apply weekly during active growth or every two weeks for maintenance feedings.',
    'Use after transplant, drought, or heat stress to support recovery and root growth.'
  ]
};

export default function LiquidKelpFertilizerProductPage() {
  return (
    <>
      <Head>
        <title>{`${product.name} - Nature's Way Soil`}</title>
        <meta name="description" content={product.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <ProductDetail product={product} />
    </>
  );
}
