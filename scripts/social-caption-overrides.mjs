export function buildForcedSocialContent({ product, platform, baseUrl }) {
  const hook = process.env.SOCIAL_VARIATION_HOOK || '';
  const caption = process.env.SOCIAL_VARIATION_CAPTION || '';
  const angle = process.env.SOCIAL_VARIATION_ANGLE || '';
  const funnelUrl = process.env.PRODUCT_FUNNEL_URL || `/product/${product.id}`;
  const checkoutUrl = process.env.PRODUCT_CHECKOUT_URL || `/checkout?productId=${product.id}&coupon=SAVE15`;
  const fullFunnelUrl = `${baseUrl}${funnelUrl}`;
  const fullCheckoutUrl = `${baseUrl}${checkoutUrl}`;

  if (!hook && !caption) return null;

  const hashtags = '#NaturesWaySoil #LawnCare #SoilHealth #OrganicGardening #GardenTips';
  const shortText = `${hook}\n\n${caption}\n\nShop direct and save 15% on your first order: ${fullFunnelUrl}`;

  return {
    instagram: {
      caption: `${hook}\n\n${caption}\n\nShop direct and save 15% on your first order:\n${fullFunnelUrl}\n\n${hashtags}`,
      alt_text: `${product.name} video: ${hook}`
    },
    twitter: {
      text: shortText.length > 270 ? `${hook}\n\nShop direct and save 15%: ${fullFunnelUrl}` : shortText,
      alt_text: `${product.name} video: ${hook}`
    },
    youtube: {
      title: hook.length > 95 ? `${hook.slice(0, 92)}...` : hook,
      description: `${hook}\n\n${caption}\n\nShop direct and save 15% on your first order:\n${fullFunnelUrl}\n\nQuick checkout:\n${fullCheckoutUrl}\n\nAngle: ${angle}\n\n${hashtags}`,
      tags: ['lawn care', 'soil health', 'organic gardening', 'Nature’s Way Soil', angle].filter(Boolean),
      category_id: '26'
    },
    facebook: {
      message: `${hook}\n\n${caption}\n\nShop direct and save 15% on your first order:\n${fullFunnelUrl}\n\n${hashtags}`,
      link: fullFunnelUrl
    },
    pinterest: {
      title: hook.length > 95 ? `${hook.slice(0, 92)}...` : hook,
      description: `${caption}\n\nShop direct and save 15% on your first order: ${fullFunnelUrl}\n\n${hashtags}`,
      link: fullFunnelUrl,
      alt_text: `${product.name} video: ${hook}`
    }
  }[platform];
}
