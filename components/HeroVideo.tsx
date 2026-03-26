import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const YOUTUBE_ID = "RokXnrzFl3M";

export default function HeroVideoOptimized() {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!isPlaying) {
    return (
      <section className="relative h-[92vh] w-full overflow-hidden flex items-center justify-center">
        {/* Hero poster image - loads immediately, much lighter than YouTube iframe */}
        <Image
          src="/images/hero-poster.jpg"
          alt="Nature's Way Soil - Living Soil"
          fill
          priority
          quality={85}
          className="object-cover"
          sizes="100vw"
        />

        {/* Readability overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/25 to-black/40" />
        <div className="absolute inset-0 bg-green-900/10 mix-blend-multiply" />

        {/* Content */}
        <div className="relative z-10 text-center text-white px-4 md:px-8">
          <div className="mx-auto mb-4 w-fit text-white">
            <p className="text-base tracking-[0.35em] uppercase text-white/80">Nature&apos;s Way Soil</p>
            <p className="text-2xl md:text-4xl font-extrabold leading-tight">Living Soil Starts Here</p>
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]">
            Naturally Stronger Soil Starts Here
          </h1>
          <p className="mt-3 md:mt-4 text-base md:text-xl lg:text-2xl opacity-95 max-w-3xl mx-auto">
            Microbe-rich fertilizers, biochar, and compost from our family farm — safe for kids, pets, and pollinators.
          </p>
          <div className="mt-5 md:mt-7 flex items-center justify-center gap-3 md:gap-4">
            <Link href="/shop" className="inline-block bg-green-600 hover:bg-green-700 focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:outline-none px-6 md:px-7 py-3 md:py-3.5 rounded-2xl font-semibold shadow-lg transition-colors">
              Shop Now
            </Link>
            <Link href="/about" className="inline-block border border-white/70 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none px-6 md:px-7 py-3 md:py-3.5 rounded-2xl font-semibold transition-colors">
              Learn More
            </Link>
          </div>

          {/* Play video button */}
          <button
            onClick={() => setIsPlaying(true)}
            className="mt-8 group flex items-center justify-center gap-3 text-white/90 hover:text-white transition mx-auto"
            aria-label="Play video"
          >
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
              <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <span className="text-sm font-medium">Watch Our Story</span>
          </button>
        </div>
      </section>
    );
  }

  // Video is playing - render iframe (only loads when user clicks play)
  return (
    <section className="relative h-[92vh] w-full overflow-hidden flex items-center justify-center">
      {/* YouTube iframe - only loaded after user interaction */}
      <div className="absolute inset-0 w-full h-full">
        <iframe
          key="playing"
          className="absolute w-[300%] h-[300%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          src={`https://www.youtube.com/embed/${YOUTUBE_ID}?autoplay=1&loop=1&playlist=${YOUTUBE_ID}&controls=1&showinfo=0&rel=0&modestbranding=1`}
          allow="autoplay; encrypted-media"
          allowFullScreen
          title="Nature's Way Soil hero video"
          style={{ border: 0 }}
        />
      </div>

      {/* Close button */}
      <button
        onClick={() => setIsPlaying(false)}
        className="absolute top-6 right-6 z-10 bg-black/70 hover:bg-black/90 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-sm border border-white/20 transition-colors"
        aria-label="Close video"
      >
        ✕ Close Video
      </button>
    </section>
  );
}
