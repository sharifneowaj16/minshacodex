'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PasswordResetSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect to login after 3 seconds
    const timer = setTimeout(() => {
      router.push('/login');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ backgroundColor: '#FFE6D2' }}>
      <div className="w-full max-w-md text-center">
        {/* Success Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            {/* Outer Circle with Animation */}
            <div className="w-40 h-40 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FFF' }}>
              {/* Inner Success Circle */}
              <div className="w-32 h-32 rounded-full flex items-center justify-center relative" style={{ backgroundColor: '#FFE6D2' }}>
                {/* Checkmark */}
                <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="#64320D" strokeWidth="2" fill="none" />
                  <path d="M8 12l2.5 2.5 5.5-5.5" stroke="#64320D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>

                {/* Decorative Dots */}
                <div className="absolute -top-2 -left-2 w-2 h-2 rounded-full" style={{ backgroundColor: '#8E6545' }}></div>
                <div className="absolute -top-1 -right-3 w-2 h-2 rounded-full" style={{ backgroundColor: '#8E6545' }}></div>
                <div className="absolute -bottom-2 -left-3 w-2 h-2 rounded-full" style={{ backgroundColor: '#8E6545' }}></div>
                <div className="absolute -bottom-1 -right-2 w-2 h-2 rounded-full" style={{ backgroundColor: '#8E6545' }}></div>
                <div className="absolute top-0 -left-4 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#64320D' }}></div>
                <div className="absolute top-2 -right-4 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#64320D' }}></div>
                <div className="absolute -bottom-3 left-1 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#64320D' }}></div>
                <div className="absolute -bottom-2 right-0 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#64320D' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#421C00' }}>
            Password updated
          </h1>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#421C00' }}>
            Successfully !
          </h2>
          <p className="text-sm" style={{ color: '#8E6545' }}>
            Your password has been changed successfully.
            <br />
            Redirecting to login...
          </p>
        </div>

        {/* Login Button */}
        <Link
          href="/login"
          className="inline-block w-full max-w-xs py-3 px-6 rounded-full font-medium text-white transition-all duration-200 hover:opacity-90"
          style={{ backgroundColor: '#64320D' }}
        >
          Back to Login
        </Link>

        {/* Navigation Icons (Bottom) */}
        <div className="mt-16 flex justify-center gap-12">
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
