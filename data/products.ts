// Shared product data for Nature's Way Soil
export interface ProductData {
  id: string;
  asin?: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  description: string;
  category: string;
  tags: string[];
  features: string[];
  images: string[];
  video?: string;
  videoWebm?: string;
  videoPoster?: string;
  inStock: boolean;
  sizes?: Array<{
    name: string;
    price: number;
    sku: string;
  }>;
  usage?: string[];
}

export const allProducts: ProductData[] = [
  {
    id: 'NWS_001',
    asin: 'B0822RH5L3',
    name: 'Natural Liquid Fertilizer for Garden and House Plants',
    price: 20.99,
    image: '/images/products/NWS_001/main.jpg',
    description: '100% Natural USDA Certified Biobased Product with B-1 Vitamin and Aloe Vera Juice to improve transplants. Made fresh weekly for maximum potency.',
    category: 'Fertilizer',
    tags: ['natural', 'liquid', 'b1-vitamin', 'aloe-vera', 'house-plants', 'garden', 'microbes'],
    features: [
      'Contains billions of beneficial living microbes',
      '100% Natural and USDA Certified Biobased',
      'B-1 Vitamin for enhanced root development',
      'Aloe Vera Juice improves transplant success',
      'Made fresh weekly for optimal microbial activity',
      'Fast absorption for quick results',
      'Safe for children, pets, and pollinators',
      'Easy application - just mix with water'
    ],
    images: [
      '/images/products/NWS_001/main.jpg',
      '/images/products/NWS_001/thumb.jpg'
    ],
  video: '/videos/NWS_001.mp4',
  videoWebm: '/videos/NWS_001.webm',
  videoPoster: '/videos/NWS_001.jpg',
    inStock: true,
    sizes: [
      { name: '32 oz', price: 20.99, sku: '3L-3MPJ-6BQM' }
    ],
    usage: [
      'Shake well before each use to activate the living microbes.',
      'Mix 2 ounces with 1 gallon of water for routine feedings or 4 ounces for transplant rescue.',
      'Drench soil around roots until evenly moist; safe to foliar spray at the same dilution.',
      'Repeat every 10-14 days during active growth for best results.'
    ]
  },
  {
    id: 'NWS_002',
    asin: 'B0D52CQNGN',
    name: 'Horticultural Activated Charcoal - 4 Quarts',
    price: 29.99,
    image: '/images/products/NWS_002/main.jpg',
    description: 'Premium activated biochar for plants, terrariums, and soil conditioning. Improves drainage, filters toxins, and provides habitat for beneficial microbes.',
    category: 'Soil Amendment',
    tags: ['biochar', 'activated-charcoal', 'terrarium', 'drainage', 'soil-conditioning'],
    features: [
      'Creates permanent habitat for soil microbes',
      'Improves water retention by up to 40%',
      'Filters toxins and heavy metals from soil',
      'Enhances nutrient holding capacity',
      'Improves soil drainage and aeration',
      'Lightweight and easy to mix',
      'Lasts indefinitely in soil',
      'Perfect for indoor and outdoor use'
    ],
    images: [
      '/images/products/NWS_002/main.jpg',
      '/images/products/NWS_002/thumb.jpg'
    ],
    inStock: true,
    video: '/videos/NWS_002.mp4',
    sizes: [
      { name: '4 Quarts', price: 29.99, sku: 'NWS-4q-ABC' }
    ],
    usage: [
      'Rinse charcoal with clean water to remove loose dust before use.',
      'Blend 1 cup into each gallon of potting mix to improve drainage and odor control.',
      'For terrariums and vivariums, add a 1-inch layer beneath moss or substrate.',
      'Reapply a thin layer every 6-12 months to refresh filtration and microbe habitat.'
    ]
  },
  {
    id: 'NWS_003',
    asin: 'B0D6886G54',
    name: 'Organic Tomato Liquid Fertilizer',
    price: 29.99,
    image: '/images/products/NWS_003/main.jpg',
    description: 'Made fresh weekly concentrate with Vitamin B-1 and Aloe Vera for faster root establishment, healthier transplants, and stops blossom end rot.',
    category: 'Fertilizer',
    tags: ['tomato', 'organic', 'b1-vitamin', 'aloe-vera', 'vegetables', 'blossom-end-rot'],
    features: [
      'Balanced nutrition for maximum tomato yields',
      'Vitamin B-1 for faster root establishment',
      'Aloe vera for healthier transplants',
      'Prevents blossom end rot',
      'Made fresh weekly with live microbes',
      'Easily absorbed essential nutrients',
      'Perfect for organic tomato growing',
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
      { name: '32 oz', price: 29.99, sku: 'P5-NP0G-5SL7' }
    ],
    usage: [
      'Shake well before mixing to distribute nutrients evenly.',
      'Dilute 2 ounces in 1 gallon of water and drench around tomato roots at planting.',
      'Apply every 10 days during flowering and fruit set; foliar spray at 1 ounce per gallon.',
      'Stop applications two weeks before harvest and rinse sprayers after use.'
    ]
  },
  {
    id: 'NWS_004',
    asin: 'B0D69LNC5T',
    name: 'Soil Booster and Loosener',
    price: 29.99,
  image: '/images/products/NWS_001/main.jpg',
    description: 'Organic formula to enhance soil health, improve aeration, and promote root growth. Ideal for gardens, lawns, and potted plants.',
    category: 'Soil Amendment',
    tags: ['soil-booster', 'aeration', 'organic', 'root-growth', 'gardens', 'lawns'],
    features: [
      'Improves soil structure and aeration',
      'Promotes robust root development',
      'Enhances water penetration',
      'Breaks up compacted soil naturally',
      'Perfect for clay and hard soils',
      'Safe for all plant types',
      'Organic and chemical-free',
      'Easy to apply with watering'
    ],
    images: [
      '/images/products/NWS_001/main.jpg',
      '/images/products/NWS_001/thumb.jpg'
    ],
    inStock: true,
    video: '/videos/NWS_004.mp4',
    sizes: [
      { name: 'Quart', price: 29.99, sku: '9P-CSA1-NC45' }
    ],
    usage: [
      'Shake thoroughly, then dilute 4 ounces with 1 gallon of water.',
      'Apply evenly over up to 500 sq ft using a watering can or pump sprayer.',
      'Water lightly after application to move biology deeper into the soil profile.',
      'Repeat monthly or anytime soil has been compacted, aerated, or heavily trafficked.'
    ]
  },
  {
    id: 'NWS_006',
    asin: 'B0F97893PD',
    name: 'Liquid Kelp Fertilizer - Organic Seaweed Extract',
    price: 34.99,
  image: '/images/products/NWS_006/main.jpg',
    description: 'Premium liquid kelp fertilizer made fresh weekly with organic seaweed extract, Vitamin B-1, and aloe vera. Promotes stronger roots and prevents blossom end rot.',
    category: 'Fertilizer',
    tags: ['kelp', 'seaweed', 'organic', 'b1-vitamin', 'aloe-vera', 'root-development', 'transplant'],
    features: [
      'Rich in natural plant hormones and trace minerals',
      'Promotes stronger root systems',
      'Enhances transplant success rate',
      'Prevents blossom end rot in tomatoes',
      'Contains Vitamin B-1 and aloe vera',
      'Made fresh weekly for maximum potency',
      'Safe for all plants including edibles',
      'Excellent for stress recovery'
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
      { name: '32 oz', price: 19.99, sku: 'XX-XBWB-DF03' },
      { name: '32 oz', price: 34.99, sku: '8K-DBU9-JA4K' },
      { name: '2.5 Gallon', price: 64.99, sku: '3L-41WW-8JVG' }
    ],
    usage: [
      'Shake well before each application to revive settled kelp solids.',
      'Mix 1-2 ounces with 1 gallon of water for soil drenches or foliar sprays.',
      'Apply weekly during active growth or every two weeks for maintenance feedings.',
      'Use after transplant, drought, or heat stress to speed recovery and root growth.'
    ]
  },
  {
    id: 'NWS_011',
    asin: 'B0F9V46JPP',
    name: 'Liquid Humic & Fulvic Acid with Kelp',
    price: 39.99,
  image: '/images/products/NWS_011/main.jpg',
    description: 'Professional-grade liquid humic and fulvic acid fertilizer enriched with organic kelp extract. Revives tired soil by enhancing nutrient uptake and microbial activity.',
    category: 'Soil Amendment',
    tags: ['humic-acid', 'fulvic-acid', 'kelp', 'soil-conditioner', 'organic', 'nutrient-uptake'],
    features: [
      'Enhances nutrient uptake dramatically',
      'Stimulates beneficial microbial activity',
      'Boosts overall plant vigor',
      'Carbon-rich soil amendment',
      'Improves clay or sandy soils',
      'Increases plant stress resistance',
      'Perfect for vegetables, flowers, trees, lawns',
      'Professional-grade formula'
    ],
    images: [
      '/images/products/NWS_011/main.jpg',
      '/images/products/NWS_011/thumb.jpg'
    ],
    inStock: true,
  video: '/videos/NWS_011.mp4',
  videoWebm: '/videos/NWS_011.webm',
  videoPoster: '/videos/NWS_011.jpg',
    sizes: [
      { name: '32 oz', price: 19.99, sku: 'FP-AL1H-WYNQ' },
      { name: '32 oz', price: 39.99, sku: 'IT-ADBS-CXUC' },
      { name: '2.5 Gallon', price: 69.99, sku: 'GA-TZ69-N9XK' }
    ],
    usage: [
      'Dilute 2 ounces per gallon of water for routine soil applications.',
      'Apply to 1,000 sq ft of lawn or garden beds, concentrating on the root zone.',
      'Follow with plain water to transport humic and fulvic acids into the soil profile.',
      'Repeat every 3-4 weeks or whenever plants show nutrient uptake challenges.'
    ]
  },
  {
    id: 'NWS_012',
    asin: 'B0F9W7B3NL',
    name: 'Liquid Bone Meal Fertilizer',
    price: 19.99,
  image: '/images/products/NWS_012/main.jpg',
    description: 'Fast-absorbing liquid bone meal with 25% hydrolyzed bone meal, 5% calcium, and 10% phosphorus for immediate plant uptake and robust root development.',
    category: 'Fertilizer',
    tags: ['bone-meal', 'phosphorus', 'calcium', 'liquid', 'root-development', 'flowering'],
    features: [
      '25% hydrolyzed bone meal for instant availability',
      '5% calcium for strong cell structure',
      '10% phosphorus (P₂O₅) for roots and flowers',
      'Promotes robust root development',
      'Stronger flowering and fruit set',
      'Superior to granular bone meal',
      'Easy application and fast absorption',
      'Perfect for vegetables, trees, and shrubs'
    ],
    images: [
      '/images/products/NWS_012/main.jpg',
      '/images/products/NWS_012/thumb.jpg'
    ],
  video: '/videos/NWS_012.mp4',
  videoWebm: '/videos/NWS_012.webm',
  videoPoster: '/videos/NWS_012.jpg',
    inStock: true,
    sizes: [
      { name: '32 oz', price: 19.99, sku: 'B5-G9JD-1K10' },
      { name: '32 oz', price: 39.99, sku: 'TY-Z0X8-ENHG' }
    ],
    usage: [
      'Shake thoroughly to suspend the hydrolyzed bone meal particles.',
      'Mix 3 ounces with 1 gallon of water and drench into the root zone.',
      'Apply at planting and repeat every four weeks for heavy-blooming plants.',
      'Avoid foliar spraying; rinse equipment with warm water after each use.'
    ]
  },
  {
    id: 'NWS_013',
    asin: 'B0DDCPYLG1',
    name: 'Enhanced Living Compost with Fermented Duckweed',
    price: 29.99,
  image: '/images/products/NWS_013/main.jpg',
    description: 'Superior living compost blend with 20% worm castings, 20% activated biochar, and 60% weed-free aged compost. Premium blend with fermented duckweed extract.',
    category: 'Compost',
    tags: ['compost', 'worm-castings', 'biochar', 'living-soil', 'microbes', 'duckweed'],
    features: [
      'Contains billions of beneficial soil microbes',
      '20% Premium Worm Castings for slow-release nutrition',
      '20% Activated BioChar for soil structure',
      '60% Weed-Free Compost base',
      'Fermented Duckweed Extract for enhanced microbiology',
      'Enriches soil biology dramatically',
      'Stimulates healthy root development',
      'Provides slow-release nutrition'
    ],
    images: [
      '/images/products/NWS_013/main.jpg',
      '/images/products/NWS_013/thumb.jpg'
    ],
    inStock: true,
  video: '/videos/NWS_013.mp4',
  videoWebm: '/videos/NWS_013.webm',
  videoPoster: '/videos/NWS_013.jpg',
    sizes: [
      { name: '10 lb', price: 29.99, sku: 'WK-558E-QZUL' }
    ],
    usage: [
      'Spread a 1-2 inch layer over garden beds and incorporate into the top 3-4 inches of soil.',
      'Blend up to 25% by volume into potting mixes for containers and raised beds.',
      'Topdress around established plants with a 0.5-inch layer, then water thoroughly.',
      'Apply in spring and fall or whenever soil needs a microbial refresh.'
    ]
  },
  {
    id: 'NWS_014',
    asin: 'B0FG38PQQX',
    name: 'Dog Urine Neutralizer & Lawn Repair',
    price: 29.99,
  image: '/images/products/NWS_014/main.jpg',
    description: 'Professional-strength dog urine neutralizer that eliminates yellow spots caused by pet urine burn. Pet-safe formula that neutralizes salts and revives grass.',
    category: 'Lawn Care',
    tags: ['dog-urine', 'lawn-repair', 'pet-safe', 'yellow-spots', 'odor-control'],
    features: [
      'Eliminates yellow spots from pet urine',
      'Neutralizes harmful salts instantly',
      'Eliminates odors naturally',
      'Revives damaged grass quickly',
      '100% safe for dogs, cats, and pets',
      'No waiting period - pets can walk immediately',
      'Professional-strength formula',
      'Essential for pet owners'
    ],
    images: [
      '/images/products/NWS_014/main.jpg',
      '/images/products/NWS_014/thumb.jpg'
    ],
    inStock: true,
  video: '/videos/NWS_014.mp4',
  videoWebm: '/videos/NWS_014.webm',
  videoPoster: '/videos/NWS_014.jpg',
    sizes: [
      { name: '32 oz', price: 29.99, sku: 'EG-PJ13-DA9T' },
      { name: '32 oz', price: 59.99, sku: 'T0-MB9Q-JIKC' }
    ],
    usage: [
      'Shake bottle vigorously before every use to activate neutralizing microbes.',
      'For fresh spots, mix 4 ounces with 1 gallon of water and saturate the area immediately.',
      'For stubborn burn spots, pre-wet soil and apply undiluted product until runoff.',
      'Reapply every 1-2 weeks in high-traffic areas to maintain soil balance and odor control.'
    ]
  },
  {
    id: 'NWS_016',
    asin: 'B0D9HT7ND8',
    name: 'Organic Hydroponic Fertilizer Concentrate',
    price: 19.99,
  image: '/images/products/NWS_011/main.jpg',
    description: 'Made fresh weekly - 32 oz makes 512 gallons of nutrient solution. Organic plant food for hydroponic systems and aquaponics.',
    category: 'Fertilizer',
    tags: ['hydroponic', 'aquaponic', 'organic', 'concentrate', 'indoor-growing', 'pet-safe'],
    features: [
      'Makes up to 512 gallons of nutrient solution',
      'Perfectly balanced nutrition for rapid growth',
      'Pet-safe and chemical-free formula',
      'Made fresh weekly with live microbes',
      'Ideal for hydroponic and aquaponic systems',
      'Perfect for indoor growing and greenhouses',
      'Supports healthy development naturally',
      'Easy to use - just mix with water'
    ],
    images: [
      '/images/products/NWS_016/main.jpg',
      '/images/products/NWS_016/thumb.jpg'
    ],
  video: '/videos/NWS_016.mp4',
  videoWebm: '/videos/NWS_016.webm',
  videoPoster: '/videos/NWS_016.jpg',
    inStock: true,
    sizes: [
      { name: '32 oz', price: 19.99, sku: 'FR-IJ8R-6LQK' }
    ],
    usage: [
      'Shake well before measuring concentrate to distribute nutrients evenly.',
      'Start seedlings at 1 teaspoon per gallon and increase to 1 tablespoon for mature plants.',
      'Maintain reservoir pH between 5.8 and 6.2 and refresh solution every 7-10 days.',
      'Compatible with drip, NFT, ebb-and-flow, and aquaponic systems when used as directed.'
    ]
  },
  {
    id: 'NWS_018',
    asin: 'B0FGWSKGCY',
    name: 'Seaweed & Humic Acid Lawn Treatment',
    price: 11.99,
  image: '/images/products/NWS_018/main.jpg',
    description: '32 oz concentrate with 4.5% North Atlantic Seaweed and 4.5% Humic Acid. Liquid soil revitalizer for greener lawns and healthier plants.',
    category: 'Lawn Care',
    tags: ['seaweed', 'humic-acid', 'lawn', 'kelp', 'organic', 'grass', 'soil-revitalizer'],
    features: [
      '4.5% North Atlantic Seaweed (Ascophyllum nodosum)',
      '4.5% Humic Acid from Leonardite',
      'Boosts nutrient absorption and soil biology',
      'Creates greener lawns naturally',
      'Improves soil structure and root health',
      'Compatible with all grass types',
      'Safe for new sod and established lawns',
      'Used by professional turf managers'
    ],
    images: [
      '/images/products/NWS_018/main.jpg',
      '/images/products/NWS_018/thumb.jpg'
    ],
  video: '/videos/NWS_018.mp4',
  videoWebm: '/videos/NWS_018.webm',
  videoPoster: '/videos/NWS_018.jpg',
    inStock: true,
    sizes: [
      { name: '32 oz', price: 11.99, sku: 'BH-NBDZ-TCRT' },
      { name: '32 oz', price: 19.99, sku: 'BH-NBDZ-1GAL' },
      { name: '2.5 Gallon', price: 55.97, sku: 'BH-NBDZ-25GAL' }
    ],
    usage: [
      'Shake well before mixing to disperse seaweed and humic acid solids.',
      'Mix 2 ounces per gallon of water and apply evenly across 1,000 sq ft of lawn.',
      'For hose-end sprayers, set to 2 ounces per gallon and walk at a steady pace.',
      'Water in lightly after application to move microbes into the root zone.',
      'Repeat every 3-4 weeks during the growing season or after heavy stress.',
      'Apply to established lawns during cool morning hours for best absorption.',
      'Safe for all grass types including Bermuda, Zoysia, Fescue, and St. Augustine.'
    ]
  },
  {
    id: 'NWS_021',
    asin: 'B0DJ1JNQW4',
    name: 'Horse Safe Hay, Pasture & Lawn Fertilizer',
    price: 39.99,
  image: '/images/products/NWS_021/main.jpg',
    description: 'Premium horse-safe microbial nitrogen fertilizer blend for hay fields, pastures, and lawns. Naturally feeds grass while supporting sustained growth and greener lawns.',
    category: 'Fertilizer',
    tags: ['hay', 'pasture', 'lawn', 'horse-safe', 'livestock', 'microbial', 'nitrogen'],
    features: [
      'Safe for horses and livestock - no waiting period',
      'Microbial nitrogen blend for sustained growth',
      'Creates greener lawns and pastures',
      'Improves soil structure naturally',
      'Perfect for organic farms and horse pastures',
      'Feeds grass and turf naturally',
      'Supports beneficial soil microbes',
      'Suitable for hay fields and residential lawns'
    ],
    images: [
      '/images/products/NWS_021/main.jpg',
      '/images/products/NWS_021/thumb.jpg'
    ],
    inStock: true,
  video: '/videos/NWS_021.mp4',
  videoWebm: '/videos/NWS_021.webm',
  videoPoster: '/videos/NWS_021.jpg',
    sizes: [
      { name: '32 oz', price: 39.99, sku: 'VY-T7ZM-760R' },
      { name: '2.5 Gallon', price: 99.99, sku: 'N4-E00Z-BB9W' }
    ],
    usage: [
      'Shake well, then dilute 8 ounces per gallon of water for broadcast spraying.',
      'Apply to approximately 1,000 sq ft, coating foliage and soil for best results.',
      'Irrigate or allow rainfall within 24 hours to carry nutrients into the root zone.',
      'Horses and livestock may graze once the spray has dried, typically after 2 hours.'
    ]
  }
];

export function getProductById(id: string): ProductData | undefined {
  return allProducts.find(p => p.id === id);
}

export function getAllProductIds(): string[] {
  return allProducts.map(p => p.id);
}
