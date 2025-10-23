import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Play, Pause, Volume2, VolumeX, Truck, Shield, Leaf } from 'lucide-react';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';


type SizeOption = { name: string; price: number; sku?: string };

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  features: string[];
  images: string[];
  image: string;
  video?: string;
  videoWebm?: string;
  videoPoster?: string;
  inStock: boolean;
  category: string;
  sizes?: SizeOption[];
  usage?: string[];
}

interface ProductDetailProps {
  product: Product;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();
  const galleryImages = product.images && product.images.length > 0 ? product.images : [product.image];
  // Prefer the generated video poster as the first gallery image when available
  const enrichedGallery = product.videoPoster ? [product.videoPoster, ...galleryImages] : galleryImages;

  // Auto-play video when component mounts (muted for better UX)
  useEffect(() => {
    if (videoRef.current && (product.video || product.videoWebm)) {
      const video = videoRef.current;
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          // Auto-play prevented, user will need to click play
        });
      }
    }
  }, [product.video, product.videoWebm]);

  // Use product sizes if available, otherwise determine based on category
  const isLiquid = product.category === 'Fertilizer' || product.category === 'Soil Amendment' || product.category === 'Lawn Care';
  const isCompost = product.category === 'Compost';

  // Prefer explicit product sizes when provided. Only fall back to heuristics when sizes are missing.
  const explicitSizes = product.sizes;
  const sizes: SizeOption[] = explicitSizes && explicitSizes.length > 0
    ? explicitSizes
    : (isLiquid
      ? [
          { name: '32 oz', price: +(product.price * 0.6).toFixed(2) },
          { name: '1 Gallon', price: +product.price.toFixed(2) },
          { name: '2.5 Gallon', price: +(product.price * 2.8).toFixed(2) }
        ]
      : isCompost
        ? [ { name: '10 lb', price: +product.price.toFixed(2) } ]
        : [ { name: '4 Quarts', price: +product.price.toFixed(2) } ]);

  const [selectedSize, setSelectedSize] = useState(sizes[0]?.name || '');

  const toggleVideo = () => {
    const video = videoRef.current;
    if (video) {
      if (isVideoPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = !video.muted;
      setIsVideoMuted(video.muted);
      if (!video.muted) {
        video.volume = 1;
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(() => {
            /* ignore */
          });
        }
      }
    }
  };

  const activeSize = sizes.find((size) => size.name === selectedSize);
  const currentPrice = activeSize?.price ?? product.price;

  const handleBuyNow = async () => {
    if (isSubmitting || !product.inStock) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (typeof window === 'undefined') {
        throw new Error('Checkout is only available in the browser.');
      }

      const payload = {
        productId: product.id,
        productName: product.name,
        productImage: (product.videoPoster ?? enrichedGallery[0] ?? product.image),
        sizeName: selectedSize,
        quantity,
        price: currentPrice,
        sku: activeSize?.sku,
      };

      window.sessionStorage.setItem('nws-checkout-selection', JSON.stringify(payload));
      await router.push('/checkout');
    } catch (error) {
      console.error('Unable to prepare checkout', error);
      alert('Unable to prepare checkout. Please reach out to support.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Product Video & Images Section - Video embedded directly */}
          <div className="space-y-4">
            {/* Main Video Display - Videos embedded directly when available */}
            {(product.video || product.videoWebm) ? (
              <div className="relative bg-black rounded-2xl overflow-hidden border border-gray-200 
                              aspect-video max-h-[70vh]">
                <video
                  ref={videoRef}
                  className="w-full h-full object-contain bg-black"
                  poster={product.videoPoster ?? galleryImages[0] ?? product.image}
                  muted={isVideoMuted}
                  crossOrigin="anonymous"
                  onPlay={() => setIsVideoPlaying(true)}
                  onPause={() => setIsVideoPlaying(false)}
                  onEnded={() => setIsVideoPlaying(false)}
                >
                  {product.videoWebm && (
                    <source src={product.videoWebm} type="video/webm" />
                  )}
                  {product.video && (
                    <source src={product.video} type="video/mp4" />
                  )}
                  Your browser does not support the video tag.
                </video>
                
                {/* Video Controls - Fully functional play/pause and mute controls */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <button
                    onClick={toggleVideo}
                    className="bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-colors shadow-lg"
                    aria-label={isVideoPlaying ? 'Pause video' : 'Play video'}
                  >
                    {isVideoPlaying ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5 ml-0.5" />
                    )}
                  </button>
                  
                  <button
                    onClick={toggleMute}
                    className="bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-colors shadow-lg"
                    aria-label={isVideoMuted ? 'Unmute video' : 'Mute video'}
                  >
                    {isVideoMuted ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Video info badge */}
                <div className="absolute top-4 left-4 bg-nature-green-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                  Product Video
                </div>
              </div>
            ) : (
              /* Fallback to image display when no video available */
              <div className="relative bg-white rounded-2xl overflow-hidden border border-gray-200 
                              aspect-[4/3] sm:aspect-[4/3] lg:aspect-[16/10] 2xl:aspect-[16/9] max-h-[70vh]">
                <Image
                  src={enrichedGallery[0]}
                  alt={product.name}
                  fill
                  className="object-contain lg:object-cover bg-white"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            <div>
              <p className="text-nature-green-600 font-medium text-sm uppercase tracking-wide">
                {product.category}
              </p>
              <h1 className="text-3xl font-bold text-gray-900 mt-2">
                {product.name}
              </h1>
            </div>

            {/* Price */}
            <div className="space-y-4">
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold text-gray-900">
                  ${currentPrice.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <span className="text-lg text-gray-500 line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
              
              {/* Size Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Size
                </label>
                <div className={`grid gap-3 ${sizes.length === 1 ? 'grid-cols-1' : sizes.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                  {sizes.map((size: SizeOption) => (
                    <button
                      key={size.name}
                      onClick={() => setSelectedSize(size.name)}
                      className={`p-3 text-sm font-medium rounded-lg border-2 transition-colors ${
                        selectedSize === size.name
                          ? 'border-nature-green-500 bg-nature-green-50 text-nature-green-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      aria-pressed={selectedSize === size.name}
                    >
                      <div>{size.name}</div>
                      <div className="text-xs text-gray-500">${size.price.toFixed(2)}</div>
                      {size.sku && <div className="text-[11px] text-gray-400 mt-1">SKU: {size.sku}</div>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 font-medium"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 font-medium"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="space-y-4">
              <button
                onClick={handleBuyNow}
                disabled={!product.inStock || isSubmitting}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-colors ${
                  product.inStock
                    ? 'bg-nature-green-600 hover:bg-nature-green-700 text-white disabled:hover:bg-nature-green-600'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                } disabled:opacity-70 disabled:cursor-not-allowed`}
              >
                {!product.inStock ? 'Out of Stock' : isSubmitting ? 'Redirecting...' : 'Buy Now with Stripe'}
              </button>
              
              <div className="text-sm text-gray-600 space-y-1 bg-gray-50 p-4 rounded-lg">
                <p>• Secure checkout with Stripe payment processing</p>
                <p>• Taxes and shipping (if applicable) handled during checkout</p>
                <p>• Selected size: {selectedSize} · Quantity: {quantity}</p>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div className="flex flex-col items-center space-y-1">
                  <Truck className="w-5 h-5 text-nature-green-600" />
                  <span className="text-gray-600">Free shipping over $50</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <Shield className="w-5 h-5 text-nature-green-600" />
                  <span className="text-gray-600">30-day guarantee</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <Leaf className="w-5 h-5 text-nature-green-600" />
                  <span className="text-gray-600">100% natural</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Description</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
              
              <h4 className="font-medium text-gray-900">Key Features:</h4>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-nature-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              {product.usage && product.usage.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">How to Use:</h4>
                  <ul className="space-y-2">
                    {product.usage.map((step, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-nature-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-600">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}