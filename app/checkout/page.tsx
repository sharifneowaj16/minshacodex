'use client';

import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, CreditCard, FileText, ChevronDown, ChevronUp, Edit2 } from 'lucide-react';
import { formatPrice } from '@/utils/currency';

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    subtotal,
    shippingCost,
    tax,
    total,
    selectedAddress,
    selectedPaymentMethod,
    updateQuantity
  } = useCart();

  const [expandedSection, setExpandedSection] = useState<'address' | 'payment' | 'summary' | null>('address');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert('Please select a shipping address');
      return;
    }
    if (!selectedPaymentMethod) {
      alert('Please select a payment method');
      return;
    }

    setIsPlacingOrder(true);
    try {
      // Detect if this is a real DB id (cuid format) or a local temp id (numeric timestamp)
      const isRealDbId = selectedAddress.id && !/^\d+$/.test(selectedAddress.id);

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.id,
            variantId: item.variantId || undefined,
            name: item.name,
            sku: item.sku || '',
            price: item.price,
            quantity: item.quantity,
          })),
          // Send real DB id if available
          addressId: isRealDbId ? selectedAddress.id : undefined,
          // Always send addressData as fallback so server can resolve/create
          addressData: {
            fullName:       selectedAddress.fullName,
            phoneNumber:    selectedAddress.phoneNumber,
            address:        selectedAddress.address,
            zone:           selectedAddress.zone,
            city:           selectedAddress.city,
            provinceRegion: selectedAddress.provinceRegion,
            landmark:       selectedAddress.landmark,
          },
          paymentMethod: selectedPaymentMethod.type,
          subtotal,
          shippingCost,
          taxAmount: tax,
          discountAmount: 0,
          total,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to place order. Please try again.');
        return;
      }

      router.push(data.redirectURL || '/checkout/order-confirmed');
    } catch {
      alert('Network error. Please check your connection and try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const toggleSection = (section: 'address' | 'payment' | 'summary') => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="min-h-screen bg-minsah-light pb-24">
      {/* Header */}
      <header className="bg-minsah-dark text-minsah-light sticky top-0 z-50 shadow-md">
        <div className="px-4 py-4 flex items-center justify-between">
          <Link href="/cart" className="p-2 hover:bg-minsah-primary rounded-lg transition">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-xl font-semibold">Checkout</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <div className="px-4 py-6 space-y-4">
        {/* Shipping Address Section */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection('address')}
            className="w-full px-4 py-4 flex items-center justify-between hover:bg-minsah-accent/30 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-minsah-accent rounded-lg flex items-center justify-center">
                <MapPin size={20} className="text-minsah-primary" />
              </div>
              <div className="text-left">
                <h2 className="font-bold text-minsah-dark">Shipping Address</h2>
                {selectedAddress && expandedSection !== 'address' && (
                  <p className="text-xs text-minsah-secondary line-clamp-1">
                    {selectedAddress.address}
                  </p>
                )}
              </div>
            </div>
            {expandedSection === 'address' ? (
              <ChevronUp className="text-minsah-secondary" size={20} />
            ) : (
              <ChevronDown className="text-minsah-secondary" size={20} />
            )}
          </button>

          {expandedSection === 'address' && (
            <div className="px-4 pb-4 border-t border-minsah-accent">
              {selectedAddress ? (
                <div className="mt-4 p-4 bg-minsah-accent rounded-xl relative">
                  <Link
                    href="/checkout/select-address"
                    className="absolute top-3 right-3 p-2 bg-white rounded-lg hover:bg-minsah-light transition"
                  >
                    <Edit2 size={16} className="text-minsah-primary" />
                  </Link>
                  <div className="pr-12">
                    <div className="flex items-start gap-2 mb-2">
                      <MapPin size={16} className="text-minsah-primary mt-0.5" />
                      <p className="text-sm font-semibold text-minsah-dark">
                        {selectedAddress.address}
                      </p>
                    </div>
                    <p className="text-sm text-minsah-secondary ml-6">
                      {selectedAddress.city}, {selectedAddress.zone}
                    </p>
                    <p className="text-sm text-minsah-secondary ml-6">
                      {selectedAddress.fullName} • {selectedAddress.phoneNumber}
                    </p>
                  </div>
                </div>
              ) : (
                <Link
                  href="/checkout/select-address"
                  className="mt-4 block w-full bg-minsah-primary text-minsah-light text-center py-3 rounded-xl font-semibold hover:bg-minsah-dark transition"
                >
                  Add Shipping Address
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Payment Method Section */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection('payment')}
            className="w-full px-4 py-4 flex items-center justify-between hover:bg-minsah-accent/30 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-minsah-accent rounded-lg flex items-center justify-center">
                <CreditCard size={20} className="text-minsah-primary" />
              </div>
              <div className="text-left">
                <h2 className="font-bold text-minsah-dark">Payment Method</h2>
                {selectedPaymentMethod && expandedSection !== 'payment' && (
                  <p className="text-xs text-minsah-secondary">
                    {selectedPaymentMethod.name}
                  </p>
                )}
              </div>
            </div>
            {expandedSection === 'payment' ? (
              <ChevronUp className="text-minsah-secondary" size={20} />
            ) : (
              <ChevronDown className="text-minsah-secondary" size={20} />
            )}
          </button>
        </div>

        {/* Order Summary Section */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection('summary')}
            className="w-full px-4 py-4 flex items-center justify-between hover:bg-minsah-accent/30 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-minsah-accent rounded-lg flex items-center justify-center">
                <FileText size={20} className="text-minsah-primary" />
              </div>
              <div className="text-left">
                <h2 className="font-bold text-minsah-dark">Order Summary</h2>
                <p className="text-xs text-minsah-secondary">
                  {items.length} item{items.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            {expandedSection === 'summary' ? (
              <ChevronUp className="text-minsah-secondary" size={20} />
            ) : (
              <ChevronDown className="text-minsah-secondary" size={20} />
            )}
          </button>

          {expandedSection === 'summary' && (
            <div className="px-4 pb-4 border-t border-minsah-accent">
              <div className="mt-4 space-y-3">
                {items.map((item) => (
                  <div key={item.cartItemId || `${item.id}:${item.variantId ?? 'default'}`} className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-minsah-dark line-clamp-1">{item.name}</p>
                      <p className="text-xs text-minsah-secondary">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-minsah-primary">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}

                <div className="border-t border-minsah-accent pt-3 space-y-2">
                  <div className="flex justify-between text-sm text-minsah-secondary">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-minsah-secondary">
                    <span>Shipping</span>
                    <span>{shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-minsah-secondary">
                    <span>Tax (5%)</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-minsah-dark">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Place Order Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-minsah-accent shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-minsah-secondary">Total</span>
          <span className="text-xl font-bold text-minsah-primary">{formatPrice(total)}</span>
        </div>
        <button
          onClick={handlePlaceOrder}
          disabled={isPlacingOrder || items.length === 0}
          className="w-full bg-minsah-primary text-minsah-light py-4 rounded-xl font-bold text-base shadow-lg hover:bg-minsah-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPlacingOrder ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Placing Order...
            </span>
          ) : (
            'Place Order'
          )}
        </button>
      </div>
    </div>
  );
}
