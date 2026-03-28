'use client';

import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';

interface Variant {
  id: string;
  sku: string;
  name: string;
  price: number;
  stock: number;
  attributes: Record<string, string> | null;
  image?: string; // variant-specific image URL
}

interface VariantSelectorProps {
  variants: Variant[];
  basePrice: number;
  onVariantChange: (variantId: string | null, price: number, qty: number) => void;
  onImageChange?: (imageUrl: string | null) => void; // NEW: notify parent when variant image changes
}

export default function VariantSelector({
  variants,
  basePrice,
  onVariantChange,
  onImageChange,
}: VariantSelectorProps) {
  const [selectedVariant, setSelectedVariant] = useState<string | null>(
    variants.length === 1 ? variants[0].id : null
  );
  const [quantity, setQuantity] = useState(1);

  const currentVariant = variants.find((v) => v.id === selectedVariant);
  const currentPrice   = currentVariant?.price ?? basePrice;
  const maxStock       = currentVariant?.stock ?? 99;

  const handleVariantSelect = (variantId: string) => {
    const v = variants.find((x) => x.id === variantId);
    if (!v || v.stock === 0) return;
    setSelectedVariant(variantId);
    setQuantity(1);
    onVariantChange(variantId, v.price, 1);
    // Notify parent to change main image if variant has its own image
    if (onImageChange) {
      onImageChange(v.image || null);
    }
  };

  const handleQtyChange = (delta: number) => {
    const newQty = Math.max(1, Math.min(maxStock, quantity + delta));
    setQuantity(newQty);
    onVariantChange(selectedVariant, currentPrice, newQty);
  };

  const allSizes = Array.from(
    new Set(variants.map((v) => v.attributes?.size).filter(Boolean))
  ) as string[];
  const allColors = Array.from(
    new Set(variants.map((v) => v.attributes?.color).filter(Boolean))
  ) as string[];

  // No variants — just quantity
  if (variants.length === 0) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-[#8B5E3C]">পরিমাণ:</span>
        <div className="flex items-center gap-2 border border-[#D4B896] rounded-full px-3 py-1">
          <button onClick={() => handleQtyChange(-1)} disabled={quantity <= 1}
            className="w-6 h-6 flex items-center justify-center text-[#3D1F0E] disabled:opacity-30 hover:bg-[#F5E9DC] rounded-full transition">
            <Minus size={12} />
          </button>
          <span className="text-sm font-semibold text-[#1A0D06] w-6 text-center">{quantity}</span>
          <button onClick={() => handleQtyChange(1)} disabled={quantity >= maxStock}
            className="w-6 h-6 flex items-center justify-center text-[#3D1F0E] disabled:opacity-30 hover:bg-[#F5E9DC] rounded-full transition">
            <Plus size={12} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Size variants */}
      {allSizes.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[#3D1F0E] uppercase tracking-wide mb-2">
            সাইজ:{' '}
            <span className="font-normal text-[#6B4226] normal-case tracking-normal">
              {currentVariant?.attributes?.size || 'নির্বাচন করুন'}
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            {allSizes.map((size) => {
              const variant    = variants.find((v) => v.attributes?.size === size);
              const isSelected = currentVariant?.attributes?.size === size;
              const outOfStock = variant?.stock === 0;
              return (
                <button key={size} onClick={() => variant && handleVariantSelect(variant.id)}
                  disabled={outOfStock}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
                    isSelected
                      ? 'bg-[#3D1F0E] text-[#F5E6D3] border-[#3D1F0E]'
                      : outOfStock
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through'
                      : 'bg-transparent text-[#3D1F0E] border-[#D4B896] hover:border-[#3D1F0E]'
                  }`}>
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Color variants — with swatch + image preview */}
      {allColors.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[#3D1F0E] uppercase tracking-wide mb-2">
            শেড / কালার:{' '}
            <span className="font-normal text-[#6B4226] normal-case tracking-normal">
              {currentVariant?.attributes?.color || 'নির্বাচন করুন'}
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            {allColors.map((color) => {
              const variant    = variants.find((v) => v.attributes?.color === color);
              const isSelected = currentVariant?.attributes?.color === color;
              const hasImage   = !!variant?.image;
              return (
                <button key={color} onClick={() => variant && handleVariantSelect(variant.id)}
                  title={color}
                  className={`relative flex flex-col items-center gap-1 transition-all duration-200 ${isSelected ? 'scale-105' : 'hover:scale-105'}`}>
                  {hasImage ? (
                    <div className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${isSelected ? 'border-[#3D1F0E] shadow-md' : 'border-[#D4B896] hover:border-[#3D1F0E]'}`}>
                      <img src={variant!.image!} alt={color} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
                      isSelected
                        ? 'bg-[#3D1F0E] text-[#F5E6D3] border-[#3D1F0E]'
                        : 'bg-transparent text-[#3D1F0E] border-[#D4B896] hover:border-[#3D1F0E]'
                    }`}>
                      {color}
                    </div>
                  )}
                  {hasImage && (
                    <span className={`text-[9px] font-medium leading-tight text-center max-w-[56px] truncate ${isSelected ? 'text-[#3D1F0E]' : 'text-[#8B5E3C]'}`}>
                      {color}
                    </span>
                  )}
                  {isSelected && hasImage && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#3D1F0E] rounded-full flex items-center justify-center">
                      <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2.5 2.5L8 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Named variants fallback (no size or color attributes) */}
      {allSizes.length === 0 && allColors.length === 0 && (
        <div>
          <p className="text-xs font-semibold text-[#3D1F0E] uppercase tracking-wide mb-2">ভেরিয়েন্ট</p>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => {
              const isSelected = selectedVariant === v.id;
              const outOfStock = v.stock === 0;
              return (
                <button key={v.id} onClick={() => handleVariantSelect(v.id)} disabled={outOfStock}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
                    isSelected
                      ? 'bg-[#3D1F0E] text-[#F5E6D3] border-[#3D1F0E]'
                      : outOfStock
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through'
                      : 'bg-transparent text-[#3D1F0E] border-[#D4B896] hover:border-[#3D1F0E]'
                  }`}>
                  {v.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-[#3D1F0E] uppercase tracking-wide">পরিমাণ:</span>
        <div className="flex items-center gap-1 border border-[#D4B896] rounded-full px-2 py-1">
          <button onClick={() => handleQtyChange(-1)} disabled={quantity <= 1}
            className="w-7 h-7 flex items-center justify-center text-[#3D1F0E] disabled:opacity-30 hover:bg-[#F5E9DC] rounded-full transition">
            <Minus size={13} />
          </button>
          <span className="text-sm font-semibold text-[#1A0D06] w-7 text-center">{quantity}</span>
          <button onClick={() => handleQtyChange(1)} disabled={quantity >= maxStock}
            className="w-7 h-7 flex items-center justify-center text-[#3D1F0E] disabled:opacity-30 hover:bg-[#F5E9DC] rounded-full transition">
            <Plus size={13} />
          </button>
        </div>
        {maxStock <= 5 && maxStock > 0 && (
          <span className="text-xs text-red-500 font-medium">মাত্র {maxStock}টি বাকি!</span>
        )}
      </div>
    </div>
  );
}
