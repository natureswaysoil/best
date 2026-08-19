import Image from 'next/image';
import { useState } from 'react';

export default function BlogImage({ src, alt, priority = false, className = '' }: { src?: string; alt: string; priority?: boolean; className?: string }) {
  const [failed, setFailed] = useState(!src);
  if (failed) {
    return <div role="img" aria-label={alt} className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-nature-green-800 via-nature-green-600 to-amber-600 ${className}`}><span className="px-6 text-center text-2xl font-bold text-white">Nature&apos;s Way Soil</span></div>;
  }
  return <Image src={src!} alt={alt} fill priority={priority} className={className} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" onError={() => setFailed(true)} />;
}
