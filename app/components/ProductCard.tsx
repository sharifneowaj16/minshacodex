'use client';

import Link from 'next/link';
import { Package } from 'lucide-react';
import { formatPrice } from '@/utils/currency';

interface ProductCardProps {
  id: string;
  name: string;
  slug?: string;
  price: number;
  originalPrice?: number;
  image: string;
  category?: string;
}

export default function ProductCard({
  id,
  name,
  slug,
  price,
  originalPrice,
  image,
  category,
}: ProductCardProps) {
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  // FIXED: always use slug if available, fallback to id
  const productHref = `/products/${slug || id}`;

  return (
    <Link href={productHref} className="group">
      <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
              <Package className="w-16 h-16 text-pink-400" />
            </div>
          )}
          {discount > 0 && (
            <div className="absolute top-2 right-2 bg-pink-600 text-white text-xs font-bold px-2 py-1 rounded">
              -{discount}%
            </div>
          )}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-opacity flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-pink-600 px-4 py-2 rounded-lg font-semibold text-sm">
              Quick View
            </span>
          </div>
        </div>
        <div className="p-4">
          {category && <p className="text-xs text-gray-500 mb-1">{category}</p>}
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{name}</h3>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-pink-600">{formatPrice(price)}</span>
            {originalPrice && (
              <span className="text-sm text-gray-400 line-through">{formatPrice(originalPrice)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
