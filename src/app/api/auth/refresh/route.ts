import { NextRequest, NextResponse } from 'next/server';
import { refreshAccessToken } from '@/lib/actions/auth/session';
import { z } from 'zod';

// Security: Rate limiting for refresh attempts
const refreshAttempts = new Map<string, { count: number; resetTime: number }>();

function isRefreshRateLimited(ip: string): boolean {
    const now = Date.now();
    const windowMs = 5 * 60 * 1000; // 5 minutes
    const maxAttempts = 10; // Max refresh attempts per window

    const record = refreshAttempts.get(ip);
    if (!record || now > record.resetTime) {
        refreshAttempts.set(ip, { count: 1, resetTime: now + windowMs });
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
        // Security: Rate limiting for refresh attempts
        const ip = req.headers.get('x-forwarded-for') ||
            req.headers.get('x-real-ip') ||
            'unknown';

        if (isRefreshRateLimited(ip)) {
            return NextResponse.json(
                { success: false, message: 'Too many refresh attempts. Please try again later.' },
                { status: 429 },
            );
        }

        // Security: Get refresh token from cookies
        const refreshToken = req.cookies.get('refresh-token')?.value;

        if (!refreshToken) {
            return NextResponse.json(
                { success: false, message: 'No refresh token provided' },
                { status: 401 },
            );
        }

        // Security: Get client information
        const userAgent = req.headers.get('user-agent') || 'Unknown';

        // Security: Refresh tokens with rotation
        const { accessToken, refreshToken: newRefreshToken } = await refreshAccessToken(
            refreshToken,
            userAgent,
            ip
        );

        // Security: Set new secure cookies
        const response = NextResponse.json({
            success: true,
            message: 'Tokens refreshed successfully',
        });

        // Set new access token (short-lived)
        response.cookies.set('access-token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 15 * 60, // 15 minutes
        });

        // Set new refresh token (longer-lived)
        response.cookies.set('refresh-token', newRefreshToken, {
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
            console.error('Token refresh error:', error);
        }

        // Security: Clear invalid tokens
        const response = NextResponse.json(
            { success: false, message: 'Token refresh failed' },
            { status: 401 },
        );

        response.cookies.delete('access-token');
        response.cookies.delete('refresh-token');

        return response;
    }
}


