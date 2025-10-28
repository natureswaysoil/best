/**
 * Competitive Pricing Analysis Tool
 * Helps determine optimal pricing based on competitor analysis and market positioning
 */

export interface CompetitorPrice {
  competitor: string;
  productName: string;
  price: number;
  url: string;
  features: string[];
  shipping: number;
  totalCost: number;
  lastUpdated: string;
}

export interface PricingStrategy {
  id: string;
  name: string;
  description: string;
  multiplier: number; // Relative to average competitor price
  advantages: string[];
}

// Sample competitor data (in real implementation, this would come from API/scraping)
export const COMPETITOR_DATA: Record<string, CompetitorPrice[]> = {
  'liquid-fertilizer': [
    {
      competitor: 'Amazon (Miracle-Gro)',
      productName: 'Miracle-Gro Plant Food',
      price: 15.99,
      url: 'https://amazon.com/miracle-gro-plant-food',
      features: ['Synthetic', 'Quick release', 'NPK formula'],
      shipping: 6.99,
      totalCost: 22.98,
      lastUpdated: '2024-10-28',
    },
    {
      competitor: 'Home Depot (Scotts)',
      productName: 'Scotts Liquid Turf Builder',
      price: 18.99,
      url: 'https://homedepot.com/scotts-liquid',
      features: ['Synthetic', 'Lawn specific', 'Fast acting'],
      shipping: 8.99,
      totalCost: 27.98,
      lastUpdated: '2024-10-28',
    },
    {
      competitor: 'Lowes (Vigoro)',
      productName: 'Vigoro All-Purpose Plant Food',
      price: 12.99,
      url: 'https://lowes.com/vigoro-plant-food',
      features: ['General purpose', 'Liquid concentrate'],
      shipping: 7.99,
      totalCost: 20.98,
      lastUpdated: '2024-10-28',
    },
    {
      competitor: 'Neptune\'s Harvest',
      productName: 'Fish & Seaweed Fertilizer',
      price: 24.99,
      url: 'https://neptunesharvest.com/fish-seaweed',
      features: ['Organic', 'Fish emulsion', 'Seaweed extract'],
      shipping: 9.99,
      totalCost: 34.98,
      lastUpdated: '2024-10-28',
    },
    {
      competitor: 'Fox Farm',
      productName: 'Big Bloom Liquid Concentrate',
      price: 22.99,
      url: 'https://foxfarm.com/big-bloom',
      features: ['Organic', 'Microbes', 'Earthworm castings'],
      shipping: 8.99,
      totalCost: 31.98,
      lastUpdated: '2024-10-28',
    },
  ],
};

// Pricing strategies inspired by Amazon and other successful retailers
export const PRICING_STRATEGIES: PricingStrategy[] = [
  {
    id: 'penetration',
    name: 'Market Penetration',
    description: 'Price below competitors to gain market share quickly',
    multiplier: 0.85, // 15% below average
    advantages: [
      'Fastest customer acquisition',
      'High conversion rates',
      'Builds customer loyalty early',
      'Forces competitors to respond',
    ],
  },
  {
    id: 'competitive',
    name: 'Competitive Parity',
    description: 'Match average competitor pricing',
    multiplier: 1.0, // At market average
    advantages: [
      'Safe market positioning',
      'Competes on features/quality',
      'Reduces price sensitivity',
      'Standard market expectation',
    ],
  },
  {
    id: 'value',
    name: 'Value Premium',
    description: 'Slight premium justified by superior value',
    multiplier: 1.15, // 15% above average
    advantages: [
      'Higher profit margins',
      'Premium brand positioning',
      'Quality perception',
      'Sustainable growth',
    ],
  },
  {
    id: 'premium',
    name: 'Premium Positioning',
    description: 'Highest price tier for luxury/professional market',
    multiplier: 1.35, // 35% above average
    advantages: [
      'Maximum profit per sale',
      'Luxury brand perception',
      'Lower volume, higher margin',
      'Professional market appeal',
    ],
  },
  {
    id: 'dynamic',
    name: 'Dynamic Pricing',
    description: 'Adjust prices based on demand, inventory, and competition',
    multiplier: 1.1, // Base price with adjustments
    advantages: [
      'Optimal revenue capture',
      'Responsive to market changes',
      'Inventory management tool',
      'Seasonal optimization',
    ],
  },
];

/**
 * Calculate competitive pricing analysis for a product category
 */
export function analyzeCompetitivePricing(category: string): {
  averagePrice: number;
  averageShipping: number;
  averageTotalCost: number;
  priceRange: { min: number; max: number };
  competitors: CompetitorPrice[];
  recommendations: { strategy: PricingStrategy; suggestedPrice: number }[];
} {
  const competitors = COMPETITOR_DATA[category] || [];
  
  if (competitors.length === 0) {
    return {
      averagePrice: 0,
      averageShipping: 0,
      averageTotalCost: 0,
      priceRange: { min: 0, max: 0 },
      competitors: [],
      recommendations: [],
    };
  }

  // Calculate averages
  const averagePrice = competitors.reduce((sum, comp) => sum + comp.price, 0) / competitors.length;
  const averageShipping = competitors.reduce((sum, comp) => sum + comp.shipping, 0) / competitors.length;
  const averageTotalCost = competitors.reduce((sum, comp) => sum + comp.totalCost, 0) / competitors.length;

  // Calculate price range
  const prices = competitors.map(comp => comp.price);
  const priceRange = {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };

  // Generate pricing recommendations
  const recommendations = PRICING_STRATEGIES.map(strategy => ({
    strategy,
    suggestedPrice: Math.round(averagePrice * strategy.multiplier * 100) / 100,
  }));

  return {
    averagePrice: Math.round(averagePrice * 100) / 100,
    averageShipping: Math.round(averageShipping * 100) / 100,
    averageTotalCost: Math.round(averageTotalCost * 100) / 100,
    priceRange,
    competitors,
    recommendations,
  };
}

/**
 * Get pricing recommendation based on business goals
 */
export function getPricingRecommendation(
  category: string,
  businessGoal: 'growth' | 'profit' | 'market-share' | 'premium'
): { strategy: PricingStrategy; suggestedPrice: number; reasoning: string } | null {
  const analysis = analyzeCompetitivePricing(category);
  
  if (analysis.recommendations.length === 0) {
    return null;
  }

  let selectedStrategy: PricingStrategy;
  let reasoning: string;

  switch (businessGoal) {
    case 'growth':
      selectedStrategy = PRICING_STRATEGIES.find(s => s.id === 'penetration')!;
      reasoning = 'Penetration pricing accelerates customer acquisition and market share growth';
      break;
      
    case 'market-share':
      selectedStrategy = PRICING_STRATEGIES.find(s => s.id === 'competitive')!;
      reasoning = 'Competitive parity pricing maximizes market appeal while maintaining healthy margins';
      break;
      
    case 'profit':
      selectedStrategy = PRICING_STRATEGIES.find(s => s.id === 'value')!;
      reasoning = 'Value premium pricing optimizes profit margins while remaining competitive';
      break;
      
    case 'premium':
      selectedStrategy = PRICING_STRATEGIES.find(s => s.id === 'premium')!;
      reasoning = 'Premium positioning targets quality-conscious customers willing to pay more';
      break;
      
    default:
      selectedStrategy = PRICING_STRATEGIES.find(s => s.id === 'competitive')!;
      reasoning = 'Default competitive pricing strategy';
  }

  const suggestedPrice = Math.round(analysis.averagePrice * selectedStrategy.multiplier * 100) / 100;

  return {
    strategy: selectedStrategy,
    suggestedPrice,
    reasoning,
  };
}

/**
 * Calculate price elasticity and demand sensitivity
 */
export function calculatePriceElasticity(
  basePrice: number,
  baseDemand: number,
  newPrice: number,
  newDemand: number
): {
  elasticity: number;
  interpretation: string;
  recommendation: string;
} {
  const priceChangePercent = ((newPrice - basePrice) / basePrice) * 100;
  const demandChangePercent = ((newDemand - baseDemand) / baseDemand) * 100;
  
  const elasticity = demandChangePercent / priceChangePercent;
  
  let interpretation: string;
  let recommendation: string;

  if (Math.abs(elasticity) > 1) {
    interpretation = 'Elastic demand - customers are price sensitive';
    recommendation = 'Consider lower prices to increase total revenue';
  } else if (Math.abs(elasticity) < 1) {
    interpretation = 'Inelastic demand - customers are less price sensitive';
    recommendation = 'Opportunity to increase prices without losing many customers';
  } else {
    interpretation = 'Unit elastic demand - balanced price sensitivity';
    recommendation = 'Current pricing is optimal for revenue';
  }

  return {
    elasticity: Math.round(elasticity * 100) / 100,
    interpretation,
    recommendation,
  };
}

/**
 * Amazon-style dynamic pricing factors
 */
export interface DynamicPricingFactors {
  demandLevel: 'low' | 'medium' | 'high';
  inventoryLevel: 'low' | 'medium' | 'high';
  seasonality: 'off-season' | 'normal' | 'peak';
  competitorActivity: 'stable' | 'aggressive' | 'premium';
  customerSegment: 'price-sensitive' | 'balanced' | 'premium';
}

/**
 * Calculate dynamic price adjustment
 */
export function calculateDynamicPrice(
  basePrice: number,
  factors: DynamicPricingFactors
): {
  adjustedPrice: number;
  adjustmentPercentage: number;
  reasoning: string[];
} {
  let multiplier = 1.0;
  const reasoning: string[] = [];

  // Demand adjustments
  switch (factors.demandLevel) {
    case 'high':
      multiplier *= 1.15;
      reasoning.push('High demand (+15%)');
      break;
    case 'low':
      multiplier *= 0.9;
      reasoning.push('Low demand (-10%)');
      break;
    default:
      reasoning.push('Normal demand (0%)');
  }

  // Inventory adjustments
  switch (factors.inventoryLevel) {
    case 'low':
      multiplier *= 1.1;
      reasoning.push('Low inventory (+10%)');
      break;
    case 'high':
      multiplier *= 0.95;
      reasoning.push('High inventory (-5%)');
      break;
    default:
      reasoning.push('Normal inventory (0%)');
  }

  // Seasonality adjustments
  switch (factors.seasonality) {
    case 'peak':
      multiplier *= 1.2;
      reasoning.push('Peak season (+20%)');
      break;
    case 'off-season':
      multiplier *= 0.85;
      reasoning.push('Off-season (-15%)');
      break;
    default:
      reasoning.push('Normal season (0%)');
  }

  // Competitor activity adjustments
  switch (factors.competitorActivity) {
    case 'aggressive':
      multiplier *= 0.9;
      reasoning.push('Aggressive competition (-10%)');
      break;
    case 'premium':
      multiplier *= 1.1;
      reasoning.push('Premium competition (+10%)');
      break;
    default:
      reasoning.push('Stable competition (0%)');
  }

  // Customer segment adjustments
  switch (factors.customerSegment) {
    case 'premium':
      multiplier *= 1.15;
      reasoning.push('Premium customers (+15%)');
      break;
    case 'price-sensitive':
      multiplier *= 0.9;
      reasoning.push('Price-sensitive customers (-10%)');
      break;
    default:
      reasoning.push('Balanced customers (0%)');
  }

  const adjustedPrice = Math.round(basePrice * multiplier * 100) / 100;
  const adjustmentPercentage = Math.round((multiplier - 1) * 100 * 100) / 100;

  return {
    adjustedPrice,
    adjustmentPercentage,
    reasoning,
  };
}