'use client';

import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import { useState } from 'react';
import { Search, ShoppingCart, Heart, Home, User, ChevronLeft, Plus, Minus } from 'lucide-react';
import { formatPrice, convertUSDtoBDT } from '@/utils/currency';

const categories = ['All', 'Makeup', 'Skincare', 'Hair Care', 'Fragrance'];

const products = [
  { id: '1', name: 'Lip Gloss', brand: 'Fenty Beauty', price: 22, image: '💋', stock: 0 },
  { id: '2', name: 'Face Serum', brand: 'The Ordinary', price: 15, image: '✨', stock: 0 },
  { id: '3', name: 'Mascara', brand: 'Maybelline', price: 12, image: '👁️', stock: 0 },
  { id: '4', name: 'Setting Spray', brand: 'Urban Decay', price: 34, image: '💦', stock: 0 },
  { id: '5', name: 'Hair Oil', brand: 'Moroccanoil', price: 44, image: '🧴', stock: 0 },
  { id: '6', name: 'Body Lotion', brand: 'Sol de Janeiro', price: 25, image: '🧴', stock: 0 },
];

export default function FavouritesPage() {
  const { items } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const getQuantity = (productId: string) => quantities[productId] || 0;

  const incrementQuantity = (productId: string) => {
    setQuantities(prev => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));
  };

  const decrementQuantity = (productId: string) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] || 0) - 1)
    }));
  };

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
                placeholder="Search here"
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
            {categories.map((category) => (
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
        <h1 className="text-2xl font-bold text-minsah-dark">My Favourites</h1>
      </div>

      {/* Products Grid */}
      <div className="px-4 py-6">
        <div className="grid grid-cols-2 gap-4">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl p-4 shadow-sm relative">
              {/* Product Image */}
              <div className="relative mb-3">
                <Link href={`/products/${product.id}`} className="block">
                  <div className="w-full aspect-square bg-minsah-accent rounded-xl flex items-center justify-center text-5xl mb-2">
                    {product.image}
                  </div>
                </Link>
                <button className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                  <Heart size={16} className="text-red-500 fill-red-500" />
                </button>
              </div>

              {/* Product Info */}
              <Link href={`/products/${product.id}`}>
                <h3 className="font-semibold text-sm text-minsah-dark mb-1">{product.name}</h3>
                <p className="text-xs text-minsah-secondary mb-2">{product.brand}</p>

                {/* Price and Quantity */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex flex-col">
                    <span className="text-base font-bold text-minsah-primary">
                      {formatPrice(convertUSDtoBDT(product.price))}
                    </span>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        decrementQuantity(product.id);
                      }}
                      className="w-6 h-6 rounded-full border border-minsah-secondary/30 flex items-center justify-center hover:bg-minsah-accent transition"
                    >
                      <Minus size={12} className="text-minsah-dark" />
                    </button>
                    <span className="text-sm font-semibold text-minsah-dark min-w-[20px] text-center">
                      {getQuantity(product.id)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        incrementQuantity(product.id);
                      }}
                      className="w-6 h-6 rounded-full bg-minsah-primary flex items-center justify-center hover:bg-minsah-dark transition"
                    >
                      <Plus size={12} className="text-white" />
                    </button>
                  </div>
                </div>
              </Link>

              {/* Stock Status */}
              <div className="mt-2 flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                <span className="text-[10px] text-minsah-secondary">{product.stock}</span>
              </div>
            </div>
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
          <Link href="/favourites" className="flex flex-col items-center gap-1 text-minsah-primary">
            <Heart size={24} className="fill-minsah-primary" />
            <span className="text-xs font-semibold">Wishlist</span>
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
