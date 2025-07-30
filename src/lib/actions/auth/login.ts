'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { signJwtToken } from '@/lib/auth/jwt';
import { rateLimit } from '@/lib/middleware/rateLimit';
import { logLogin, logFailedAttempt } from '@/lib/actions/auth/audit';
import { verifyCsrfToken } from '@/lib/auth/csrf';
import { createSession } from './session';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const failedLoginAttempts: Record<string, { count: number; last: number; lockedUntil?: number }> = {};
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

export async function loginUser(email: string, password: string, csrfToken: string, ip?: string, userAgent?: string) {
  await verifyCsrfToken(csrfToken);
  if (!email || !password) throw new Error('Email and password required');
  if (!rateLimit(`login:${email}`, 5, 60_000)) {
    await logFailedAttempt(null, 'login_rate_limit', ip, userAgent);
    throw new Error('Too many login attempts. Please try again later.');
  }
  const now = Date.now();
  const fail = failedLoginAttempts[email];
  if (fail?.lockedUntil && now < fail.lockedUntil) {
    throw new Error('Account temporarily locked due to too many failed attempts. Try again later.');
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    failedLoginAttempts[email] = { count: (fail?.count || 0) + 1, last: now };
    if (failedLoginAttempts[email].count >= MAX_ATTEMPTS) {
      failedLoginAttempts[email].lockedUntil = now + LOCKOUT_TIME;
    }
    await logFailedAttempt(null, 'login', ip, userAgent);
    throw new Error('Invalid credentials');
  }
  if (user.canLogin === false) {
    await logFailedAttempt(user.id, 'login_blocked_canLogin', ip, userAgent);
    throw Object.assign(new Error('Login not allowed for this user.'), { status: 403 });
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    failedLoginAttempts[email] = { count: (fail?.count || 0) + 1, last: now };
    if (failedLoginAttempts[email].count >= MAX_ATTEMPTS) {
      failedLoginAttempts[email].lockedUntil = now + LOCKOUT_TIME;
    }
    await logFailedAttempt(user.id, 'login', ip, userAgent);
    throw new Error('Invalid credentials');
  }
  // Reset failed attempts on success
  delete failedLoginAttempts[email];

  // Sign JWT and set cookie
  const token = signJwtToken({ id: user.id, email: user.email, role: user.role });
  const cookieStore = await cookies();
  cookieStore.set('session-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  // Generate refresh token and create session
  const refreshToken = crypto.randomBytes(32).toString('hex');
  const refreshExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  await createSession(user.id, refreshToken, refreshExpires, userAgent, ip);

  await logLogin(user.id, ip, userAgent);
  return { success: true };
}
