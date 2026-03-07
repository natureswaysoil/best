import { useState } from "react";
import Link from "next/link";

const YOUTUBE_ID = "RokXnrzFl3M";

export default function HeroVideo() {
  const [muted, setMuted] = useState(true);

  // Rebuild iframe src to toggle mute
  const iframeSrc = `https://www.youtube.com/embed/${YOUTUBE_ID}?autoplay=1&loop=1&playlist=${YOUTUBE_ID}&controls=0&showinfo=0&rel=0&modestbranding=1&mute=${muted ? 1 : 0}&playsinline=1`;

  return (
    <section className="relative h-[92vh] w-full overflow-hidden flex items-center justify-center">
      {/* YouTube iframe as fullscreen background */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <iframe
          key={String(muted)}
          className="absolute w-[300%] h-[300%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          src={iframeSrc}
          allow="autoplay; encrypted-media"
          allowFullScreen
          title="Nature's Way Soil hero video"
          style={{ border: 0 }}
        />
      </div>

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
          <Link href="/shop" className="inline-block bg-green-600 hover:bg-green-700 focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:outline-none px-6 md:px-7 py-3 md:py-3.5 rounded-2xl font-semibold shadow-lg">
            Shop Now
          </Link>
          <Link href="/about" className="inline-block border border-white/70 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none px-6 md:px-7 py-3 md:py-3.5 rounded-2xl font-semibold">
            Learn More
          </Link>
        </div>
      </div>

      {/* Mute/Unmute button */}
      <button
        onClick={() => setMuted(m => !m)}
        className="absolute bottom-6 right-6 z-10 bg-black/55 hover:bg-black/70 text-white px-3 py-2 rounded-md text-sm backdrop-blur-sm border border-white/10"
        aria-label={muted ? "Unmute video" : "Mute video"}
      >
        {muted ? "🔇 Unmute" : "🔊 Mute"}
      </button>
    </section>
  );
}
