import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
console.log('[MIDDLEWARE] JWT_SECRET:', JWT_SECRET);

export async function middleware(request: NextRequest) {
    const url = new URL(request.url);
    const path = url.pathname;
    const token = request.cookies.get('session-token')?.value;
    console.log('[MIDDLEWARE] session-token:', token);
    let user = null;
    if (token) {
        try {
            const { payload } = await jwtVerify(
                new TextEncoder().encode(token),
                new TextEncoder().encode(JWT_SECRET)
            );
            user = payload;
            console.log('[MIDDLEWARE] Decoded JWT:', user);
        } catch (err) {
            console.warn('[MIDDLEWARE] JWT verification failed:', err);
            user = null;
        }
    }
    if (!user) {
        console.warn('[MIDDLEWARE] No valid user from JWT. Redirecting to /login.');
        return NextResponse.redirect(new URL('/login', request.url));
    }
    if (!['admin', 'superadmin'].includes(user.role)) {
        console.warn('[MIDDLEWARE] User role not authorized:', user.role);
        return NextResponse.redirect(new URL('/login', request.url));
    }
    console.log('[MIDDLEWARE] User authorized:', user.email, user.role);
    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/admin/:path*'],
}; 