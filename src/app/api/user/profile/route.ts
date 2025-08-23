import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/actions/auth/session';
import { logAudit } from '@/lib/actions/auth/audit';
import { z } from 'zod';

// Security: Profile update validation schema
const profileUpdateSchema = z.object({
    firstName: z.string().min(1, 'First name is required').max(100).optional(),
    lastName: z.string().min(1, 'Last name is required').max(100).optional(),
    username: z.string().min(3, 'Username must be at least 3 characters').max(50).optional(),
    profilePicture: z.string().url('Invalid profile picture URL').optional(),
});

// Security: Password change validation schema
const passwordChangeSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(12, 'New password must be at least 12 characters'),
});

export async function GET(req: NextRequest) {
    try {
        const userId = await getCurrentUserId();

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                username: true,
                profilePicture: true,
                role: true,
                emailVerified: true,
                twoFactorEnabled: true,
                createdAt: true,
                lastLoginAt: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 },
            );
        }

        return NextResponse.json({
            success: true,
            user,
        });

    } catch (error) {
        return NextResponse.json(
            { success: false, message: 'Failed to fetch profile' },
            { status: 500 },
        );
    }
}

export async function PUT(req: NextRequest) {
    try {
        const userId = await getCurrentUserId();

        // Security: Parse and validate request body
        const body = await req.json();
        const validationResult = profileUpdateSchema.safeParse(body);

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

        const { firstName, lastName, username, profilePicture } = validationResult.data;

        // Security: Check username availability if provided
        if (username) {
            const existingUsername = await prisma.user.findFirst({
                where: {
                    username,
                    id: { not: userId },
                },
                select: { id: true },
            });

            if (existingUsername) {
                return NextResponse.json(
                    { success: false, message: 'Username is already taken' },
                    { status: 409 },
                );
            }
        }

        // Security: Get client information
        const userAgent = req.headers.get('user-agent') || 'Unknown';
        const ip = req.headers.get('x-forwarded-for') ||
            req.headers.get('x-real-ip') ||
            'Unknown';

        // Security: Update user profile
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                ...(firstName && { firstName }),
                ...(lastName && { lastName }),
                ...(username && { username }),
                ...(profilePicture && { profilePicture }),
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                username: true,
                profilePicture: true,
                role: true,
                emailVerified: true,
                twoFactorEnabled: true,
            },
        });

        // Security: Log profile update
        await logAudit(userId, 'profile_updated', {
            userAgent,
            ip,
            updatedFields: Object.keys(validationResult.data),
        });

        return NextResponse.json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser,
        });

    } catch (error) {
        return NextResponse.json(
            { success: false, message: 'Failed to update profile' },
            { status: 500 },
        );
    }
}

// Security: Change password endpoint
export async function PATCH(req: NextRequest) {
    try {
        const userId = await getCurrentUserId();

        // Security: Parse and validate request body
        const body = await req.json();
        const validationResult = passwordChangeSchema.safeParse(body);

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

        const { currentPassword, newPassword } = validationResult.data;

        // Security: Get current user with password
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { password: true },
        });

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 },
            );
        }

        // Security: Verify current password
        const bcrypt = await import('bcrypt');
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if (!isCurrentPasswordValid) {
            return NextResponse.json(
                { success: false, message: 'Current password is incorrect' },
                { status: 400 },
            );
        }

        // Security: Validate new password
        const { validatePassword, hashPassword } = await import('@/lib/auth/password');
        const passwordValidation = validatePassword(newPassword);

        if (!passwordValidation.isValid) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'New password does not meet security requirements',
                    errors: passwordValidation.errors,
                    warnings: passwordValidation.warnings,
                },
                { status: 400 },
            );
        }

        // Security: Hash new password
        const hashedPassword = await hashPassword(newPassword);

        // Security: Get client information
        const userAgent = req.headers.get('user-agent') || 'Unknown';
        const ip = req.headers.get('x-forwarded-for') ||
            req.headers.get('x-real-ip') ||
            'Unknown';

        // Security: Update password
        await prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
                loginAttempts: 0, // Reset failed login attempts
                lockedUntil: null, // Unlock account if locked
            },
        });

        // Security: Invalidate all existing sessions for security
        await prisma.session.deleteMany({
            where: { userId },
        });

        // Security: Log password change
        await logAudit(userId, 'password_changed', {
            userAgent,
            ip,
            passwordStrength: passwordValidation.score,
            passwordEntropy: passwordValidation.entropy,
        });

        return NextResponse.json({
            success: true,
            message: 'Password changed successfully. Please log in again.',
        });

    } catch (error) {
        return NextResponse.json(
            { success: false, message: 'Failed to change password' },
            { status: 500 },
        );
    }
}


