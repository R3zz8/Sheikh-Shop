'use server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAccessToken, verifyRefreshToken, signAccessToken, signRefreshToken, generateSessionId, generateTokenId, blacklistToken } from '@/lib/auth/jwt';
import { logAudit } from './audit';
import { cacheSession, deleteCachedSession } from '@/lib/redis';
import { SESSION_CONFIG } from '@/lib/config/auth';
import type { DeviceFingerprint } from '@/lib/config/auth';
import crypto from 'crypto';

// Security: Generate device fingerprint hash
function generateDeviceFingerprint(fingerprint: DeviceFingerprint): string {
  const fingerprintData = {
    userAgent: fingerprint.userAgent,
    screenResolution: fingerprint.screenResolution || '',
    timezone: fingerprint.timezone || '',
    language: fingerprint.language || '',
    platform: fingerprint.platform || '',
    ip: fingerprint.ip || '',
  };
  
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(fingerprintData))
    .digest('hex');
}

// Security: Clean up expired sessions
export async function cleanupExpiredSessions(): Promise<void> {
  try {
    await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  } catch (error) {
    console.error('Failed to cleanup expired sessions:', error);
  }
}

// Security: Session management with refresh token rotation and device fingerprinting
export async function createSession(
  userId: string, 
  userAgent?: string, 
  ip?: string,
  deviceFingerprint?: DeviceFingerprint
) {
  const sessionId = generateSessionId();
  const tokenId = generateTokenId();

  // Security: Get user details for token generation
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, role: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Security: Check session limit and remove oldest if needed
  const activeSessions = await prisma.session.count({
    where: { 
      userId, 
      expiresAt: { gt: new Date() } 
    }
  });

  if (activeSessions >= SESSION_CONFIG.MAX_SESSIONS_PER_USER) {
    // Security: Remove oldest session
    const oldestSession = await prisma.session.findFirst({
      where: { userId },
      orderBy: { createdAt: 'asc' }
    });
    
    if (oldestSession) {
      // Security: Blacklist the old refresh token
      await blacklistToken(oldestSession.refreshToken);
      await prisma.session.delete({ where: { id: oldestSession.id } });
    }
  }

  // Security: Generate device fingerprint hash
  const deviceHash = deviceFingerprint 
    ? generateDeviceFingerprint(deviceFingerprint)
    : crypto.createHash('sha256').update(userAgent || 'unknown').digest('hex');

  // Security: Create session in database with enhanced tracking
  const session = await prisma.session.create({
    data: {
      id: sessionId,
      userId,
      refreshToken: tokenId,
      userAgent: userAgent || 'Unknown',
      ip: ip || 'Unknown',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      deviceFingerprint: deviceHash,
    },
  });

  // Security: Generate tokens with user information
  const accessToken = signAccessToken({
    id: userId,
    email: user.email,
    role: user.role,
    sessionId,
  });

  const refreshToken = signRefreshToken({
    id: userId,
    email: user.email,
    role: user.role,
    sessionId,
    tokenId,
  });

  // Cache lightweight session for fast middleware checks (TTL aligns with access token ~15m)
  await cacheSession({ id: userId, email: user.email, role: user.role, sessionId }, 15 * 60);

  return { session, accessToken, refreshToken };
}

// Security: Refresh access token with rotation and device validation
export async function refreshAccessToken(
  refreshToken: string, 
  userAgent?: string, 
  ip?: string,
  deviceFingerprint?: DeviceFingerprint
) {
  const payload = await verifyRefreshToken(refreshToken);
  
  if (!payload) {
    throw new Error('Invalid refresh token');
  }

  // Security: Check if session exists and is valid
  const session = await prisma.session.findUnique({
    where: { id: payload.sessionId },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date() || session.refreshToken !== payload.tokenId) {
    throw new Error('Session expired or invalid');
  }

  // Security: Validate device fingerprint if provided
  if (deviceFingerprint) {
    const currentDeviceHash = generateDeviceFingerprint(deviceFingerprint);
    if (session.deviceFingerprint && session.deviceFingerprint !== currentDeviceHash) {
      await logAudit(session.userId, 'suspicious_refresh_attempt', {
        expectedDeviceHash: session.deviceFingerprint,
        receivedDeviceHash: currentDeviceHash,
        ip,
        userAgent,
      });
      
      // Security: Optionally invalidate session on device mismatch
      // await invalidateSession(session.id, session.userId);
      // throw new Error('Device mismatch detected');
    }
  }

  // Security: Check for suspicious activity
  if (userAgent && session.userAgent !== userAgent) {
    await logAudit(session.userId, 'suspicious_refresh_attempt', {
      expectedUserAgent: session.userAgent,
      receivedUserAgent: userAgent,
      ip,
    });
  }

  // Security: Generate new tokens with rotation
  const newTokenId = generateTokenId();
  const newAccessToken = signAccessToken({
    id: session.userId,
    email: session.user.email,
    role: session.user.role,
    sessionId: session.id,
  });

  const newRefreshToken = signRefreshToken({
    id: session.userId,
    email: session.user.email,
    role: session.user.role,
    sessionId: session.id,
    tokenId: newTokenId,
  });

  // Security: Blacklist old refresh token
  await blacklistToken(refreshToken);

  // Security: Update session with new refresh token (rotation)
  await prisma.session.update({
    where: { id: session.id },
    data: {
      refreshToken: newTokenId,
      lastUsedAt: new Date(),
      ip: ip || session.ip,
      userAgent: userAgent || session.userAgent,
    },
  });

  // Security: Log token refresh
  await logAudit(session.userId, 'token_refreshed', { 
    ip,
    userAgent,
    sessionId: session.id,
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

// Security: Invalidate session and blacklist tokens
export async function invalidateSession(sessionId: string, userId: string) {
  try {
    const session = await prisma.session.findUnique({
      where: { id: sessionId, userId },
    });

    if (session) {
      // Security: Blacklist the refresh token
      await blacklistToken(session.refreshToken);
      
      // Security: Delete the session
      await prisma.session.delete({
        where: { id: sessionId },
      });
    await deleteCachedSession(sessionId);
    }

    await logAudit(userId, 'session_invalidated', { sessionId });
  } catch (error) {
    console.error('Failed to invalidate session:', error);
  }
}

// Security: Invalidate all user sessions
export async function invalidateAllUserSessions(userId: string) {
  try {
    const sessions = await prisma.session.findMany({
      where: { userId },
      select: { refreshToken: true },
    });

    // Security: Blacklist all refresh tokens
    await Promise.all(
      sessions.map(session => blacklistToken(session.refreshToken))
    );

    // Security: Delete all sessions
    await prisma.session.deleteMany({
      where: { userId },
    });

    await logAudit(userId, 'all_sessions_invalidated');
  } catch (error) {
    console.error('Failed to invalidate all user sessions:', error);
  }
}

// Security: Get current user ID from session
export async function getCurrentUserId(): Promise<string> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access-token')?.value;
  const refreshToken = cookieStore.get('refresh-token')?.value;

  if (!accessToken && !refreshToken) {
    throw new Error('No authentication token found');
  }

  let payload = null;

  // Security: Try access token first
  if (accessToken) {
    payload = await verifyAccessToken(accessToken);
  }

  // Security: Try refresh token if access token failed
  if (!payload && refreshToken) {
    try {
      const { accessToken: newAccessToken } = await refreshAccessToken(refreshToken);
      payload = await verifyAccessToken(newAccessToken);
    } catch (error) {
      throw new Error('Invalid authentication token');
    }
  }

  if (!payload?.id) {
    throw new Error('Invalid authentication token');
  }

  return payload.id;
}

// Security: Get user sessions with device information
export async function getUserSessions(userId: string) {
  return prisma.session.findMany({
    where: { userId },
    orderBy: { lastUsedAt: 'desc' },
    select: {
      id: true,
      userAgent: true,
      ip: true,
      createdAt: true,
      lastUsedAt: true,
      expiresAt: true,
      deviceFingerprint: true,
    },
  });
}

// Security: Create legacy session (for backward compatibility)
export async function createLegacySession(
  userId: string, 
  refreshToken: string, 
  expiresAt: Date, 
  userAgent?: string, 
  ip?: string
) {
  return prisma.session.create({
    data: {
      userId,
      refreshToken,
      expiresAt,
      userAgent: userAgent || 'Unknown',
      ip: ip || 'Unknown',
    },
  });
}

// Security: Revoke session by refresh token
export async function revokeSession(refreshToken: string) {
  try {
    // Security: Blacklist the token
    await blacklistToken(refreshToken);
    
    // Security: Delete the session
    return prisma.session.deleteMany({ where: { refreshToken } });
  } catch (error) {
    console.error('Failed to revoke session:', error);
    return { count: 0 };
  }
}

// Security: Get current user sessions
export async function getCurrentUserSessions() {
  const userId = await getCurrentUserId();
  return getUserSessions(userId);
}

// Security: Revoke specific user session
export async function revokeUserSession(sessionId: string) {
  const userId = await getCurrentUserId();
  const session = await prisma.session.findUnique({ where: { id: sessionId } });
  
  if (!session || session.userId !== userId) {
    throw new Error('Unauthorized');
  }
  
  await invalidateSession(sessionId, userId);
}

// Security: Revoke all sessions for user
export async function revokeAllSessionsForUser(userId: string) {
  await invalidateAllUserSessions(userId);
}

// Security: Schedule periodic session cleanup
function scheduleSessionCleanup() {
  setInterval(async () => {
    await cleanupExpiredSessions();
  }, SESSION_CONFIG.SESSION_CLEANUP_INTERVAL);
}

// Security: Initialize session cleanup on module load
if (typeof window === 'undefined') {
  // Only run on server side
  scheduleSessionCleanup();
}

