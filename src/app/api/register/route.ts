import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth/password';
import { createSession } from '@/lib/actions/auth/session';
import { logAudit } from '@/lib/actions/auth/audit';
import { z } from 'zod';

// Simplified registration validation schema for development
const registrationSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'), // Further reduced for testing
    firstName: z.string().min(1, 'First name is required').max(100),
    lastName: z.string().min(1, 'Last name is required').max(100),
    username: z.string().min(3, 'Username must be at least 3 characters').max(50).optional(),
});

export async function POST(req: NextRequest) {
    try {
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

        // Security: Hash password
        const hashedPassword = await hashPassword(password);

        // Security: Create user with all required fields
        const user = await prisma.user.create({
            data: {
                email: email.toLowerCase(),
                password: hashedPassword,
                firstName,
                lastName,
                username: username || null,
                role: 'USER',
                emailVerified: false,
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
                createdAt: true,
            },
        });

        // Security: Get client information
        const userAgent = req.headers.get('user-agent') || 'Unknown';
        const ip = req.headers.get('x-forwarded-for') ||
            req.headers.get('x-real-ip') ||
            'Unknown';

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
        });

        // Security: Set cookies for immediate login
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

        // Set secure cookies
        response.cookies.set('access-token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60, // 15 minutes
            path: '/',
        });

        response.cookies.set('refresh-token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Registration error:', error);

        // Provide user-friendly error messages
        let errorMessage = 'Registration failed';
        if (error instanceof Error) {
            if (error.message.includes('Unique constraint')) {
                errorMessage = 'Email or username already exists';
            } else if (error.message.includes('Database')) {
                errorMessage = 'Database error. Please try again later.';
            } else {
                errorMessage = error.message;
            }
        }

        return NextResponse.json(
            { success: false, message: errorMessage },
            { status: 500 },
        );
    }
}


