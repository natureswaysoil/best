import Head from 'next/head';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
  productData?: {
    price?: number;
    availability?: 'InStock' | 'OutOfStock';
    brand?: string;
    sku?: string;
  };
}

export default function SEO({
  title = 'Nature\'s Way Soil - Premium Organic Fertilizer & Soil Amendments | Pet & Kid Safe',
  description = 'Premium organic liquid fertilizers, activated biochar, and living compost. Made fresh weekly on our family farm. Safe for kids, pets & pollinators. Free shipping on orders $50+.',
  image = '/images/og-image.jpg',
  url = 'https://natureswaysoil.com',
  type = 'website',
  productData
}: SEOProps) {
  const siteName = 'Nature\'s Way Soil';

  // Enhanced structured data
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    url: url,
    logo: `${url}/logo.png`,
    description: 'Premium organic soil amendments and fertilizers made fresh weekly on our family farm',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'US'
    },
    sameAs: [
      'https://www.instagram.com/natureswaysoil',
      'https://twitter.com/natureswaysoil',
      'https://www.youtube.com/@natureswaysoil',
      'https://www.pinterest.com/natureswaysoil'
    ]
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: url,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${url}/shop?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };

  const productSchema = productData ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: title,
    description: description,
    image: image,
    brand: {
      '@type': 'Brand',
      name: productData.brand || siteName
    },
    sku: productData.sku,
    offers: {
      '@type': 'Offer',
      price: productData.price,
      priceCurrency: 'USD',
      availability: `https://schema.org/${productData.availability || 'InStock'}`,
      seller: {
        '@type': 'Organization',
        name: siteName
      }
    }
  } : null;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content="organic fertilizer, liquid fertilizer, biochar, living compost, pet safe fertilizer, organic gardening, soil amendment, worm castings, microbes, natural fertilizer" />
      <meta name="author" content="Nature's Way Soil" />
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <link rel="canonical" href={url} />

      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={url} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@natureswaysoil" />
      <meta name="twitter:creator" content="@natureswaysoil" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Additional SEO Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#16a34a" />
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema)
        }}
      />
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(productSchema)
          }}
        />
      )}
    </Head>
  );
}