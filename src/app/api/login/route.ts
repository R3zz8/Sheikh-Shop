import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth/password';
import { signAccessToken, signRefreshToken, generateSessionId, generateTokenId } from '@/lib/auth/jwt';
import { createSession } from '@/lib/actions/auth/session';
import { logAudit, logFailedAttempt } from '@/lib/actions/auth/audit';
import { z } from 'zod';

// Security: Input validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional(),
});

// Simplified rate limiting for development
const loginAttempts = new Map<string, { count: number; resetTime: number }>();

function isLoginRateLimited(email: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 20; // Increased for development

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
        loginAttempts: true,
        lockedUntil: true,
      },
    });

    if (!user) {
      await logFailedAttempt(null, 'login_failed', req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined, req.headers.get('user-agent') || undefined);
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 },
      );
    }

    // Security: Check if user can login
    if (!user.canLogin || user.disabled) {
      await logFailedAttempt(user.id, 'login_blocked', req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined, req.headers.get('user-agent') || undefined);
      return NextResponse.json(
        { success: false, message: 'Account is disabled' },
        { status: 403 },
      );
    }

    // Security: Check if email is verified
    if (!user.emailVerified) {
      await logFailedAttempt(user.id, 'login_unverified_email', req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined, req.headers.get('user-agent') || undefined);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Please verify your email before logging in.',
          requiresEmailVerification: true,
          email: user.email 
        },
        { status: 403 },
      );
    }

    // Security: Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      await logFailedAttempt(user.id, 'login_blocked_locked', req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined, req.headers.get('user-agent') || undefined);
      return NextResponse.json(
        { success: false, message: 'Account is temporarily locked due to too many failed attempts.' },
        { status: 423 },
      );
    }

    // Security: Get client information
    const userAgent = req.headers.get('user-agent') || 'Unknown';
    const ip = req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      'Unknown';

    // Security: Verify password with timing attack protection
    const validPassword = await verifyPassword(password, user.password);
    if (!validPassword) {
      // Security: Update failed attempts in database
      const newAttempts = (user.loginAttempts || 0) + 1;
      const shouldLock = newAttempts >= 5;
      
      await prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: newAttempts,
          lockedUntil: shouldLock ? new Date(Date.now() + 15 * 60 * 1000) : null,
        },
      });
      
      await logFailedAttempt(user.id, 'login_failed', ip, userAgent);
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 },
      );
    }

    // Security: Reset failed attempts on success
    if (user.loginAttempts > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: 0,
          lockedUntil: null,
          lastLoginAt: new Date(),
        },
      });
    }

    // Security: Create session with refresh token rotation
    const { session, accessToken, refreshToken } = await createSession(
      user.id,
      userAgent,
      ip
    );

    // Security: Log successful login
    await logAudit(user.id, 'login_success', {
      sessionId: session.id,
      userAgent,
      ip,
      twoFactorEnabled: user.twoFactorEnabled,
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

    // Security: Set access token (short-lived)
    response.cookies.set('access-token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 15 * 60, // 15 minutes
    });

    // Security: Set refresh token (longer-lived)
    response.cookies.set('refresh-token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;

  } catch (error: any) {
    // Security: Classify and log server errors for production debugging without exposing sensitive internals
    const errorMessage = error?.message || String(error);
    const errorStack = error?.stack || '';
    const errorName = error?.name || 'Error';

    if (errorMessage.includes('prisma') || error?.code?.startsWith('P') || errorMessage.includes('connect')) {
      console.error('[AUTH_DATABASE_ERROR] Database operation failed during login:', {
        message: errorMessage,
        code: error?.code,
        stack: errorStack,
      });
    } else if (errorMessage.includes('fetch') || errorMessage.includes('ETIMEDOUT') || errorMessage.includes('ECONNREFUSED') || errorMessage.includes('ENOTFOUND') || errorMessage.includes('EAI_AGAIN')) {
      console.error('[AUTH_NETWORK_ERROR] Network dependency failure during login:', {
        message: errorMessage,
        stack: errorStack,
      });
    } else if (errorMessage.includes('session') || errorMessage.includes('token') || errorMessage.includes('JWT')) {
      console.error('[AUTH_SESSION_ERROR] Session or token creation failure during login:', {
        message: errorMessage,
        stack: errorStack,
      });
    } else {
      console.error('[AUTH_UNHANDLED_ERROR] Unexpected error during login process:', {
        name: errorName,
        message: errorMessage,
        stack: errorStack,
      });
    }

    return NextResponse.json(
      { success: false, message: 'ورود انجام نشد. لطفاً دوباره تلاش کنید.' },
      { status: 500 },
    );
  }
}
