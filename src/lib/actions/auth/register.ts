'use server';

import { prisma } from '@/lib/prisma';
import { hashPassword, validatePassword } from '@/lib/auth/password';
import { logAudit } from '@/lib/actions/auth/audit';
import { verifyCsrfToken, rotateCsrfToken } from '@/lib/auth/csrf';
import { createSession } from './session';

export async function register(email: string, password: string, csrfToken: string, ip?: string, userAgent?: string) {
    // Security: Verify CSRF token
    await verifyCsrfToken(csrfToken);
    
    // Security: Input validation
    if (!email || !password) {
        throw new Error('Email and password are required');
    }
    
    // Security: Email format validation
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        throw new Error('Invalid email format');
    }
    
    // Security: Enhanced password validation
    const passwordValidation = await validatePassword(password);
    if (!passwordValidation.isValid) {
        throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
    }
    
    // Security: Check for existing user
    const existing = await prisma.user.findUnique({ 
        where: { email: email.toLowerCase() },
        select: { id: true }
    });
    
    if (existing) {
        throw new Error('Email already in use');
    }
    
    // Security: Hash password with standardized salt rounds
    const hashedPassword = await hashPassword(password);
    
    // Security: Create user with secure defaults
    const user = await prisma.user.create({
        data: {
            email: email.toLowerCase(),
            password: hashedPassword,
            role: 'USER', // Default role
            emailVerified: false, // Require email verification
            canLogin: true,
            disabled: false,
            loginAttempts: 0,
        },
        select: {
            id: true,
            email: true,
            role: true,
            emailVerified: true,
            createdAt: true,
        }
    });
    
    // Security: Create session for immediate login
    const { session, accessToken, refreshToken } = await createSession(
        user.id, 
        userAgent, 
        ip
    );
    
    // Security: Log successful registration
    await logAudit(user.id, 'registration_success', { 
        ip, 
        userAgent,
        sessionId: session.id,
        passwordStrength: passwordValidation.score,
        passwordEntropy: passwordValidation.entropy,
    });
    
    // Security: Rotate CSRF token after successful registration
    await rotateCsrfToken();
    
    return { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        accessToken,
        refreshToken,
    };
}
