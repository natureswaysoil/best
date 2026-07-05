export type ShippingPreset = {
  weightLbs: number;
  lengthIn?: number;
  widthIn?: number;
  heightIn?: number;
};

const DEFAULT_DIMENSIONS = {
  lengthIn: 12,
  widthIn: 9,
  heightIn: 6,
};

export function getShippingPreset(sizeName?: string | null, sku?: string | null, productName?: string | null): ShippingPreset {
  const haystack = `${sizeName || ''} ${sku || ''} ${productName || ''}`.toLowerCase();

  if (haystack.includes('2.5') || haystack.includes('25gal') || haystack.includes('2-5') || haystack.includes('2 1/2')) {
    return {
      weightLbs: 25,
      lengthIn: 16,
      widthIn: 12,
      heightIn: 12,
    };
  }

  if (haystack.includes('gallon') || haystack.includes('1gal') || haystack.includes('1 gal')) {
    return {
      weightLbs: 8,
      lengthIn: 12,
      widthIn: 9,
      heightIn: 6,
    };
  }

  if (haystack.includes('32') || haystack.includes('32oz') || haystack.includes('32 oz')) {
    return {
      weightLbs: 3,
      lengthIn: 10,
      widthIn: 6,
      heightIn: 4,
    };
  }

  return {
    weightLbs: 8,
    ...DEFAULT_DIMENSIONS,
  };
}
