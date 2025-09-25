'use server';
import { cookies } from 'next/headers';
import { getCurrentUserId, invalidateSession, invalidateAllUserSessions } from './session';
import { logAudit } from './audit';
import { clearCsrfToken } from '@/lib/auth/csrf';
import { blacklistToken } from '@/lib/auth/jwt';

export async function logoutUser() {
  try {
    const cookieStore = await cookies();

    // Security: Get current session information before clearing
    let sessionId = '';
    let userId = '';
    let accessToken = '';
    let refreshToken = '';

    try {
      userId = await getCurrentUserId();
      accessToken = cookieStore.get('access-token')?.value || '';
      refreshToken = cookieStore.get('refresh-token')?.value || '';
    } catch (error) {
      // User not authenticated, just clear cookies
    }

    // Security: Blacklist tokens if they exist
    if (accessToken) {
      await blacklistToken(accessToken);
    }
    
    if (refreshToken) {
      await blacklistToken(refreshToken);
    }

    // Security: Invalidate session in database
    if (userId) {
      try {
        // Security: Invalidate current session
        if (sessionId) {
          await invalidateSession(sessionId, userId);
        }
        
        await logAudit(userId, 'logout_success', {
          sessionId,
          logoutType: 'single_session',
        });
      } catch (error) {
        // Log error but continue with cookie cleanup
        console.error('Error invalidating session:', error);
      }
    }

    // Security: Clear all authentication cookies
    cookieStore.delete('session-token'); // Legacy
    cookieStore.delete('access-token');
    cookieStore.delete('refresh-token');
    
    // Security: Clear CSRF token
    await clearCsrfToken();

  } catch (error) {
    // Security: Always clear cookies even if session invalidation fails
    const cookieStore = await cookies();
    cookieStore.delete('session-token');
    cookieStore.delete('access-token');
    cookieStore.delete('refresh-token');
    await clearCsrfToken();

    throw error;
  }
}

// Security: Logout from all sessions
export async function logoutAllSessions() {
  try {
    const cookieStore = await cookies();
    const userId = await getCurrentUserId();
    
    // Security: Get all tokens to blacklist
    const accessToken = cookieStore.get('access-token')?.value || '';
    const refreshToken = cookieStore.get('refresh-token')?.value || '';
    
    // Security: Blacklist current tokens
    if (accessToken) {
      await blacklistToken(accessToken);
    }
    
    if (refreshToken) {
      await blacklistToken(refreshToken);
    }
    
    // Security: Invalidate all user sessions
    await invalidateAllUserSessions(userId);
    
    // Security: Log the action
    await logAudit(userId, 'logout_all_sessions', {
      logoutType: 'all_sessions',
    });
    
    // Security: Clear all cookies
    cookieStore.delete('session-token');
    cookieStore.delete('access-token');
    cookieStore.delete('refresh-token');
    await clearCsrfToken();
    
  } catch (error) {
    console.error('Error during logout all sessions:', error);
    throw error;
  }
}

// Security: Invalidate all user sessions (for security incidents)
export async function logoutAllUserSessions(userId: string) {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  try {
    // Security: Get all sessions to blacklist tokens
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
  } finally {
    await prisma.$disconnect();
  }
}
