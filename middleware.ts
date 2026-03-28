import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Get allowed origins from environment or use defaults
function getAllowedOrigins(): string[] {
  const envOrigins = process.env.ALLOWED_ORIGINS;
  if (envOrigins) {
    return envOrigins.split(',').map((origin) => origin.trim());
  }

  // Default origins based on environment
  if (process.env.NODE_ENV === 'production') {
    return [
      'https://minsahbeauty.cloud',
      'https://www.minsahbeauty.cloud',
    ];
  }

  return ['http://localhost:3000', 'http://127.0.0.1:3000'];
}

// Check if origin is allowed
function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return true; // Allow same-origin requests
  const allowedOrigins = getAllowedOrigins();
  return allowedOrigins.includes(origin);
}

function hasUserAuthCookie(request: NextRequest): boolean {
  return Boolean(
    request.cookies.get('auth_token')?.value ||
      request.cookies.get('refresh_token')?.value ||
      request.cookies.get('next-auth.session-token')?.value ||
      request.cookies.get('__Secure-next-auth.session-token')?.value
  );
}

// Generate nonce for CSP
function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Buffer.from(array).toString('base64');
}

// Create base response with security headers
function createSecureResponse(response: NextResponse): NextResponse {
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self), payment=(self)');

  // CSP header for production
  if (process.env.NODE_ENV === 'production') {
    const minioHost = process.env.MINIO_ENDPOINT || 'storage.minsahbeauty.cloud';

    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net https://www.google-analytics.com; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      `img-src 'self' data: https: blob: http://${minioHost}:9000 https://${minioHost}; ` +
      "font-src 'self' https://fonts.gstatic.com; " +
      `connect-src 'self' https://www.google-analytics.com https://graph.facebook.com wss: http://${minioHost}:9000; ` +
      "frame-ancestors 'none'; " +
      "base-uri 'self'; " +
      "form-action 'self'; " +
      "upgrade-insecure-requests;"
    );
  }

  return response;
}

// Handle CORS preflight and headers
function handleCors(request: NextRequest, response: NextResponse): NextResponse {
  const origin = request.headers.get('origin');
  const allowedOrigins = getAllowedOrigins();

  // Check if origin is allowed
  if (origin && isOriginAllowed(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    // Same-origin request or server-to-server
    response.headers.set('Access-Control-Allow-Origin', allowedOrigins[0]);
  }

  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Max-Age', '86400');

  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });
    return handleCors(request, response);
  }

  // Handle API routes
  if (pathname.startsWith('/api')) {
    const response = NextResponse.next();
    // Do NOT set a fixed Content-Type here.
    // - Response Content-Type is set by each route handler (e.g. NextResponse.json()).
    // - Upload routes receive multipart/form-data requests; forcing application/json
    //   onto the NextResponse.next() object overwrites the forwarded request Content-Type
    //   header in Next.js App Router middleware, causing request.formData() to throw.
    return handleCors(request, createSecureResponse(response));
  }

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    // Allow access to login page
    if (pathname === '/admin/login') {
      return createSecureResponse(NextResponse.next());
    }

    // Check for admin access token
    const accessToken = request.cookies.get('admin_access_token');
    const refreshToken = request.cookies.get('admin_refresh_token');

    // No tokens at all - redirect to login
    if (!accessToken && !refreshToken) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return createSecureResponse(NextResponse.redirect(loginUrl));
    }

    // Has refresh token but no access token - let the client handle refresh
    // The AdminAuthContext will automatically try to refresh
    if (!accessToken && refreshToken) {
      return createSecureResponse(NextResponse.next());
    }

    // Access token exists - allow access
    // Actual token verification happens in the API routes
    return createSecureResponse(NextResponse.next());
  }

  // Protect user account routes
  if (pathname.startsWith('/account')) {
    // Allow login and register pages
    if (pathname === '/login' || pathname === '/register') {
      return createSecureResponse(NextResponse.next());
    }

    if (!hasUserAuthCookie(request)) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return createSecureResponse(NextResponse.redirect(loginUrl));
    }

    return createSecureResponse(NextResponse.next());
  }

  // All other routes
  return createSecureResponse(NextResponse.next());
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/account/:path*',
    '/api/:path*',
    // Exclude static files and images
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.ico$).*)',
  ],
};
