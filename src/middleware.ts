import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Security: Use environment variable with proper fallback
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET environment variable must be set to a secure value (min 32 chars)');
}

// Security: Define allowed roles for restricted app areas
const ALLOWED_ROLES = ['ADMIN', 'SUPERADMIN', 'SYSTEM'] as const;
type AllowedRole = typeof ALLOWED_ROLES[number];

// Security: Simple in-memory rate limiting (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100; // Max requests per window

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

  // Security: Prevent redirect loops by checking if we're already on an auth page
  const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password', '/system-login', '/verify-email-sent'].includes(pathname);
  if (isAuthPage) {
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }

  // Security: Rate limiting (consider separate limits per route type in production)
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  if (isRateLimited(ip)) {
    const response = isApiRoute
      ? NextResponse.json({ error: 'Too many requests' }, { status: 429 })
      : NextResponse.redirect(new URL('/login', request.url));
    
    return addSecurityHeaders(response);
  }

  // Skip auth for specific API routes (handled by their own logic)
  if (
    isApiRoute && (
      pathname.startsWith('/api/auth') ||
      pathname.startsWith('/api/login') ||
      pathname.startsWith('/api/register') ||
      pathname.startsWith('/api/csrf') ||
      pathname.startsWith('/api/amazing-deals')
    )
  ) {
    const response = NextResponse.next();
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
  ].some(route => pathname.startsWith(route));

  // Allow public access to store pages
  if (isPublicRoute && !isApiRoute) {
    const response = NextResponse.next();
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
    
    return addSecurityHeaders(response);
  }

  let user: { id: string; email: string; role: string; sessionId: string } | null = null;

  try {
    // Security: Verify access token first
    if (accessToken) {
      const { payload } = await jwtVerify(
        accessToken,
        new TextEncoder().encode(JWT_SECRET),
        {
          algorithms: ['HS256'],
          issuer: 'sheikh-shop',
          audience: 'sheikh-shop-users',
        },
      );
      user = payload as { id: string; email: string; role: string; sessionId: string };
    }
  } catch {
    // Access token invalid/expired, try refresh token
    if (refreshToken) {
      try {
        const { payload } = await jwtVerify(
          refreshToken,
          new TextEncoder().encode(JWT_SECRET),
          {
            algorithms: ['HS256'],
            issuer: 'sheikh-shop',
            audience: 'sheikh-shop-refresh',
          },
        );

        // Security: Validate session from DB
        const { PrismaClient } = await import('@prisma/client');
        const prisma = new PrismaClient();
        const session = await prisma.session.findUnique({
          where: {
            id: payload.sessionId as string,
            refreshToken: payload.tokenId as string,
          },
          include: { user: true },
        });

        if (session && session.expiresAt > new Date()) {
          user = {
            id: session.userId,
            email: session.user.email,
            role: session.user.role,
            sessionId: session.id,
          };
          await prisma.session.update({ where: { id: session.id }, data: { lastUsedAt: new Date() } });
        }

        await prisma.$disconnect();
      } catch {
        // Both tokens invalid
      }
    }
  }

  if (!user) {
    const response = isApiRoute
      ? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      : NextResponse.redirect(new URL('/login', request.url));
    
    return addSecurityHeaders(response);
  }

  // Security: Role-gate only protected app areas; allow any authenticated user for API routes
  const requiresRole = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');
  if (requiresRole && !ALLOWED_ROLES.includes(user.role as AllowedRole)) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    return addSecurityHeaders(response);
  }

  // Security: Pass user context downstream
  const response = NextResponse.next();
  response.headers.set('x-user-id', user.id);
  response.headers.set('x-user-role', user.role);
  response.headers.set('x-session-id', user.sessionId);
  
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
  ],
};
