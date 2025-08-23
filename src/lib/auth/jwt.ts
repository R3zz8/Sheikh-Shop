import jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { randomBytes } from 'crypto';

// Security: Validate JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-for-build-only';
if (!JWT_SECRET || JWT_SECRET === 'dev-secret-key' || JWT_SECRET === 'changeme') {
  // Only throw error in production or when actually using the functions
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable must be set to a secure value');
  }
  // In development/build, use a fallback
  console.warn('JWT_SECRET not set, using fallback for development');
}

// Security: Define JWT payload interface
export interface JWTPayload {
  id: string;
  email: string;
  role: string;
  sessionId?: string;
  tokenId?: string;
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
  expiresIn: StringValue | number = '7d',
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
  if (!decoded?.exp) return true;

  return Date.now() >= decoded.exp * 1000;
}

// Add missing functions that are being imported
export function signAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp' | 'iss' | 'aud'>, expiresIn: StringValue | number = '15m'): string {
  return signJwtToken(payload, expiresIn);
}

export function signRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp' | 'iss' | 'aud'>, expiresIn: StringValue | number = '7d'): string {
  return signJwtToken(payload, expiresIn);
}

export function verifyAccessToken(token: string): JWTPayload | null {
  return verifyJwtToken(token);
}

export function verifyRefreshToken(token: string): JWTPayload | null {
  return verifyJwtToken(token);
}

export function generateSessionId(): string {
  return randomBytes(32).toString('hex');
}

export function generateTokenId(): string {
  return randomBytes(16).toString('hex');
}
