'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface VerifyOTPClientProps {
  email: string;
}

export function VerifyOTPClient({ email }: VerifyOTPClientProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split('').forEach((char, index) => {
      if (index < 6) {
        newOtp[index] = char;
      }
    });
    setOtp(newOtp);

    // Focus the last filled input or the next empty one
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp: otpCode }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to reset password page with token
        router.push(`/reset-password?token=${data.token}`);
      } else {
        setError(data.error || 'Invalid OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResending(true);
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        // Clear OTP inputs
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        // You could show a success message here
      } else {
        setError('Failed to resend OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ backgroundColor: '#FFE6D2' }}>
      <div className="w-full max-w-md">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/forgot-password" className="inline-flex items-center text-sm font-medium hover:underline" style={{ color: '#64320D' }}>
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
          <p className="text-sm px-4" style={{ color: '#8E6545' }}>
            We sent an OTP to <span className="font-semibold" style={{ color: '#64320D' }}>{email || 'your email'}</span>. Please enter that 6 digit code mentioned in the email
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* OTP Input Boxes */}
          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-12 h-14 text-center text-xl font-semibold border-2 rounded-lg focus:outline-none focus:ring-2 transition-all"
                style={{
                  borderColor: digit ? '#64320D' : '#8E6545',
                  backgroundColor: '#FFF',
                  color: '#421C00',
                  boxShadow: digit ? '0 0 0 1px #64320D' : 'none'
                }}
              />
            ))}
          </div>

          {/* Verify OTP Button */}
          <button
            type="submit"
            disabled={loading || otp.join('').length !== 6}
            className="w-full py-3 px-4 rounded-full font-medium text-white transition-all duration-200 disabled:opacity-50 hover:opacity-90"
            style={{ backgroundColor: '#64320D' }}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>

          {/* Resend OTP */}
          <div className="text-center">
            <p className="text-sm" style={{ color: '#8E6545' }}>
              Haven't got the email yet?{' '}
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resending}
                className="font-semibold hover:underline disabled:opacity-50"
                style={{ color: '#64320D' }}
              >
                {resending ? 'Resending...' : 'Resend OTP'}
              </button>
            </p>
          </div>
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
