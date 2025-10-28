import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import ShippingCalculator from '../components/ShippingCalculator';
import ShippingCostBreakdown from '../components/ShippingCostBreakdown';
import FreeShippingProgress from '../components/FreeShippingProgress';
import { ShippingCalculation } from '../lib/shipping';

interface CheckoutItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image?: string;
  sku?: string;
}

interface OrderSummary {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

const EnhancedCheckout: React.FC = () => {
  const [items, setItems] = useState<CheckoutItem[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingCalculation | null>(null);
  const [orderSummary, setOrderSummary] = useState<OrderSummary>({
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0,
  });

  // Customer information
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
  });

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponApplied, setCouponApplied] = useState(false);

  // Load checkout items from localStorage or URL params
  useEffect(() => {
    // Try to load from localStorage first
    const savedSelection = localStorage.getItem('nws-checkout-selection');
    if (savedSelection) {
      try {
        const parsed = JSON.parse(savedSelection);
        const checkoutItem: CheckoutItem = {
          productId: parsed.productId,
          productName: parsed.productName,
          price: parsed.price,
          quantity: parsed.quantity || 1,
          image: parsed.productImage,
          sku: parsed.sku,
        };
        setItems([checkoutItem]);
      } catch (error) {
        console.error('Failed to parse checkout selection:', error);
      }
    }

    // Also check URL parameters for direct product checkout
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('product');
    const productName = urlParams.get('name');
    const price = urlParams.get('price');
    
    if (productId && productName && price) {
      const checkoutItem: CheckoutItem = {
        productId,
        productName,
        price: parseFloat(price),
        quantity: parseInt(urlParams.get('quantity') || '1'),
        sku: urlParams.get('sku') || undefined,
      };
      setItems([checkoutItem]);
    }
  }, []);

  // Calculate order summary when items or shipping changes
  useEffect(() => {
    const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = selectedShipping?.total || 0;
    const tax = calculateTax(subtotal, shipping, customerInfo.state);
    const total = subtotal + shipping + tax;

    setOrderSummary({
      subtotal,
      shipping,
      tax,
      total,
    });
  }, [items, selectedShipping, customerInfo.state]);

  // Simple tax calculation (you can enhance this)
  const calculateTax = (subtotal: number, shipping: number, state: string): number => {
    const taxRates: Record<string, number> = {
      'NC': 0.0475, // North Carolina
      'CA': 0.0725, // California
      'NY': 0.08,   // New York
      'TX': 0.0625, // Texas
      'FL': 0.06,   // Florida
    };
    
    const rate = taxRates[state] || 0;
    return Math.round((subtotal + shipping) * rate * 100) / 100;
  };

  const handleShippingChange = (shipping: ShippingCalculation | null) => {
    setSelectedShipping(shipping);
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setCouponError(null);
    
    try {
      const response = await fetch('/api/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim().toUpperCase(),
          subtotal: orderSummary.subtotal * 100, // Convert to cents
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.valid) {
        setCouponError(data.error || 'Invalid coupon code');
        setCouponDiscount(0);
        setCouponApplied(false);
        return;
      }

      setCouponDiscount(data.discount || 0);
      setCouponApplied(true);
      setCouponError(null);
    } catch (error) {
      console.error('Failed to validate coupon', error);
      setCouponError('Unable to validate coupon. Please try again.');
      setCouponDiscount(0);
      setCouponApplied(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponDiscount(0);
    setCouponApplied(false);
    setCouponError(null);
  };

  const handleCustomerInfoChange = (field: string, value: string) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCheckout = async () => {
    if (!selectedShipping) {
      alert('Please select a shipping method');
      return;
    }

    if (!customerInfo.name || !customerInfo.email || !customerInfo.address1 || !customerInfo.city || !customerInfo.state || !customerInfo.zipCode) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      // Create payment intent with shipping
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: items[0]?.productId,
          productName: items[0]?.productName,
          sizeName: items[0]?.sku,
          price: items[0]?.price,
          quantity: items[0]?.quantity,
          couponCode: couponApplied ? couponCode : undefined,
          couponDiscount: couponApplied ? couponDiscount : undefined,
          customer: {
            name: customerInfo.name,
            email: customerInfo.email,
            phone: customerInfo.phone,
          },
          address: {
            line1: customerInfo.address1,
            line2: customerInfo.address2,
            city: customerInfo.city,
            state: customerInfo.state,
            postal_code: customerInfo.zipCode,
          },
          shippingMethod: selectedShipping.method.id,
          shippingCost: selectedShipping.total,
        }),
      });

      const data = await response.json();
      
      if (data.clientSecret) {
        // Redirect to Stripe checkout or handle payment here
        console.log('Payment intent created:', data);
        alert('Payment processing would happen here');
      } else {
        throw new Error(data.error || 'Failed to create payment intent');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Checkout failed. Please try again.');
    }
  };

  if (items.length === 0) {
    return (
      <Layout>
        <Head>
          <title>Checkout - Nature&apos;s Way Soil</title>
        </Head>
        
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
              <p className="text-gray-600 mb-8">Add some products to your cart to continue with checkout.</p>
              <Link 
                href="/shop" 
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Checkout - Nature&apos;s Way Soil</title>
      </Head>
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Free Shipping Progress */}
              <div className="bg-white rounded-lg shadow p-6">
                <FreeShippingProgress currentTotal={orderSummary.subtotal} />
              </div>
              
              {/* Customer Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={customerInfo.name}
                      onChange={(e) => handleCustomerInfoChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => handleCustomerInfoChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      value={customerInfo.address1}
                      onChange={(e) => handleCustomerInfoChange('address1', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Apartment, Suite, etc.
                    </label>
                    <input
                      type="text"
                      value={customerInfo.address2}
                      onChange={(e) => handleCustomerInfoChange('address2', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        value={customerInfo.city}
                        onChange={(e) => handleCustomerInfoChange('city', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State *
                      </label>
                      <select
                        value={customerInfo.state}
                        onChange={(e) => handleCustomerInfoChange('state', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      >
                        <option value="">Select State</option>
                        {['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'].map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        value={customerInfo.zipCode}
                        onChange={(e) => handleCustomerInfoChange('zipCode', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Calculator */}
              <div className="bg-white rounded-lg shadow">
                <ShippingCalculator
                  items={items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price,
                  }))}
                  onShippingChange={handleShippingChange}
                  className="border-0 bg-transparent"
                />
              </div>

              {/* Coupon Code Section */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">💰 Have a coupon code?</h3>
                {!couponApplied ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter coupon code (e.g., SAVE15ABC)"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button
                      type="button"
                      onClick={applyCoupon}
                      className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-md p-3">
                    <div className="flex items-center text-green-700">
                      <span className="font-medium">✅ Coupon "{couponCode}" applied!</span>
                      <span className="ml-2">Save ${(couponDiscount / 100).toFixed(2)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-red-600 hover:text-red-700 underline"
                    >
                      Remove
                    </button>
                  </div>
                )}
                {couponError && (
                  <p className="text-red-600 text-sm mt-2">{couponError}</p>
                )}
              </div>

              {/* Shipping Cost Breakdown */}
              {selectedShipping && (
                <div className="bg-white rounded-lg shadow p-6">
                  <ShippingCostBreakdown
                    subtotal={orderSummary.subtotal}
                    shippingCost={selectedShipping.total}
                    shippingMethod={selectedShipping.method.name}
                    isFreeShipping={selectedShipping.isFree}
                  />
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-8">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                
                {/* Order Items */}
                <div className="space-y-4 mb-6">
                  {items.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      {item.image && (
                        <img 
                          src={item.image} 
                          alt={item.productName}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">{item.productName}</h3>
                        <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Totals */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${orderSummary.subtotal.toFixed(2)}</span>
                  </div>
                  
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({couponCode}):</span>
                      <span>-${(couponDiscount / 100).toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>
                      {selectedShipping?.isFree ? 'FREE' : `$${orderSummary.shipping.toFixed(2)}`}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>${orderSummary.tax.toFixed(2)}</span>
                  </div>
                  
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>${(orderSummary.total - (couponDiscount / 100)).toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={!selectedShipping}
                  className="w-full mt-6 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-md transition-colors"
                >
                  {selectedShipping ? 'Proceed to Payment' : 'Select Shipping Method'}
                </button>

                {/* Security Notice */}
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">
                    🔒 Secure checkout powered by Stripe
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EnhancedCheckout;