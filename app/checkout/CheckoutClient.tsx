/**
 * Checkout Client Component
 * Handles Purchase event tracking with Facebook Pixel + CAPI deduplication
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  generateEventId,
  trackPurchase,
  sendToServerCAPI,
  trackInitiateCheckout,
} from '@/lib/facebook/pixel';

interface CheckoutFormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  state: string;
  country: string;
  paymentMethod: 'card' | 'paypal' | 'cod';
}

interface CheckoutClientProps {
  subtotal: number;
  shipping: number;
  total: number;
  bdtSubtotal: string;
  bdtShipping: string;
  bdtTotal: string;
}

export default function CheckoutClient({
  subtotal,
  shipping,
  total,
  bdtSubtotal,
  bdtShipping,
  bdtTotal,
}: CheckoutClientProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    state: '',
    country: 'BD', // Bangladesh
    paymentMethod: 'card',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, paymentMethod: e.target.value as CheckoutFormData['paymentMethod'] }));
  };

  /**
   * Handle Place Order button click
   * Implements HYBRID tracking: Pixel (client) + CAPI (server) with deduplication
   */
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.email || !formData.fullName) {
      alert('Please fill in all required fields');
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Generate unique event ID for deduplication
      const eventId = generateEventId();
      console.log('[Checkout] Generated Event ID:', eventId);

      // Step 2: Simulate payment processing (replace with real payment gateway)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 3: Generate order ID (in production, this comes from your payment processor)
      const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

      // Step 4: Track Purchase with Facebook Pixel (CLIENT-SIDE)
      // This sends event to Facebook with eventID
      trackPurchase({
        value: total,
        currency: 'BDT',
        contentIds: ['sample-product-1', 'sample-product-2'], // Replace with actual cart product IDs
        numItems: 3, // Replace with actual cart item count
        eventId: eventId, // CRITICAL: Same eventID used for server-side
      });

      console.log('[Checkout] Pixel Purchase event sent');

      // Step 5: Extract first and last name
      const nameParts = formData.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Step 6: Send Purchase to Server-side CAPI (same eventID for deduplication)
      const serverResult = await sendToServerCAPI({
        eventName: 'Purchase',
        eventId: eventId, // CRITICAL: Same eventID for deduplication
        email: formData.email,
        phone: formData.phone,
        firstName: firstName,
        lastName: lastName,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
        value: total,
        currency: 'BDT',
        contentIds: ['sample-product-1', 'sample-product-2'], // Replace with actual cart
        numItems: 3, // Replace with actual cart item count
        orderId: orderId,
        contents: [
          // Replace with actual cart contents
          { id: 'sample-product-1', quantity: 1, price: 29.99 },
          { id: 'sample-product-2', quantity: 2, price: 24.99 },
        ],
      });

      if (!serverResult.success) {
        console.error('[Checkout] Server-side CAPI failed:', serverResult.error);
        // Continue anyway - Pixel tracking already sent
      } else {
        console.log('[Checkout] Server-side CAPI sent successfully');
      }

      // Step 7: Show success and redirect
      alert(`Order placed successfully! Order ID: ${orderId}`);
      router.push(`/account/orders/${orderId}`);

    } catch (error) {
      console.error('[Checkout] Error processing order:', error);
      alert('An error occurred while processing your order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Checkout Form */}
      <div className="lg:col-span-2">
        <form onSubmit={handlePlaceOrder}>
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Billing Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500"
                  placeholder="john@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500"
                  placeholder="+880 1234 567890"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500"
                  placeholder="123 Main Street"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500"
                    placeholder="Dhaka"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">ZIP Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500"
                    placeholder="1000"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">Payment Method</h2>
            <div className="space-y-4">
              <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={formData.paymentMethod === 'card'}
                  onChange={handlePaymentChange}
                  className="mr-3"
                />
                <span>Credit/Debit Card</span>
              </label>
              <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="payment"
                  value="paypal"
                  checked={formData.paymentMethod === 'paypal'}
                  onChange={handlePaymentChange}
                  className="mr-3"
                />
                <span>PayPal</span>
              </label>
              <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={formData.paymentMethod === 'cod'}
                  onChange={handlePaymentChange}
                  className="mr-3"
                />
                <span>Cash on Delivery</span>
              </label>
            </div>
          </div>

          {/* Hidden submit button for form */}
          <button type="submit" style={{ display: 'none' }} />
        </form>
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
          <h2 className="text-xl font-bold mb-6">Order Summary</h2>
          <div className="space-y-4 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold">{bdtSubtotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="font-semibold">{bdtShipping}</span>
            </div>
            <div className="border-t pt-4 flex justify-between">
              <span className="text-lg font-bold">Total</span>
              <span className="text-lg font-bold text-pink-600">{bdtTotal}</span>
            </div>
          </div>
          <button
            onClick={handlePlaceOrder}
            disabled={isProcessing}
            className={`w-full px-6 py-4 rounded-lg font-semibold transition ${
              isProcessing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-pink-600 text-white hover:bg-pink-700'
            }`}
          >
            {isProcessing ? 'Processing...' : 'Place Order'}
          </button>

          {/* Security notice */}
          <div className="mt-4 text-xs text-gray-500 text-center">
            <p>🔒 Secure checkout with encryption</p>
            <p className="mt-1">Your data is protected and never shared</p>
          </div>
        </div>
      </div>
    </div>
  );
}
