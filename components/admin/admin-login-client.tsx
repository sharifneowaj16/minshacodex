'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Eye, EyeOff, Lock, Mail, ArrowLeft } from 'lucide-react';

interface AdminLoginClientProps {
  redirectTo: string;
}

export function AdminLoginClient({ redirectTo }: AdminLoginClientProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { login, user, isLoading: authLoading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      setIsLoggedIn(true);
      setTimeout(() => {
        router.push(redirectTo);
      }, 500);
    }
  }, [user, authLoading, router, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        setIsLoggedIn(true);
        setTimeout(() => {
          router.push(redirectTo);
        }, 500);
      } else {
        setError(result.error || 'Invalid email or password');
        setIsLoading(false);
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isLoggedIn || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Successful!</h2>
          <p className="text-gray-600 mb-4">Redirecting to admin dashboard...</p>
          <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto">
            <div className="bg-purple-600 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 to-pink-600 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-black/20"></div>

        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-8">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-purple-600 font-bold text-xl">M</span>
            </div>
            <span className="text-white text-2xl font-semibold">Minsah Beauty Admin</span>
          </div>

          <div className="max-w-md">
            <h1 className="text-4xl font-bold text-white mb-4">
              Admin Dashboard
            </h1>
            <p className="text-white/90 text-lg leading-relaxed">
              Manage your beauty empire with our powerful admin tools.
              Control products, orders, customers, and analytics all in one place.
            </p>
          </div>
        </div>

        <div className="relative z-10">
          <div className="space-y-4 text-white/80">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">&#10003;</span>
              </div>
              <div>
                <div className="text-white font-medium">Complete Order Management</div>
                <div className="text-white/70 text-sm">Track and process orders efficiently</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">&#10003;</span>
              </div>
              <div>
                <div className="text-white font-medium">Product Control</div>
                <div className="text-white/70 text-sm">Manage inventory and pricing</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">&#10003;</span>
              </div>
              <div>
                <div className="text-white font-medium">Customer Analytics</div>
                <div className="text-white/70 text-sm">Deep insights into your business</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center space-x-2 mb-8 lg:hidden">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <span className="text-purple-600 text-2xl font-semibold">Admin</span>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your admin dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  placeholder="Enter your email address"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-purple-600 hover:text-purple-500 transition-colors inline-flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Back to Main Site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
