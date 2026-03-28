'use client';

import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import { useState } from 'react';
import { Search, ShoppingCart, Heart, Home, User, ChevronLeft, ChevronRight } from 'lucide-react';

const brandCategories = ['All', 'Makeup', 'Skincare', 'Hair Care', 'Fragrance'];

const brands = [
  { id: '1', name: 'Fenty Beauty', logo: '💄', productCount: 145, category: 'Makeup' },
  { id: '2', name: 'The Ordinary', logo: '✨', productCount: 89, category: 'Skincare' },
  { id: '3', name: 'Huda Beauty', logo: '💋', productCount: 203, category: 'Makeup' },
  { id: '4', name: 'Estée Lauder', logo: '👑', productCount: 178, category: 'Makeup' },
  { id: '5', name: 'Olaplex', logo: '🧴', productCount: 67, category: 'Hair Care' },
  { id: '6', name: 'Charlotte Tilbury', logo: '💎', productCount: 156, category: 'Makeup' },
  { id: '7', name: 'Dior', logo: '🌟', productCount: 234, category: 'Fragrance' },
  { id: '8', name: 'MAC Cosmetics', logo: '💅', productCount: 312, category: 'Makeup' },
  { id: '9', name: 'Anastasia Beverly Hills', logo: '🎨', productCount: 128, category: 'Makeup' },
  { id: '10', name: 'NARS', logo: '✨', productCount: 189, category: 'Makeup' },
  { id: '11', name: 'Moroccanoil', logo: '🥥', productCount: 45, category: 'Hair Care' },
  { id: '12', name: 'Giorgio Armani', logo: '🌺', productCount: 167, category: 'Fragrance' },
];

export default function BrandsPage() {
  const { items } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBrands = selectedCategory === 'All'
    ? brands
    : brands.filter(brand => brand.category === selectedCategory);

  return (
    <div className="min-h-screen bg-minsah-light pb-20">
      {/* Header Banner */}
      <div className="bg-minsah-primary text-minsah-light text-center py-2 text-xs">
        Free Shipping on all order above 100 $. Free Shipping on all orders
      </div>

      {/* Header */}
      <header className="bg-minsah-accent sticky top-0 z-50 shadow-sm">
        <div className="px-4 py-3">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-3">
            <Link href="/" className="p-2 -ml-2">
              <ChevronLeft size={24} className="text-minsah-dark" />
            </Link>
            <span className="text-xs text-minsah-secondary">9:41</span>
          </div>

          {/* Search and Cart */}
          <div className="flex items-center gap-3 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-minsah-secondary" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search brands"
                className="w-full pl-10 pr-4 py-2 bg-white text-minsah-dark placeholder:text-minsah-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-minsah-primary border border-minsah-secondary/20"
              />
            </div>
            <Link href="/cart" className="relative p-2 bg-white rounded-lg">
              <ShoppingCart size={20} className="text-minsah-dark" />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {brandCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  selectedCategory === category
                    ? 'bg-minsah-primary text-white'
                    : 'bg-white text-minsah-dark border border-minsah-secondary/30'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Page Title */}
      <div className="px-4 py-4 bg-white">
        <h1 className="text-2xl font-bold text-minsah-dark">Popular Brands</h1>
        <p className="text-sm text-minsah-secondary mt-1">Discover top beauty brands from around the world</p>
      </div>

      {/* Brands Grid */}
      <div className="px-4 py-6">
        <div className="grid grid-cols-2 gap-4">
          {filteredBrands.map((brand) => (
            <Link
              key={brand.id}
              href={`/brands/${brand.id}`}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition group"
            >
              {/* Brand Logo */}
              <div className="w-full aspect-square bg-minsah-accent rounded-xl flex items-center justify-center text-6xl mb-4 group-hover:scale-105 transition">
                {brand.logo}
              </div>

              {/* Brand Info */}
              <div className="text-center">
                <h3 className="font-semibold text-sm text-minsah-dark mb-1">{brand.name}</h3>
                <p className="text-xs text-minsah-secondary">{brand.productCount} Products</p>
              </div>

              {/* View Products Arrow */}
              <div className="mt-3 flex items-center justify-center gap-1 text-minsah-primary text-xs font-medium opacity-0 group-hover:opacity-100 transition">
                <span>View Products</span>
                <ChevronRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-minsah-accent shadow-lg z-50">
        <div className="flex items-center justify-around py-3">
          <Link href="/" className="flex flex-col items-center gap-1 text-minsah-secondary hover:text-minsah-primary transition">
            <Home size={24} />
            <span className="text-xs">Home</span>
          </Link>
          <Link href="/search" className="flex flex-col items-center gap-1 text-minsah-secondary hover:text-minsah-primary transition">
            <Search size={24} />
            <span className="text-xs">Search</span>
          </Link>
          <Link href="/wishlist" className="flex flex-col items-center gap-1 text-minsah-secondary hover:text-minsah-primary transition">
            <Heart size={24} />
            <span className="text-xs">Wishlist</span>
          </Link>
          <Link href="/login" className="flex flex-col items-center gap-1 text-minsah-secondary hover:text-minsah-primary transition">
            <User size={24} />
            <span className="text-xs">Account</span>
          </Link>
        </div>
      </nav>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
