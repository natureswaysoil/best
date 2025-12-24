import { useEffect, useRef, useState } from "react";
import Link from "next/link";

function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()!.split(";").shift() || null;
  return null;
}
function setCookie(name: string, value: string, days = 365) {
  if (typeof document === "undefined") return;
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value}; expires=${d.toUTCString()}; path=/; SameSite=Lax`;
}

export default function HeroVideo() {
  const HERO_SRC = process.env.NEXT_PUBLIC_HERO_VIDEO_URL || "https://cdn.abacus.ai/images/c2e4e0e6-7b3e-4d0d-9848-33a1c938db27.png";
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const seen = getCookie("soundHintSeen");
    if (!seen) {
      setShowHint(true);
      const t = setTimeout(() => { setShowHint(false); setCookie("soundHintSeen", "1"); }, 6000);
      return () => clearTimeout(t);
    }
    
    // Force play on mount
    if (videoRef.current) {
      videoRef.current.muted = true;
      const playPromise = videoRef.current.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch((err) => {
          console.log("Autoplay prevented:", err);
        });
      }
    }
  }, []);

  const toggleMute = () => {
    const vid = videoRef.current;
    if (vid) {
      vid.muted = !vid.muted;
      setMuted(vid.muted);
      if (!vid.muted) {
        vid.volume = 1;
        setCookie("soundHintSeen", "1");
        setShowHint(false);
        const playPromise = vid.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => {
            /* ignore autoplay rejection */
          });
        }
      }
    }
  };

  return (
    <section className="relative h-[92vh] w-full overflow-hidden flex items-center justify-center">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        src={HERO_SRC}
        autoPlay
        loop
  muted
        playsInline
        preload="auto"
           crossOrigin="anonymous"
        aria-label="Nature&apos;s Way Soil hero video"
        onLoadedMetadata={() => {
          if (videoRef.current) {
            const playPromise = videoRef.current.play();
            if (playPromise && typeof playPromise.catch === "function") {
              playPromise.catch(() => {
                /* Ignore, user gesture required */
              });
            }
          }
        }}
      >
        <track kind="captions" src="/videos/website-hero.vtt" srcLang="en" label="English captions" default />
      </video>

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

      {/* Mute/Unmute */}
      <button
        onClick={toggleMute}
        className="absolute bottom-6 right-6 z-10 bg-black/55 hover:bg-black/70 text-white px-3 py-2 rounded-md text-sm backdrop-blur-sm border border-white/10"
        aria-label={muted ? "Unmute video" : "Mute video"}
      >
        {muted ? "Unmute" : "Mute"}
      </button>

      {/* First-visit hint */}
      {showHint && (
        <div
          className="absolute bottom-20 right-6 z-10 bg-black/70 text-white text-sm md:text-base px-3 py-2 rounded-md shadow-lg max-w-xs md:max-w-sm"
          role="status"
          onClick={() => { setShowHint(false); setCookie("soundHintSeen", "1"); }}
        >
          Tip: Tap <strong>Unmute</strong> to hear the ambiance.
        </div>
      )}
    </section>
  );
}
