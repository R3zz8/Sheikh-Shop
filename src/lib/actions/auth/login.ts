'use server';

import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword, validatePassword } from '@/lib/auth/password';
import { signJwtToken } from '@/lib/auth/jwt';
import { logFailedAttempt, logAudit } from '@/lib/actions/auth/audit';
import { verifyCsrfToken, rotateCsrfToken } from '@/lib/auth/csrf';
import { createSession } from './session';
import { cookies } from 'next/headers';

const failedLoginAttempts: Record<string, { count: number; last: number; lockedUntil?: number }> = {};
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

export async function login(email: string, password: string, csrfToken: string, ip?: string, userAgent?: string) {
    // Security: Verify CSRF token
    await verifyCsrfToken(csrfToken);
    
    // Security: Input validation
    if (!email || !password) {
        throw new Error('Email and password required');
    }
    
    // Security: Email format validation
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        throw new Error('Invalid email format');
    }
    
    // Security: Rate limiting check
    const now = Date.now();
    const fail = failedLoginAttempts[email];
    if (fail?.lockedUntil && now < fail.lockedUntil) {
        throw new Error('Account temporarily locked due to too many failed attempts. Try again later.');
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
        }
    });
    
    if (!user) {
        // Security: Track failed attempts for non-existent users
        failedLoginAttempts[email] = { count: (fail?.count || 0) + 1, last: now };
        if (failedLoginAttempts[email].count >= MAX_ATTEMPTS) {
            failedLoginAttempts[email].lockedUntil = now + LOCKOUT_TIME;
        }
        await logFailedAttempt(null, 'login_failed', ip, userAgent);
        throw new Error('Invalid credentials');
    }
    
    // Security: Check if user can login
    if (!user.canLogin || user.disabled) {
        await logFailedAttempt(user.id, 'login_blocked_canLogin', ip, userAgent);
        throw Object.assign(new Error('Login not allowed for this user.'), { status: 403 });
    }
    
    // Security: Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
        await logFailedAttempt(user.id, 'login_blocked_locked', ip, userAgent);
        throw new Error('Account is temporarily locked due to too many failed attempts.');
    }
    
    // Security: Verify password with timing attack protection
    const valid = await verifyPassword(password, user.password);
    if (!valid) {
        // Security: Update failed attempts in database
        const newAttempts = (user.loginAttempts || 0) + 1;
        const shouldLock = newAttempts >= MAX_ATTEMPTS;
        
        await prisma.user.update({
            where: { id: user.id },
            data: {
                loginAttempts: newAttempts,
                lockedUntil: shouldLock ? new Date(Date.now() + LOCKOUT_TIME) : null,
            },
        });
        
        await logFailedAttempt(user.id, 'login_failed', ip, userAgent);
        throw new Error('Invalid credentials');
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
    
    // Security: Remove from in-memory tracking
    delete failedLoginAttempts[email];
    
    // Security: Create session with device fingerprinting
    const { session, accessToken, refreshToken } = await createSession(
        user.id, 
        userAgent, 
        ip
    );
    
    // Security: Set secure cookies
    const cookieStore = await cookies();
    
    // Security: Set access token (short-lived)
    cookieStore.set('access-token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict', // Enhanced from 'lax'
        path: '/',
        maxAge: 15 * 60, // 15 minutes
    });
    
    // Security: Set refresh token (longer-lived)
    cookieStore.set('refresh-token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict', // Enhanced from 'lax'
        path: '/',
        maxAge: 7 * 24 * 60 * 60, // 7 days
    });
    
    // Security: Rotate CSRF token after successful authentication
    await rotateCsrfToken();
    
    // Security: Log successful login
    await logAudit(user.id, 'login_success', { 
        ip, 
        userAgent, 
        sessionId: session.id,
        twoFactorEnabled: user.twoFactorEnabled,
    });
    
    return { 
        success: true,
        requires2FA: user.twoFactorEnabled,
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
            emailVerified: user.emailVerified,
        }
    };
}
