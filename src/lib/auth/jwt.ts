import jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
if (!process.env.JWT_SECRET || JWT_SECRET === 'dev-secret-key') {
    console.warn('[JWT] WARNING: Using default or missing JWT_SECRET!');
}

export function signJwtToken(payload: { id: string; email: string; role: string }, expiresIn: StringValue | number = '7d') {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyJwtToken(token: string): { id: string; email: string; role: string } | null {
    try {
        return jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
    } catch (err) {
        console.warn('[JWT] Invalid token:', err);
        return null;
    }
}

export function generateSystemUserToken(user: { id: string, email: string, role: string }) {
    // 1 year expiry
    const expiresIn = 365 * 24 * 60 * 60; // seconds
    return signJwtToken({ id: user.id, email: user.email, role: user.role }, expiresIn);
} 