import Head from 'next/head';
import ProductDetail from '../../components/ProductDetail';

const product = {
  id: 'NWS_FRUIT_TREE_32OZ',
  name: "Nature's Way Soil Fruit Tree Fertilizer with Liquid Biochar – 32 oz Concentrate Makes Up to 64 Gallons – for Apple, Peach, Pear, Citrus & More",
  price: 29.99,
  description: 'A concentrated liquid formula made to feed fruit trees while supporting healthier soil, stronger roots, bloom support, fruit set support, and seasonal tree vigor.',
  features: [
    'Fruit tree fertilizer with liquid biochar for root-zone nutrient retention',
    'Supports blooms, fruit set, root strength, and seasonal orchard recovery',
    'Built for backyard orchards, young trees, mature trees, transplants, and stressed trees',
    'Use on apple, peach, pear, citrus, banana, fig, mango, plum, and similar fruit trees',
    '32 oz concentrate makes up to 64 gallons when diluted as directed',
    'Easy to mix for watering cans, pump sprayers, hose-end systems, soil drenches, and routine orchard feeding',
    'Apply spring through post-harvest during green-up, pre-bloom, fruit set, and summer stress periods',
    'Small-batch Nature’s Way Soil formula for fruit trees, berries, and backyard orchard care'
  ],
  images: ['/images/products/NWS_012/main.jpg', '/images/products/NWS_006/main.jpg'],
  image: '/images/products/NWS_012/main.jpg',
  inStock: true,
  category: 'Fertilizer',
  sizes: [
    { name: '32 oz', price: 29.99, sku: 'NWS-FRUIT-TREE-32OZ' }
  ],
  usage: [
    'Shake well before each use to distribute liquid biochar, humic materials, kelp, and nutrients evenly.',
    'Mix according to label directions and apply around the tree drip line and active feeder-root zone.',
    'Use during spring green-up, pre-bloom, fruit set, summer stress, and post-harvest recovery windows.',
    'Water in after application to help move nutrients and soil-support ingredients into the root zone.'
  ]
};

export default function FruitTreeFertilizerProductPage() {
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
