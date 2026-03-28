'use client';

import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check } from 'lucide-react';

export default function PaymentMethodPage() {
  const router = useRouter();
  const { paymentMethods, selectedPaymentMethod, setSelectedPaymentMethod } = useCart();

  const handleSelectPayment = (method: typeof paymentMethods[0]) => {
    setSelectedPaymentMethod(method);

    // Navigate to specific payment pages for mobile financial services and cards
    if (method.type === 'bkash') {
      router.push('/checkout/payment/bkash');
    } else if (method.type === 'nagad') {
      router.push('/checkout/payment/nagad');
    } else if (method.type === 'rocket') {
      router.push('/checkout/payment/rocket');
    } else if (method.type === 'card') {
      router.push('/checkout/payment/card');
    } else {
      // For COD and GPay, go back to checkout
      router.back();
    }
  };

  return (
    <div className="min-h-screen bg-minsah-light">
      {/* Header */}
      <header className="bg-minsah-dark text-minsah-light sticky top-0 z-50 shadow-md">
        <div className="px-4 py-4 flex items-center justify-between">
          <Link href="/checkout" className="p-2 hover:bg-minsah-primary rounded-lg transition">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-xl font-semibold">Payment Method</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <div className="px-4 py-6">
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => handleSelectPayment(method)}
              className={`w-full p-4 rounded-2xl border-2 transition-all ${
                selectedPaymentMethod?.id === method.id
                  ? 'border-minsah-primary bg-minsah-accent shadow-md'
                  : 'border-transparent bg-white hover:border-minsah-secondary'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Radio Button */}
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  selectedPaymentMethod?.id === method.id
                    ? 'border-minsah-primary bg-minsah-primary'
                    : 'border-minsah-secondary'
                }`}>
                  {selectedPaymentMethod?.id === method.id && (
                    <Check size={16} className="text-white" />
                  )}
                </div>

                {/* Payment Icon */}
                <div className="w-12 h-12 bg-minsah-accent rounded-xl flex items-center justify-center flex-shrink-0">
                  {method.icon?.startsWith('/') ? (
                    <img src={method.icon} alt={method.name} className="w-8 h-8 object-contain" />
                  ) : (
                    <span className="text-2xl">{method.icon}</span>
                  )}
                </div>

                {/* Payment Name */}
                <div className="flex-1 text-left">
                  <p className="font-semibold text-minsah-dark">{method.name}</p>
                  {method.details && (
                    <p className="text-xs text-minsah-secondary mt-1">{method.details}</p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Info Notice */}
        <div className="mt-6 p-4 bg-white rounded-2xl border border-minsah-accent">
          <p className="text-sm text-minsah-secondary text-center">
            🔒 All payments are secure and encrypted
          </p>
        </div>
      </div>
    </div>
  );
}
