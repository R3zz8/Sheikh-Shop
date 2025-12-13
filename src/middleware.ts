import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { getUserPreferredCurrency, parseCurrency, type CurrencyCode, type Locale } from '@/lib/currency';

// Security: Accessor to read JWT secret on demand to avoid build-time/runtime init throws
function getJwtSecret(): string | null {
  const secret = process.env.JWT_SECRET || '';
  if (!secret || secret.length < 32) return null;
  return secret;
}

// Currency/Region helpers
function detectCountryCode(request: NextRequest): string | null {
  return (
    request.headers.get('x-vercel-ip-country') ||
    request.headers.get('cf-ipcountry') ||
    request.headers.get('x-country-code') ||
    null
  );
}

function detectLocaleFromPathname(pathname: string): Locale {
  const first = pathname.split('/').filter(Boolean)[0];
  return first === 'ar' ? 'ar' : 'en';
}

function chooseCurrency(locale: Locale, country: string | null, userPreference?: string): CurrencyCode {
  // 1. Check user's manual preference first
  const parsedPreference = parseCurrency(userPreference);
  if (parsedPreference) {
    return parsedPreference;
  }
  
  // 2. Use locale-based mapping
  const localeCurrency = getUserPreferredCurrency(locale);
  
  // 3. Fallback to EUR (default)
  return localeCurrency;
}

function setCurrencyCookieIfNeeded(request: NextRequest, response: NextResponse) {
  try {
    const pathname = request.nextUrl.pathname;
    const locale = detectLocaleFromPathname(pathname);
    const country = detectCountryCode(request);
    const existingPreference = request.cookies.get('preferred-currency')?.value;
    const desired = chooseCurrency(locale, country, existingPreference);

    // Only set cookie if it's different from existing or doesn't exist
    if (existingPreference !== desired) {
      response.cookies.set('preferred-currency', desired, {
        httpOnly: false,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }
  } catch {
    // Silently handle errors to avoid breaking the middleware
  }
}

// Security: Define allowed roles for restricted app areas
const ALLOWED_ROLES = ['AUTHOR', 'EDITOR', 'ADMIN', 'SUPERADMIN', 'SYSTEM'] as const;
type AllowedRole = typeof ALLOWED_ROLES[number];

// Security: Simple in-memory rate limiting (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(ip: string, userRole?: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 200; // Increased from 100 for admin operations

  // Skip rate limiting for admin users
  if (userRole && ['SUPERADMIN', 'ADMIN', 'EDITOR'].includes(userRole)) {
    return false;
  }

  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return false;
  }

  if (record.count >= maxRequests) {
    return true;
  }

  record.count++;
  return false;
}

// Security: Add security headers to response
function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self' https://www.google-analytics.com https://ssl.google-analytics.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  );
  
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set('X-Download-Options', 'noopen');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  
  return response;
}

async function handleReferralTracking(request: NextRequest, response: NextResponse) {
  const refCode = request.nextUrl.searchParams.get('ref');

  if (refCode) {
    response.cookies.set('referral_code', refCode, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    });

    // Fire-and-forget fetch to the internal API
    fetch(new URL('/api/internal/track-referral', request.url).toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
        'x-forwarded-for': request.headers.get('x-forwarded-for') || '',
        'user-agent': request.headers.get('user-agent') || ''
      },
      body: JSON.stringify({
        pathname: request.nextUrl.pathname,
        search: request.nextUrl.search,
      }),
    }).catch(error => {
      console.error('Failed to track referral:', error);
    });
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isApiRoute = pathname.startsWith('/api');
  const hasJwtSecret = !!getJwtSecret();

  // Security: Prevent redirect loops
  const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password', '/system-login', '/verify-email-sent'].includes(pathname);
  if (isAuthPage) {
    const response = NextResponse.next();
    setCurrencyCookieIfNeeded(request, response);
    return addSecurityHeaders(response);
  }

  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

  if (
    isApiRoute && (
      pathname.startsWith('/api/auth') ||
      pathname.startsWith('/api/login') ||
      pathname.startsWith('/api/register') ||
      pathname.startsWith('/api/csrf') ||
      pathname.startsWith('/api/amazing-deals') ||
      pathname.startsWith('/api/units') ||
      pathname.startsWith('/api/og') ||
      pathname.startsWith('/api/mobile-carousel') ||
      pathname.startsWith('/api/internal') // Allow internal API calls
    )
  ) {
    const response = NextResponse.next();
    setCurrencyCookieIfNeeded(request, response);
    return addSecurityHeaders(response);
  }

  const isPublicRoute = [
    '/', '/products', '/product', '/categories', '/about-us', '/contact',
    '/terms', '/privacy', '/article', '/checkout',
  ].some(route => pathname.startsWith(route) || pathname.startsWith(`/ar${route === '/' ? '' : route}`));

  if (isPublicRoute && !isApiRoute) {
    const response = NextResponse.next();
    setCurrencyCookieIfNeeded(request, response);
    await handleReferralTracking(request, response);
    return addSecurityHeaders(response);
  }

  const accessToken = request.cookies.get('access-token')?.value;
  const refreshToken = request.cookies.get('refresh-token')?.value;

  const isProtectedRoute = pathname.startsWith('/dashboard') || 
                          pathname.startsWith('/admin') || 
                          pathname.startsWith('/user') ||
                          (isApiRoute && !pathname.startsWith('/api/auth') && !pathname.startsWith('/api/login') && !pathname.startsWith('/api/register') && !pathname.startsWith('/api/csrf'));

  if (isProtectedRoute && !accessToken && !refreshToken) {
    const response = isApiRoute
      ? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      : NextResponse.redirect(new URL('/login', request.url));
    
    setCurrencyCookieIfNeeded(request, response);
    return addSecurityHeaders(response);
  }

  let user: { id: string; email: string; role: string; sessionId: string } | null = null;

  try {
    if (!hasJwtSecret) throw new Error('Missing JWT secret');

    if (accessToken) {
      const JWT_SECRET = getJwtSecret()!;
      const { payload } = await jwtVerify(
        accessToken,
        new TextEncoder().encode(JWT_SECRET),
        { algorithms: ['HS256'], issuer: 'sheikh-shop', audience: 'sheikh-shop-users' },
      );
      user = payload as any;
    } else if (refreshToken) {
      const JWT_SECRET = getJwtSecret()!;
      const { payload } = await jwtVerify(
        refreshToken,
        new TextEncoder().encode(JWT_SECRET),
        { algorithms: ['HS256'], issuer: 'sheikh-shop', audience: 'sheikh-shop-refresh' },
      );
      user = payload as any; // Simplified for Edge, no DB access
    }
  } catch (error) {
    if (refreshToken) {
       try {
        const JWT_SECRET = getJwtSecret()!;
        await jwtVerify(
          refreshToken,
          new TextEncoder().encode(JWT_SECRET),
          { algorithms: ['HS256'], issuer: 'sheikh-shop', audience: 'sheikh-shop-refresh' },
        );
       } catch (refreshError) {
        const response = isApiRoute
          ? NextResponse.json({ error: 'Session expired. Please log in again.' }, { status: 401 })
          : NextResponse.redirect(new URL('/login', request.url));
        
        response.cookies.delete('access-token');
        response.cookies.delete('refresh-token');
        
        setCurrencyCookieIfNeeded(request, response);
        return addSecurityHeaders(response);
       }
    } else {
        const response = isApiRoute
          ? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
          : NextResponse.redirect(new URL('/login', request.url));
        setCurrencyCookieIfNeeded(request, response);
        return addSecurityHeaders(response);
    }
  }

  const isArticleOperation = pathname.includes('/dashboard/articles') && ['POST', 'PATCH', 'PUT'].includes(request.method);
  
  if (!isArticleOperation && isRateLimited(ip, user?.role)) {
    const response = isApiRoute
      ? NextResponse.json({ error: 'Too many requests' }, { status: 429 })
      : NextResponse.redirect(new URL('/login', request.url));
    setCurrencyCookieIfNeeded(request, response);
    return addSecurityHeaders(response);
  }

  if (isProtectedRoute && !user) {
    const response = isApiRoute
      ? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      : NextResponse.redirect(new URL('/login', request.url));
    
    setCurrencyCookieIfNeeded(request, response);
    return addSecurityHeaders(response);
  }

  const requiresRole = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');
  if (requiresRole && user && !ALLOWED_ROLES.includes(user.role as AllowedRole)) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    setCurrencyCookieIfNeeded(request, response);
    return addSecurityHeaders(response);
  }

  const response = NextResponse.next();
  if (user) {
      response.headers.set('x-user-id', user.id);
      response.headers.set('x-user-role', user.role);
      response.headers.set('x-session-id', user.sessionId);
  }
  setCurrencyCookieIfNeeded(request, response);

  await handleReferralTracking(request, response);
  
  return addSecurityHeaders(response);
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/user/:path*',
    '/api/:path*',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/system-login',
    '/verify-email-sent',
    '/',
    '/products/:path*',
    '/product/:path*',
    '/categories/:path*',
    '/about-us',
    '/contact',
    '/terms',
    '/privacy',
    '/article/:path*',
    '/checkout',
    '/ar/:path*',
  ],
};