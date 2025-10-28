import React, { useState, useEffect } from 'react';
import { getShippingOptions, formatShippingCost, formatDeliveryEstimate, ShippingCalculation } from '../lib/shipping';

interface ShippingCalculatorProps {
  items: Array<{ productId: string; quantity: number; price: number }>;
  onShippingChange?: (shipping: ShippingCalculation | null) => void;
  className?: string;
}

const ShippingCalculator: React.FC<ShippingCalculatorProps> = ({
  items,
  onShippingChange,
  className = '',
}) => {
  const [zipCode, setZipCode] = useState('');
  const [state, setState] = useState('');
  const [shippingOptions, setShippingOptions] = useState<ShippingCalculation[]>([]);
  const [selectedOption, setSelectedOption] = useState<ShippingCalculation | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // US States for dropdown
  const US_STATES = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  useEffect(() => {
    const calculateRates = async () => {
      if (!state || items.length === 0) {
        setShippingOptions([]);
        setSelectedOption(null);
        return;
      }

      setIsCalculating(true);
      setError(null);

      try {
        const options = getShippingOptions(items, state);
        setShippingOptions(options);
        
        // Auto-select the best (cheapest) option
        const bestOption = options.length > 0 ? options[0] : null;
        setSelectedOption(bestOption);
        onShippingChange?.(bestOption);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to calculate shipping';
        setError(errorMessage);
        setShippingOptions([]);
        setSelectedOption(null);
        onShippingChange?.(null);
      } finally {
        setIsCalculating(false);
      }
    };

    calculateRates();
  }, [state, items, onShippingChange]);

  const handleOptionSelect = (option: ShippingCalculation) => {
    setSelectedOption(option);
    onShippingChange?.(option);
  };

  const getDeliveryIcon = (methodId: string) => {
    switch (methodId) {
      case 'overnight':
        return '⚡';
      case 'expedited':
        return '🚚';
      case 'standard':
        return '📦';
      case 'ground_saver':
        return '🐌';
      default:
        return '📦';
    }
  };

  return (
    <div className={`shipping-calculator bg-gray-50 rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        🚛 Shipping Options
      </h3>

      {/* Location Input */}
      <div className="mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label htmlFor="zip-code" className="block text-sm font-medium text-gray-700 mb-1">
              ZIP Code
            </label>
            <input
              id="zip-code"
              type="text"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              placeholder="12345"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              maxLength={5}
            />
          </div>
          
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <select
              id="state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Select State</option>
              {US_STATES.map(stateCode => (
                <option key={stateCode} value={stateCode}>{stateCode}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isCalculating && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Calculating shipping rates...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
          <p className="text-red-700 text-sm">❌ {error}</p>
        </div>
      )}

      {/* Shipping Options */}
      {!isCalculating && !error && shippingOptions.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 mb-3">
            Choose your preferred delivery method:
          </p>
          
          {shippingOptions.map((option, index) => (
            <div
              key={option.method.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedOption?.method.id === option.method.id
                  ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => handleOptionSelect(option)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shipping-method"
                    checked={selectedOption?.method.id === option.method.id}
                    onChange={() => handleOptionSelect(option)}
                    className="text-green-600 focus:ring-green-500"
                  />
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getDeliveryIcon(option.method.id)}</span>
                      <h4 className="font-medium text-gray-900">
                        {option.method.name}
                      </h4>
                      {index === 0 && option.isFree && (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                          POPULAR
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-1">
                      {option.method.description}
                    </p>
                    
                    <p className="text-sm text-gray-500 mt-1">
                      Arrives by {option.estimatedDelivery}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">
                    {formatShippingCost(option)}
                  </div>
                  
                  {option.isFree && (
                    <div className="text-xs text-green-600 font-medium">
                      Free shipping!
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500 mt-1">
                    {formatDeliveryEstimate(option)}
                  </div>
                </div>
              </div>
              
              {/* Shipping breakdown for selected option */}
              {selectedOption?.method.id === option.method.id && !option.isFree && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex justify-between">
                      <span>Base shipping:</span>
                      <span>${option.baseCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Weight-based:</span>
                      <span>${option.weightCost.toFixed(2)}</span>
                    </div>
                    {option.zoneCost > 0 && (
                      <div className="flex justify-between">
                        <span>Distance adjustment:</span>
                        <span>${option.zoneCost.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* No shipping available */}
      {!isCalculating && !error && state && shippingOptions.length === 0 && (
        <div className="text-center py-4">
          <p className="text-gray-600">No shipping options available for this location.</p>
        </div>
      )}

      {/* Free shipping promotion */}
      {!isCalculating && state && items.length > 0 && (
        <div className="mt-4">
          {(() => {
            const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
            const freeShippingThreshold = 50.00;
            
            if (subtotal >= freeShippingThreshold) {
              return (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800 font-medium">
                    🎉 <strong>Congratulations!</strong> Your order qualifies for FREE standard shipping!
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    Expedited and overnight shipping are premium paid options available above.
                  </p>
                </div>
              );
            } else {
              const needed = freeShippingThreshold - subtotal;
              return (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Add ${needed.toFixed(2)} more</strong> to your order to qualify for FREE standard shipping!
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Standard shipping FREE over $50 • Expedited & overnight are always paid premium options
                  </p>
                </div>
              );
            }
          })()}
        </div>
      )}
    </div>
  );
};

export default ShippingCalculator;