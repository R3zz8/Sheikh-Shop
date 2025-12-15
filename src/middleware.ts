import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { getUserPreferredCurrency, parseCurrency, type CurrencyCode, type Locale } from '@/lib/currency';
import { getCachedSession } from '@/lib/redis';

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

  console.log('[RATE_LIMIT] Checking rate limit', { ip, now, userRole });

  // Skip rate limiting for admin users
  if (userRole && ['SUPERADMIN', 'ADMIN', 'EDITOR'].includes(userRole)) {
    console.log('[RATE_LIMIT] Admin user, skipping rate limit', { ip, userRole });
    return false;
  }

  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    console.log('[RATE_LIMIT] New window started', { ip, count: 1 });
    return false;
  }

  if (record.count >= maxRequests) {
    console.log('[RATE_LIMIT] Rate limit exceeded', { ip, count: record.count, maxRequests });
    return true;
  }

  record.count++;
  console.log('[RATE_LIMIT] Request allowed', { ip, count: record.count, maxRequests });
  return false;
}

// Security: Add security headers to response
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Security: Strict security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Security: Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  );
  
  // Security: Additional security headers
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set('X-Download-Options', 'noopen');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  
  return response;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isApiRoute = pathname.startsWith('/api');
  const hasJwtSecret = !!getJwtSecret();

  console.log('[MIDDLEWARE] Processing request', { 
    pathname, 
    isApiRoute, 
    method: request.method,
    hasJwtSecret 
  });

  // Security: Prevent redirect loops by checking if we're already on an auth page
  const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password', '/system-login', '/verify-email-sent'].includes(pathname);
  if (isAuthPage) {
    console.log('[MIDDLEWARE] Auth page, skipping auth check');
    const response = NextResponse.next();
    setCurrencyCookieIfNeeded(request, response);
    return addSecurityHeaders(response);
  }

  // Capture IP early for later rate limiting
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

  // Skip auth for specific API routes (handled by their own logic)
  if (
    isApiRoute && (
      pathname.startsWith('/api/health') || // PPS-FIX: Exclude health check from all middleware processing
      pathname.startsWith('/api/auth') ||
      pathname.startsWith('/api/login') ||
      pathname.startsWith('/api/register') ||
      pathname.startsWith('/api/csrf') ||
      pathname.startsWith('/api/amazing-deals') ||
      pathname.startsWith('/api/units') ||
      pathname.startsWith('/api/og') ||
      pathname.startsWith('/api/mobile-carousel') // FIXED: Exempt public carousel API from auth
    )
  ) {
    const response = NextResponse.next();
    setCurrencyCookieIfNeeded(request, response);
    return addSecurityHeaders(response);
  }

  // Define public routes that don't require authentication
  const isPublicRoute = [
    '/', // Home page
    '/products',
    '/product',
    '/categories',
    '/about-us',
    '/contact',
    '/terms',
    '/privacy',
    '/article',
    '/checkout', // Allow checkout for guest users
  ].some(route => pathname.startsWith(route) || pathname.startsWith(`/ar${route === '/' ? '' : route}`));

  // Allow public access to store pages
  if (isPublicRoute && !isApiRoute) {
    const response = NextResponse.next();
    setCurrencyCookieIfNeeded(request, response);
    return addSecurityHeaders(response);
  }

  // Security: Get tokens from cookies
  const accessToken = request.cookies.get('access-token')?.value;
  const refreshToken = request.cookies.get('refresh-token')?.value;

  // Only require authentication for protected routes
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

  console.log('[MIDDLEWARE] Token validation', { 
    hasAccessToken: !!accessToken, 
    hasRefreshToken: !!refreshToken,
    accessTokenLength: accessToken?.length || 0,
    refreshTokenLength: refreshToken?.length || 0
  });

  try {
    if (!hasJwtSecret) {
      throw new Error('Missing JWT secret');
    }
    // Verify access token first
    if (accessToken) {
      console.log('[MIDDLEWARE] Verifying access token');
      const JWT_SECRET = getJwtSecret();
      if (!JWT_SECRET) throw new Error('Missing JWT secret');
      const { payload } = await jwtVerify(
        accessToken,
        new TextEncoder().encode(JWT_SECRET),
        {
          algorithms: ['HS256'],
          issuer: 'sheikh-shop',
          audience: 'sheikh-shop-users',
        },
      );
      console.log('[MIDDLEWARE] Access token valid', { userId: payload.id });
      // Fast path: resolve user from cache using sessionId
      const cached = payload.sessionId ? await getCachedSession(String(payload.sessionId)) : null;
      user = cached || (payload as { id: string; email: string; role: string; sessionId: string });
      console.log('[MIDDLEWARE] User resolved', { userId: user?.id, fromCache: !!cached });
    }
  } catch (error) {
    console.log('[MIDDLEWARE] Access token invalid', { error: error instanceof Error ? error.message : 'Unknown error' });
    // Access token invalid/expired, try refresh token (validate only, avoid DB when possible)
    if (refreshToken) {
      try {
        console.log('[MIDDLEWARE] Attempting refresh token');
        const JWT_SECRET = getJwtSecret();
        if (!JWT_SECRET) throw new Error('Missing JWT secret');
        const { payload } = await jwtVerify(
          refreshToken,
          new TextEncoder().encode(JWT_SECRET),
          {
            algorithms: ['HS256'],
            issuer: 'sheikh-shop',
            audience: 'sheikh-shop-refresh',
          },
        );
        console.log('[MIDDLEWARE] Refresh token valid', { userId: payload.id });
        const cached = payload.sessionId ? await getCachedSession(String(payload.sessionId)) : null;
        if (cached && cached.sessionId && cached.id) {
          user = cached;
          console.log('[MIDDLEWARE] User resolved from refresh cache', { userId: user.id });
        }
      } catch (refreshError) {
        // If refresh token is also invalid, clear cookies and redirect to login
        console.warn('[MIDDLEWARE] Refresh token invalid:', refreshError);
        console.log('[MIDDLEWARE] Clearing cookies and redirecting to login');
        const response = isApiRoute
          ? NextResponse.json({ error: 'Session expired. Please log in again.' }, { status: 401 })
          : NextResponse.redirect(new URL('/login', request.url));
        
        // Clear invalid cookies
        response.cookies.delete('access-token');
        response.cookies.delete('refresh-token');
        
        setCurrencyCookieIfNeeded(request, response);
        return addSecurityHeaders(response);
      }
    }
  }

  // Security: Rate limiting (after user resolution so we can exempt admins)
  // Skip rate limiting for dashboard/article operations to prevent false positives
  const isArticleOperation = pathname.includes('/dashboard/articles') && 
                             (request.method === 'POST' || request.method === 'PATCH' || request.method === 'PUT');
  
  if (!isArticleOperation && isRateLimited(ip, user?.role)) {
    console.log('[MIDDLEWARE] Rate limited', { ip, role: user?.role, pathname });
    const response = isApiRoute
      ? NextResponse.json({ error: 'Too many requests' }, { status: 429 })
      : NextResponse.redirect(new URL('/login', request.url));
    setCurrencyCookieIfNeeded(request, response);
    return addSecurityHeaders(response);
  }

  if (!user) {
    const response = isApiRoute
      ? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      : NextResponse.redirect(new URL('/login', request.url));
    
    setCurrencyCookieIfNeeded(request, response);
    return addSecurityHeaders(response);
  }

  // Security: Role-gate only protected app areas; allow any authenticated user for API routes
  const requiresRole = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');
  if (requiresRole && !ALLOWED_ROLES.includes(user.role as AllowedRole)) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    setCurrencyCookieIfNeeded(request, response);
    return addSecurityHeaders(response);
  }

  // Security: Pass user context downstream
  const response = NextResponse.next();
  response.headers.set('x-user-id', user.id);
  response.headers.set('x-user-role', user.role);
  response.headers.set('x-session-id', user.sessionId);
  setCurrencyCookieIfNeeded(request, response);

  // Handle affiliate referral tracking
  await handleReferralTracking(request, response);
  
  return addSecurityHeaders(response);
}

// Affiliate referral tracking
async function handleReferralTracking(request: NextRequest, response: NextResponse) {
  const refCode = request.nextUrl.searchParams.get('ref');

  if (refCode) {
    try {
      // Set cookie to track referral for the session
      response.cookies.set('referral_code', refCode, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24, // 1 day
      });

      // Asynchronously log the referral visit to the database
      const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
      const userAgent = request.headers.get('user-agent') || 'unknown';

      // Use a separate async function to avoid blocking the middleware
      (async () => {
        try {
          const { prisma } = await import('@/lib/prisma');
          const affiliate = await prisma.affiliate.findUnique({ where: { referralCode: refCode } });

          if (affiliate) {
            await prisma.referral.create({
              data: {
                affiliateId: affiliate.id,
                ipAddress: ip,
                userAgent: userAgent,
              },
            });

            // Increment total clicks
            await prisma.affiliate.update({
              where: { id: affiliate.id },
              data: { totalClicks: { increment: 1 } },
            });

            // New: Update daily stats
            const today = new Date();
            today.setUTCHours(0, 0, 0, 0);

            await prisma.affiliateDailyStat.upsert({
              where: {
                affiliateId_date: {
                  affiliateId: affiliate.id,
                  date: today,
                },
              },
              update: {
                clicks: { increment: 1 },
              },
              create: {
                affiliateId: affiliate.id,
                date: today,
                clicks: 1,
                sales: 0, // Sales are tracked separately
                commissionEarned: 0, // Commission is tracked separately
              },
            });
          }
        } catch (dbError) {
          console.error('Error logging referral visit:', dbError);
        }
      })();

    } catch (error) {
      console.error('Error in referral tracking:', error);
    }
  }
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
