// Conversion Optimization Enhancements for Nature's Way Soil
// This script implements high-impact improvements identified in the audit
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

import { useEffect, useState } from 'react';

// Trust indicators component
export const TrustIndicators = ({ className = '' }: { className?: string }) => (
  <div className={`flex flex-wrap items-center gap-3 ${className}`}>
    <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5">
      <span className="text-green-600">🌱</span>
      <span className="text-sm font-medium text-green-800">Made Fresh This Week</span>
    </div>
    <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5">
      <span className="text-blue-600">🛡️</span>
      <span className="text-sm font-medium text-blue-800">Safe for Kids & Pets</span>
    </div>
    <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-1.5">
      <span className="text-orange-600">✅</span>
      <span className="text-sm font-medium text-orange-800">USDA Certified</span>
    </div>
  </div>
);

// Urgency banner component
export const UrgencyBanner = ({ product }: { product?: any }) => (
  <div className="bg-orange-100 border border-orange-300 rounded-lg p-3 mb-4">
    <div className="flex items-center justify-between">
      <span className="text-orange-800 font-medium">
        ⚡ Fresh Batch Alert: Made this week - ships within 24 hours!
      </span>
      {product?.inventory && product.inventory < 20 && (
        <span className="text-red-600 text-sm font-bold">
          Only {product.inventory} left!
        </span>
      )}
    </div>
  </div>
);

// Social proof component
export const SocialProof = ({ className = '' }: { className?: string }) => {
  const customerCount = 2847;
  const recentOrders = [
    { name: 'Sarah', location: 'Texas', product: 'Liquid Fertilizer', time: '2 hours ago' },
    { name: 'Mike', location: 'California', product: 'Living Compost', time: '4 hours ago' },
    { name: 'Lisa', location: 'Florida', product: 'Biochar', time: '6 hours ago' }
  ];

  const [currentOrder, setCurrentOrder] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentOrder((prev) => (prev + 1) % recentOrders.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [recentOrders.length]);

  return (
    <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="flex -space-x-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div 
              key={i}
              className="w-8 h-8 rounded-full border-2 border-white bg-green-200 flex items-center justify-center text-sm font-medium text-green-700"
            >
              {String.fromCharCode(65 + i)}
            </div>
          ))}
        </div>
        <span className="text-sm text-gray-700 font-medium">
          {customerCount.toLocaleString()} happy customers
        </span>
      </div>
      <p className="text-sm text-gray-600">
        <span className="font-medium">{recentOrders[currentOrder].name}</span> from{' '}
        <span className="font-medium">{recentOrders[currentOrder].location}</span> ordered{' '}
        <span className="font-medium">{recentOrders[currentOrder].product}</span>{' '}
        {recentOrders[currentOrder].time}
      </p>
    </div>
  );
};

// Enhanced pricing component
export const EnhancedPricing = ({ 
  price, 
  originalPrice, 
  size = '32 oz',
  freeShippingThreshold = 50 
}: {
  price: number;
  originalPrice?: number;
  size?: string;
  freeShippingThreshold?: number;
}) => {
  const savings = originalPrice ? originalPrice - price : 0;
  const remaining = freeShippingThreshold - price;

  return (
    <div className="pricing-section">
      {savings > 0 && (
        <div className="savings-highlight bg-red-100 border border-red-200 rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-red-800 font-medium">Limited Time Savings</span>
            <span className="bg-red-600 text-white px-2 py-1 rounded text-sm font-bold">
              Save ${savings.toFixed(2)}
            </span>
          </div>
        </div>
      )}
      
      <div className="price-display">
        <div className="flex items-baseline gap-3 mb-2">
          <span className="text-3xl font-bold text-green-600">${price.toFixed(2)}</span>
          {originalPrice && (
            <span className="text-lg text-gray-500 line-through">
              ${originalPrice.toFixed(2)}
            </span>
          )}
        </div>
        
        <div className="text-sm text-gray-600 mb-2">
          {size} - Makes 64 gallons of fertilizer = Only $0.33 per gallon!
        </div>
        
        {remaining > 0 && (
          <div className="shipping-info bg-blue-50 border border-blue-200 rounded p-2">
            <span className="text-blue-800 text-sm">
              📦 Add ${remaining.toFixed(2)} more for FREE shipping
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// Problem-solution format for product descriptions
export const ProblemSolutionBenefits = ({ 
  problems, 
  solutions, 
  results 
}: {
  problems: string[];
  solutions: string[];
  results: string[];
}) => (
  <div className="enhanced-description space-y-6">
    <div className="problem-section">
      <h4 className="font-semibold text-red-600 mb-3 flex items-center">
        <span className="mr-2">😞</span>
        Common Plant Problems:
      </h4>
      <ul className="space-y-1">
        {problems.map((problem, index) => (
          <li key={index} className="text-gray-600 flex items-start">
            <span className="mr-2 text-red-500">•</span>
            {problem}
          </li>
        ))}
      </ul>
    </div>
    
    <div className="solution-section">
      <h4 className="font-semibold text-blue-600 mb-3 flex items-center">
        <span className="mr-2">✅</span>
        This Product Solves:
      </h4>
      <ul className="space-y-1">
        {solutions.map((solution, index) => (
          <li key={index} className="text-gray-600 flex items-start">
            <span className="mr-2 text-blue-500">•</span>
            {solution}
          </li>
        ))}
      </ul>
    </div>
    
    <div className="results-section">
      <h4 className="font-semibold text-green-600 mb-3 flex items-center">
        <span className="mr-2">🌱</span>
        You'll See Results In:
      </h4>
      <ul className="space-y-1">
        {results.map((result, index) => (
          <li key={index} className="text-gray-600 flex items-start">
            <span className="mr-2 text-green-500">•</span>
            {result}
          </li>
        ))}
      </ul>
    </div>
  </div>
);

// Enhanced CTA button
export const EnhancedCTAButton = ({ 
  product,
  className = '',
  size = 'large'
}: {
  product?: any;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}) => {
  const sizeClasses = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg'
  };

  return (
    <div className={className}>
      <button className={`
        cta-button bg-green-600 hover:bg-green-700 text-white font-bold 
        rounded-lg w-full transform hover:scale-105 transition-all duration-200 
        ${sizeClasses[size]}
      `}>
        🌱 Get Healthier Plants in 7 Days - Order Now
      </button>
      
      <button className="secondary-cta border-2 border-green-600 text-green-600 hover:bg-green-50 py-3 px-6 rounded-lg font-medium w-full mt-3">
        📞 Call Us First - Free Growing Advice: (555) 123-4567
      </button>
    </div>
  );
};

// Money-back guarantee
export const MoneyBackGuarantee = ({ className = '' }: { className?: string }) => (
  <div className={`guarantee-section bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-2xl">🛡️</span>
      </div>
      <div>
        <h4 className="font-bold text-yellow-800 mb-1">60-Day Money-Back Guarantee</h4>
        <p className="text-yellow-700 text-sm">
          Not seeing results? We'll refund every penny. No questions asked.
        </p>
      </div>
    </div>
  </div>
);

// Exit intent popup (would be triggered by exit intent detection)
export const ExitIntentOffer = ({ 
  isVisible, 
  onClose 
}: { 
  isVisible: boolean; 
  onClose: () => void; 
}) => {
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  useEffect(() => {
    if (!isVisible) return;
    
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev > 0 ? prev - 1 : 0);
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
        
        <h3 className="text-2xl font-bold mb-3">Wait! Don't Miss Out! 🌱</h3>
        <p className="mb-4 text-gray-700">Get 15% off your first order + free growing guide</p>
        
        <div className="timer bg-red-100 p-3 rounded mb-4 border border-red-200">
          <span className="text-red-600 font-bold">
            ⏰ This offer expires in: {formatTime(timeLeft)}
          </span>
        </div>
        
        <input 
          type="email" 
          placeholder="Enter your email for instant discount"
          className="w-full p-3 border border-gray-300 rounded-lg mb-4"
        />
        <button className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700">
          Claim My 15% Discount
        </button>
        
        <p className="text-sm text-gray-600 mt-3">
          Join {(2847).toLocaleString()} gardeners getting weekly growing tips
        </p>
      </div>
    </div>
  );
};

// Sticky mobile CTA
export const StickyMobileCTA = ({ 
  product, 
  isVisible 
}: { 
  product: any; 
  isVisible: boolean; 
}) => {
  if (!isVisible) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40 shadow-lg">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="font-semibold text-green-600 text-lg">
            ${product?.price?.toFixed(2)}
          </div>
          <div className="text-sm text-gray-600">{product?.name}</div>
        </div>
        <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 flex-shrink-0">
          Add to Cart
        </button>
      </div>
    </div>
  );
};

// Conversion tracking utilities
export const trackConversion = (eventName: string, data: any = {}) => {
  // Google Analytics 4
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, {
      event_category: 'ecommerce',
      event_label: data.product_name || '',
      value: data.value || 0,
      currency: 'USD',
      ...data
    });
  }

  // Facebook Pixel
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', eventName, data);
  }

  console.log(`Conversion tracked: ${eventName}`, data);
};

// Product view tracking
export const trackProductView = (product: any) => {
  trackConversion('view_item', {
    currency: 'USD',
    value: product.price,
    items: [{
      item_id: product.id,
      item_name: product.name,
      category: product.category,
      quantity: 1,
      price: product.price
    }]
  });
};

// Add to cart tracking
export const trackAddToCart = (product: any, quantity = 1) => {
  trackConversion('add_to_cart', {
    currency: 'USD',
    value: product.price * quantity,
    items: [{
      item_id: product.id,
      item_name: product.name,
      category: product.category,
      quantity: quantity,
      price: product.price
    }]
  });
};

// Purchase tracking
export const trackPurchase = (orderId: string, items: any[], total: number) => {
  trackConversion('purchase', {
    transaction_id: orderId,
    value: total,
    currency: 'USD',
    items: items.map(item => ({
      item_id: item.id,
      item_name: item.name,
      category: item.category,
      quantity: item.quantity,
      price: item.price
    }))
  });
};