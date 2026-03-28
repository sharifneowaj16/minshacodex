'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, Menu, Package } from 'lucide-react';

export default function TopBar() {
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Hide top bar when scrolling down, show when at top
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      } else if (currentScrollY === 0) {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  return (
    <div className={`bg-white py-1 px-6 text-base text-black transition-all duration-300 ${
      isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
    }`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Left side shipping info */}
        <div className="flex-1 text-center md:text-left font-circular-std text-black">
          <span className="text-sm text-black flex items-center h-full">
            Free standard shipping on any 3500 taka purchase
          </span>
        </div>

        {/* Right side links */}
        <div className="hidden md:flex items-center space-x-8">
          <div className="relative group">
            <button
              className="flex items-center space-x-1 hover:text-black transition-colors font-circular-std text-black text-sm"
              onMouseEnter={() => setIsServicesOpen(true)}
              onMouseLeave={() => setIsServicesOpen(false)}
            >
              <span className="text-black">Join / Sign in</span>
              <ChevronDown className="w-3 h-3 text-black" />
            </button>

            {/* Dropdown menu */}
            {isServicesOpen && (
              <div
                className="absolute top-full right-0 mt-1 w-48 bg-white text-black rounded shadow-lg z-50 border border-gray-200"
                onMouseEnter={() => setIsServicesOpen(true)}
                onMouseLeave={() => setIsServicesOpen(false)}
              >
                <Link href="/login" className="block px-4 py-2 hover:bg-gray-50 text-sm font-circular-std text-black">Sign In</Link>
                <Link href="/register" className="block px-4 py-2 hover:bg-gray-50 text-sm font-circular-std text-black">Create Account</Link>
                <Link href="/rewards" className="block px-4 py-2 hover:bg-gray-50 text-sm font-circular-std text-black">Minsah Beauty Rewards®</Link>
              </div>
            )}
          </div>

          <Link href="/orders/track" className="hover:text-black transition-colors font-circular-std text-black text-sm">
            Track an Order
          </Link>

          <Link href="/community" className="hover:text-black transition-colors font-circular-std text-black text-sm">
            Community
          </Link>

          <Link href="/rewards" className="hover:text-black transition-colors font-circular-std font-medium text-black text-sm">
            Minsah Beauty Rewards®
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button className="text-black hover:text-black">
            <Menu className="w-4 h-4 text-black" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden mt-2 pt-2 border-t border-gray-200">
        <div className="flex flex-col space-y-2 text-xs">
          <Link href="/login" className="hover:text-black font-circular-std text-black">Sign In</Link>
          <Link href="/register" className="hover:text-black font-circular-std text-black">Create Account</Link>
          <Link href="/orders/track" className="hover:text-black font-circular-std text-black">Track an Order</Link>
          <Link href="/community" className="hover:text-black font-circular-std text-black">Community</Link>
          <Link href="/rewards" className="hover:text-black font-circular-std text-black">Minsah Beauty Rewards®</Link>
        </div>
      </div>
    </div>
  );
}
