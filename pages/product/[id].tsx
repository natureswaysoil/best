import { GetStaticProps, GetStaticPaths } from 'next';
import Head from 'next/head';
import ProductDetail from '../../components/ProductDetail';
import { getProductById, getAllProductIds } from '../../data/products';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  features: string[];
  images: string[];
  image: string;
  video?: string;
  inStock: boolean;
  category: string;
  sizes?: Array<{ name: string; price: number; sku?: string }>;
  usage?: string[];
}

interface ProductPageProps {
  product: Product;
}

export default function ProductPage({ product }: ProductPageProps) {
  return (
    <>
      <Head>
        <title>{product.name} - Nature's Way Soil</title>
        <meta name="description" content={product.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <ProductDetail product={product} />
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const productIds = getAllProductIds();
  
  const paths = productIds.map((id) => ({
    params: { id },
  }));

  return {
    paths,
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps<ProductPageProps> = async ({ params }) => {
  const productId = params?.id as string;
  
  let productData = getProductById(productId);

  // If product not found in detailed data, create basic product data
  if (!productData) {
    productData = {
      id: productId,
      name: `Nature's Way Soil Product ${productId}`,
      price: 29.99,
      image: 'https://images.unsplash.com/photo-1515165562835-c4c24b872fb4?auto=format&fit=crop&w=900&q=80',
      description: 'Premium natural soil amendment with beneficial microbes, worm castings, and biochar. Part of our living soil product line.',
      category: 'Soil Amendment',
      tags: ['natural', 'microbes', 'living-soil'],
      features: [
        'Contains billions of beneficial living microbes',
        'Made with natural, safe ingredients',
        'Enhances soil structure and water retention',
        'Improves plant health and yields',
        'Safe for children, pets, and pollinators',
        'Made fresh on our family farm',
        'Easy to use and apply',
        'Suitable for all garden types'
      ],
      images: ['https://images.unsplash.com/photo-1515165562835-c4c24b872fb4?auto=format&fit=crop&w=900&q=80'],
      inStock: true
    };
  }

  // Convert to Product format for ProductDetail component
  // Only include optional fields if they have actual values (not undefined)
  const product: Product = {
    id: productData.id,
    name: productData.name,
    price: productData.price,
    ...(productData.originalPrice !== undefined && { originalPrice: productData.originalPrice }),
    description: productData.description,
    features: productData.features,
  images: productData.images,
  image: productData.image,
    ...(productData.video && { video: productData.video }),
    inStock: productData.inStock,
    category: productData.category,
    ...(productData.sizes && productData.sizes.length > 0 && { sizes: productData.sizes }),
    ...(productData.usage && productData.usage.length > 0 && { usage: productData.usage })
  };

  return {
    props: {
      product,
    },
    revalidate: 3600,
  };
};