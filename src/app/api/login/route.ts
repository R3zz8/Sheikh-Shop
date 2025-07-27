import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { signJwtToken } from '@/lib/auth/jwt';
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
                    errors: validationResult.error.errors
                },
                { status: 400 }
            );
        }

        const { email, password } = validationResult.data;

        // Security: Rate limiting for login attempts
        if (isLoginRateLimited(email)) {
            return NextResponse.json(
                { success: false, message: 'Too many login attempts. Please try again later.' },
                { status: 429 }
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
            }
        });

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Security: Check if user can login
        if (!user.canLogin || user.disabled) {
            return NextResponse.json(
                { success: false, message: 'Account is disabled' },
                { status: 403 }
            );
        }

        // Security: Verify password with timing attack protection
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return NextResponse.json(
                { success: false, message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Security: Generate JWT token
        const token = signJwtToken({
            id: user.id,
            email: user.email,
            role: user.role
        });

        // Security: Set secure cookie
        const response = NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                emailVerified: user.emailVerified,
            }
        });

        response.cookies.set('session-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return response;

    } catch (error) {
        // Security: Log errors in development, generic message in production
        if (process.env.NODE_ENV === 'development') {
            console.error('Login error:', error);
        }

        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
} 