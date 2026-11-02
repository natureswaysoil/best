import { GetStaticProps, GetStaticPaths } from 'next';
import fs from 'fs';
import path from 'path';
import ProductSEO from '../../components/ProductSEO';
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
  videoWebm?: string;
  videoPoster?: string;
  inStock: boolean;
  category: string;
  sizes?: Array<{ name: string; price: number; sku?: string }>;
  usage?: string[];
}

interface ProductPageProps {
  product: Product;
}

const productImageOverrides: Record<string, { image: string; images: string[] }> = {
  NWS_022: {
    image: '/images/products/NWS_024/lawn-recovery-25gal-box.svg',
    images: [
      '/images/products/NWS_024/lawn-recovery-25gal-box.svg',
      '/images/products/NWS_024/main.svg',
      '/images/products/NWS_024/lawn-recovery-32oz.svg',
    ],
  },
};

export default function ProductPage({ product }: ProductPageProps) {
  return (
    <>
      <ProductSEO product={product} path={`/product/${encodeURIComponent(product.id)}`} />
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

  const productData = getProductById(productId);

  // Unknown IDs must return a real 404 instead of a generic placeholder page,
  // otherwise search engines index endless thin "Product XYZ" URLs.
  if (!productData) {
    return { notFound: true, revalidate: 3600 };
  }

  const imageOverride = productImageOverrides[productData.id];

  // Convert to Product format for ProductDetail component
  // Only include optional fields if they have actual values (not undefined)
  // Prefer a locally generated video in public/videos/{id}.mp4 if present
  const localVideoPath = `/videos/${productId}.mp4`;
  const localVideoAbs = path.join(process.cwd(), 'public', 'videos', `${productId}.mp4`);
  const localWebmPath = `/videos/${productId}.webm`;
  const localWebmAbs = path.join(process.cwd(), 'public', 'videos', `${productId}.webm`);
  const hasLocalVideo = fs.existsSync(localVideoAbs);
  const hasLocalWebm = fs.existsSync(localWebmAbs);
  const localPosterPath = `/videos/${productId}.jpg`;
  const localPosterAbs = path.join(process.cwd(), 'public', 'videos', `${productId}.jpg`);
  const hasLocalPoster = fs.existsSync(localPosterAbs);

  const product: Product = {
    id: productData.id,
    name: productData.name,
    price: productData.price,
    ...(productData.originalPrice !== undefined && { originalPrice: productData.originalPrice }),
    description: productData.description,
    features: productData.features,
    images: imageOverride?.images ?? productData.images,
    image: imageOverride?.image ?? productData.image,
    // Prefer configured catalog media so website videos can be versioned independently of social assets.
    ...((productData.video && { video: productData.video }) || (hasLocalVideo && { video: localVideoPath })),
    // Only fall back to a local .webm when no catalog video is configured, so an updated video isn't paired with an old one.
    ...(!productData.video && hasLocalWebm && { videoWebm: localWebmPath }),
    ...((productData.videoPoster && { videoPoster: productData.videoPoster }) || (hasLocalPoster && { videoPoster: localPosterPath })),
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