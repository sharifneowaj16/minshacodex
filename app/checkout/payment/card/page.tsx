'use client';

import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, CreditCard as CreditCardIcon, Lock } from 'lucide-react';
import { formatPrice, convertUSDtoBDT } from '@/utils/currency';

export default function CardPaymentPage() {
  const router = useRouter();
  const { total, selectedAddress, items } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });

  const bdtTotal = convertUSDtoBDT(total);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'cardNumber') {
      // Format card number with spaces
      const cleaned = value.replace(/\s/g, '');
      const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
      setCardData(prev => ({ ...prev, [name]: formatted }));
    } else if (name === 'cvv') {
      // Only allow numbers, max 4 digits
      const cleaned = value.replace(/\D/g, '').slice(0, 4);
      setCardData(prev => ({ ...prev, [name]: cleaned }));
    } else {
      setCardData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    const cardNumberClean = cardData.cardNumber.replace(/\s/g, '');
    if (cardNumberClean.length < 13 || cardNumberClean.length > 19) {
      setError('Please enter a valid card number');
      return;
    }

    if (!cardData.cardHolder || cardData.cardHolder.length < 3) {
      setError('Please enter cardholder name');
      return;
    }

    if (!cardData.expiryMonth || !cardData.expiryYear) {
      setError('Please select expiry date');
      return;
    }

    if (cardData.cvv.length < 3) {
      setError('Please enter valid CVV');
      return;
    }

    setIsProcessing(true);

    try {
      // Call payment gateway API (SSLCommerz, aamarpay, etc.)
      const response = await fetch('/api/payments/card/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          amount: bdtTotal,
          cardData: {
            number: cardNumberClean,
            holder: cardData.cardHolder,
            expiry: `${cardData.expiryMonth}/${cardData.expiryYear}`,
            cvv: cardData.cvv
          },
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
        if (data.gatewayURL) {
          // Redirect to payment gateway
          window.location.href = data.gatewayURL;
        } else {
          router.push(`/checkout/order-confirmed?orderNumber=${data.orderNumber}`);
        }
      } else {
        setError(data.message || 'Payment failed. Please try again.');
      }
    } catch (err) {
      console.error('Card payment error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, i) => currentYear + i);

  return (
    <div className="min-h-screen bg-minsah-light">
      {/* Header */}
      <header className="bg-minsah-dark text-minsah-light sticky top-0 z-50 shadow-md">
        <div className="px-4 py-4 flex items-center justify-between">
          <Link href="/checkout" className="p-2 hover:bg-minsah-primary rounded-lg transition">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-xl font-semibold">Card Payment</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <div className="px-4 py-6">
        {/* Card Display */}
        <div className="relative mb-6">
          <div className="bg-gradient-to-br from-minsah-primary via-minsah-secondary to-minsah-dark rounded-3xl p-6 shadow-2xl text-white h-52 flex flex-col justify-between">
            {/* Card Chip & Logo */}
            <div className="flex justify-between items-start">
              <div className="w-12 h-10 bg-yellow-400 rounded-lg"></div>
              <CreditCardIcon size={40} className="opacity-50" />
            </div>

            {/* Card Number */}
            <div className="font-mono text-xl tracking-wider">
              {cardData.cardNumber || '•••• •••• •••• ••••'}
            </div>

            {/* Card Holder & Expiry */}
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs opacity-70">Card Holder</p>
                <p className="font-semibold text-sm uppercase">
                  {cardData.cardHolder || 'YOUR NAME'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs opacity-70">Expires</p>
                <p className="font-semibold text-sm">
                  {cardData.expiryMonth && cardData.expiryYear
                    ? `${cardData.expiryMonth}/${cardData.expiryYear.slice(-2)}`
                    : 'MM/YY'}
                </p>
              </div>
            </div>
          </div>

          {/* Security Badge */}
          <div className="absolute -bottom-3 right-4 bg-white rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
            <Lock size={16} className="text-green-600" />
            <span className="text-xs font-semibold text-green-600">Secured</span>
          </div>
        </div>

        {/* Amount to Pay */}
        <div className="bg-gradient-to-br from-minsah-accent to-white rounded-2xl p-6 shadow-sm mb-6 border-2 border-minsah-accent">
          <p className="text-sm text-minsah-secondary mb-1">Amount to Pay</p>
          <p className="text-4xl font-bold text-minsah-primary">{formatPrice(bdtTotal)}</p>
        </div>

        {/* Payment Form */}
        <form onSubmit={handlePayment}>
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 space-y-4">
            {/* Card Number */}
            <div>
              <label className="block text-sm font-semibold text-minsah-dark mb-2">
                Card Number *
              </label>
              <input
                type="text"
                name="cardNumber"
                value={cardData.cardNumber}
                onChange={handleInputChange}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                required
                className="w-full px-4 py-3 border-2 border-minsah-accent rounded-xl focus:outline-none focus:ring-2 focus:ring-minsah-primary focus:border-transparent font-mono text-lg"
              />
            </div>

            {/* Card Holder */}
            <div>
              <label className="block text-sm font-semibold text-minsah-dark mb-2">
                Cardholder Name *
              </label>
              <input
                type="text"
                name="cardHolder"
                value={cardData.cardHolder}
                onChange={handleInputChange}
                placeholder="JOHN DOE"
                required
                className="w-full px-4 py-3 border-2 border-minsah-accent rounded-xl focus:outline-none focus:ring-2 focus:ring-minsah-primary focus:border-transparent uppercase"
              />
            </div>

            {/* Expiry & CVV */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-minsah-dark mb-2">
                  Month *
                </label>
                <select
                  name="expiryMonth"
                  value={cardData.expiryMonth}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-3 border-2 border-minsah-accent rounded-xl focus:outline-none focus:ring-2 focus:ring-minsah-primary bg-white"
                >
                  <option value="">MM</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                    <option key={month} value={month.toString().padStart(2, '0')}>
                      {month.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-minsah-dark mb-2">
                  Year *
                </label>
                <select
                  name="expiryYear"
                  value={cardData.expiryYear}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-3 border-2 border-minsah-accent rounded-xl focus:outline-none focus:ring-2 focus:ring-minsah-primary bg-white"
                >
                  <option value="">YYYY</option>
                  {years.map(year => (
                    <option key={year} value={year.toString()}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-minsah-dark mb-2">
                  CVV *
                </label>
                <input
                  type="password"
                  name="cvv"
                  value={cardData.cvv}
                  onChange={handleInputChange}
                  placeholder="123"
                  maxLength={4}
                  required
                  className="w-full px-4 py-3 border-2 border-minsah-accent rounded-xl focus:outline-none focus:ring-2 focus:ring-minsah-primary text-center font-mono text-lg"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Accepted Cards */}
          <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
            <p className="text-xs text-minsah-secondary mb-3">We accept:</p>
            <div className="flex gap-3 flex-wrap">
              <div className="px-4 py-2 bg-minsah-accent rounded-lg font-bold text-xs">VISA</div>
              <div className="px-4 py-2 bg-minsah-accent rounded-lg font-bold text-xs">Mastercard</div>
              <div className="px-4 py-2 bg-minsah-accent rounded-lg font-bold text-xs">Amex</div>
              <div className="px-4 py-2 bg-minsah-accent rounded-lg font-bold text-xs">Discover</div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isProcessing}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition flex items-center justify-center gap-2 ${
              isProcessing
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-minsah-primary text-minsah-light hover:bg-minsah-dark'
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Lock size={20} />
                <span>Pay Securely</span>
                <span>{formatPrice(bdtTotal)}</span>
              </>
            )}
          </button>
        </form>

        {/* Security Notice */}
        <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex gap-3">
            <Lock size={20} className="text-green-600 flex-shrink-0" />
            <div className="text-sm text-green-800">
              <p className="font-semibold mb-1">Your payment is secure</p>
              <p className="text-xs">We use industry-standard SSL encryption to protect your card information. Your details are never stored on our servers.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
