import React from 'react';

interface FreeShippingProgressProps {
  currentTotal: number;
  threshold?: number;
  className?: string;
}

const FreeShippingProgress: React.FC<FreeShippingProgressProps> = ({
  currentTotal,
  threshold = 50.00,
  className = '',
}) => {
  const progress = Math.min((currentTotal / threshold) * 100, 100);
  const remaining = Math.max(threshold - currentTotal, 0);
  const isEligible = currentTotal >= threshold;

  return (
    <div className={`free-shipping-progress ${className}`}>
      {isEligible ? (
        // Success state - qualified for free shipping
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-green-500 text-lg">🎉</span>
            <span className="font-medium text-green-800">You qualify for FREE shipping!</span>
          </div>
          <div className="w-full bg-green-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full w-full"></div>
          </div>
          <p className="text-sm text-green-700 mt-2">
            Your order total of ${currentTotal.toFixed(2)} qualifies for free standard shipping.
          </p>
        </div>
      ) : (
        // Progress state - working toward free shipping
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-blue-800">
              Add ${remaining.toFixed(2)} more for FREE shipping
            </span>
            <span className="text-sm text-blue-600">
              ${currentTotal.toFixed(2)} / ${threshold.toFixed(2)}
            </span>
          </div>
          
          <div className="w-full bg-blue-200 rounded-full h-3 mb-2">
            <div 
              className="bg-blue-500 h-3 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <p className="text-sm text-blue-700">
            🚚 Standard shipping is FREE on orders over ${threshold.toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
};

export default FreeShippingProgress;