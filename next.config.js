/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'localhost' },
      { protocol: 'https', hostname: 'm.media-amazon.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'd3uryq9bhgb5qr.cloudfront.net' },
      { protocol: 'https', hostname: 'cdn.abacus.ai' },
    ],
    formats: ['image/webp', 'image/avif']
  },
  async headers() {
    return [
      {
        source: '/videos/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
        ]
      }
    ]
  },
  async redirects() {
    return [
      // Old product slugs
      { source: '/products/nws-128-tom', destination: '/shop', permanent: true },
      { source: '/products/nws-128-worm', destination: '/shop', permanent: true },
      { source: '/products/nws-32-root', destination: '/shop', permanent: true },
      { source: '/products/nws-128-kelp', destination: '/shop', permanent: true },
      { source: '/products/liquid-bone', destination: '/shop', permanent: true },
      { source: '/products/nws-cf2-prem', destination: '/shop', permanent: true },
      { source: '/products/nws-128-org', destination: '/shop', permanent: true },
      { source: '/products/nws-garden-house-1gal', destination: '/shop', permanent: true },
      { source: '/products/nws-liq-bone-1gal', destination: '/shop', permanent: true },
      { source: '/products/nws-hay-pasture-25gal', destination: '/shop', permanent: true },
      { source: '/products/nws-humic-fulvic-kelp-25gal', destination: '/shop', permanent: true },
      { source: '/products/nws-dog-urine-32oz', destination: '/shop', permanent: true },
      { source: '/products/nws-living-compost', destination: '/shop', permanent: true },
      { source: '/products/nws-128-tea', destination: '/shop', permanent: true },
      { source: '/products/nws-seaweed-humic-32oz', destination: '/shop', permanent: true },
      { source: '/products/nws-256-lawn', destination: '/shop', permanent: true },
      { source: '/products/nws-tomato-1gal', destination: '/shop', permanent: true },
      { source: '/products/nws-hydro-32oz', destination: '/shop', permanent: true },
      { source: '/products/nws-16-ph', destination: '/shop', permanent: true },
      { source: '/products/nws-kit-strt', destination: '/shop', permanent: true },
      { source: '/products/hay-pasture-1gal', destination: '/shop', permanent: true },
      { source: '/products/sku', destination: '/shop', permanent: true },
      { source: '/products/nws-liq-kelp-32oz', destination: '/shop', permanent: true },
      
      // Named products
      { source: '/products/organic-tomato-fertilizer', destination: '/shop', permanent: true },
      { source: '/products/humic-fulvic', destination: '/shop', permanent: true },
      { source: '/products/organic-hydroponic', destination: '/shop', permanent: true },
      { source: '/products/liquid-kelp', destination: '/shop', permanent: true },
      { source: '/products/living-compost', destination: '/shop', permanent: true },
      { source: '/products/hay-fertilizer', destination: '/shop', permanent: true },
      { source: '/products/liquid-biochar', destination: '/shop', permanent: true },
      { source: '/products/dog-urine-neutralizer', destination: '/shop', permanent: true },
      { source: '/products/liquid-kelp-32oz', destination: '/shop', permanent: true },
      { source: '/products/liquid-bone-meal-32oz', destination: '/shop', permanent: true },
      { source: '/products/liquid-bone-meal', destination: '/shop', permanent: true },
      { source: '/products/nature-s-way-soil-liquid-bone-meal-fertilizer-organic-phosphorus-calcium-for-healthy-roots-flowers-fruits-fast-absorbing-liquid-plant-food-for-vegetables-flowers-trees-and-shrubs-1-gallon', destination: '/shop', permanent: true },
      
      // Numbered products
      { source: '/products/1', destination: '/shop', permanent: true },
      { source: '/products/2', destination: '/shop', permanent: true },
      { source: '/products/3', destination: '/shop', permanent: true },
      { source: '/products/4', destination: '/shop', permanent: true },
      { source: '/products/5', destination: '/shop', permanent: true },
      { source: '/products/6', destination: '/shop', permanent: true },
      { source: '/products/7', destination: '/shop', permanent: true },
      { source: '/products/8', destination: '/shop', permanent: true },
      { source: '/products/9', destination: '/shop', permanent: true },
      
      // Base products URL
      { source: '/products', destination: '/shop', permanent: true },
      
      // Policy pages
      { source: '/policies/privacy', destination: '/privacy', permanent: true },
      { source: '/privacy-policy', destination: '/privacy', permanent: true },
      { source: '/refund-policy', destination: '/returns', permanent: true },

      // Government page legacy typo
      { source: '/governement', destination: '/government', permanent: true },
    ];
  },
}

module.exports = nextConfig
