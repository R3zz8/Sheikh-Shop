import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
console.log('[DEBUG] JWT_SECRET in server code:', JWT_SECRET);

export function signJwtToken(payload: { id: string; email: string }) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export async function setSessionCookie(token: string) {
    const cookieStore = await cookies();
    cookieStore.set('session-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
    });
}

export async function removeSessionCookie() {
    const cookieStore = await cookies();
    cookieStore.set('session-token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
    });
}

export async function getUserFromToken(): Promise<{ id: string; email: string } | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('session-token')?.value;
    if (!token) return null;
    try {
        return jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    } catch {
        return null;
    }
} 