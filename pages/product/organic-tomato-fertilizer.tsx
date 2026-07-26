import Head from 'next/head';
import ProductDetail from '../../components/ProductDetail';

const product = {
  id: 'NWS_003',
  asin: 'B0D6886G54',
  name: "Nature's Way Soil Organic Tomato Liquid Fertilizer",
  price: 29.99,
  image: '/images/products/NWS_003/main.jpg',
  description: 'Made-fresh-weekly tomato fertilizer with Vitamin B-1 and aloe vera to support root establishment, healthy transplants, flowering, and fruit development.',
  category: 'Fertilizer',
  tags: ['tomato', 'b1-vitamin', 'aloe-vera', 'vegetables', 'root-development', 'fruit-development'],
  features: [
    'Balanced nutrition for tomatoes and other fruiting vegetables',
    'Vitamin B-1 to support root establishment',
    'Aloe vera to support healthy transplants',
    'Supports consistent calcium uptake when used with proper watering',
    'Made fresh weekly with live microbes',
    'Easily absorbed essential nutrients',
    'Designed for tomato-growing programs',
    'Works on all fruiting vegetables'
  ],
  images: [
    '/images/products/NWS_003/main.jpg',
    '/images/products/NWS_003/thumb.jpg'
  ],
  inStock: true,
  video: '/videos/NWS_003.mp4',
  videoWebm: '/videos/NWS_003.webm',
  videoPoster: '/videos/NWS_003.jpg',
  sizes: [
    { name: 'Quart', price: 29.99, sku: 'P5-NP0G-5SL7' }
  ],
  usage: [
    'Shake well before mixing to distribute nutrients evenly.',
    'Dilute 2 ounces in 1 gallon of water and drench around tomato roots at planting.',
    'Apply every 10 days during flowering and fruit set; foliar spray at 1 ounce per gallon.',
    'Maintain even soil moisture during fruit development and rinse sprayers after use.'
  ]
};

export default function OrganicTomatoFertilizerProductPage() {
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
