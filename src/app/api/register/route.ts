import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, validatePassword } from '@/lib/auth/password';
import { createSession } from '@/lib/actions/auth/session';
import { logLogin } from '@/lib/actions/auth/audit';
import { registrationRateLimit } from '@/lib/middleware/rateLimit';
import { z } from 'zod';

// Security: Registration validation schema
const registrationSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(12, 'Password must be at least 12 characters'),
    firstName: z.string().min(1, 'First name is required').max(100),
    lastName: z.string().min(1, 'Last name is required').max(100),
    username: z.string().min(3, 'Username must be at least 3 characters').max(50).optional(),
});

export async function POST(req: NextRequest) {
    try {
        // Security: Rate limiting for registration
        const rateLimitResult = await registrationRateLimit(req);
        if (rateLimitResult) {
            return rateLimitResult;
        }

        // Security: Parse and validate request body
        const body = await req.json();
        const validationResult = registrationSchema.safeParse(body);

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

        const { email, password, firstName, lastName, username } = validationResult.data;

        // Security: Enhanced password validation
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Password does not meet security requirements',
                    errors: passwordValidation.errors,
                    warnings: passwordValidation.warnings,
                },
                { status: 400 },
            );
        }

        // Security: Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            select: { id: true },
        });

        if (existingUser) {
            return NextResponse.json(
                { success: false, message: 'User with this email already exists' },
                { status: 409 },
            );
        }

        // Security: Check username availability if provided
        if (username) {
            const existingUsername = await prisma.user.findUnique({
                where: { username },
                select: { id: true },
            });

            if (existingUsername) {
                return NextResponse.json(
                    { success: false, message: 'Username is already taken' },
                    { status: 409 },
                );
            }
        }

        // Security: Hash password with strong settings
        const hashedPassword = await hashPassword(password);

        // Security: Get client information
        const userAgent = req.headers.get('user-agent') || 'Unknown';
        const ip = req.headers.get('x-forwarded-for') ||
            req.headers.get('x-real-ip') ||
            'Unknown';

        // Security: Create user with secure defaults
        const user = await prisma.user.create({
            data: {
                email: email.toLowerCase(),
                password: hashedPassword,
                firstName,
                lastName,
                username: username || null,
                role: 'USER', // Default role
                emailVerified: false, // Require email verification
                canLogin: true,
                disabled: false,
                loginAttempts: 0,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                username: true,
                role: true,
                emailVerified: true,
            },
        });

        // Security: Create session for immediate login
        const { session, accessToken, refreshToken } = await createSession(
            user.id,
            userAgent,
            ip
        );

        // Security: Log successful registration
        await logLogin(user.id, 'registration_success', {
            sessionId: session.id,
            userAgent,
            ip,
            passwordStrength: passwordValidation.score,
            passwordEntropy: passwordValidation.entropy,
        });

        // Security: Set secure cookies
        const response = NextResponse.json({
            success: true,
            message: 'Registration successful',
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                role: user.role,
                emailVerified: user.emailVerified,
            },
            requiresEmailVerification: !user.emailVerified,
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
        // Security: Log errors in development
        if (process.env.NODE_ENV === 'development') {
            console.error('Registration error:', error);
        }

        return NextResponse.json(
            { success: false, message: 'Registration failed' },
            { status: 500 },
        );
    }
}


