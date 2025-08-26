import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { signAccessToken, signRefreshToken, generateSessionId, generateTokenId } from '@/lib/auth/jwt';
import { createSession } from '@/lib/actions/auth/session';
import { logLogin, logFailedAttempt, logAudit } from '@/lib/actions/auth/audit';
import { z } from 'zod';

// Security: Input validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// Security: Rate limiting for login attempts
const loginAttempts = new Map<string, { count: number; resetTime: number }>();

function isLoginRateLimited(email: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5; // Max login attempts per window

  const record = loginAttempts.get(email);
  if (!record || now > record.resetTime) {
    loginAttempts.set(email, { count: 1, resetTime: now + windowMs });
    return false;
  }

  if (record.count >= maxAttempts) {
    return true;
  }

  record.count++;
  return false;
}

export async function POST(req: NextRequest) {
  try {
    // Security: Parse and validate request body
    const body = await req.json();
    const validationResult = loginSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid input data',
          errors: validationResult.error.errors,
        },
        { status: 400 },
      );
    }

    const { email, password } = validationResult.data;

    // Security: Rate limiting for login attempts
    if (isLoginRateLimited(email)) {
      return NextResponse.json(
        { success: false, message: 'Too many login attempts. Please try again later.' },
        { status: 429 },
      );
    }

    // Security: Find user with proper error handling
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        canLogin: true,
        disabled: true,
        emailVerified: true,
        twoFactorEnabled: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 },
      );
    }

    // Security: Check if user can login
    if (!user.canLogin || user.disabled) {
      return NextResponse.json(
        { success: false, message: 'Account is disabled' },
        { status: 403 },
      );
    }

    // Security: Get client information
    const userAgent = req.headers.get('user-agent') || 'Unknown';
    const ip = req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      'Unknown';

    // Security: Verify password with timing attack protection
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      await logFailedAttempt(user.id, 'login_failed', ip, userAgent);
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 },
      );
    }

    // Security: Create session with refresh token rotation
    const { session, accessToken, refreshToken } = await createSession(
      user.id,
      userAgent,
      ip
    );

    // Security: Update user's last login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        loginAttempts: 0, // Reset failed attempts on successful login
      },
    });

    // Security: Log successful login
    await logAudit(user.id, 'login_success', {
      sessionId: session.id,
      userAgent,
      ip,
    });

    // Security: Set secure cookies
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        twoFactorEnabled: user.twoFactorEnabled,
      },
      requires2FA: user.twoFactorEnabled,
    });

    // Set access token (short-lived)
    response.cookies.set('access-token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60, // 15 minutes
    });

    // Set refresh token (longer-lived)
    response.cookies.set('refresh-token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;

  } catch (error) {
    // Security: Log errors in development, generic message in production
    if (process.env.NODE_ENV === 'development') {
      console.error('Login error:', error);
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 },
    );
  }
}
