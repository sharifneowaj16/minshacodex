'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart } from 'lucide-react';
import { Product } from '@/types/product';
import { formatPrice } from '@/lib/shopUtils';
import { useCart } from '@/contexts/CartContext';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

function ProductImage({ src, alt }: { src: string; alt: string }) {
  const isUrl = src && (src.startsWith('/') || src.startsWith('http') || src.startsWith('data:'));
  if (isUrl) {
    return <img src={src} alt={alt} className="w-full h-full object-cover" />;
  }
  return <span className="text-7xl md:text-8xl group-hover:scale-105 transition-transform duration-300">{src || '✨'}</span>;
}

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { addItem } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsWishlisted(!isWishlisted);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock === 0 || isAddingToCart) return;

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      sku: product.sku,
    });

    setIsAddingToCart(true);
    setTimeout(() => setIsAddingToCart(false), 1500);
  };

  const renderBadges = () => {
    if (product.stock === 0) {
      return (
        <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center rounded-t-xl z-10">
          <span className="bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-bold">Out of Stock</span>
        </div>
      );
    }

    const badges = [];
    if (product.discount && product.discount > 0) {
      badges.push(<span key="discount" className="bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold">{product.discount}% OFF</span>);
    }
    if (product.isNew) {
      badges.push(<span key="new" className="bg-green-500 text-white px-2 py-1 rounded-md text-xs font-bold">NEW</span>);
    }
    if (product.isBestSeller) {
      badges.push(<span key="bestseller" className="bg-yellow-500 text-white px-2 py-1 rounded-md text-xs font-bold">BEST SELLER</span>);
    }
    if (product.isTrending) {
      badges.push(<span key="trending" className="bg-orange-500 text-white px-2 py-1 rounded-md text-xs font-bold">TRENDING</span>);
    }
    if (product.isExclusive) {
      badges.push(<span key="exclusive" className="bg-purple-500 text-white px-2 py-1 rounded-md text-xs font-bold">EXCLUSIVE</span>);
    }

    return badges.length > 0 ? (
      <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">{badges}</div>
    ) : null;
  };

  const renderCertificationBadges = () => {
    const certs = [];
    if (product.isVegan) certs.push(<span key="vegan" title="Vegan" className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-semibold">V</span>);
    if (product.isCrueltyFree) certs.push(<span key="cf" title="Cruelty-Free" className="text-xs bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded font-semibold">CF</span>);
    if (product.isHalalCertified) certs.push(<span key="halal" title="Halal Certified" className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-semibold">H</span>);
    if (product.isBSTIApproved) certs.push(<span key="bsti" title="BSTI Approved" className="text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-semibold">BSTI</span>);
    return certs.length > 0 ? <div className="flex items-center gap-1">{certs}</div> : null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden group">
      {/* Product Image */}
      <Link href={`/products/${product.id}`} className="block relative">
        <div className="relative w-full aspect-square bg-minsah-accent/30 flex items-center justify-center overflow-hidden">
          <ProductImage src={product.image} alt={product.name} />
          {renderBadges()}

          <button
            onClick={handleWishlist}
            className="absolute top-2 right-2 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50 transition-colors z-10"
            aria-label="Add to wishlist"
          >
            <Heart size={18} className={`${isWishlisted ? 'text-red-500 fill-red-500' : 'text-minsah-secondary'} transition-colors`} />
          </button>

          {product.stock > 0 && product.stock <= 5 && (
            <div className="absolute bottom-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-md text-xs font-semibold z-10">
              Only {product.stock} left!
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-3 md:p-4">
        <Link href={`/shop?brand=${product.brandSlug}`}>
          <p className="text-xs text-minsah-secondary uppercase font-medium mb-1 hover:text-minsah-primary transition-colors">
            {product.brand}
          </p>
        </Link>

        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-sm md:text-base text-minsah-dark mb-1 line-clamp-2 hover:text-minsah-primary transition-colors min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center">
            <span className="text-yellow-400 text-sm">★</span>
            <span className="text-xs text-minsah-dark font-medium ml-1">{product.rating.toFixed(1)}</span>
          </div>
          <span className="text-xs text-minsah-secondary">({product.reviewCount})</span>
          {renderCertificationBadges()}
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg md:text-xl font-bold text-minsah-primary">
            ৳{formatPrice(product.price)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <>
              <span className="text-sm text-minsah-secondary line-through">৳{formatPrice(product.originalPrice)}</span>
              <span className="text-xs text-green-600 font-semibold">Save ৳{formatPrice(product.originalPrice - product.price)}</span>
            </>
          )}
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {product.isCODAvailable && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">COD</span>}
          {product.isSameDayDelivery && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Same Day</span>}
          {product.freeShippingEligible && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Free Shipping</span>}
          {product.isEMIAvailable && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">EMI</span>}
        </div>

        <div className="flex gap-2">
          {product.hasVariants ? (
            <Link
              href={`/products/${product.id}`}
              className="flex-1 px-3 py-2 bg-minsah-primary text-white text-sm font-semibold rounded-lg hover:bg-minsah-dark transition-colors text-center"
            >
              Select Options
            </Link>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || isAddingToCart}
              className={`flex-1 px-3 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                product.stock === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : isAddingToCart
                  ? 'bg-green-500 text-white'
                  : 'bg-minsah-primary text-white hover:bg-minsah-dark'
              }`}
            >
              {product.stock === 0 ? 'Out of Stock' : isAddingToCart ? <>✓ Added!</> : <><ShoppingCart size={16} /> Add to Cart</>}
            </button>
          )}
        </div>

        {onQuickView && (
          <button
            onClick={() => onQuickView(product)}
            className="w-full mt-2 px-3 py-2 text-sm font-medium text-minsah-primary border border-minsah-primary rounded-lg hover:bg-minsah-accent transition-colors"
          >
            Quick View
          </button>
        )}
      </div>
    </div>
  );
}
