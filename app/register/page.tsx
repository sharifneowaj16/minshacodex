'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';

function EyeOpen() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function EyeClosed() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  // Already logged in → redirect
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      router.replace('/account');
    }
  }, [session, status, router]);

  const validatePassword = (pass: string): string | null => {
    if (pass.length < 8) return 'Password কমপক্ষে 8 character হতে হবে';
    if (!/[A-Z]/.test(pass)) return 'একটি uppercase letter থাকতে হবে';
    if (!/[0-9]/.test(pass)) return 'একটি number থাকতে হবে';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (password !== confirmPassword) {
      setError('Password দুটো মিলছে না।');
      return;
    }
    const passError = validatePassword(password);
    if (passError) {
      setError(passError);
      return;
    }

    setLoading(true);

    try {
      // Step 1: Register via API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email: email.toLowerCase().trim(), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.details && Array.isArray(data.details)) {
          setError(data.details[0] || data.error || 'Registration failed');
        } else {
          setError(data.error || 'Registration failed। আবার চেষ্টা করুন।');
        }
        setLoading(false);
        return;
      }

      // Step 2: Auto-login after successful registration
      const loginResult = await signIn('credentials', {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
      });

      if (loginResult?.ok) {
        setSuccess(true);
        const redirectTo = searchParams.get('redirect') || '/account';
        setTimeout(() => {
          router.push(redirectTo);
          router.refresh();
        }, 800);
      } else {
        // Registration succeeded but auto-login failed — redirect to login
        router.push('/login?registered=true');
      }
    } catch {
      setError('Network error। Internet connection চেক করুন।');
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const redirectTo = searchParams.get('redirect') || '/account';
    await signIn('google', { callbackUrl: redirectTo });
  };

  const handleFacebookSignIn = async () => {
    const redirectTo = searchParams.get('redirect') || '/account';
    await signIn('facebook', { callbackUrl: redirectTo });
  };

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
                <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
                  <path d="M24 4L8 14v20l16 10 16-10V14L24 4z" fill="#64320D"/>
                  <path d="M24 8L12 16v16l12 8 12-8V16L24 8z" fill="#8E6545"/>
                </svg>
              </div>
              <h2 className="text-2xl font-bold" style={{ color: '#64320D' }}>Minsah Beauty</h2>
              <p className="text-sm" style={{ color: '#8E6545' }}>Toxin Free & Natural</p>
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#421C00' }}>Sign up</h1>
          <p className="text-base" style={{ color: '#8E6545' }}>Start Your Beauty Journey!</p>
        </div>

        {success && (
          <div className="mb-6 px-4 py-3 rounded-xl text-sm text-center" style={{ backgroundColor: '#F0FFF4', color: '#276749', border: '1px solid #9AE6B4' }}>
            ✅ Account তৈরি হয়েছে! আপনাকে dashboard-এ নিয়ে যাচ্ছি...
          </div>
        )}

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: '#FFF5F5', color: '#C53030', border: '1px solid #FEB2B2' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2" style={{ color: '#421C00' }}>
              আপনার নাম
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2" style={{ color: '#8E6545' }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              <input
                id="name" name="name" type="text" required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading || success}
                className="w-full pl-12 pr-4 py-3 border rounded-full focus:outline-none focus:ring-2 transition-all disabled:opacity-60"
                style={{ borderColor: '#8E6545', backgroundColor: '#FFF', color: '#421C00' }}
                placeholder="Ex: John David"
              />
            </div>
          </div>

          {/* Email */}
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
                id="email" name="email" type="email" required
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                id="password" name="password"
                type={showPassword ? 'text' : 'password'} required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || success}
                className="w-full pl-12 pr-12 py-3 border rounded-full focus:outline-none focus:ring-2 transition-all disabled:opacity-60"
                style={{ borderColor: '#8E6545', backgroundColor: '#FFF', color: '#421C00' }}
                placeholder="কমপক্ষে 8 character"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 hover:opacity-70"
                style={{ color: '#8E6545' }}>
                {showPassword ? <EyeOpen /> : <EyeClosed />}
              </button>
            </div>
            <p className="text-xs mt-1 ml-2" style={{ color: '#8E6545' }}>
              ৮+ character, একটি uppercase ও একটি number লাগবে
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2" style={{ color: '#421C00' }}>
              Password Confirm করুন
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2" style={{ color: '#8E6545' }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </span>
              <input
                id="confirmPassword" name="confirmPassword"
                type={showConfirm ? 'text' : 'password'} required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading || success}
                className="w-full pl-12 pr-12 py-3 border rounded-full focus:outline-none focus:ring-2 transition-all disabled:opacity-60"
                style={{
                  borderColor: confirmPassword && confirmPassword !== password ? '#FC8181' : '#8E6545',
                  backgroundColor: '#FFF',
                  color: '#421C00'
                }}
                placeholder="আবার টাইপ করুন"
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 hover:opacity-70"
                style={{ color: '#8E6545' }}>
                {showConfirm ? <EyeOpen /> : <EyeClosed />}
              </button>
            </div>
            {confirmPassword && confirmPassword !== password && (
              <p className="text-xs mt-1 ml-2" style={{ color: '#C53030' }}>Password মিলছে না</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-3 px-4 rounded-full font-medium text-white transition-all duration-200 disabled:opacity-60 hover:opacity-90 flex items-center justify-center gap-2"
            style={{ backgroundColor: '#64320D' }}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Account তৈরি হচ্ছে...
              </>
            ) : success ? '✅ সফল!' : 'Sign up'}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: '#8E6545' }} />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4" style={{ backgroundColor: '#FFE6D2', color: '#8E6545' }}>অথবা</span>
            </div>
          </div>

          {/* Google */}
          <button
            type="button" onClick={handleGoogleSignIn}
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

          {/* Facebook */}
          <button
            type="button" onClick={handleFacebookSignIn}
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

        <p className="mt-8 text-center text-sm" style={{ color: '#8E6545' }}>
          ইতিমধ্যে account আছে?{' '}
          <Link href="/login" className="font-semibold hover:underline" style={{ color: '#64320D' }}>
            Login করুন
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFE6D2' }}>
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#64320D', borderTopColor: 'transparent' }} />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}

// 'use client';

// import { useState } from 'react';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import { signIn } from 'next-auth/react';

// export default function RegisterPage() {
//   const [name, setName] = useState('');
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
//       const response = await fetch('/api/auth/register', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ name, email, password }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         // Redirect to login or home page
//         router.push('/login');
//       } else {
//         setError(data.error || 'Registration failed');
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

//         {/* Register Form */}
//         <div className="text-center mb-8">
//           <h1 className="text-3xl font-bold mb-2" style={{ color: '#421C00' }}>Sign up</h1>
//           <p className="text-base" style={{ color: '#8E6545' }}>Start Your Beauty Journey !</p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-5">
//           {error && (
//             <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
//               {error}
//             </div>
//           )}

//           {/* Name Field */}
//           <div>
//             <label htmlFor="name" className="block text-sm font-medium mb-2" style={{ color: '#421C00' }}>
//               Your Name
//             </label>
//             <div className="relative">
//               <span className="absolute left-4 top-1/2 transform -translate-y-1/2" style={{ color: '#8E6545' }}>
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                 </svg>
//               </span>
//               <input
//                 id="name"
//                 name="name"
//                 type="text"
//                 required
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 className="w-full pl-12 pr-4 py-3 border rounded-full focus:outline-none focus:ring-2 transition-all"
//                 style={{
//                   borderColor: '#8E6545',
//                   backgroundColor: '#FFF',
//                   color: '#421C00'
//                 }}
//                 placeholder="Ex: John David"
//               />
//             </div>
//           </div>

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
//                   color: '#421C00'
//                 }}
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

//           {/* Sign Up Button */}
//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full py-3 px-4 rounded-full font-medium text-white transition-all duration-200 disabled:opacity-50 hover:opacity-90"
//             style={{ backgroundColor: '#64320D' }}
//           >
//             {loading ? 'Signing up...' : 'Sign up'}
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

//         {/* Login Link */}
//         <p className="mt-8 text-center text-sm" style={{ color: '#8E6545' }}>
//           Already have an account?{' '}
//           <Link href="/login" className="font-semibold hover:underline" style={{ color: '#64320D' }}>
//             Login
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }
