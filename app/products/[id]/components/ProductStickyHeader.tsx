'use client';

import Link from 'next/link';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { useScrollHeader } from '@/hooks/useSwipeAndScrollHeader';

interface ProductStickyHeaderProps {
  productName: string;
  price: number;
}

export default function ProductStickyHeader({ productName, price }: ProductStickyHeaderProps) {
  const showDetails = useScrollHeader(280);

  return (
    <div className={`sticky top-0 z-40 transition-all duration-300 ${
      showDetails ? 'bg-[#3D1F0E]' : 'bg-[#3D1F0E]'
    }`}>
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Back */}
        <Link href="/shop" className="flex items-center gap-1.5 text-[#F5E6D3] hover:text-white transition text-sm flex-shrink-0">
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">ফিরে যান</span>
        </Link>

        {/* Center — fades in on scroll */}
        <div className={`flex-1 overflow-hidden transition-all duration-300 ${showDetails ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-[#F5E6D3] text-sm font-medium truncate leading-tight">{productName}</p>
          <p className="text-[#C4A882] text-xs">৳{price.toLocaleString('bn-BD')}</p>
        </div>

        {/* Logo — fades out on scroll */}
        <p className={`text-[#F5E6D3] font-semibold text-sm tracking-widest uppercase transition-all duration-300 absolute left-1/2 -translate-x-1/2 ${
          showDetails ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}>
          Minsah Beauty
        </p>

        {/* Cart */}
        <Link href="/cart" className="text-[#F5E6D3] hover:text-white transition flex-shrink-0">
          <ShoppingCart size={18} />
        </Link>
      </div>
    </div>
  );
}
