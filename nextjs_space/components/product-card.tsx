
'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { Play, Pause, Clock, CheckCircle } from 'lucide-react';
import type { Product } from '@/lib/products';

interface ProductCardProps {
  product: Product;
  index: number;
}

export default function ProductCard({ product, index }: ProductCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-100px" });

  const toggleVideo = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'fertilizer':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'soil-amendment':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'lawn-care':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'specialty':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group"
    >
      <div className={`relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 ${
        isHovered ? 'transform -translate-y-2' : ''
      }`}>
        {/* Video Section */}
        <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            poster="/favicon.svg"
            preload="metadata"
            playsInline
            muted
          >
            <source src={`/${product.filename}`} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          
          {/* Video Overlay */}
          <div className={`absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            <motion.button
              onClick={toggleVideo}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="bg-white/90 hover:bg-white text-green-600 rounded-full p-4 shadow-lg transition-all duration-200"
            >
              {isPlaying ? (
                <Pause className="h-8 w-8" />
              ) : (
                <Play className="h-8 w-8 ml-1" />
              )}
            </motion.button>
          </div>

          {/* Duration Badge */}
          <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{product.duration}</span>
          </div>

          {/* Category Badge */}
          <div className="absolute top-4 left-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(product.category)}`}>
              {product.category.replace('-', ' ').toUpperCase()}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors duration-200">
            {product.name}
          </h3>
          
          <p className="text-gray-600 mb-4 leading-relaxed">
            {product.description}
          </p>

          {/* Key Points */}
          <div className="space-y-2 mb-6">
            {product.keyPoints.slice(0, 3).map((point, pointIndex) => (
              <motion.div
                key={pointIndex}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: 0.4, delay: (index * 0.1) + (pointIndex * 0.1) }}
                className="flex items-center space-x-2 text-sm text-gray-700"
              >
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>{point}</span>
              </motion.div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={toggleVideo}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span>{isPlaying ? 'Pause' : 'Watch Demo'}</span>
            </motion.button>
            
            <motion.a
              href="#contact"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white rounded-xl font-medium transition-all duration-200 text-center cursor-pointer"
            >
              Shop
            </motion.a>
          </div>
        </div>

        {/* Hover Glow Effect */}
        <div className={`absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-2xl transition-opacity duration-500 pointer-events-none ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`} />
      </div>
    </motion.div>
  );
}
