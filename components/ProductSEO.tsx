import SEO from './SEO';

const SITE_URL = 'https://www.natureswaysoil.com';

type ProductSEOInput = {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  image: string;
  images?: string[];
  inStock: boolean;
  sizes?: Array<{ name: string; price: number; sku?: string }>;
};

const absoluteUrl = (src: string) => (src.startsWith('http') ? src : `${SITE_URL}${src.startsWith('/') ? '' : '/'}${src}`);

function metaDescription(text: string) {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= 158) return clean;
  return `${clean.slice(0, 155).replace(/\s+\S*$/, '')}…`;
}

function pageTitle(name: string) {
  // Amazon-style names are very long; keep the part before the first dash for the <title>.
  const short = name.split(/\s[–—-]\s/)[0].trim();
  return /^nature'?s way soil/i.test(short) ? short : `${short} | Nature's Way Soil`;
}

/**
 * Canonical URL, Open Graph tags and Product structured data for a product page.
 * `path` is the canonical path, e.g. `/product/NWS_014`.
 */
export default function ProductSEO({ product, path }: { product: ProductSEOInput; path: string }) {
  const prices = (product.sizes?.length ? product.sizes : [{ name: 'Standard', price: product.price }]).map((s) => s.price);
  const images = [...new Set([product.image, ...(product.images || [])].filter(Boolean))]
    .map((src) => src.split('?')[0])
    .filter((src) => !src.endsWith('.svg'))
    .map(absoluteUrl);
  const url = `${SITE_URL}${path}`;

  return (
    <SEO
      title={pageTitle(product.name)}
      description={metaDescription(product.description)}
      url={url}
      type="product"
      {...(images[0] && { image: images[0] })}
      productData={{
        name: product.name,
        sku: product.sizes?.[0]?.sku || product.id,
        category: product.category,
        images,
        price: Math.min(...prices),
        lowPrice: Math.min(...prices),
        highPrice: Math.max(...prices),
        offerCount: prices.length,
        availability: product.inStock ? 'InStock' : 'OutOfStock',
      }}
    />
  );
}
