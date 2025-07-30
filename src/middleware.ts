import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Security: Use environment variable with proper fallback
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET === 'changeme') {
  throw new Error('JWT_SECRET environment variable must be set to a secure value');
}

// Security: Define allowed roles for better type safety
const ALLOWED_ROLES = ['ADMIN', 'SUPERADMIN', 'SYSTEM'] as const;
type AllowedRole = typeof ALLOWED_ROLES[number];

// Security: Rate limiting map (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Security: Rate limiting function
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
  // Security: Rate limiting
  const ip = request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        'unknown';
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 },
    );
  }

  // Security: Get token from cookies
  const token = request.cookies.get('session-token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  let user: { id: string; email: string; role: string } | null = null;

  try {
    // Security: Proper JWT verification with jose
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET),
      {
        algorithms: ['HS256'],
        issuer: 'sheikh-shop',
        audience: 'sheikh-shop-users',
      },
    );

    user = payload as { id: string; email: string; role: string };
  } catch (error) {
    // Security: Log failed authentication attempts (in production)
    console.warn('JWT verification failed:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Security: Validate user role
  if (!user || !ALLOWED_ROLES.includes(user.role as AllowedRole)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Security: Add user info to headers for downstream use
  const response = NextResponse.next();
  response.headers.set('x-user-id', user.id);
  response.headers.set('x-user-role', user.role);

  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    // Security: Add more protected routes as needed
  ],
};
