'use client';

import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { formatPrice, convertUSDtoBDT } from '@/utils/currency';

export default function RocketPaymentPage() {
  const router = useRouter();
  const { total, selectedAddress, items } = useCart();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const bdtTotal = convertUSDtoBDT(total);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phoneNumber || phoneNumber.length < 11) {
      setError('Please enter a valid Rocket number');
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('/api/payments/rocket/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          amount: bdtTotal,
          phoneNumber,
          items: items.map(item => ({
            productId: item.id,
            variantId: item.variantId || undefined,
            name: item.name,
            price: convertUSDtoBDT(item.price),
            quantity: item.quantity
          })),
          shippingAddress: selectedAddress
        })
      });

      const data = await response.json();

      if (data.success) {
        if (data.rocketURL) {
          window.location.href = data.rocketURL;
        } else {
          router.push(`/checkout/order-confirmed?orderNumber=${data.orderNumber}`);
        }
      } else {
        setError(data.message || 'Payment failed. Please try again.');
      }
    } catch (err) {
      console.error('Rocket payment error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-minsah-light">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-700 to-purple-900 text-white sticky top-0 z-50 shadow-md">
        <div className="px-4 py-4 flex items-center justify-between">
          <Link href="/checkout" className="p-2 hover:bg-purple-800 rounded-lg transition">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-xl font-semibold">Rocket Payment</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <div className="px-4 py-6">
        {/* Rocket Logo */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-4xl">🚀</span>
          </div>
          <h2 className="text-2xl font-bold text-minsah-dark mb-2">Pay with Rocket</h2>
          <p className="text-minsah-secondary">Dutch-Bangla Bank Mobile Banking</p>
        </div>

        {/* Amount to Pay */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 shadow-sm mb-6 border-2 border-purple-200">
          <p className="text-sm text-purple-700 mb-1">Amount to Pay</p>
          <p className="text-4xl font-bold text-purple-600">{formatPrice(bdtTotal)}</p>
        </div>

        {/* Payment Form */}
        <form onSubmit={handlePayment}>
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <h3 className="font-bold text-minsah-dark mb-4">Enter Rocket Number</h3>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-minsah-dark mb-2">
                Rocket Account Number *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-minsah-secondary">
                  +88
                </span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="01XXXXXXXXX"
                  maxLength={11}
                  required
                  className="w-full pl-14 pr-4 py-4 border-2 border-minsah-accent rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg font-semibold"
                />
              </div>
              <p className="text-xs text-minsah-secondary mt-2">
                Enter your 11-digit Rocket mobile number
              </p>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <h3 className="font-bold text-minsah-dark mb-3">Payment Steps:</h3>
            <ol className="space-y-3 text-sm text-minsah-secondary">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-xs">1</span>
                <span>Enter your Rocket mobile number above</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-xs">2</span>
                <span>Click "Proceed to Pay" button</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-xs">3</span>
                <span>Dial *322# from your registered mobile</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-xs">4</span>
                <span>Enter your Rocket PIN to complete payment</span>
              </li>
            </ol>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isProcessing || !phoneNumber}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition flex items-center justify-center gap-2 ${
              isProcessing || !phoneNumber
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-700 to-purple-900 text-white hover:from-purple-800 hover:to-purple-950'
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Proceed to Pay</span>
                <span>{formatPrice(bdtTotal)}</span>
              </>
            )}
          </button>
        </form>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-minsah-secondary">
            🔒 Secure payment powered by Dutch-Bangla Bank Rocket
          </p>
        </div>
      </div>
    </div>
  );
}
