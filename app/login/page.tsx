'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';

// Eye icons inline to avoid import issues
function EyeOpen() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function EyeClosed() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  // If already logged in, redirect immediately
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const redirectTo = searchParams.get('redirect') || '/account';
      router.replace(redirectTo);
    }
  }, [session, status, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Use NextAuth signIn — this sets the session cookie that /account needs
      const result = await signIn('credentials', {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
      });

      if (result?.ok) {
        setSuccess(true);

        // Smart redirect priority:
        // 1. ?redirect= param (e.g. came from checkout)
        // 2. /account dashboard (default for customers)
        const redirectTo = searchParams.get('redirect') || '/account';

        // Small delay for success animation
        setTimeout(() => {
          router.push(redirectTo);
          router.refresh(); // Refresh server components
        }, 600);
      } else {
        // NextAuth error codes
        if (result?.error === 'CredentialsSignin') {
          setError('Email অথবা password ভুল হয়েছে।');
        } else if (result?.error === 'Your account has been suspended') {
          setError('আপনার account suspend করা হয়েছে। Support-এ যোগাযোগ করুন।');
        } else {
          setError(result?.error || 'Login failed। আবার চেষ্টা করুন।');
        }
      }
    } catch {
      setError('Network error। Internet connection চেক করুন।');
    } finally {
      if (!success) setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const redirectTo = searchParams.get('redirect') || '/account';
    try {
      await signIn('google', { callbackUrl: redirectTo });
    } catch {
      setError('Google দিয়ে login করতে সমস্যা হয়েছে।');
    }
  };

  const handleFacebookSignIn = async () => {
    const redirectTo = searchParams.get('redirect') || '/account';
    try {
      await signIn('facebook', { callbackUrl: redirectTo });
    } catch {
      setError('Facebook দিয়ে login করতে সমস্যা হয়েছে।');
    }
  };

  // Show loading while session is being checked
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFE6D2' }}>
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#64320D', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ backgroundColor: '#FFE6D2' }}>
      <div className="w-full max-w-md">

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

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#421C00' }}>Welcome Back!</h1>
          <p className="text-base" style={{ color: '#8E6545' }}>আপনার account-এ login করুন</p>
        </div>

        {/* Redirect info banner */}
        {searchParams.get('redirect') && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm text-center" style={{ backgroundColor: '#FFF3E8', color: '#64320D', border: '1px solid #D4A574' }}>
            🔒 Login করুন — তারপর আপনাকে redirect করা হবে
          </div>
        )}

        {/* Success state */}
        {success && (
          <div className="mb-6 px-4 py-3 rounded-xl text-sm text-center animate-pulse" style={{ backgroundColor: '#F0FFF4', color: '#276749', border: '1px solid #9AE6B4' }}>
            ✅ Login সফল! Redirecting...
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: '#FFF5F5', color: '#C53030', border: '1px solid #FEB2B2' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: '#421C00' }}>
              Email Address
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2" style={{ color: '#8E6545' }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || success}
                className="w-full pl-12 pr-4 py-3 border rounded-full focus:outline-none focus:ring-2 transition-all disabled:opacity-60"
                style={{ borderColor: '#8E6545', backgroundColor: '#FFF', color: '#421C00' }}
                placeholder="Ex: abc@example.com"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: '#421C00' }}>
              Password
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2" style={{ color: '#8E6545' }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || success}
                className="w-full pl-12 pr-12 py-3 border rounded-full focus:outline-none focus:ring-2 transition-all disabled:opacity-60"
                style={{ borderColor: '#8E6545', backgroundColor: '#FFF', color: '#421C00' }}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 transition-opacity hover:opacity-70"
                style={{ color: '#8E6545' }}
              >
                {showPassword ? <EyeOpen /> : <EyeClosed />}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm font-medium hover:underline transition-all"
              style={{ color: '#64320D' }}
            >
              Password ভুলে গেছেন?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-3 px-4 rounded-full font-medium text-white transition-all duration-200 disabled:opacity-60 hover:opacity-90 flex items-center justify-center gap-2"
            style={{ backgroundColor: '#64320D' }}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Logging in...
              </>
            ) : success ? (
              <>✅ Redirecting...</>
            ) : (
              'Login'
            )}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: '#8E6545' }} />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4" style={{ backgroundColor: '#FFE6D2', color: '#8E6545' }}>
                অথবা
              </span>
            </div>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading || success}
            className="w-full py-3 px-4 rounded-full font-medium transition-all duration-200 hover:opacity-90 flex items-center justify-center gap-3 disabled:opacity-60"
            style={{ backgroundColor: '#FFF', color: '#421C00', border: '2px solid #8E6545' }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google দিয়ে Continue
          </button>

          {/* Facebook Sign In */}
          <button
            type="button"
            onClick={handleFacebookSignIn}
            disabled={loading || success}
            className="w-full py-3 px-4 rounded-full font-medium text-white transition-all duration-200 hover:opacity-90 flex items-center justify-center gap-3 disabled:opacity-60"
            style={{ backgroundColor: '#1877F2' }}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook দিয়ে Continue
          </button>
        </form>

        {/* Register Link */}
        <p className="mt-8 text-center text-sm" style={{ color: '#8E6545' }}>
          Account নেই?{' '}
          <Link href="/register" className="font-semibold hover:underline" style={{ color: '#64320D' }}>
            Sign up করুন
          </Link>
        </p>

        {/* Admin link */}
        <p className="mt-3 text-center text-xs" style={{ color: '#B08060' }}>
          Admin?{' '}
          <Link href="/admin/login" className="hover:underline" style={{ color: '#8E6545' }}>
            Admin Panel Login
          </Link>
        </p>
      </div>
    </div>
  );
}

// Suspense wrapper required because useSearchParams() needs it in Next.js
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFE6D2' }}>
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#64320D', borderTopColor: 'transparent' }} />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

// 'use client';

// import { useState } from 'react';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import { signIn } from 'next-auth/react';
// import Image from 'next/image';

// export default function LoginPage() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const router = useRouter();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       // Simulate API call
//       const response = await fetch('/api/auth/login', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         // Set auth cookie
//         document.cookie = `auth_token=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}`;
//         document.cookie = `user_id=${data.user.id}; path=/; max-age=${60 * 60 * 24 * 7}`;

//         // Redirect to account or admin based on role
//         if (data.user.role === 'admin' || data.user.role === 'super-admin') {
//           router.push('/admin');
//         } else {
//           router.push('/');
//         }
//       } else {
//         setError(data.error || 'Login failed');
//       }
//     } catch (err) {
//       setError('Network error. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleGoogleSignIn = async () => {
//     try {
//       await signIn('google', { callbackUrl: '/' });
//     } catch (error) {
//       setError('Failed to sign in with Google');
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ backgroundColor: '#FFE6D2' }}>
//       <div className="w-full max-w-md">
//         {/* Logo */}
//         <div className="text-center mb-8">
//           <div className="flex items-center justify-center mb-6">
//             <div className="text-center">
//               <div className="flex items-center justify-center mb-2">
//                 <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
//                   <path d="M24 4L8 14v20l16 10 16-10V14L24 4z" fill="#64320D"/>
//                   <path d="M24 8L12 16v16l12 8 12-8V16L24 8z" fill="#8E6545"/>
//                 </svg>
//               </div>
//               <h2 className="text-2xl font-bold" style={{ color: '#64320D' }}>Minsah Beauty</h2>
//               <p className="text-sm" style={{ color: '#8E6545' }}>Toxin Free & Natural</p>
//             </div>
//           </div>
//         </div>

//         {/* Login Form */}
//         <div className="text-center mb-8">
//           <h1 className="text-3xl font-bold mb-2" style={{ color: '#421C00' }}>Log in</h1>
//           <p className="text-base" style={{ color: '#8E6545' }}>Let's Get Started !</p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-5">
//           {error && (
//             <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
//               {error}
//             </div>
//           )}

//           {/* Email Field */}
//           <div>
//             <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: '#421C00' }}>
//               Your Email Address
//             </label>
//             <div className="relative">
//               <span className="absolute left-4 top-1/2 transform -translate-y-1/2" style={{ color: '#8E6545' }}>
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
//                 </svg>
//               </span>
//               <input
//                 id="email"
//                 name="email"
//                 type="email"
//                 required
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="w-full pl-12 pr-4 py-3 border rounded-full focus:outline-none focus:ring-2 transition-all"
//                 style={{
//                   borderColor: '#8E6545',
//                   backgroundColor: '#FFF',
//                   color: '#421C00',
//                   // Using Tailwind for focus ring
//                   '--tw-ring-color': '#64320D'
//                 } as React.CSSProperties}
//                 placeholder="Ex: abc@example.com"
//               />
//             </div>
//           </div>

//           {/* Password Field */}
//           <div>
//             <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: '#421C00' }}>
//               Your Password
//             </label>
//             <div className="relative">
//               <span className="absolute left-4 top-1/2 transform -translate-y-1/2" style={{ color: '#8E6545' }}>
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//                 </svg>
//               </span>
//               <input
//                 id="password"
//                 name="password"
//                 type={showPassword ? 'text' : 'password'}
//                 required
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="w-full pl-12 pr-12 py-3 border rounded-full focus:outline-none focus:ring-2 transition-all"
//                 style={{
//                   borderColor: '#8E6545',
//                   backgroundColor: '#FFF',
//                   color: '#421C00'
//                 }}
//                 placeholder="••••••••"
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute right-4 top-1/2 transform -translate-y-1/2"
//                 style={{ color: '#8E6545' }}
//               >
//                 {showPassword ? (
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//                   </svg>
//                 ) : (
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
//                   </svg>
//                 )}
//               </button>
//             </div>
//           </div>

//           {/* Forgot Password Link */}
//           <div className="text-right">
//             <Link
//               href="/forgot-password"
//               className="text-sm font-medium hover:underline"
//               style={{ color: '#64320D' }}
//             >
//               Forgot Password?
//             </Link>
//           </div>

//           {/* Login Button */}
//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full py-3 px-4 rounded-full font-medium text-white transition-all duration-200 disabled:opacity-50 hover:opacity-90"
//             style={{ backgroundColor: '#64320D' }}
//           >
//             {loading ? 'Logging in...' : 'Login'}
//           </button>

//           {/* Divider */}
//           <div className="relative my-6">
//             <div className="absolute inset-0 flex items-center">
//               <div className="w-full border-t" style={{ borderColor: '#8E6545' }} />
//             </div>
//             <div className="relative flex justify-center text-sm">
//               <span className="px-4" style={{ backgroundColor: '#FFE6D2', color: '#8E6545' }}>
//                 or
//               </span>
//             </div>
//           </div>

//           {/* Google Sign In */}
//           <button
//             type="button"
//             onClick={handleGoogleSignIn}
//             className="w-full py-3 px-4 rounded-full font-medium text-white transition-all duration-200 hover:opacity-90 flex items-center justify-center gap-2"
//             style={{ backgroundColor: '#421C00' }}
//           >
//             <svg className="w-5 h-5" viewBox="0 0 24 24">
//               <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
//               <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
//               <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
//               <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
//             </svg>
//             Continue with Google
//           </button>
//         </form>

//         {/* Sign Up Link */}
//         <p className="mt-8 text-center text-sm" style={{ color: '#8E6545' }}>
//           Don't have an account?{' '}
//           <Link href="/register" className="font-semibold hover:underline" style={{ color: '#64320D' }}>
//             Sign up
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }
