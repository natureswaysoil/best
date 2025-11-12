
'use client';

import { motion } from 'framer-motion';
import { Leaf, Droplets, Sprout, Star } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with Parallax Effect */}
      <motion.div
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 bg-gradient-to-br from-green-900 via-green-800 to-emerald-900"
      >
        <div className="absolute inset-0 bg-black/20" />
        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 opacity-10">
          <Leaf className="h-32 w-32 text-white transform rotate-12" />
        </div>
        <div className="absolute bottom-20 right-16 opacity-10">
          <Sprout className="h-24 w-24 text-white transform -rotate-12" />
        </div>
        <div className="absolute top-1/3 right-10 opacity-10">
          <Droplets className="h-20 w-20 text-white" />
        </div>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="relative"
            >
              <Leaf className="h-16 w-16 text-green-400" />
              <div className="absolute -bottom-2 -right-2 h-6 w-6 bg-amber-500 rounded-full flex items-center justify-center">
                <Star className="h-3 w-3 text-white" />
              </div>
            </motion.div>
          </div>
          
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6"
          >
            Nature's Way
            <span className="block text-green-400 mt-2">Soil</span>
          </motion.h1>
          
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl sm:text-2xl text-green-100 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Professional-grade organic fertilizers and soil amendments that transform your garden into a thriving ecosystem
          </motion.p>
          
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <motion.a
              href="#products"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer"
            >
              Explore Products
            </motion.a>
            <motion.a
              href="#products"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="border-2 border-white text-white hover:bg-white hover:text-green-800 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-200 cursor-pointer"
            >
              Watch Videos
            </motion.a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
          >
            {[
              { number: '12', label: 'Premium Products' },
              { number: '100%', label: 'Organic Certified' },
              { number: '50k+', label: 'Happy Customers' },
              { number: '15+', label: 'Years Experience' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="text-center"
              >
                <div className="text-3xl sm:text-4xl font-bold text-green-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-green-100 text-sm sm:text-base">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
