import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtToken } from '@/lib/auth/jwt';
import { prisma } from '@/lib/prisma';

// Security: Input validation schema
const validateToken = (token: string): boolean => {
  return typeof token === 'string' && token.length > 0;
};

export async function GET(req: NextRequest) {
  try {
    // Security: Get token from cookies with validation
    const token = req.cookies.get('session-token')?.value;

    if (!token || !validateToken(token)) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    // Security: Verify JWT token
    const user = verifyJwtToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 },
      );
    }

    // Security: Fetch user from database with proper error handling
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
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
