import jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { randomBytes } from 'crypto';

// TEMP DEBUG LOG (remove after diagnosis)
if (process.env.NODE_ENV !== 'production') {
  // Do NOT print the actual secret
  // eslint-disable-next-line no-console
  console.log('[debug] JWT_SECRET present:', Boolean(process.env.JWT_SECRET), 'length:', (process.env.JWT_SECRET || '').length);
}

// Security: Accessor to read and validate JWT secrets for rotation
function getJwtSecrets(): string[] {
    const secretsEnv = process.env.JWT_SECRETS || process.env.JWT_SECRET || '';
    if (!secretsEnv) {
        throw new Error('JWT_SECRETS environment variable is not set');
    }

    const secrets = secretsEnv.split(',').map(s => s.trim()).filter(Boolean);

    if (secrets.length === 0) {
        throw new Error('JWT_SECRETS environment variable is empty or invalid');
    }

    for (const secret of secrets) {
        if (secret.length < 32) {
            throw new Error('All JWT secrets must be at least 32 characters long');
        }
        if (secret === 'dev-secret-key' || secret === 'changeme' || secret.includes('dev-secret')) {
            throw new Error('JWT_SECRETS cannot contain development or default values');
        }
    }

    return secrets;
}

// Gets the primary secret (the first in the list) for signing new tokens.
function getPrimaryJwtSecret(): string {
    const secrets = getJwtSecrets();
    if (secrets.length === 0) {
        throw new Error('JWT_SECRET is not defined');
    }
    return secrets[0]!;
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
    const primarySecret = getPrimaryJwtSecret();
    return jwt.sign(payload, primarySecret, {
      ...JWT_OPTIONS,
      expiresIn,
    });
  } catch (error) {
    throw new Error(`Failed to sign JWT token: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Security: Enhanced JWT verification with secret rotation support
export async function verifyJwtToken(token: string): Promise<JWTPayload | null> {
    const secrets = getJwtSecrets();

    // Security: Check if token is blacklisted first
    if (await isTokenBlacklisted(token)) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[JWT] Token is blacklisted');
      }
      return null;
    }

    for (const secret of secrets) {
        try {
            const decoded = jwt.verify(token, secret, {
                algorithms: ['HS256'],
                issuer: 'sheikh-shop',
                audience: 'sheikh-shop-users',
            }) as unknown as JWTPayload;
            return decoded; // Return decoded payload on first successful verification
        } catch (error) {
            // Ignore errors and try the next secret
            if (error instanceof jwt.TokenExpiredError) {
                // If token is expired, no need to check other secrets
                if (process.env.NODE_ENV === 'development') {
                    console.warn('[JWT] Token expired:', error.expiredAt);
                }
                return null;
            }
        }
    }

    // If no secret worked, log the final error
    if (process.env.NODE_ENV === 'development') {
        console.warn('[JWT] Token verification failed with all available secrets.');
    }

    return null;
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
  // Skip cleanup during build time
  if (process.env.NEXT_PHASE === 'phase-production-build' || process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    return;
  }

  try {
    const { prisma } = await import('@/lib/prisma');
    const result = await prisma.blacklistedToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
    
    if (result.count > 0) {
      console.log(`[JWT] Cleaned up ${result.count} expired blacklisted tokens`);
    }
  } catch (error) {
    // Silently fail during build - database may not be available
    if (process.env.NEXT_PHASE !== 'phase-production-build') {
      console.error('[JWT] Failed to cleanup expired blacklisted tokens:', error);
    }
  }
}

// Security: Schedule cleanup of expired blacklisted tokens
if (typeof window === 'undefined' && process.env.NEXT_PHASE !== 'phase-production-build') {
  // Run cleanup every hour
  const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour
  
  setInterval(async () => {
    try {
      await cleanupExpiredBlacklistedTokens();
    } catch (error) {
      console.error('[JWT] Scheduled cleanup failed:', error);
    }
  }, CLEANUP_INTERVAL);
  
  // Run initial cleanup on server start (only if not building)
  if (process.env.NEXT_PHASE !== 'phase-production-build') {
    cleanupExpiredBlacklistedTokens().catch(error => {
      // Only log if not during build
      if (process.env.NEXT_PHASE !== 'phase-production-build') {
        console.error('[JWT] Initial cleanup failed:', error);
      }
    });
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
