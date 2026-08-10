import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { verifyJwtToken } from '@/lib/auth/jwt';
import { getCachedSession } from '@/lib/redis';
import { prisma } from '@/lib/prisma';

// Security: Input validation schema
const validateToken = (token: string): boolean => {
  return typeof token === 'string' && token.length > 0;
};

export async function GET(req: NextRequest) {
  try {
    const xUserRole = req.headers.get('x-user-role');
    const xUserId = req.headers.get('x-user-id');
    const accessToken = req.cookies.get('access-token')?.value;
    const isLocalMockDb = process.env.MOCK_DB === 'true';

    if (isLocalMockDb && (process.env.MOCK_AUTH === 'true' || accessToken === 'mocked-jwt-token' || (xUserRole === 'SUPERADMIN' && xUserId === 'mock-user-id'))) {
      return NextResponse.json({
        id: 'mock-user-id',
        email: 'customer@sheikhshop.com',
        role: 'SUPERADMIN',
        emailVerified: true,
      });
    }

    // Security: Accept multiple auth cookies for compatibility
    const sessionToken = req.cookies.get('session-token')?.value; // legacy
    const refreshToken = req.cookies.get('refresh-token')?.value;

    // Helper to verify using jose directly (matches middleware expectations)
    async function verifyJose(token: string, audience: 'sheikh-shop-users' | 'sheikh-shop-refresh') {
      const secret = process.env.JWT_SECRET || '';
      if (!secret || secret.length < 32) return null;
      try {
        const { payload } = await jwtVerify(
          token,
          new TextEncoder().encode(secret),
          {
            algorithms: ['HS256'],
            issuer: 'sheikh-shop',
            audience,
          },
        );
        return payload as { id: string; email: string; role: string; sessionId?: string };
      } catch {
        return null;
      }
    }

    // 1) Prefer access-token → fastest path
    let payload: { id: string; email: string; role: string; sessionId?: string } | null = null;
    if (accessToken && validateToken(accessToken)) {
      payload = await verifyJose(accessToken, 'sheikh-shop-users');
    }

    // 2) Fallback to refresh-token (validate only)
    if (!payload && refreshToken && validateToken(refreshToken)) {
      payload = await verifyJose(refreshToken, 'sheikh-shop-refresh');
    }

    // 3) Legacy: session-token via shared verifier (kept for compatibility)
    if (!payload && sessionToken && validateToken(sessionToken)) {
      const legacy = await verifyJwtToken(sessionToken);
      if (legacy) {
        payload = legacy;
      }
    }

    if (!payload) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    // Try cache first for user basics
    const cached = payload.sessionId ? await getCachedSession(payload.sessionId) : null;
    if (cached) {
      return NextResponse.json({
        id: cached.id,
        email: cached.email,
        role: cached.role,
        emailVerified: true,
      });
    }

    // Security: Fetch user from database with proper error handling
    const dbUser = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        email: true,
        role: true,
        canLogin: true,
        disabled: true,
        emailVerified: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 },
      );
    }

    // Security: Check if user can login
    if (!dbUser.canLogin || dbUser.disabled) {
      return NextResponse.json(
        { error: 'Account disabled' },
        { status: 403 },
      );
    }

    // Security: Return only necessary user data
    return NextResponse.json({
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
      emailVerified: dbUser.emailVerified,
    });

  } catch (error) {
    // Security: Log errors in development, generic message in production
    if (process.env.NODE_ENV === 'development') {
      console.error('User API error:', error);
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
