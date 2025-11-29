import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
  jti?: string; // JWT ID for token revocation
}

export interface RefreshTokenPayload {
  userId: string;
  tokenVersion: number;
  iat?: number;
  exp?: number;
}

export class JWTManager {
  private static instance: JWTManager;
  private revokedTokens: Set<string> = new Set();

  private constructor() {
    // Clean up revoked tokens every hour
    setInterval(() => {
      this.cleanupRevokedTokens();
    }, 60 * 60 * 1000);
  }

  public static getInstance(): JWTManager {
    if (!JWTManager.instance) {
      JWTManager.instance = new JWTManager();
    }
    return JWTManager.instance;
  }

  // Generate access token
  generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp' | 'jti'>): string {
    const jti = this.generateTokenId();
    const tokenPayload: JWTPayload = {
      ...payload,
      jti,
    };

    return jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'sheikh-shop',
      audience: 'sheikh-shop-users',
    } as jwt.SignOptions);
  }

  // Generate refresh token
  generateRefreshToken(userId: string, tokenVersion: number): string {
    const payload: RefreshTokenPayload = {
      userId,
      tokenVersion,
    };

    return jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
      issuer: 'sheikh-shop',
      audience: 'sheikh-shop-refresh',
    } as jwt.SignOptions);
  }

  // Verify access token
  verifyAccessToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET, {
        issuer: 'sheikh-shop',
        audience: 'sheikh-shop-users',
      }) as JWTPayload;

      // Check if token is revoked
      if (decoded.jti && this.revokedTokens.has(decoded.jti)) {
        return null;
      }

      return decoded;
    } catch (error) {
      console.error('JWT verification failed:', error);
      return null;
    }
  }

  // Verify refresh token
  verifyRefreshToken(token: string): RefreshTokenPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
        issuer: 'sheikh-shop',
        audience: 'sheikh-shop-refresh',
      }) as RefreshTokenPayload;

      return decoded;
    } catch (error) {
      console.error('Refresh token verification failed:', error);
      return null;
    }
  }

  // Revoke token
  revokeToken(jti: string): void {
    this.revokedTokens.add(jti);
  }

  // Revoke all tokens for a user (by incrementing token version)
  revokeAllUserTokens(userId: string): void {
    // This would typically update the user's token version in the database
    // For now, we'll just log it
    console.log(`Revoking all tokens for user: ${userId}`);
  }

  // Extract token from request
  extractTokenFromRequest(req: NextRequest): string | null {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Check cookies
    const cookieToken = req.cookies.get('access-token')?.value;
    if (cookieToken) {
      return cookieToken;
    }

    return null;
  }

  // Get user from request
  getUserFromRequest(req: NextRequest): JWTPayload | null {
    const token = this.extractTokenFromRequest(req);
    if (!token) {
      return null;
    }

    return this.verifyAccessToken(token);
  }

  // Generate secure token ID
  private generateTokenId(): string {
    return `jti_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Clean up expired revoked tokens
  private cleanupRevokedTokens(): void {
    // In a real implementation, you'd check token expiration times
    // For now, we'll just limit the size of the revoked tokens set
    if (this.revokedTokens.size > 10000) {
      this.revokedTokens.clear();
    }
  }
}

// Export singleton instance
export const jwtManager = JWTManager.getInstance();

// Utility functions
export function createTokenPair(userId: string, email: string, role: string, tokenVersion: number) {
  const accessToken = jwtManager.generateAccessToken({ userId, email, role });
  const refreshToken = jwtManager.generateRefreshToken(userId, tokenVersion);

  return {
    accessToken,
    refreshToken,
    expiresIn: JWT_EXPIRES_IN,
  };
}

export function verifyToken(token: string): JWTPayload | null {
  return jwtManager.verifyAccessToken(token);
}

export function extractToken(req: NextRequest): string | null {
  return jwtManager.extractTokenFromRequest(req);
}

export function getUserFromToken(req: NextRequest): JWTPayload | null {
  return jwtManager.getUserFromRequest(req);
}

// Middleware helper
export function withAuth(handler: (req: NextRequest, user: JWTPayload) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const user = getUserFromToken(req);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid or missing token' },
        { status: 401 }
      );
    }

    return handler(req, user);
  };
}

// Role-based access control
export function withRole(requiredRole: string) {
  return (handler: (req: NextRequest, user: JWTPayload) => Promise<NextResponse>) => {
    return withAuth(async (req: NextRequest, user: JWTPayload) => {
      if (user.role !== requiredRole && user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Forbidden', message: 'Insufficient permissions' },
          { status: 403 }
        );
      }

      return handler(req, user);
    });
  };
}

