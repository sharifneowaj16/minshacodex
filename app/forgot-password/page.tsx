'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to OTP verification page
        router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ backgroundColor: '#FFE6D2' }}>
      <div className="w-full max-w-md">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/login" className="inline-flex items-center text-sm font-medium hover:underline" style={{ color: '#64320D' }}>
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
        </div>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 4L8 14v20l16 10 16-10V14L24 4z" fill="#64320D"/>
                  <path d="M24 8L12 16v16l12 8 12-8V16L24 8z" fill="#8E6545"/>
                </svg>
              </div>
              <h2 className="text-2xl font-bold" style={{ color: '#64320D' }}>Minsah Beauty</h2>
              <p className="text-sm" style={{ color: '#8E6545' }}>Toxin Free & Natural</p>
            </div>
          </div>
        </div>

        {/* Form Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-3" style={{ color: '#421C00' }}>Forgot Password</h1>
          <p className="text-sm" style={{ color: '#8E6545' }}>
            Please enter your email to reset the password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: '#421C00' }}>
              Email Address
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2" style={{ color: '#8E6545' }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border rounded-full focus:outline-none focus:ring-2 transition-all"
                style={{
                  borderColor: '#8E6545',
                  backgroundColor: '#FFF',
                  color: '#421C00'
                }}
                placeholder="abc@gmail.com"
              />
            </div>
          </div>

          {/* Send OTP Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-full font-medium text-white transition-all duration-200 disabled:opacity-50 hover:opacity-90"
            style={{ backgroundColor: '#64320D' }}
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>

        {/* Navigation Icons (Bottom) */}
        <div className="mt-12 flex justify-center gap-12">
          <Link href="/" className="flex flex-col items-center" style={{ color: '#8E6545' }}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </Link>
          <Link href="/wishlist" className="flex flex-col items-center" style={{ color: '#8E6545' }}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </Link>
          <Link href="/login" className="flex flex-col items-center" style={{ color: '#8E6545' }}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
