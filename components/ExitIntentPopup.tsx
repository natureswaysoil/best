import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { X, Gift, ArrowRight } from 'lucide-react';
import { trackLeadCapture } from '../lib/ga4';

interface ExitIntentPopupProps {
  onClose?: () => void;
}

export default function ExitIntentPopup({ onClose }: ExitIntentPopupProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [email, setEmail] = useState('');
  const [couponClaimed, setCouponClaimed] = useState(false);
  const [couponCode, setCouponCode] = useState('SAVE15');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if popup has already been shown this session
    const popupShown = sessionStorage.getItem('exitPopupShown');
    if (popupShown) {
      setHasShown(true);
      return;
    }

    let exitTimer: NodeJS.Timeout;
    
    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if mouse leaves through the top of the window
      if (e.clientY <= 0 && !hasShown) {
        clearTimeout(exitTimer);
        exitTimer = setTimeout(() => {
          setIsVisible(true);
          setHasShown(true);
          sessionStorage.setItem('exitPopupShown', 'true');
        }, 100);
      }
    };

    const handleMouseEnter = () => {
      clearTimeout(exitTimer);
    };

    // Add event listeners
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Show popup after 60 seconds if not triggered by exit intent
    const timeoutShow = setTimeout(() => {
      if (!hasShown && !isVisible) {
        setIsVisible(true);
        setHasShown(true);
        sessionStorage.setItem('exitPopupShown', 'true');
      }
    }, 60000);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      clearTimeout(exitTimer);
      clearTimeout(timeoutShow);
    };
  }, [hasShown, isVisible]);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const searchParams = typeof window === 'undefined'
      ? new URLSearchParams()
      : new URLSearchParams(window.location.search);

    const nextCouponCode = generateCouponCode();

    try {
      const response = await fetch('/api/lead-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: 'exit_intent_popup',
          pagePath: router.asPath,
          couponCode: nextCouponCode,
          utmSource: searchParams.get('utm_source') || undefined,
          utmMedium: searchParams.get('utm_medium') || undefined,
          utmCampaign: searchParams.get('utm_campaign') || undefined,
        }),
      });

      if (!response.ok) {
        setError('Unable to claim your code right now. Please try again.');
        return;
      }

      trackLeadCapture({
        source: 'exit_intent_popup',
        page_path: router.asPath,
        coupon_code: nextCouponCode,
        utm_source: searchParams.get('utm_source') || undefined,
        utm_medium: searchParams.get('utm_medium') || undefined,
        utm_campaign: searchParams.get('utm_campaign') || undefined,
      });

      setCouponCode(nextCouponCode);
      setCouponClaimed(true);
      setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    } catch (submitError) {
      console.warn('Exit intent lead submit failed', submitError);
      setError('Unable to claim your code right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateCouponCode = () => {
    return 'SAVE15' + Math.random().toString(36).substr(2, 3).toUpperCase();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Popup Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden animate-slide-up">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close popup"
        >
          <X className="w-5 h-5" />
        </button>

        {!couponClaimed ? (
          <>
            {/* Header */}
            <div className="bg-gradient-to-r from-nature-green-600 to-nature-green-700 p-8 text-white text-center">
              <div className="flex justify-center mb-3">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                  <Gift className="w-10 h-10" />
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-2">Wait! Don't Leave Empty-Handed</h2>
              <p className="text-nature-green-100 text-xl">
                Get 15% off your first order of our premium soil products
              </p>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Join thousands of happy gardeners!
                </h3>
                <p className="text-gray-600">
                  Get your discount code and exclusive gardening tips delivered to your inbox.
                </p>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-nature-green-500 focus:border-transparent text-center"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span>{isSubmitting ? 'Claiming…' : 'Claim My 15% Discount'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
              {error && <p className="mt-3 text-center text-sm text-red-600">{error}</p>}

              <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-nature-green-500 rounded-full"></div>
                  <span>No spam</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-nature-green-500 rounded-full"></div>
                  <span>Unsubscribe anytime</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Success State */
          <div className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-nature-green-100 rounded-full flex items-center justify-center">
                <Gift className="w-8 h-8 text-nature-green-600" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Success! 🎉
            </h2>
            
            <div className="bg-nature-green-50 border-2 border-dashed border-nature-green-300 rounded-xl p-4 mb-4">
              <p className="text-sm text-nature-green-700 mb-2">Your discount code:</p>
              <p className="text-2xl font-mono font-bold text-nature-green-800 tracking-wider">
                {couponCode}
              </p>
            </div>
            
            <p className="text-gray-600 mb-4">
              We've sent this code to your email. Use it at checkout for 15% off!
            </p>
            
            <button
              onClick={handleClose}
              className="btn-primary"
            >
              Start Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}