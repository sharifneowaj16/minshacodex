'use client';

import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import { Minus, Plus, Trash2, ArrowLeft, ShoppingCart, Heart, Home } from 'lucide-react';
import { formatPrice, convertUSDtoBDT } from '@/utils/currency';

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeItem,
    subtotal,
    shippingCost,
    tax,
    total,
    promoCode,
    setPromoCode,
    applyPromoCode,
    discount
  } = useCart();

  const handleQuantityChange = (itemId: string, delta: number) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      updateQuantity(itemId, item.quantity + delta);
    }
  };

  const bdtSubtotal = convertUSDtoBDT(subtotal);
  const bdtShipping = convertUSDtoBDT(shippingCost);
  const bdtTax = convertUSDtoBDT(tax);
  const bdtTotal = convertUSDtoBDT(total);

  return (
    <div className="min-h-screen bg-minsah-light">
      {/* Header */}
      <header className="bg-minsah-dark text-minsah-light sticky top-0 z-50 shadow-md">
        <div className="px-4 py-4 flex items-center justify-between">
          <Link href="/shop" className="p-2 hover:bg-minsah-primary rounded-lg transition">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-xl font-semibold">Cart</h1>
          <Link href="/cart" className="p-2 relative">
            <ShoppingCart size={24} />
            {items.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-minsah-accent text-minsah-dark text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                {items.length}
              </span>
            )}
          </Link>
        </div>
      </header>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <div className="bg-minsah-accent rounded-full p-8 mb-6">
            <ShoppingCart size={64} className="text-minsah-primary" />
          </div>
          <h2 className="text-2xl font-bold text-minsah-dark mb-2">Your cart is empty</h2>
          <p className="text-minsah-secondary mb-6 text-center">
            Add some beautiful products to get started!
          </p>
          <Link
            href="/shop"
            className="bg-minsah-primary text-minsah-light px-8 py-3 rounded-lg font-semibold hover:bg-minsah-dark transition"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="pb-32">
          {/* Cart Items */}
          <div className="px-4 py-6 space-y-4">
            {items.map((item) => (
              <div
                key={item.cartItemId || item.id}
                className="bg-white rounded-2xl p-4 shadow-sm flex gap-4"
              >
                {/* Product Image */}
                <div className="w-24 h-24 bg-gradient-to-br from-minsah-accent to-minsah-light rounded-xl flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                  {item.image && (item.image.startsWith('/') || item.image.startsWith('http') || item.image.startsWith('data:')) ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-4xl">{item.image || '✨'}</div>
                  )}
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-minsah-dark text-sm mb-1 line-clamp-2">
                    {item.name}
                  </h3>
                  {item.sku && (
                    <p className="text-xs text-minsah-secondary mb-2">{item.sku}</p>
                  )}
                  <p className="text-minsah-primary font-bold mb-3">
                    {formatPrice(convertUSDtoBDT(item.price))}
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center bg-minsah-accent rounded-lg">
                      <button
                        onClick={() => handleQuantityChange(item.id, -1)}
                        className="p-2 hover:bg-minsah-secondary hover:text-white rounded-l-lg transition"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="px-4 py-2 font-semibold min-w-[40px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.id, 1)}
                        className="p-2 hover:bg-minsah-secondary hover:text-white rounded-r-lg transition"
                        aria-label="Increase quantity"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      aria-label="Remove item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Item Total */}
                <div className="text-right flex-shrink-0">
                  <button className="p-2 mb-2 text-minsah-secondary hover:text-red-600 transition">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Promo Code Section */}
          <div className="px-4 mb-6">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-semibold text-minsah-dark mb-3">Promo code</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Enter code"
                  className="flex-1 px-4 py-2 border border-minsah-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-minsah-primary"
                />
                <button
                  onClick={applyPromoCode}
                  className="bg-minsah-primary text-minsah-light px-6 py-2 rounded-lg font-semibold hover:bg-minsah-dark transition whitespace-nowrap"
                >
                  Apply Code
                </button>
              </div>
              {discount > 0 && (
                <p className="text-green-600 text-sm mt-2">
                  ✓ Promo code applied! You saved {formatPrice(convertUSDtoBDT(discount))}
                </p>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="px-4 mb-6">
            <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-minsah-secondary">Subtotal</span>
                <span className="font-semibold text-minsah-dark">{formatPrice(bdtSubtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-minsah-secondary">Shipping Cost</span>
                <span className="font-semibold text-minsah-dark">
                  {shippingCost === 0 ? 'FREE' : formatPrice(bdtShipping)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-minsah-secondary">Tax</span>
                <span className="font-semibold text-minsah-dark">{formatPrice(bdtTax)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span className="font-semibold">-{formatPrice(convertUSDtoBDT(discount))}</span>
                </div>
              )}
              <div className="border-t border-minsah-accent pt-3 flex justify-between">
                <span className="font-bold text-minsah-dark">Total</span>
                <span className="font-bold text-minsah-primary text-lg">
                  {formatPrice(bdtTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      {items.length > 0 && (
        <>
          {/* Checkout Button */}
          <div className="fixed bottom-16 left-0 right-0 px-4 pb-4 bg-gradient-to-t from-minsah-light via-minsah-light to-transparent pt-6">
            <Link
              href="/checkout"
              className="block w-full bg-minsah-primary text-minsah-light text-center py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-minsah-dark transition"
            >
              Checkout
            </Link>
          </div>

          {/* Bottom Navigation Bar */}
          <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-minsah-accent shadow-lg">
            <div className="flex items-center justify-around py-3">
              <Link href="/" className="flex flex-col items-center gap-1 text-minsah-secondary hover:text-minsah-primary transition">
                <Home size={24} />
                <span className="text-xs">Home</span>
              </Link>
              <Link href="/wishlist" className="flex flex-col items-center gap-1 text-minsah-secondary hover:text-minsah-primary transition">
                <Heart size={24} />
                <span className="text-xs">Wishlist</span>
              </Link>
              <Link href="/cart" className="flex flex-col items-center gap-1 text-minsah-primary">
                <ShoppingCart size={24} />
                <span className="text-xs font-semibold">Cart</span>
              </Link>
              <Link href="/login" className="flex flex-col items-center gap-1 text-minsah-secondary hover:text-minsah-primary transition">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-xs">Account</span>
              </Link>
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
