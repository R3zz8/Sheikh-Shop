import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Security: Use environment variable with proper fallback
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET === 'changeme') {
  throw new Error('JWT_SECRET environment variable must be set to a secure value');
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

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isApiRoute = pathname.startsWith('/api');

  // Security: Rate limiting (consider separate limits per route type in production)
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  if (isRateLimited(ip)) {
    return isApiRoute
      ? NextResponse.json({ error: 'Too many requests' }, { status: 429 })
      : NextResponse.redirect(new URL('/login', request.url));
  }

  // Skip auth for specific API routes (handled by their own logic)
  if (
    isApiRoute && (
      pathname.startsWith('/api/auth') ||
      pathname.startsWith('/api/login') ||
      pathname.startsWith('/api/register')
    )
  ) {
    return NextResponse.next();
  }

  // Security: Get tokens from cookies
  const accessToken = request.cookies.get('access-token')?.value;
  const refreshToken = request.cookies.get('refresh-token')?.value;

  if (!accessToken && !refreshToken) {
    return isApiRoute
      ? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      : NextResponse.redirect(new URL('/login', request.url));
  }

  let user: { id: string; email: string; role: string; sessionId: string } | null = null;

  try {
    // Verify access token first
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

        // Validate session from DB
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
    return isApiRoute
      ? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      : NextResponse.redirect(new URL('/login', request.url));
  }

  // Role-gate only protected app areas; allow any authenticated user for API routes
  const requiresRole = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');
  if (requiresRole && !ALLOWED_ROLES.includes(user.role as AllowedRole)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Pass user context downstream
  const response = NextResponse.next();
  response.headers.set('x-user-id', user.id);
  response.headers.set('x-user-role', user.role);
  response.headers.set('x-session-id', user.sessionId);
  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/api/:path*', // Protect all API routes; exclusions handled inside middleware
  ],
};
