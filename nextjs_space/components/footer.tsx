
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, CheckCircle } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Youtube, href: '#', label: 'YouTube' },
  ];

  return (
    <footer className="bg-gradient-to-b from-green-900 to-green-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="relative">
                <Leaf className="h-10 w-10 text-green-400" />
                <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-amber-500 rounded-full" />
              </div>
              <div className="text-2xl font-bold">
                <span className="text-white">Nature's Way</span>
                <span className="text-amber-400 ml-1">Soil</span>
              </div>
            </div>
            
            <p className="text-green-100 text-lg mb-6 leading-relaxed max-w-md">
              Transform your garden with our premium organic fertilizers and soil amendments. 
              Professional-grade products for healthy, thriving plants.
            </p>

            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-green-200">
                <Mail className="h-5 w-5 flex-shrink-0" />
                <span>info@natureswaysoil.com</span>
              </div>
              <div className="flex items-center space-x-3 text-green-200">
                <Phone className="h-5 w-5 flex-shrink-0" />
                <span>1-800-NATURE-1</span>
              </div>
              <div className="flex items-center space-x-3 text-green-200">
                <MapPin className="h-5 w-5 flex-shrink-0" />
                <span>Growing Everywhere, Naturally</span>
              </div>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3 className="text-xl font-bold mb-6 text-white">Quick Links</h3>
            <ul className="space-y-3">
              {['Products', 'About Us', 'Contact', 'Resources'].map((link) => (
                <li key={link}>
                  <motion.a
                    href={`#${link.toLowerCase().replace(' ', '-')}`}
                    whileHover={{ x: 5 }}
                    className="text-green-200 hover:text-white transition-all duration-200 flex items-center space-x-2"
                  >
                    <span className="w-2 h-2 bg-green-400 rounded-full" />
                    <span>{link}</span>
                  </motion.a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-xl font-bold mb-6 text-white">Stay Connected</h3>
            <p className="text-green-200 mb-4">
              Get growing tips and product updates delivered to your inbox.
            </p>
            
            <form onSubmit={handleSubscribe} className="space-y-3">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-green-600 text-white placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-200"
                required
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubscribed}
                className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-70"
              >
                {isSubscribed ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Subscribed!</span>
                  </>
                ) : (
                  <span>Subscribe</span>
                )}
              </motion.button>
            </form>

            {/* Social Links */}
            <div className="flex space-x-4 mt-6">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  className="bg-white/10 hover:bg-green-600 p-3 rounded-full transition-all duration-200"
                  aria-label={label}
                >
                  <Icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="border-t border-green-700 py-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-green-300 text-center md:text-left">
              © {currentYear} Nature's Way Soil. All rights reserved. Growing naturally since 2009.
            </p>
            <div className="flex space-x-6 text-green-300">
              <motion.a
                href="#"
                whileHover={{ y: -2 }}
                className="hover:text-white transition-colors duration-200"
              >
                Contact
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
