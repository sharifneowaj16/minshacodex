'use client';

import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { X, Loader2 } from 'lucide-react';

interface SocialLoginModalProps {
  onSuccess: (userId: string, userName: string) => void;
  onClose: () => void;
  purpose: 'send_gift' | 'get_gift';
}

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <defs>
      <linearGradient id="ig" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FED373"/>
        <stop offset="25%" stopColor="#F15245"/>
        <stop offset="50%" stopColor="#D92E7F"/>
        <stop offset="75%" stopColor="#9B36B7"/>
        <stop offset="100%" stopColor="#515ECF"/>
      </linearGradient>
    </defs>
    <path fill="url(#ig)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

export default function SocialLoginModal({ onSuccess, onClose, purpose }: SocialLoginModalProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<string | null>(null);

  // Already logged in — auto-proceed
  if (session?.user) {
    const userId = (session.user as any).id;
    const userName = session.user.name || session.user.email || 'User';
    setTimeout(() => onSuccess(userId, userName), 0);
    return null;
  }

  const handleLogin = async (provider: 'google' | 'facebook') => {
    setLoading(provider);
    try {
      const result = await signIn(provider, {
        redirect: false,
        callbackUrl: window.location.href,
      });

      if (result?.error) {
        console.error('Login error:', result.error);
        setLoading(null);
        return;
      }

      // Session will update via useSession
      // Wait briefly then check session
      setTimeout(async () => {
        const res = await fetch('/api/auth/session');
        const sess = await res.json();
        if (sess?.user) {
          onSuccess(sess.user.id, sess.user.name || sess.user.email);
        }
        setLoading(null);
      }, 1500);
    } catch {
      setLoading(null);
    }
  };

  const purposeText = purpose === 'send_gift'
    ? 'Gift পাঠাতে login করুন'
    : 'Gift request করতে login করুন';

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-[#1A0D06]">{purposeText}</h3>
          <p className="text-xs text-[#8B5E3C] mt-0.5">একবার login করলে পরের বার লাগবে না</p>
        </div>
        <button onClick={onClose} className="text-[#8B5E3C] hover:text-[#3D1F0E]">
          <X size={18} />
        </button>
      </div>

      {/* Social buttons */}
      <div className="space-y-2.5">
        {/* Google */}
        <button
          onClick={() => handleLogin('google')}
          disabled={!!loading}
          className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-[#D4B896] rounded-2xl text-sm font-medium text-[#1A0D06] hover:bg-[#F5E9DC] transition disabled:opacity-60 active:scale-95"
        >
          {loading === 'google'
            ? <Loader2 size={18} className="animate-spin text-[#8B5E3C]" />
            : <GoogleIcon />
          }
          Google দিয়ে continue করুন
        </button>

        {/* Facebook */}
        <button
          onClick={() => handleLogin('facebook')}
          disabled={!!loading}
          className="w-full flex items-center gap-3 px-4 py-3 bg-[#1877F2] rounded-2xl text-sm font-medium text-white hover:bg-[#1565D8] transition disabled:opacity-60 active:scale-95"
        >
          {loading === 'facebook'
            ? <Loader2 size={18} className="animate-spin text-white" />
            : <FacebookIcon />
          }
          Facebook দিয়ে continue করুন
        </button>

        {/* Instagram — same as Facebook */}
        <button
          onClick={() => handleLogin('facebook')}
          disabled={!!loading}
          className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-[#D4B896] rounded-2xl text-sm font-medium text-[#1A0D06] hover:bg-[#F5E9DC] transition disabled:opacity-60 active:scale-95"
        >
          {loading === 'facebook' ? (
            <Loader2 size={18} className="animate-spin text-[#8B5E3C]" />
          ) : (
            <InstagramIcon />
          )}
          Instagram দিয়ে continue করুন
        </button>
      </div>

      <p className="text-[10px] text-[#A0856A] text-center mt-4 leading-relaxed">
        Login করলে Minsah Beauty-র{' '}
        <span className="underline cursor-pointer">Terms</span> এবং{' '}
        <span className="underline cursor-pointer">Privacy Policy</span> মেনে নিচ্ছেন
      </p>
    </div>
  );
}
