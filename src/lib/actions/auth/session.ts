'use server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAccessToken, verifyRefreshToken, signAccessToken, signRefreshToken, generateSessionId, generateTokenId } from '@/lib/auth/jwt';
import { logLogin } from './audit';

// Security: Session management with refresh token rotation
export async function createSession(userId: string, userAgent?: string, ip?: string) {
  const sessionId = generateSessionId();
  const tokenId = generateTokenId();

  // Get user details for token generation
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, role: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Create session in database
  const session = await prisma.session.create({
    data: {
      id: sessionId,
      userId,
      refreshToken: tokenId,
      userAgent: userAgent || 'Unknown',
      ip: ip || 'Unknown',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  // Generate tokens with user information
  const accessToken = signAccessToken({
    id: userId,
    email: user.email,
    role: user.role,
    sessionId,
  });

  const refreshToken = signRefreshToken({
    id: userId,
    sessionId,
    tokenId,
  });

  return { session, accessToken, refreshToken };
}

// Security: Refresh access token with rotation
export async function refreshAccessToken(refreshToken: string, userAgent?: string, ip?: string) {
  const payload = verifyRefreshToken(refreshToken);
  if (!payload) {
    throw new Error('Invalid refresh token');
  }

  // Check if session exists and is valid
  const session = await prisma.session.findUnique({
    where: { id: payload.sessionId },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date() || session.refreshToken !== payload.tokenId) {
    throw new Error('Session expired or invalid');
  }

  // Check for suspicious activity
  if (userAgent && session.userAgent !== userAgent) {
    await logLogin(session.userId, 'suspicious_refresh_attempt', {
      expectedUserAgent: session.userAgent,
      receivedUserAgent: userAgent,
      ip,
    });
  }

  // Generate new tokens with rotation
  const newTokenId = generateTokenId();
  const newAccessToken = signAccessToken({
    id: session.userId,
    email: session.user.email,
    role: session.user.role,
    sessionId: session.id,
  });

  const newRefreshToken = signRefreshToken({
    id: session.userId,
    sessionId: session.id,
    tokenId: newTokenId,
  });

  // Update session with new refresh token (rotation)
  await prisma.session.update({
    where: { id: session.id },
    data: {
      refreshToken: newTokenId,
      lastUsedAt: new Date(),
    },
  });

  await logLogin(session.userId, 'token_refreshed', { ip });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

// Security: Invalidate session
export async function invalidateSession(sessionId: string, userId: string) {
  await prisma.session.deleteMany({
    where: {
      id: sessionId,
      userId,
    },
  });

  await logLogin(userId, 'session_invalidated');
}

// Security: Invalidate all user sessions
export async function invalidateAllUserSessions(userId: string) {
  await prisma.session.deleteMany({
    where: { userId },
  });

  await logLogin(userId, 'all_sessions_invalidated');
}

// Security: Get current user ID from session
export async function getCurrentUserId(): Promise<string> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access-token')?.value;
  const refreshToken = cookieStore.get('refresh-token')?.value;

  if (!accessToken) {
    throw new Error('No access token found');
  }

  const payload = verifyAccessToken(accessToken);
  if (payload) {
    return payload.id;
  }

  // Try to refresh if access token is expired
  if (refreshToken) {
    try {
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await refreshAccessToken(refreshToken);

      // Update cookies
      cookieStore.set('access-token', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 15 * 60, // 15 minutes
      });

      cookieStore.set('refresh-token', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });

      const newPayload = verifyAccessToken(newAccessToken);
      return newPayload?.id || '';
    } catch (error) {
      throw new Error('Session expired');
    }
  }

  throw new Error('Session expired');
}

// Security: Get user sessions
export async function getUserSessions(userId: string) {
  return await prisma.session.findMany({
    where: { userId },
    orderBy: { lastUsedAt: 'desc' },
  });
}

// Security: Clean up expired sessions
export async function cleanupExpiredSessions() {
  await prisma.session.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
}

// Legacy functions for backward compatibility
export async function createSession(userId: string, refreshToken: string, expiresAt: Date, userAgent?: string, ip?: string) {
  return prisma.session.create({
    data: {
      userId,
      refreshToken,
      expiresAt,
      userAgent: userAgent || null,
      ip: ip || null,
    },
  });
}

export async function revokeSession(refreshToken: string) {
  return prisma.session.deleteMany({ where: { refreshToken } });
}

export async function getCurrentUserSessions() {
  const userId = await getCurrentUserId();
  return getUserSessions(userId);
}

export async function revokeUserSession(sessionId: string) {
  const userId = await getCurrentUserId();
  const session = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!session || session.userId !== userId) throw new Error('Unauthorized');
  await prisma.session.delete({ where: { id: sessionId } });
}

export async function revokeAllSessionsForUser(userId: string) {
  await prisma.session.deleteMany({ where: { userId } });
}
