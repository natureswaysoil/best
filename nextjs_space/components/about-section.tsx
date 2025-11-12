
'use client';

import { motion } from 'framer-motion';
import { Leaf, Award, Users, Target, Sprout, Heart } from 'lucide-react';

export default function AboutSection() {
  const features = [
    {
      icon: Award,
      title: '100% Organic Certified',
      description: 'All our products are USDA certified organic, ensuring the highest quality and environmental safety.'
    },
    {
      icon: Users,
      title: '50,000+ Happy Customers',
      description: 'Trusted by gardeners, farmers, and landscapers across the country for over 15 years.'
    },
    {
      icon: Target,
      title: 'Science-Based Solutions',
      description: 'Our formulations are developed using the latest agricultural science and proven field results.'
    },
    {
      icon: Heart,
      title: 'Environmentally Safe',
      description: 'Safe for pets, children, and beneficial insects while being tough on plant nutrition needs.'
    }
  ];

  const stats = [
    { number: '15+', label: 'Years of Excellence' },
    { number: '12', label: 'Premium Products' },
    { number: '50K+', label: 'Satisfied Customers' },
    { number: '100%', label: 'Organic Promise' }
  ];

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Why Choose
            <span className="text-green-600 block mt-2">Nature's Way Soil?</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We're passionate about creating premium organic solutions that help your plants thrive naturally, 
            while protecting our environment for future generations.
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-16">
          {/* Left Column - Story */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="relative">
                <Sprout className="h-12 w-12 text-green-600" />
                <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-amber-500 rounded-full" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Our Story</h3>
            </div>
            
            <p className="text-gray-700 leading-relaxed text-lg">
              Founded in 2009, Nature's Way Soil began with a simple mission: to create the highest quality 
              organic fertilizers and soil amendments that work in harmony with nature. Our journey started 
              when our founder, a third-generation farmer, recognized the need for truly effective organic solutions.
            </p>
            
            <p className="text-gray-700 leading-relaxed text-lg">
              Today, we're proud to offer 12 premium products that have transformed gardens, farms, and landscapes 
              across the country. Each formula is carefully crafted using time-tested organic ingredients combined 
              with modern agricultural science.
            </p>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-green-50 border-l-4 border-green-600 p-6 rounded-r-lg"
            >
              <p className="text-green-800 font-medium italic">
                "Our commitment is simple: provide products that are safe for your family, 
                effective for your plants, and gentle on our planet."
              </p>
              <p className="text-green-700 mt-2 font-semibold">— The Nature's Way Soil Team</p>
            </motion.div>
          </motion.div>

          {/* Right Column - Features */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 p-3 rounded-lg flex-shrink-0">
                    <feature.icon className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h4>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 md:p-12"
        >
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-white mb-4">Trusted by Gardeners Everywhere</h3>
            <p className="text-green-100 text-lg max-w-2xl mx-auto">
              Our commitment to quality and results has earned the trust of thousands of gardeners, 
              farmers, and landscaping professionals.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-green-100 text-sm md:text-base font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
