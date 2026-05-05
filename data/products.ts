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
    name: "Nature's Way Soil Liquid Lawn Soil Conditioner – Humic Acid & Kelp Liquid Aeration for Compacted Soil – Root Growth Booster for Grass & Lawns – 32 oz Concentrate",
    price: 29.99,
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
      { name: '32 oz', price: 29.99, sku: '3L-3MPJ-6BQM' }
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
    videoWebm: '/videos/NWS_002.webm',
    videoPoster: '/videos/NWS_002.jpg',
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
      { name: 'Quart', price: 29.99, sku: 'P5-NP0G-5SL7' }
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
    videoWebm: '/videos/NWS_004.webm',
    videoPoster: '/videos/NWS_004.jpg',
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
      { name: '1 Gallon', price: 34.99, sku: '8K-DBU9-JA4K' },
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
      { name: '1 Gallon', price: 39.99, sku: 'IT-ADBS-CXUC' },
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
      { name: '1 Gallon', price: 39.99, sku: 'TY-Z0X8-ENHG' }
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
    name: 'Living Compost with Worm Castings & Biochar',
    price: 29.99,
    image: '/images/products/NWS_013/main.jpg',
    description: 'Concentrated living compost with 20% worm castings, 20% activated biochar, and living microbes to improve root-zone biology in raised beds, containers, and gardens.',
    category: 'Compost',
    tags: ['compost', 'worm-castings', 'biochar', 'garden-mix', 'raised-beds', 'living-soil'],
    features: [
      'Concentrated living soil blend with 20% worm castings + 20% activated biochar',
      'Small bag, high impact: use 1–2 cups per plant or a 1:4 soil mix',
      'Supports transplant shock recovery and stronger early root establishment',
      'Biochar helps hold moisture and nutrients near the root zone',
      'Small-batch processed to preserve biologically active microbial life'
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
      { name: '10 Pounds', price: 29.99, sku: 'WK-558E-QZUL' }
    ],
    usage: [
      'Blend into beds or containers at roughly 1 part compost to 4 parts existing soil.',
      'For transplants, place 1-2 cups in the planting hole and backfill around roots.',
      'Topdress established plants with a light ring around the drip line, then water in.',
      'Reapply during active growth to keep biology and structure strong in high-demand beds.'
    ]
  },
  {
    id: 'NWS_014',
    asin: 'B0FG38PQQX',
    name: 'Dog Urine Neutralizer & Lawn Revitalizer',
    price: 29.99,
    image: '/images/products/NWS_014/main.jpg',
    description: 'Pet-safe enzyme and humic treatment designed to support lawn recovery in dog urine-stressed areas by helping address odor residues and soil imbalance.',
    category: 'Lawn Care',
    tags: ['dog-urine', 'lawn-revival', 'pet-safe', 'odor-control', 'lawn-cluster'],
    features: [
      'Designed for soil-level lawn support, not a temporary green dye',
      'Enzymes help break down urine residues linked to recurring burn spots',
      'Humic and fulvic acids support improved soil conditions for regrowth',
      'Helps neutralize odor markers that encourage repeat marking',
      'Pet-safe, plant-based formula made in small batches in the USA'
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
      { name: '32 Ounce', price: 29.99, sku: 'EG-PJ13-DA9T' },
      { name: '1 Gallon', price: 59.99, sku: 'T0-MB9Q-JIKC' }
    ],
    usage: [
      'Shake thoroughly before each use to activate the enzyme and humic blend.',
      'Dilute according to label directions and spray directly on yellow or stressed areas.',
      'Treat both the damaged spot and surrounding root zone for better coverage.',
      'Repeat in high-traffic pet zones as part of an ongoing lawn recovery routine.'
    ]
  },
  {
    id: 'NWS_023',
    asin: 'B0GFC45K6T',
    name: 'Liquid Lawn Fertilizer for Yellow & Heat-Stressed Grass',
    price: 39.99,
    image: '/images/products/NWS_023/main.jpg',
    description: 'Concentrated 5-3-4 living-soil lawn fertilizer with humic and kelp support for greener color, stronger roots, and stress recovery in established turf.',
    category: 'Lawn Care',
    tags: ['lawn-fertilizer', '5-3-4', 'heat-stress', 'yellow-grass', 'lawn-cluster'],
    features: [
      'Liquid 5-3-4 nutrition helps correct pale, weak, and slow-growing grass',
      'Concentrated formula covers approximately 5,000-10,000 sq ft depending on dilution',
      'Feeds both grass and soil with humic support for longer-lasting performance',
      'Low-burn formulation suitable for routine use on established turf',
      'Simple mix-and-spray application with hose-end sprayers or watering cans'
    ],
    images: [
      '/images/products/NWS_023/main.jpg',
      '/images/products/NWS_023/thumb.jpg'
    ],
    inStock: true,
    sizes: [
      { name: '1 Gallon', price: 39.99, sku: 'NWS-LAWN-1GAL' }
    ],
    usage: [
      'Shake well, then dilute per label rate for your sprayer style and lawn condition.',
      'Apply evenly over established turf during cool parts of the day.',
      'Water lightly after application to move nutrition toward the root zone.',
      'Repeat every 2-4 weeks through active growing season as needed.'
    ]
  },
  {
    id: 'NWS_016',
    asin: 'B0D9HT7ND8',
    name: 'Organic Hydroponic Nutrients - Liquid Concentrate',
    price: 29.99,
    image: '/images/products/NWS_016/main.jpg',
    description: 'Organic hydroponic nutrient concentrate powered by fermented duckweed, kelp, and humic support. One 32 oz bottle makes up to 64 gallons of feed solution.',
    category: 'Fertilizer',
    tags: ['hydroponic', 'organic', 'duckweed', 'kelp', 'indoor-growing', 'nutrient-solution'],
    features: [
      'One 32 oz bottle makes up to 64 gallons of nutrient solution',
      'Water-soluble formula for hydroponics, coco, raised beds, and soil gardens',
      'Fermented duckweed and kelp blend supports balanced plant growth',
      'Humic and fulvic acids help improve nutrient availability',
      'Low-salt, non-burn formula suitable for routine feedings'
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
      { name: '32 Fluid Ounces', price: 29.99, sku: 'FR-IJ8R-6LQK' }
    ],
    usage: [
      'Shake bottle well before measuring concentrate.',
      'Use 1 tablespoon per gallon of water for routine feeding in most systems.',
      'Monitor EC and pH regularly and refresh reservoir solution every 7-10 days.',
      'Compatible with DWC, drip, coco, and soil drench programs when used as directed.'
    ]
  },
  {
    id: 'NWS_018',
    asin: 'B0FGWSKGCY',
    name: 'Seaweed & Humic Acid Lawn Treatment',
    price: 19.99,
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
      { name: '1 Gallon', price: 19.99, sku: 'BH-NBDZ-1GAL' },
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
    name: 'Hay and Pasture Liquid Fertilizer',
    price: 39.99,
    image: '/images/products/NWS_021/main.jpg',
    description: 'Organic non-toxic pasture fertilizer formulated for horse and livestock safety. Supports stronger forage growth, nutrient uptake, and long-term soil health.',
    category: 'Fertilizer',
    tags: ['hay', 'pasture', 'horse-safe', 'livestock', 'forage', 'microbial'],
    features: [
      'Concentrated formula can cover up to 5 acres per gallon when diluted 1:50',
      'Helps accelerate regrowth between cuttings with biology-first nutrition',
      '100% safe for horses, cattle, and livestock with no withdrawal period',
      'Introduces beneficial microorganisms for long-term soil health',
      'Easy application with hose-end, backpack, or boom sprayer systems'
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
      { name: '1 Gallon', price: 39.99, sku: 'VY-T7ZM-760R' },
      { name: '2.5 Gallon', price: 99.99, sku: 'N4-E00Z-BB9W' }
    ],
    usage: [
      'Dilute concentrate 1:50 with water (or follow label rates for your sprayer).',
      'Spray evenly over hay fields, pasture grass, or forage zones.',
      'Apply before rainfall or irrigate to move biology into the root zone.',
      'Repeat on a regular feeding cadence to maintain forage density and color.'
    ]
  },
  {
    id: 'NWS_022',
    asin: 'B0GTBZ7N56',
    name: 'Fruit Tree Fertilizer - Liquid Concentrate',
    price: 29.99,
    image: '/images/products/NWS_022/main.jpg',
    description: 'Liquid concentrate for apple, peach, pear, citrus, banana, and other fruit trees. Supports blooms, fruit set, root strength, and seasonal tree vigor.',
    category: 'Fertilizer',
    tags: ['fruit-tree', 'orchard', 'citrus', 'apple', 'peach', 'liquid-fertilizer'],
    features: [
      'Supports healthier roots and stronger overall fruit tree performance',
      'Formulated to support blooms, fruit set, and in-season vigor',
      '32 oz concentrate makes up to 64 gallons for broad orchard coverage',
      'Suitable for young transplants, mature trees, and stressed trees',
      'Easy soil-drench application via watering can, sprayer, or hose-end system'
    ],
    images: [
      '/images/products/NWS_022/main.jpg',
      '/images/products/NWS_022/thumb.jpg'
    ],
    inStock: true,
    sizes: [
      { name: '32 Fluid Ounces', price: 29.99, sku: 'NWS-FRUIT-32OZ' }
    ],
    usage: [
      'Shake concentrate thoroughly before mixing.',
      'Dilute in water and apply as a soil drench around the drip line.',
      'Feed routinely from spring green-up through fruiting season.',
      'Use after transplanting or stress events to support root recovery.'
    ]
  }
];

export function getProductById(id: string): ProductData | undefined {
  return allProducts.find(p => p.id === id);
}

export function getAllProductIds(): string[] {
  return allProducts.map(p => p.id);
}
