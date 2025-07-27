import jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';

// Security: Validate JWT secret
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET === 'dev-secret-key' || JWT_SECRET === 'changeme') {
    throw new Error('JWT_SECRET environment variable must be set to a secure value');
}

// Security: Define JWT payload interface
export interface JWTPayload {
    id: string;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
    iss?: string;
    aud?: string;
}

// Security: JWT options with proper configuration
const JWT_OPTIONS: jwt.SignOptions = {
    algorithm: 'HS256',
    issuer: 'sheikh-shop',
    audience: 'sheikh-shop-users',
    expiresIn: '7d',
};

// Security: Enhanced JWT signing with proper typing
export function signJwtToken(
    payload: Omit<JWTPayload, 'iat' | 'exp' | 'iss' | 'aud'>,
    expiresIn: StringValue | number = '7d'
): string {
    try {
        return jwt.sign(payload, JWT_SECRET!, {
            ...JWT_OPTIONS,
            expiresIn,
        });
    } catch (error) {
        throw new Error(`Failed to sign JWT token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

// Security: Enhanced JWT verification with proper error handling
export function verifyJwtToken(token: string): JWTPayload | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET!, {
            algorithms: ['HS256'],
            issuer: 'sheikh-shop',
            audience: 'sheikh-shop-users',
        });

        return decoded as unknown as JWTPayload;
    } catch (error) {
        // Security: Log verification failures (in production, use proper logging)
        if (process.env.NODE_ENV === 'development') {
            console.warn('JWT verification failed:', error);
        }
        return null;
    }
}

// Security: Generate system user token with extended expiry
export function generateSystemUserToken(user: { id: string; email: string; role: string }): string {
    const expiresIn = 365 * 24 * 60 * 60; // 1 year in seconds
    return signJwtToken(user, expiresIn);
}

// Security: Decode JWT without verification (for debugging only)
export function decodeJwtToken(token: string): JWTPayload | null {
    try {
        const decoded = jwt.decode(token);
        return decoded as unknown as JWTPayload;
    } catch {
        return null;
    }
}

// Security: Check if token is expired
export function isTokenExpired(token: string): boolean {
    const decoded = decodeJwtToken(token);
    if (!decoded || !decoded.exp) return true;

    return Date.now() >= decoded.exp * 1000;
} 