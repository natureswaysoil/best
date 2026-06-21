import Head from 'next/head';
import ProductDetail from '../../components/ProductDetail';

const product = {
  id: 'NWS_LIQUID_BIOCHAR_1GAL',
  name: "Nature's Way Soil Liquid Biochar Soil Conditioner – 1 Gallon, 5-Micron Biochar with Humic, Fulvic & Kelp",
  price: 89.99,
  description: 'A premium soil-building blend made with activated liquid biochar, humic acid, fulvic acid, and kelp to support healthier soil, stronger roots, nutrient retention, and moisture-holding goals.',
  features: [
    'Liquid biochar soil conditioner made with activated 5-micron biochar',
    'Helps retain water and nutrients in sandy, depleted, or stressed soils',
    'Supports root and plant vigor with humic acid, fulvic acid, and kelp',
    'Feeds beneficial soil life with soil-support ingredients including molasses and aloe',
    'Easy liquid concentrate for gardens, lawns, raised beds, trees, containers, and greenhouses',
    'Use as a soil drench, compost tea booster, transplant solution, or lawn and garden conditioner',
    'Mix 2-4 ounces per gallon of water for routine application',
    'Small-batch Nature’s Way Soil formula made for long-term soil improvement programs'
  ],
  images: ['/images/products/NWS_002/main.jpg', '/images/products/NWS_011/main.jpg'],
  image: '/images/products/NWS_002/main.jpg',
  inStock: true,
  category: 'Soil Amendment',
  sizes: [
    { name: '1 Gallon', price: 89.99, sku: 'NWS-LIQ-BIOCHAR-1GAL' }
  ],
  usage: [
    'Shake well before use to distribute biochar, humic, fulvic, and kelp materials evenly.',
    'Mix 2-4 ounces per gallon of water for soil drench, transplant solution, or lawn and garden applications.',
    'Apply around roots, raised beds, containers, trees, lawn areas, or stressed soil zones.',
    'Water in after application when possible to move the product into the root zone.'
  ]
};

export default function LiquidBiocharSoilConditionerProductPage() {
  return (
    <>
      <Head>
        <title>{product.name} - Nature&apos;s Way Soil</title>
        <meta name="description" content={product.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <ProductDetail product={product} />
    </>
  );
}
