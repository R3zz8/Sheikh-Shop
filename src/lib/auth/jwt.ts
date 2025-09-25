import jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { randomBytes } from 'crypto';

// TEMP DEBUG LOG (remove after diagnosis)
if (process.env.NODE_ENV !== 'production') {
  // Do NOT print the actual secret
  // eslint-disable-next-line no-console
  console.log('[debug] JWT_SECRET present:', Boolean(process.env.JWT_SECRET), 'length:', (process.env.JWT_SECRET || '').length);
}

// Security: Accessor to read and validate JWT secret on demand (avoid top-level throws during build)
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET || '';
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  if (secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }
  if (secret === 'dev-secret-key' || secret === 'changeme' || secret.includes('dev-secret')) {
    throw new Error('JWT_SECRET cannot use development or default values');
  }
  return secret;
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

// Security: Enhanced JWT signing with proper typing and error handling
export function signJwtToken(
  payload: Omit<JWTPayload, 'iat' | 'exp' | 'iss' | 'aud'>,
  expiresIn: StringValue | number = '7d',
): string {
  try {
    const JWT_SECRET = getJwtSecret();
    return jwt.sign(payload, JWT_SECRET, {
      ...JWT_OPTIONS,
      expiresIn,
    });
  } catch (error) {
    throw new Error(`Failed to sign JWT token: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Security: Enhanced JWT verification with proper error handling and blacklist check
export async function verifyJwtToken(token: string): Promise<JWTPayload | null> {
  try {
    const JWT_SECRET = getJwtSecret();
    
    // Security: Check if token is blacklisted
    if (await isTokenBlacklisted(token)) {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET, {
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

// Security: Token blacklisting functions
export async function isTokenBlacklisted(token: string): Promise<boolean> {
  try {
    // Reuse shared prisma instance to avoid per-call clients
    const { prisma } = await import('@/lib/prisma');
    const blacklistedToken = await prisma.blacklistedToken.findUnique({
      where: { token },
    });
    return !!blacklistedToken;
  } catch (error) {
    // If blacklist check fails, assume token is valid (fail open for availability)
    console.error('Token blacklist check failed:', error);
    return false;
  }
}

export async function blacklistToken(token: string, expiresAt?: Date): Promise<void> {
  try {
    const { prisma } = await import('@/lib/prisma');
    
    // Decode token to get expiration
    const decoded = decodeJwtToken(token);
    const tokenExpiresAt = expiresAt || (decoded?.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 24 * 60 * 60 * 1000));
    
    await prisma.blacklistedToken.create({
      data: {
        token,
        expiresAt: tokenExpiresAt,
      },
    });
  } catch (error) {
    console.error('Failed to blacklist token:', error);
  }
}

// Security: Clean up expired blacklisted tokens
export async function cleanupExpiredBlacklistedTokens(): Promise<void> {
  try {
    const { prisma } = await import('@/lib/prisma');
    await prisma.blacklistedToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  } catch (error) {
    console.error('Failed to cleanup expired blacklisted tokens:', error);
  }
}

// Add missing functions that are being imported
export function signAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp' | 'iss' | 'aud'>, expiresIn: StringValue | number = '15m'): string {
  return signJwtToken(payload, expiresIn);
}

export function signRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp' | 'iss' | 'aud'>, expiresIn: StringValue | number = '7d'): string {
  return signJwtToken(payload, expiresIn);
}

export function verifyAccessToken(token: string): Promise<JWTPayload | null> {
  return verifyJwtToken(token);
}

export function verifyRefreshToken(token: string): Promise<JWTPayload | null> {
  return verifyJwtToken(token);
}

export function generateSessionId(): string {
  return randomBytes(32).toString('hex');
}

export function generateTokenId(): string {
  return randomBytes(16).toString('hex');
}
