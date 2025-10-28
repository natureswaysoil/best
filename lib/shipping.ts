/**
 * Advanced Shipping System - Amazon-style shipping with competitive pricing
 * Supports multiple shipping methods, weight-based calculation, and zone pricing
 */

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  deliveryDays: {
    min: number;
    max: number;
  };
  baseCost: number;
  weightMultiplier: number; // Cost per pound
  freeThreshold?: number; // Free shipping above this amount
  maxWeight?: number; // Maximum weight for this method
  businessDaysOnly?: boolean;
  tracking: boolean;
  insurance: boolean;
}

export interface ShippingZone {
  id: string;
  name: string;
  states: string[];
  multiplier: number; // 1.0 = base rate, 1.2 = 20% more expensive
}

export interface ShippingCalculation {
  method: ShippingMethod;
  baseCost: number;
  weightCost: number;
  zoneCost: number;
  total: number;
  isFree: boolean;
  estimatedDelivery: string;
}

// Product weight database (in pounds)
export const PRODUCT_WEIGHTS: Record<string, number> = {
  'NWS_001': 2.5, // Liquid fertilizer
  'NWS_002': 3.0, // Granular fertilizer
  'NWS_003': 1.8, // Organic compost
  'NWS_004': 2.2, // Liquid nutrients
  'NWS_005': 4.5, // Soil amendment
  'NWS_006': 3.2, // Plant food
  'NWS_007': 2.8, // Root enhancer
  'NWS_008': 3.5, // Growth formula
  'NWS_009': 2.0, // Seedling starter
  'NWS_010': 3.8, // Bloom booster
  'NWS_011': 2.6, // Vegetable fertilizer
  'NWS_012': 3.1, // Flower food
};

// Shipping zones for distance-based pricing
export const SHIPPING_ZONES: ShippingZone[] = [
  {
    id: 'zone1',
    name: 'Local (NC, SC, VA)',
    states: ['NC', 'SC', 'VA'],
    multiplier: 0.8, // 20% discount for local
  },
  {
    id: 'zone2', 
    name: 'Regional (Southeast)',
    states: ['GA', 'FL', 'TN', 'KY', 'AL', 'MS', 'WV'],
    multiplier: 1.0, // Base rate
  },
  {
    id: 'zone3',
    name: 'Extended (East Coast)',
    states: ['NY', 'NJ', 'PA', 'DE', 'MD', 'CT', 'RI', 'MA', 'VT', 'NH', 'ME'],
    multiplier: 1.2, // 20% more
  },
  {
    id: 'zone4',
    name: 'Central US',
    states: ['OH', 'IN', 'IL', 'MI', 'WI', 'MN', 'IA', 'MO', 'AR', 'LA', 'TX', 'OK', 'KS', 'NE', 'SD', 'ND'],
    multiplier: 1.4, // 40% more
  },
  {
    id: 'zone5',
    name: 'Mountain West',
    states: ['CO', 'WY', 'MT', 'ID', 'UT', 'NV', 'AZ', 'NM'],
    multiplier: 1.6, // 60% more
  },
  {
    id: 'zone6',
    name: 'West Coast',
    states: ['CA', 'OR', 'WA'],
    multiplier: 1.8, // 80% more
  },
  {
    id: 'zone7',
    name: 'Alaska & Hawaii',
    states: ['AK', 'HI'],
    multiplier: 2.5, // 150% more
  },
];

// Available shipping methods
export const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: 'standard',
    name: 'Standard Shipping',
    description: 'Reliable delivery with tracking (FREE over $50)',
    deliveryDays: { min: 5, max: 8 },
    baseCost: 4.99,
    weightMultiplier: 1.50,
    freeThreshold: 50.00,
    tracking: true,
    insurance: false,
    businessDaysOnly: true,
  },
  {
    id: 'expedited',
    name: 'Expedited Shipping',
    description: 'Faster delivery with priority handling',
    deliveryDays: { min: 2, max: 4 },
    baseCost: 8.99,
    weightMultiplier: 2.25,
    // No free threshold - customer always pays for expedited
    tracking: true,
    insurance: true,
    businessDaysOnly: true,
  },
  {
    id: 'overnight',
    name: 'Overnight Express',
    description: 'Next business day delivery',
    deliveryDays: { min: 1, max: 1 },
    baseCost: 19.99,
    weightMultiplier: 4.50,
    maxWeight: 10, // No overnight for heavy items
    // No free threshold - customer always pays for overnight
    tracking: true,
    insurance: true,
    businessDaysOnly: true,
  },
  {
    id: 'ground_saver',
    name: 'Economy Ground',
    description: 'Lowest cost option, slower delivery',
    deliveryDays: { min: 7, max: 12 },
    baseCost: 3.49,
    weightMultiplier: 1.25,
    // No free threshold - customer pays for economy too
    tracking: true,
    insurance: false,
    businessDaysOnly: false,
  },
];

/**
 * Get shipping zone for a state
 */
export function getShippingZone(state: string): ShippingZone {
  const stateCode = state.toUpperCase().trim();
  
  for (const zone of SHIPPING_ZONES) {
    if (zone.states.includes(stateCode)) {
      return zone;
    }
  }
  
  // Default to most expensive zone for unknown states
  return SHIPPING_ZONES[SHIPPING_ZONES.length - 1];
}

/**
 * Calculate total weight for cart items
 */
export function calculateTotalWeight(items: Array<{ productId: string; quantity: number }>): number {
  return items.reduce((total, item) => {
    const productWeight = PRODUCT_WEIGHTS[item.productId] || 2.5; // Default weight
    return total + (productWeight * item.quantity);
  }, 0);
}

/**
 * Get estimated delivery date
 */
export function getEstimatedDelivery(method: ShippingMethod): string {
  const today = new Date();
  const deliveryDate = new Date(today);
  
  // Add delivery days
  const daysToAdd = method.deliveryDays.max;
  
  // Skip weekends if business days only
  if (method.businessDaysOnly) {
    let businessDaysAdded = 0;
    while (businessDaysAdded < daysToAdd) {
      deliveryDate.setDate(deliveryDate.getDate() + 1);
      const dayOfWeek = deliveryDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
        businessDaysAdded++;
      }
    }
  } else {
    deliveryDate.setDate(deliveryDate.getDate() + daysToAdd);
  }
  
  return deliveryDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Calculate shipping cost for an order
 */
export function calculateShipping(
  items: Array<{ productId: string; quantity: number; price: number }>,
  state: string,
  method: ShippingMethod
): ShippingCalculation {
  // Calculate order total
  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // Check if qualifies for free shipping
  const isFree = method.freeThreshold && subtotal >= method.freeThreshold;
  
  if (isFree) {
    return {
      method,
      baseCost: 0,
      weightCost: 0,
      zoneCost: 0,
      total: 0,
      isFree: true,
      estimatedDelivery: getEstimatedDelivery(method),
    };
  }
  
  // Calculate weight
  const totalWeight = calculateTotalWeight(items);
  
  // Check weight limit
  if (method.maxWeight && totalWeight > method.maxWeight) {
    throw new Error(`Order too heavy for ${method.name}. Maximum weight: ${method.maxWeight} lbs`);
  }
  
  // Get shipping zone
  const zone = getShippingZone(state);
  
  // Calculate costs
  const baseCost = method.baseCost;
  const weightCost = totalWeight * method.weightMultiplier;
  const subtotalBeforeZone = baseCost + weightCost;
  const zoneCost = subtotalBeforeZone * (zone.multiplier - 1);
  const total = Math.round((subtotalBeforeZone + zoneCost) * 100) / 100;
  
  return {
    method,
    baseCost: Math.round(baseCost * 100) / 100,
    weightCost: Math.round(weightCost * 100) / 100,
    zoneCost: Math.round(zoneCost * 100) / 100,
    total,
    isFree: false,
    estimatedDelivery: getEstimatedDelivery(method),
  };
}

/**
 * Get all available shipping options for an order
 */
export function getShippingOptions(
  items: Array<{ productId: string; quantity: number; price: number }>,
  state: string
): ShippingCalculation[] {
  const totalWeight = calculateTotalWeight(items);
  
  // Filter methods by weight limit
  const availableMethods = SHIPPING_METHODS.filter(method => 
    !method.maxWeight || totalWeight <= method.maxWeight
  );
  
  // Calculate shipping for each method
  const options = availableMethods.map(method => {
    try {
      return calculateShipping(items, state, method);
    } catch {
      return null;
    }
  }).filter(Boolean) as ShippingCalculation[];
  
  // Sort by price (free shipping first, then by cost)
  return options.sort((a, b) => {
    if (a.isFree && !b.isFree) return -1;
    if (!a.isFree && b.isFree) return 1;
    return a.total - b.total;
  });
}

/**
 * Get the best shipping option (usually cheapest)
 */
export function getBestShippingOption(
  items: Array<{ productId: string; quantity: number; price: number }>,
  state: string
): ShippingCalculation | null {
  const options = getShippingOptions(items, state);
  return options.length > 0 ? options[0] : null;
}

/**
 * Format shipping cost for display
 */
export function formatShippingCost(calculation: ShippingCalculation): string {
  if (calculation.isFree) {
    return 'FREE';
  }
  return `$${calculation.total.toFixed(2)}`;
}

/**
 * Format delivery estimate for display
 */
export function formatDeliveryEstimate(calculation: ShippingCalculation): string {
  const method = calculation.method;
  
  if (method.deliveryDays.min === method.deliveryDays.max) {
    if (method.deliveryDays.min === 1) {
      return `Tomorrow by 8 PM`;
    }
    return `${method.deliveryDays.min} business days`;
  }
  
  return `${method.deliveryDays.min}-${method.deliveryDays.max} business days`;
}