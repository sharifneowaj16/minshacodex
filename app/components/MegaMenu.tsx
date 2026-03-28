"use client";
import Link from 'next/link';
import { categories } from '@/data/categories';
import { useState, useRef, useEffect } from 'react';
import { Package } from 'lucide-react';
import { formatPriceFromUSD } from '@/utils/currency';

// Featured products data for each category (prices in USD, will be converted to BDT)
const featuredProducts = {
  "Make Up": [
    { name: 'Velvet Matte Lipstick', image: '/api/placeholder/300/200', price: 24.99, href: '#' },
    { name: 'Glow Foundation SPF 30', image: '/api/placeholder/300/200', price: 42.99, href: '#' }
  ],
  "Skin care": [
    { name: 'Vitamin C Serum', image: '/api/placeholder/300/200', price: 36.99, href: '#' },
    { name: 'Hydrating Night Cream', image: '/api/placeholder/300/200', price: 28.99, href: '#' }
  ],
  "Hair care": [
    { name: 'Repair Shampoo', image: '/api/placeholder/300/200', price: 18.99, href: '#' },
    { name: 'Silk Hair Oil', image: '/api/placeholder/300/200', price: 22.99, href: '#' }
  ],
  "SPA": [
    { name: 'Rose Body Butter', image: '/api/placeholder/300/200', price: 19.99, href: '#' },
    { name: 'Exfoliating Scrub', image: '/api/placeholder/300/200', price: 16.99, href: '#' }
  ]
};

interface Category {
  name: string;
  href: string;
  subcategories: Array<{
    name: string;
    items: string[];
  }>;
}

interface MenuItemProps {
  category: Category;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ category, isOpen, onToggle, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle mouse enter with delay to prevent flickering
  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // Add small delay to prevent flickering
    timeoutRef.current = setTimeout(() => {
      onToggle();
    }, 50);
  };

  // Handle mouse leave with delay for smoother interaction
  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // Close after 300ms if mouse hasn't returned
    timeoutRef.current = setTimeout(() => {
      onClose();
    }, 300);
  };

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isOpen, onClose]);

  const featuredItems = featuredProducts[category.name as keyof typeof featuredProducts] || [];

  return (
    <div
      ref={menuRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Category Button with Arrow Indicator */}
      <button
        className={`
          text-sm font-medium transition-all duration-200 relative group
          ${isOpen ? 'text-black border-b border-black' : 'text-black hover:text-black/80'}
        `}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {category.name}
      </button>

      {/* Mega Menu Panel with Animation */}
      {isOpen && (
        <div
          className="absolute left-1/2 z-50 mt-3 w-screen max-w-6xl -translate-x-1/2 transform px-4"
          style={{
            animation: 'slideDown 0.3s ease-out, fadeIn 0.3s ease-out'
          }}
        >
          <div className="overflow-hidden rounded-2xl shadow-2xl ring-1 ring-gray-900/5" style={{ backgroundColor: 'rgba(252, 237, 234, 0.98)' }}>
            <div className="p-8">
              <div className="grid grid-cols-4 gap-8">
                {/* Subcategories Column */}
                {category.subcategories.map((sub, index) => (
                  <div key={sub.name} className="space-y-4">
                    {/* Subcategory Header */}
                    <h3 className="text-sm font-semibold text-black group-hover:text-black/80 transition-colors">
                      <Link
                        href={`${category.href}&subcategory=${sub.name.toLowerCase()}`}
                        className="block focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 rounded px-1 -mx-1"
                      >
                        {sub.name}
                      </Link>
                    </h3>

                    {/* Subcategory Items */}
                    <ul className="space-y-3">
                      {sub.items.map((item) => (
                        <li key={item}>
                          <Link
                            href={`${category.href}&subcategory=${item.toLowerCase().replace(/ /g, '-')}`}
                            className="
                              block text-sm text-black
                              hover:text-black/80 hover:bg-white/50
                              transition-all duration-200 rounded px-2 py-1 -mx-2
                              focus:outline-none focus:ring-2 focus:ring-offset-2
                            "
                          >
                            {item}
                          </Link>
                        </li>
                      ))}
                    </ul>

                    {/* View All Link */}
                    <div className="pt-3 border-t border-black/10">
                      <Link
                        href={`${category.href}&subcategory=${sub.name.toLowerCase()}`}
                        className="
                          inline-flex items-center text-sm font-medium text-black
                          hover:text-black/80 transition-colors
                          focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 rounded px-2 py-1 -mx-2
                        "
                      >
                        View All {sub.name}
                        <svg className="ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                ))}

                {/* Featured Products Section */}
                <div className="col-span-1 bg-white/60 rounded-xl p-6">
                  <h4 className="text-sm font-semibold text-black mb-4">
                    Top Picks in {category.name}
                  </h4>
                  <div className="space-y-4">
                    {featuredItems.map((product, index) => (
                      <Link
                        key={product.name}
                        href={product.href}
                        className="
                          block group focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 rounded-lg p-2 -m-2
                        "
                      >
                        <div className="relative overflow-hidden rounded-lg mb-3">
                          <div className="w-full h-24 bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                            <Package className="w-12 h-12 text-pink-400" />
                          </div>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
                        </div>
                        <h5 className="text-sm font-medium text-black group-hover:text-black/80 transition-colors">
                          {product.name}
                        </h5>
                        <p className="text-sm font-semibold text-black">{formatPriceFromUSD(product.price)}</p>
                      </Link>
                    ))}
                  </div>

                  {/* Shop All Button */}
                  <div className="mt-6 pt-4 border-t border-black/10">
                    <Link
                      href={category.href}
                      className="
                        inline-flex items-center justify-center w-full px-4 py-2
                        bg-black text-white text-sm font-medium
                        hover:bg-black/90 transition-colors duration-200
                        rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2
                      "
                    >
                      Shop All {category.name}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function MegaMenu() {
  // Track open menu state - only one menu can be open at a time
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const handleToggle = (categoryName: string) => {
    setOpenCategory(openCategory === categoryName ? categoryName : categoryName);
  };

  const handleClose = () => {
    setOpenCategory(null);
  };

  return (
    <>
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translate(-50%, -10px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>

      <div className="hidden lg:flex space-x-8">
        {categories.map((category) => (
          <MenuItem
            key={category.name}
            category={category}
            isOpen={openCategory === category.name}
            onToggle={() => handleToggle(category.name)}
            onClose={handleClose}
          />
        ))}
      </div>
    </>
  );
}
