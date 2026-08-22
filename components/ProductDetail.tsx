import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Check, Leaf, Pause, Play, Shield, ShoppingCart, Tag, Truck, Volume2, VolumeX } from 'lucide-react';
import Layout from '../components/Layout';
import { addCartItem } from '../lib/cart';
import { FarmTransparency, WhyItWorks, HonestValue, PracticalGuidance, HelpfulContact, GentleGuarantee } from './AuthenticConversion';

type SizeOption = { name: string; price: number; sku?: string };
interface Product {
  id: string; name: string; price: number; originalPrice?: number; description: string;
  features: string[]; images: string[]; image: string; video?: string; videoWebm?: string;
  videoPoster?: string; inStock: boolean; category: string; sizes?: SizeOption[]; usage?: string[];
}
interface ProductDetailProps { product: Product }

export default function ProductDetail({ product }: ProductDetailProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [added, setAdded] = useState(false);

  const galleryImages = product.images?.length ? product.images : [product.image];
  const heroImage = product.videoPoster || galleryImages[0] || product.image;
  const explicitSizes = product.sizes?.length ? product.sizes : [{ name: 'Standard', price: product.price, sku: product.id }];
  const [selectedSize, setSelectedSize] = useState(explicitSizes[0]?.name || '');
  const activeSize = explicitSizes.find(s => s.name === selectedSize) || explicitSizes[0];
  const currentPrice = activeSize?.price ?? product.price;
  const totalPrice = currentPrice * quantity;
  const largestPrice = Math.max(...explicitSizes.map(s => s.price));
  const estimatedCouponSavings = totalPrice * 0.15;
  const estimatedAfterCoupon = totalPrice - estimatedCouponSavings;

  useEffect(() => {
    if (videoRef.current && (product.video || product.videoWebm)) videoRef.current.play().catch(() => undefined);
  }, [product.video, product.videoWebm]);

  const cartPayload = () => ({
    productId: product.id,
    productName: product.name,
    sizeName: selectedSize,
    sku: activeSize?.sku,
    image: heroImage,
    price: currentPrice,
    quantity
  });

  const handleAddToCart = () => {
    if (!product.inStock) return;
    addCartItem(cartPayload());
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  const handleBuyNow = async () => {
    if (isSubmitting || !product.inStock) return;
    setIsSubmitting(true);
    try {
      const payload = { ...cartPayload(), productImage: heroImage };
      window.sessionStorage.setItem('nws-checkout-selection', JSON.stringify(payload));
      await router.push('/checkout');
    } catch (error) {
      console.error('Unable to prepare checkout', error);
      alert('Unable to prepare checkout. Please reach out to support.');
    } finally { setIsSubmitting(false); }
  };

  const toggleVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play(); else video.pause();
  };
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsVideoMuted(video.muted);
  };

  return <Layout>
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-10 pb-28 md:pb-10">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        <div className="lg:sticky lg:top-24">
          {(product.video || product.videoWebm) ? <div className="relative bg-black rounded-2xl overflow-hidden border aspect-video">
            <video ref={videoRef} className="w-full h-full object-contain" poster={heroImage} muted={isVideoMuted} playsInline onPlay={() => setIsVideoPlaying(true)} onPause={() => setIsVideoPlaying(false)}>
              {product.videoWebm && <source src={product.videoWebm} type="video/webm" />}
              {product.video && <source src={product.video} type="video/mp4" />}
            </video>
            <div className="absolute bottom-3 left-3 right-3 flex justify-between">
              <button onClick={toggleVideo} aria-label={isVideoPlaying ? 'Pause video' : 'Play video'} className="bg-black/65 text-white p-3 rounded-full">{isVideoPlaying ? <Pause className="w-5 h-5"/> : <Play className="w-5 h-5"/>}</button>
              <button onClick={toggleMute} aria-label={isVideoMuted ? 'Unmute video' : 'Mute video'} className="bg-black/65 text-white p-3 rounded-full">{isVideoMuted ? <VolumeX className="w-5 h-5"/> : <Volume2 className="w-5 h-5"/>}</button>
            </div>
          </div> : <div className="relative aspect-square bg-white rounded-2xl border overflow-hidden"><Image src={heroImage} alt={product.name} fill className="object-contain p-4" sizes="(max-width:1024px) 100vw, 50vw" /></div>}
          <div className="grid grid-cols-3 gap-3 mt-4 text-center text-xs text-gray-700">
            <div className="border rounded-xl p-3"><Truck className="w-5 h-5 mx-auto text-nature-green-700 mb-1"/>Free shipping over $50</div>
            <div className="border rounded-xl p-3"><Shield className="w-5 h-5 mx-auto text-nature-green-700 mb-1"/>30-day guarantee</div>
            <div className="border rounded-xl p-3"><Leaf className="w-5 h-5 mx-auto text-nature-green-700 mb-1"/>Clear use directions</div>
          </div>
        </div>

        <div>
          <p className="text-sm uppercase tracking-widest font-bold text-nature-green-700 mb-2">{product.category}</p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">{product.name}</h1>
          <p className="text-lg text-gray-600 leading-relaxed mb-6">{product.description}</p>

          <div className="flex items-end gap-3 mb-3">
            <div><span className="text-sm text-gray-500">Selected price</span><div className="text-4xl font-bold text-gray-900">${currentPrice.toFixed(2)}</div></div>
            {product.originalPrice && <span className="text-lg text-gray-400 line-through mb-1">${product.originalPrice.toFixed(2)}</span>}
          </div>

          <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 flex gap-3">
            <Tag className="w-6 h-6 text-amber-700 flex-none mt-0.5" />
            <div>
              <p className="font-bold text-amber-950">Save 15% at checkout</p>
              <p className="text-sm text-amber-900">Apply your 15% coupon in the promotion-code box before payment.</p>
              <p className="text-sm font-semibold text-amber-950 mt-1">On this selection: save about ${estimatedCouponSavings.toFixed(2)} · about ${estimatedAfterCoupon.toFixed(2)} after coupon</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2"><label className="font-semibold text-gray-900">Choose size</label>{explicitSizes.length > 1 && <span className="text-xs font-semibold text-nature-green-700">Larger sizes = better value per ounce</span>}</div>
            <div className={`grid gap-3 ${explicitSizes.length >= 3 ? 'grid-cols-3' : explicitSizes.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {explicitSizes.map((size) => <button key={size.name} onClick={() => setSelectedSize(size.name)} className={`relative rounded-xl border-2 p-3 text-left ${selectedSize === size.name ? 'border-nature-green-600 bg-nature-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                {size.price === largestPrice && explicitSizes.length > 1 && <span className="absolute -top-2 right-2 bg-nature-green-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">BEST VALUE</span>}
                <div className="font-bold text-sm">{size.name}</div><div className="text-gray-700">${size.price.toFixed(2)}</div>
              </button>)}
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <span className="font-semibold">Quantity</span>
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 border rounded-lg text-lg">−</button>
            <span className="w-8 text-center font-bold">{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 border rounded-lg text-lg">+</button>
            <span className="ml-auto font-bold text-gray-900">Total ${totalPrice.toFixed(2)}</span>
          </div>

          <div className="space-y-3 mb-6">
            <button onClick={handleAddToCart} disabled={!product.inStock} className="w-full py-4 rounded-xl font-bold text-lg border-2 border-nature-green-700 text-nature-green-800 hover:bg-nature-green-50 disabled:opacity-50 flex items-center justify-center gap-2">
              {added ? <><Check className="w-5 h-5"/>Added to Cart</> : <><ShoppingCart className="w-5 h-5"/>Add to Cart — ${totalPrice.toFixed(2)}</>}
            </button>
            <button onClick={handleBuyNow} disabled={!product.inStock || isSubmitting} className="w-full py-4 rounded-xl font-bold text-lg bg-nature-green-700 hover:bg-nature-green-800 text-white disabled:opacity-50">
              {!product.inStock ? 'Out of Stock' : isSubmitting ? 'Opening Secure Checkout…' : `Buy Now — $${totalPrice.toFixed(2)}`}
            </button>
            <p className="text-center text-sm text-gray-500">Secure checkout · Apply 15% coupon before payment · Shipping shown before payment · No account required</p>
          </div>

          <div className="bg-gray-50 border rounded-2xl p-5 mb-8">
            <h2 className="font-bold text-lg mb-3">Why customers choose this product</h2>
            <ul className="space-y-2">{product.features.slice(0, 5).map((feature, i) => <li key={i} className="flex gap-2 text-gray-700"><Check className="w-5 h-5 text-nature-green-700 flex-none"/><span>{feature}</span></li>)}</ul>
          </div>

          {product.usage?.length ? <div className="border rounded-2xl p-5 mb-8"><h2 className="font-bold text-lg mb-3">How to use it</h2><ol className="space-y-3">{product.usage.map((step, i) => <li key={i} className="flex gap-3"><span className="w-7 h-7 rounded-full bg-nature-green-100 text-nature-green-800 font-bold flex items-center justify-center flex-none">{i + 1}</span><span className="text-gray-700">{step}</span></li>)}</ol></div> : null}
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-16 grid lg:grid-cols-2 gap-8">
        <div className="space-y-6"><FarmTransparency/><WhyItWorks product={product}/><PracticalGuidance product={product}/></div>
        <div className="space-y-6"><HonestValue product={product}/><HelpfulContact/><GentleGuarantee/></div>
      </div>
    </div>

    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-2xl px-4 py-3 flex items-center gap-3">
      <div className="flex-1 min-w-0"><div className="text-xs text-amber-700 font-semibold">15% coupon at checkout</div><div className="font-bold text-lg">${totalPrice.toFixed(2)}</div></div>
      <button onClick={handleAddToCart} disabled={!product.inStock} className="bg-nature-green-700 text-white font-bold px-5 py-3 rounded-xl">Add to Cart</button>
    </div>
  </Layout>;
}