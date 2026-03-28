'use client';

import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import { useState } from 'react';
import { Search, ShoppingCart, Heart, Home, User, ChevronLeft } from 'lucide-react';
import { formatPrice } from '@/utils/currency';

// Combo data organized by price range
const comboRanges = [
  {
    title: '1001-1500 Taka Combos',
    priceRange: 'Tk 1001-1500',
    combos: [
      { id: 'c1', name: 'Makeup Combo', price: 1200, image: '💄' },
      { id: 'c2', name: 'Skincare Combo', price: 1350, image: '🧴' },
      { id: 'c3', name: 'Haircare Combo', price: 1400, image: '💆‍♀️' },
      { id: 'c4', name: 'Body Care Combo', price: 1450, image: '✨' },
    ]
  },
  {
    title: '1501-2000 Taka Combos',
    priceRange: 'Tk 1501-2000',
    combos: [
      { id: 'c5', name: 'Premium Makeup Set', price: 1800, image: '💎' },
      { id: 'c6', name: 'Facial Kit Combo', price: 1650, image: '🌸' },
      { id: 'c7', name: 'Hair Treatment Set', price: 1900, image: '💇‍♀️' },
      { id: 'c8', name: 'Spa Collection', price: 1750, image: '🧖‍♀️' },
    ]
  },
  {
    title: '2001-2500 Taka Combos',
    priceRange: 'Tk 2001-2500',
    combos: [
      { id: 'c9', name: 'Luxury Beauty Box', price: 2200, image: '👑' },
      { id: 'c10', name: 'Complete Skincare Set', price: 2400, image: '✨' },
      { id: 'c11', name: 'Professional Makeup Kit', price: 2300, image: '💅' },
      { id: 'c12', name: 'Pamper Package', price: 2150, image: '🎁' },
    ]
  },
  {
    title: '2501-3000 Taka Combos',
    priceRange: 'Tk 2501-3000',
    combos: [
      { id: 'c13', name: 'Deluxe Beauty Set', price: 2800, image: '🌟' },
      { id: 'c14', name: 'Ultimate Skincare', price: 2900, image: '💧' },
      { id: 'c15', name: 'Pro Makeup Collection', price: 2750, image: '🎨' },
      { id: 'c16', name: 'Total Body Care', price: 2650, image: '🧴' },
    ]
  },
  {
    title: '3001-3500 Taka Combos',
    priceRange: 'Tk 3001-3500',
    combos: [
      { id: 'c17', name: 'Elite Beauty Bundle', price: 3200, image: '💎' },
      { id: 'c18', name: 'Premium Spa Set', price: 3400, image: '🧖‍♀️' },
      { id: 'c19', name: 'Master Makeup Kit', price: 3300, image: '💄' },
      { id: 'c20', name: 'Complete Wellness', price: 3150, image: '🌺' },
    ]
  },
  {
    title: '3501-5000 Taka Combos',
    priceRange: 'Tk 3501-5000',
    combos: [
      { id: 'c21', name: 'Ultimate Beauty Collection', price: 4500, image: '👑' },
      { id: 'c22', name: 'Luxury Spa Experience', price: 4200, image: '✨' },
      { id: 'c23', name: 'Professional Beauty Kit', price: 3800, image: '💅' },
      { id: 'c24', name: 'Complete Makeover Set', price: 4800, image: '🎀' },
    ]
  },
];

export default function CombosPage() {
  const { items } = useCart();

  return (
    <div className="min-h-screen bg-minsah-light pb-20">
      {/* Header */}
      <header className="bg-minsah-accent sticky top-0 z-50 shadow-sm">
        <div className="px-4 py-3">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-3">
            <Link href="/" className="p-2 -ml-2">
              <ChevronLeft size={24} className="text-minsah-dark" />
            </Link>
            <h1 className="text-xl font-bold text-minsah-dark">Combo</h1>
            <Link href="/cart" className="relative p-2">
              <ShoppingCart size={24} className="text-minsah-dark" />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>
          </div>

          {/* Status Bar */}
          <div className="flex items-center justify-end">
            <span className="text-xs text-minsah-secondary">9:41</span>
          </div>
        </div>
      </header>

      {/* Combo Sections */}
      {comboRanges.map((range, rangeIndex) => (
        <section key={rangeIndex} className="mb-6">
          {/* Range Header */}
          <div className="bg-minsah-dark text-minsah-light px-4 py-3">
            <h2 className="text-base font-bold">{range.title}</h2>
          </div>

          {/* Combo Grid */}
          <div className="px-4 py-4 grid grid-cols-2 gap-3">
            {range.combos.map((combo) => (
              <Link
                key={combo.id}
                href={`/combos/${combo.id}`}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition"
              >
                {/* Combo Image */}
                <div className="w-full aspect-square bg-gradient-to-br from-minsah-accent to-minsah-light/50 flex items-center justify-center text-6xl p-4">
                  {combo.image}
                </div>

                {/* Combo Info */}
                <div className="p-3 bg-minsah-accent/30">
                  <h3 className="font-semibold text-sm text-minsah-dark mb-1 text-center">
                    {combo.name}
                  </h3>
                  <p className="text-xs text-center font-bold text-minsah-primary">
                    {formatPrice(combo.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}

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
    </div>
  );
}
