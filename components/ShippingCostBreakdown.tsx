import React from 'react';

interface ShippingCostBreakdownProps {
  subtotal: number;
  shippingCost: number;
  shippingMethod?: string;
  isFreeShipping: boolean;
  className?: string;
}

const ShippingCostBreakdown: React.FC<ShippingCostBreakdownProps> = ({
  subtotal,
  shippingCost,
  shippingMethod,
  isFreeShipping,
  className = '',
}) => {
  const freeShippingThreshold = 50.00;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <div className={`shipping-cost-breakdown ${className}`}>
      {/* Current Order Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <h3 className="font-medium text-gray-900 mb-3">Order Summary</h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Shipping {shippingMethod && `(${shippingMethod})`}:</span>
            <span className={isFreeShipping ? 'text-green-600 font-medium' : ''}>
              {isFreeShipping ? 'FREE' : `$${shippingCost.toFixed(2)}`}
            </span>
          </div>
          
          <div className="border-t pt-2 flex justify-between font-medium">
            <span>Total:</span>
            <span>${(subtotal + (isFreeShipping ? 0 : shippingCost)).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Shipping Cost Explanation */}
      <div className="space-y-3">
        {isFreeShipping ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-green-500">✅</span>
              <span className="font-medium text-green-800">Free Shipping Applied!</span>
            </div>
            <p className="text-sm text-green-700">
              Your order is over $50, so shipping is completely free. No hidden fees!
            </p>
          </div>
        ) : (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-orange-500">📦</span>
              <span className="font-medium text-orange-800">Shipping Charges Apply</span>
            </div>
            <p className="text-sm text-orange-700 mb-2">
              Orders under $50 are charged shipping fees based on weight and delivery speed.
            </p>
            {amountToFreeShipping > 0 && (
              <p className="text-sm text-orange-800 font-medium">
                💡 Add ${amountToFreeShipping.toFixed(2)} more to get FREE shipping!
              </p>
            )}
          </div>
        )}

        {/* Shipping Threshold Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="font-medium text-blue-800 mb-2">Free Shipping Policy</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <div className="flex items-center gap-2">
              <span className={subtotal >= 50 ? 'text-green-500' : 'text-gray-400'}>
                {subtotal >= 50 ? '✅' : '○'}
              </span>
              <span><strong>Standard Shipping FREE over $50</strong></span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span>💰</span>
              <span>Expedited & overnight shipping are premium paid services</span>
            </div>
          </div>
        </div>

        {/* When You Pay Shipping */}
        {!isFreeShipping && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <h4 className="font-medium text-gray-800 mb-2">Why Am I Paying Shipping?</h4>
            <div className="text-sm text-gray-700 space-y-1">
              <p>• Your order is <strong>${subtotal.toFixed(2)}</strong> (under $50 free shipping threshold)</p>
              <p>• Shipping cost includes packaging, handling, and delivery</p>
              <p>• Cost calculated by weight, distance, and delivery speed</p>
              <p>• No markup - we pass carrier rates directly to you</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShippingCostBreakdown;