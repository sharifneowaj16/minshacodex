'use client';

import { useState } from 'react';
import { ShoppingCart, Check, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface StickyBottomBarProps {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  variantId: string | null;
  quantity: number;
  inStock: boolean;
  whatsappNumber: string;
  onAddToCart: () => void;
  addedToCart: boolean;
}

export default function StickyBottomBar({
  productId,
  productName,
  productImage,
  price,
  variantId,
  quantity,
  inStock,
  onAddToCart,
  addedToCart,
}: StickyBottomBarProps) {
  const router = useRouter();
  const [buying, setBuying] = useState(false);

  // Build checkout URL with variant + quantity params
  const handleBuyNow = () => {
    if (!inStock) return;
    setBuying(true);

    // Build query string for checkout page
    const params = new URLSearchParams();
    params.set('productId', productId);
    params.set('quantity',  String(quantity));
    if (variantId) params.set('variantId', variantId);

    // Navigate to checkout page
    router.push(`/checkout?${params.toString()}`);
  };

  return (
    <>
      {/* ── Sticky Bottom Bar ─────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/96 backdrop-blur-md border-t border-[#E8D5C0] shadow-[0_-4px_24px_rgba(61,31,14,0.10)]">
        <div className="max-w-2xl mx-auto px-4 pt-2.5 pb-3">

          {/* Price row */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#8B5E3C]">মোট মূল্য</span>
            <span className="text-base font-semibold text-[#1A0D06]">
              ৳{price.toLocaleString('bn-BD')}
            </span>
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            {/* Add to Bag */}
            <button
              onClick={onAddToCart}
              disabled={!inStock || addedToCart}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl text-sm font-semibold border-2 transition-all duration-200 active:scale-95 ${
                addedToCart
                  ? 'bg-green-500 border-green-500 text-white'
                  : !inStock
                  ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-transparent border-[#3D1F0E] text-[#3D1F0E] hover:bg-[#F5E9DC]'
              }`}
            >
              {addedToCart ? (
                <><Check size={15} /> Added</>
              ) : (
                <><ShoppingCart size={15} /> Add to Bag</>
              )}
            </button>

            {/* Buy Now — goes to checkout */}
            <button
              onClick={handleBuyNow}
              disabled={!inStock || buying}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl text-sm font-semibold text-white transition-all duration-200 active:scale-95 ${
                !inStock
                  ? 'bg-gray-400 cursor-not-allowed'
                  : buying
                  ? 'bg-[#2A1509] scale-95'
                  : 'bg-[#3D1F0E] hover:bg-[#2A1509]'
              }`}
            >
              <ShoppingBag size={15} />
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* ── Floating WhatsApp ─────────────────────────────────────── */}
      <div className="fixed bottom-28 right-4 z-50 flex flex-col items-center gap-1 md:bottom-24">
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-[#25D366] opacity-40 animate-ping"
        />
        <a
          href={`https://wa.me/8801700000000?text=${encodeURIComponent(`🛒 অর্ডার করতে চাই:\n\nপণ্য: ${productName}\nমূল্য: ৳${price.toLocaleString()}\n\nঅনুগ্রহ করে কনফার্ম করুন।`)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp এ অর্ডার করুন"
          className="relative w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-[0_4px_20px_rgba(37,211,102,0.55)] hover:bg-[#1DA851] active:scale-95 transition-all duration-200"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>
        <span className="relative text-[9px] font-semibold text-[#1A0D06] bg-white/90 px-1.5 py-0.5 rounded-full shadow-sm whitespace-nowrap">
          WhatsApp
        </span>
      </div>
    </>
  );
}
