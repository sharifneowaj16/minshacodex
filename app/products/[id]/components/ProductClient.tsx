'use client';

import { useState, useCallback } from 'react';
import { Truck, ShieldCheck, RotateCcw, Smartphone, ChevronDown, ChevronUp, Package, MapPin, Clock } from 'lucide-react';
import ProductGallery from './ProductGallery';
import { GiftRequestButton, ShareButton } from './GiftShareButtons';
import VariantSelector from './VariantSelector';
import StickyBottomBar from './StickyBottomBar';
import ReviewSection from './ReviewSection';

interface ImageItem {
  url: string;
  alt?: string;
  isDefault?: boolean;
}

interface Variant {
  id: string;
  sku: string;
  name: string;
  price: number;
  stock: number;
  attributes: Record<string, string> | null;
  image?: string;
}

interface Review {
  id: string;
  userName: string;
  rating: number;
  title: string;
  content: string;
  verified: boolean;
  createdAt: string;
}

interface RatingData {
  average: number;
  total: number;
  distribution: Record<number, number>;
}

interface RelatedProduct {
  id: string;
  name: string;
  price: number;
  originalPrice: number | null;
  image: string;
  slug: string;
}

interface ProductClientProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    shortDescription: string;
    price: number;
    originalPrice: number | null;
    image: string;
    images: ImageItem[] | string[]; // supports both
    sku: string;
    stock: number;
    category: string;
    categorySlug?: string;
    brand: string;
    rating: number;
    reviews: number;
    inStock: boolean;
    isNew: boolean;
    ingredients?: string;
    skinType?: string[];
    codAvailable?: boolean;
    returnEligible?: boolean;
    variants: Variant[];
  };
  reviews: Review[];
  rating: RatingData;
  relatedProducts: RelatedProduct[];
  productUrl: string;
}

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '8801700000000';

// ── Delivery Estimate ────────────────────────────────────────────────────
function DeliveryEstimate() {
  const now       = new Date();
  const hour      = now.getHours();
  const isWeekend = now.getDay() === 5 || now.getDay() === 6;
  const dhakaLabel   = hour < 15 && !isWeekend ? 'আগামীকাল' : 'পরশু';
  const outsideLabel = hour < 15 && !isWeekend ? '২-৩ দিনে' : '৩-৪ দিনে';

  return (
    <div className="bg-[#F5E9DC] rounded-xl p-3 space-y-2">
      <p className="text-xs font-semibold text-[#3D1F0E] flex items-center gap-1.5">
        <Truck size={12} /> ডেলিভারি সময়
      </p>
      <div className="flex gap-3">
        <div className="flex items-start gap-1.5 flex-1">
          <MapPin size={11} className="text-[#8B5E3C] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-[#1A0D06]">ঢাকায়</p>
            <p className="text-xs text-green-600 font-medium">{dhakaLabel} পাবেন</p>
            <p className="text-[10px] text-[#8B5E3C]">বিনামূল্যে ডেলিভারি</p>
          </div>
        </div>
        <div className="w-px bg-[#E8D5C0]" />
        <div className="flex items-start gap-1.5 flex-1">
          <MapPin size={11} className="text-[#8B5E3C] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-[#1A0D06]">সারাদেশে</p>
            <p className="text-xs text-[#3D1F0E] font-medium">{outsideLabel}</p>
            <p className="text-[10px] text-[#8B5E3C]">৳১২০ ডেলিভারি চার্জ</p>
          </div>
        </div>
      </div>
      {hour < 15 && !isWeekend && (
        <div className="flex items-center gap-1.5 bg-amber-50 rounded-lg px-2.5 py-1.5 border border-amber-200">
          <Clock size={10} className="text-amber-600 flex-shrink-0" />
          <p className="text-[10px] text-amber-700 font-medium">
            আজ বিকেল ৩টার আগে অর্ডার করলে আগামীকাল পাবেন
          </p>
        </div>
      )}
    </div>
  );
}

// ── Stock Urgency ────────────────────────────────────────────────────────
function StockUrgency({ stock, inStock }: { stock: number; inStock: boolean }) {
  if (!inStock) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-red-500" />
        <span className="text-sm font-medium text-red-600">স্টক শেষ</span>
      </div>
    );
  }
  if (stock <= 10) {
    const pct = Math.round((stock / 10) * 100);
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-red-600">⚠️ মাত্র {stock}টি বাকি!</span>
          <span className="text-[10px] text-red-400 font-medium">দ্রুত শেষ হচ্ছে</span>
        </div>
        <div className="h-1.5 bg-red-100 rounded-full overflow-hidden">
          <div className="h-full bg-red-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-[10px] text-red-400">এখনই অর্ডার করুন, মিস করবেন না!</p>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
      <span className="text-sm font-medium text-green-600">স্টকে আছে</span>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────
export default function ProductClient({
  product,
  reviews,
  rating,
  relatedProducts,
  productUrl,
}: ProductClientProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    product.variants.length === 1 ? product.variants[0].id : null
  );
  const [currentPrice, setCurrentPrice]       = useState(product.price);
  const [quantity, setQuantity]               = useState(1);
  const [addedToCart, setAddedToCart]         = useState(false);
  const [expandIngredients, setExpandIngredients] = useState(false);
  const [variantImageOverride, setVariantImageOverride] = useState<string | null>(null);

  const discountPct =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  const handleVariantChange = useCallback((variantId: string | null, price: number, qty: number) => {
    setSelectedVariantId(variantId);
    setCurrentPrice(price);
    setQuantity(qty);
  }, []);

  // Called by VariantSelector when a variant with its own image is selected
  const handleVariantImageChange = useCallback((imageUrl: string | null) => {
    setVariantImageOverride(imageUrl);
  }, []);

  const handleAddToCart = useCallback(() => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  }, []);

  const totalPrice = currentPrice * quantity;

  // Normalize images for gallery
  const galleryImages = (product.images as (string | { url: string; alt?: string })[]).map((img) =>
    typeof img === 'string' ? { url: img, alt: product.name } : img
  );

  return (
    <>
      <div className="max-w-2xl mx-auto lg:max-w-6xl">
        <div className="lg:grid lg:grid-cols-2 lg:gap-10 lg:items-start">

          {/* LEFT — Gallery */}
          <div className="lg:sticky lg:top-20">
            <ProductGallery
              images={galleryImages}
              productName={product.name}
              discountPct={discountPct}
              isNew={product.isNew}
              overrideImage={variantImageOverride}
            />
          </div>

          {/* RIGHT — Info */}
          <div className="px-4 pt-4 pb-36 lg:pt-0 lg:px-0 lg:pb-8 space-y-5">

            {/* Brand + Category */}
            {(product.brand || product.category) && (
              <div className="flex items-center gap-2 flex-wrap">
                {product.brand && (
                  <span className="text-xs bg-[#F5E9DC] text-[#6B4226] px-2.5 py-1 rounded-full font-medium">{product.brand}</span>
                )}
                {product.category && (
                  <span className="text-xs bg-[#F5E9DC] text-[#6B4226] px-2.5 py-1 rounded-full font-medium">{product.category}</span>
                )}
              </div>
            )}

            {/* Name + Stars */}
            <div>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold text-[#1A0D06] leading-tight">
                {product.name}
              </h1>
              {rating.total > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg key={s} width="13" height="13" viewBox="0 0 24 24">
                        <path fill={s <= Math.round(rating.average) ? '#F59E0B' : '#E5E7EB'}
                          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-[#1A0D06]">{rating.average.toFixed(1)}</span>
                  <span className="text-sm text-[#8B5E3C]">({rating.total} রিভিউ)</span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-2xl md:text-3xl font-semibold text-[#1A0D06]">
                ৳{currentPrice.toLocaleString('bn-BD')}
              </span>
              {product.originalPrice && product.originalPrice > currentPrice && (
                <span className="text-lg text-[#A0856A] line-through">
                  ৳{product.originalPrice.toLocaleString('bn-BD')}
                </span>
              )}
              {discountPct && (
                <span className="bg-red-100 text-red-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                  {discountPct}% সাশ্রয়
                </span>
              )}
            </div>

            {/* Stock */}
            <StockUrgency stock={product.stock} inStock={product.inStock} />

            {/* Delivery */}
            {product.inStock && <DeliveryEstimate />}

            {/* Short description */}
            {product.shortDescription && (
              <p className="text-sm text-[#4A2C1A] leading-relaxed">{product.shortDescription}</p>
            )}

            <div className="h-px bg-[#E8D5C0]" />

            {/* Variant Selector */}
            <VariantSelector
              variants={product.variants}
              basePrice={product.price}
              onVariantChange={handleVariantChange}
              onImageChange={handleVariantImageChange}
            />

            {/* Gift + Share */}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <GiftRequestButton
                  productId={product.id}
                  productName={product.name}
                  variantId={selectedVariantId}
                />
              </div>
              <ShareButton productName={product.name} productUrl={productUrl} />
            </div>

            {/* Skin Type */}
            {product.skinType && product.skinType.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-[#3D1F0E] uppercase tracking-wide mb-2">উপযুক্ত ত্বকের ধরন</p>
                <div className="flex flex-wrap gap-2">
                  {product.skinType.map((type) => (
                    <span key={type} className="px-3 py-1 bg-[#F5E9DC] text-[#6B4226] text-xs font-medium rounded-full">{type}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="h-px bg-[#E8D5C0]" />

            {/* Trust Badges */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { icon: Truck,       label: 'দ্রুত ডেলিভারি', sub: 'সারাদেশে' },
                { icon: ShieldCheck, label: '১০০% অরিজিনাল', sub: 'গ্যারান্টি' },
                { icon: RotateCcw,   label: '৭ দিন',          sub: 'রিটার্ন' },
                { icon: Smartphone,  label: 'bKash / COD',     sub: 'পেমেন্ট' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center text-center p-2.5 bg-[#F5E9DC] rounded-xl">
                  <Icon size={16} className="text-[#3D1F0E] mb-1" />
                  <p className="text-[10px] font-semibold text-[#1A0D06] leading-tight">{label}</p>
                  <p className="text-[9px] text-[#8B5E3C] mt-0.5">{sub}</p>
                </div>
              ))}
            </div>

            {/* Full Description */}
            {product.description && product.description !== product.shortDescription && (
              <div>
                <p className="text-xs font-semibold text-[#3D1F0E] uppercase tracking-wide mb-2">বিস্তারিত</p>
                <p className="text-sm text-[#4A2C1A] leading-relaxed whitespace-pre-line">{product.description}</p>
              </div>
            )}

            {/* Ingredients — collapsible */}
            {product.ingredients && (
              <div className="border border-[#E8D5C0] rounded-2xl overflow-hidden">
                <button onClick={() => setExpandIngredients(!expandIngredients)}
                  className="w-full flex items-center justify-between p-4 text-left">
                  <div className="flex items-center gap-2">
                    <Package size={14} className="text-[#3D1F0E]" />
                    <span className="text-xs font-semibold text-[#3D1F0E] uppercase tracking-wide">উপাদান</span>
                  </div>
                  {expandIngredients
                    ? <ChevronUp size={14} className="text-[#8B5E3C]" />
                    : <ChevronDown size={14} className="text-[#8B5E3C]" />}
                </button>
                {expandIngredients && (
                  <div className="px-4 pb-4">
                    <p className="text-xs text-[#4A2C1A] leading-relaxed">{product.ingredients}</p>
                  </div>
                )}
              </div>
            )}

            {/* Reviews */}
            {rating.total > 0 && (
              <div>
                <p className="text-xs font-semibold text-[#3D1F0E] uppercase tracking-wide mb-3">কাস্টমার রিভিউ</p>
                <ReviewSection reviews={reviews} rating={rating} />
              </div>
            )}

            {/* Related Products */}
            {relatedProducts.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-[#3D1F0E] uppercase tracking-wide mb-3">সম্পর্কিত পণ্য</p>
                <div className="grid grid-cols-2 gap-3">
                  {relatedProducts.slice(0, 4).map((rp) => {
                    const rpDiscount =
                      rp.originalPrice && rp.originalPrice > rp.price
                        ? Math.round(((rp.originalPrice - rp.price) / rp.originalPrice) * 100)
                        : null;
                    return (
                      <a key={rp.id} href={`/products/${rp.slug}`}
                        className="block bg-[#F5E9DC] rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                        <div className="aspect-square relative">
                          <img src={rp.image} alt={rp.name} className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://placehold.co/200x200/F5E9DC/8B5E3C?text=${encodeURIComponent(rp.name.slice(0, 4))}`;
                            }} />
                          {rpDiscount && (
                            <span className="absolute top-2 right-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                              -{rpDiscount}%
                            </span>
                          )}
                        </div>
                        <div className="p-2.5">
                          <p className="text-xs font-medium text-[#1A0D06] line-clamp-2 leading-tight">{rp.name}</p>
                          <p className="text-xs font-semibold text-[#3D1F0E] mt-1">৳{rp.price.toLocaleString('bn-BD')}</p>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <StickyBottomBar
        productId={product.id}
        productName={product.name}
        productImage={product.image}
        price={totalPrice}
        variantId={selectedVariantId}
        quantity={quantity}
        inStock={product.inStock}
        whatsappNumber={WHATSAPP_NUMBER}
        onAddToCart={handleAddToCart}
        addedToCart={addedToCart}
      />
    </>
  );
}
