
export interface Product {
  id: string;
  name: string;
  filename: string;
  duration: string;
  keyPoints: string[];
  description: string;
  category: 'fertilizer' | 'soil-amendment' | 'lawn-care' | 'specialty';
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Horticultural Activated Charcoal',
    filename: 'horticultural_activated_charcoal.mp4',
    duration: '28s',
    keyPoints: ['Premium biochar', 'Improves drainage', 'Filters toxins', '40% water retention improvement'],
    description: 'Premium biochar that dramatically improves soil drainage while filtering out harmful toxins. Provides 40% better water retention for healthier plant growth.',
    category: 'soil-amendment'
  },
  {
    id: '2', 
    name: 'Soil Booster and Loosener',
    filename: 'soil_booster_and_loosener.mp4',
    duration: '29s',
    keyPoints: ['Breaks compacted soil naturally', 'Improves aeration', 'Perfect for heavy traffic areas'],
    description: 'Naturally breaks up compacted soil and improves aeration. Ideal solution for high-traffic areas and clay soils that need better structure.',
    category: 'soil-amendment'
  },
  {
    id: '3',
    name: 'Horse Safe Hay, Pasture & Lawn Fertilizer', 
    filename: 'horse_safe_hay_pasture_lawn_fertilizer.mp4',
    duration: '32s',
    keyPoints: ['Safe for horses and livestock', 'Microbial nitrogen blend', '2-hour grazing wait time'],
    description: 'Specially formulated to be completely safe for horses and livestock. Features a microbial nitrogen blend with only a 2-hour grazing wait time.',
    category: 'lawn-care'
  },
  {
    id: '4',
    name: 'Organic Hydroponic Fertilizer Concentrate',
    filename: 'organic_hydroponic_fertilizer_concentrate.mp4', 
    duration: '29s',
    keyPoints: ['Makes 512 gallons', 'Pet-safe', 'Compatible with all hydroponic systems'],
    description: 'Concentrated formula that makes up to 512 gallons of nutrient solution. Completely pet-safe and compatible with all hydroponic growing systems.',
    category: 'fertilizer'
  },
  {
    id: '5',
    name: 'Liquid Bone Meal Fertilizer',
    filename: 'liquid_bone_meal_fertilizer.mp4',
    duration: '29s', 
    keyPoints: ['25% hydrolyzed bone meal', '5% calcium', '10% phosphorus', 'Fast-absorbing'],
    description: 'Fast-absorbing liquid formula with 25% hydrolyzed bone meal, providing 5% calcium and 10% phosphorus for strong root development and flowering.',
    category: 'fertilizer'
  },
  {
    id: '6',
    name: 'Liquid Humic & Fulvic Acid with Kelp',
    filename: 'liquid_humic_fulvic_acid_with_kelp.mp4',
    duration: '31s',
    keyPoints: ['Professional-grade formula', 'Enhances nutrient uptake', 'Improves soil structure'], 
    description: 'Professional-grade formula that significantly enhances nutrient uptake and improves overall soil structure for optimal plant health and growth.',
    category: 'soil-amendment'
  },
  {
    id: '7',
    name: 'Dog Urine Neutralizer & Lawn Repair',
    filename: 'dog_urine_neutralizer_lawn_repair.mp4',
    duration: '30s',
    keyPoints: ['Eliminates yellow spots', 'Neutralizes salts', '100% pet-safe', 'No waiting period'],
    description: 'Quickly eliminates unsightly yellow spots caused by dog urine. Neutralizes harmful salts while being 100% pet-safe with no waiting period required.',
    category: 'lawn-care'
  },
  {
    id: '8', 
    name: 'Seaweed & Humic Acid Lawn Treatment',
    filename: 'seaweed_humic_acid_lawn_treatment.mp4',
    duration: '30s',
    keyPoints: ['4.5% North Atlantic Seaweed', '4.5% Humic Acid', 'Safe for all grass types'],
    description: 'Premium blend of 4.5% North Atlantic Seaweed and 4.5% Humic Acid. Safe and effective for all grass types, promoting thick, healthy lawn growth.',
    category: 'lawn-care'
  },
  {
    id: '9',
    name: 'Enhanced Living Compost with Fermented Duckweed',
    filename: 'enhanced_living_compost_fermented_duckweed.mp4', 
    duration: '30s',
    keyPoints: ['20% worm castings', '20% biochar', '60% aged compost', 'Billions of microbes'],
    description: 'Premium blend of 20% worm castings, 20% biochar, and 60% aged compost, teeming with billions of beneficial microbes for exceptional plant nutrition.',
    category: 'soil-amendment'
  },
  {
    id: '10',
    name: 'Natural Liquid Fertilizer for Garden and House Plants',
    filename: 'natural_liquid_fertilizer_garden_house_plants.mp4',
    duration: '31s', 
    keyPoints: ['100% natural USDA Certified', 'B-1 Vitamin', 'Aloe Vera', 'Safe for pollinators'],
    description: '100% natural USDA Certified formula enriched with B-1 Vitamin and Aloe Vera. Completely safe for beneficial pollinators and perfect for both gardens and houseplants.',
    category: 'fertilizer'
  },
  {
    id: '11',
    name: 'Organic Tomato Liquid Fertilizer',
    filename: 'organic_tomato_liquid_fertilizer.mp4',
    duration: '33s',
    keyPoints: ['Stops blossom end rot', 'Vitamin B-1', 'Works on all fruiting vegetables'], 
    description: 'Specially formulated to prevent blossom end rot in tomatoes. Enhanced with Vitamin B-1 and effective on all fruiting vegetables for maximum harvest yields.',
    category: 'specialty'
  },
  {
    id: '12',
    name: 'Liquid Kelp Fertilizer - Organic Seaweed Extract', 
    filename: 'liquid_kelp_fertilizer_organic_seaweed_extract.mp4',
    duration: '32s',
    keyPoints: ['Rich in plant hormones', 'Prevents blossom end rot', 'Excellent for stress recovery'],
    description: 'Rich in natural plant hormones that prevent blossom end rot and promote vigorous growth. Excellent for helping plants recover from environmental stress.',
    category: 'fertilizer'
  }
];

export const categories = {
  'fertilizer': 'Liquid Fertilizers',
  'soil-amendment': 'Soil Amendments', 
  'lawn-care': 'Lawn Care',
  'specialty': 'Specialty Products'
} as const;
