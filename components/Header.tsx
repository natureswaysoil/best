import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Mail } from 'lucide-react';

interface HeaderProps {
  transparent?: boolean;
}

export default function Header({ transparent = false }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'Blog', href: '/blog' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      transparent ? 'bg-transparent' : 'bg-white shadow-md'
    }`}>
      {/* Top bar with contact info */}
      <div className={`${transparent ? 'bg-black/20 backdrop-blur-sm' : 'bg-nature-green-50'} py-2 text-sm`}>
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-1 ${transparent ? 'text-white' : 'text-nature-green-700'}`}>
              <Mail className="w-4 h-4" />
              <span>support@natureswaysoil.com</span>
            </div>
          </div>
          <div className={`text-xs ${transparent ? 'text-white/90' : 'text-nature-green-600'}`}>
            Free shipping on orders over $50!
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div>
              <p className={`text-xl md:text-2xl font-extrabold tracking-tight ${transparent ? 'text-white' : 'text-soil-brown-900'}`}>
                Nature&apos;s Way Soil
              </p>
              <p className={`text-xs uppercase tracking-[0.25em] ${transparent ? 'text-white/70' : 'text-nature-green-600'}`}>
                Family Farm Since 1955
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`font-medium transition-colors duration-200 ${
                  transparent 
                    ? 'text-white hover:text-nature-green-200' 
                    : 'text-gray-700 hover:text-nature-green-600'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/contact"
              className={`flex items-center space-x-1 font-medium transition-colors duration-200 ${
                transparent 
                  ? 'text-white hover:text-nature-green-200' 
                  : 'text-gray-700 hover:text-nature-green-600'
              }`}
            >
              <Mail className="w-5 h-5" />
              <span>Email Us</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`md:hidden p-2 rounded-md ${
              transparent ? 'text-white' : 'text-gray-700'
            }`}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className={`md:hidden mt-4 py-4 border-t ${
            transparent ? 'border-white/20 bg-black/20 backdrop-blur-sm' : 'border-gray-200 bg-white'
          }`}>
            <div className="flex flex-col space-y-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`font-medium py-2 transition-colors duration-200 ${
                    transparent 
                      ? 'text-white hover:text-nature-green-200' 
                      : 'text-gray-700 hover:text-nature-green-600'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                href="/contact"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center space-x-1 font-medium py-2 transition-colors duration-200 ${
                  transparent 
                    ? 'text-white hover:text-nature-green-200' 
                    : 'text-gray-700 hover:text-nature-green-600'
                }`}
              >
                <Mail className="w-5 h-5" />
                <span>Email Us</span>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}