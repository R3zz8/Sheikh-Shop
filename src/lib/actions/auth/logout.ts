'use server';
import { cookies } from 'next/headers';
import { getCurrentUserId, invalidateSession } from './session';
import { logLogin } from './audit';

export async function logoutUser() {
  try {
    const cookieStore = await cookies();

    // Get current session information before clearing
    let sessionId = '';
    let userId = '';

    try {
      userId = await getCurrentUserId();
      // Note: In a real implementation, you'd get sessionId from the token
      // For now, we'll clear all sessions for the user
    } catch (error) {
      // User not authenticated, just clear cookies
    }

    // Security: Invalidate session in database
    if (userId) {
      try {
        // Invalidate all sessions for the user (security measure)
        await invalidateAllUserSessions(userId);
        await logLogin(userId, 'logout_success');
      } catch (error) {
        // Log error but continue with cookie cleanup
        console.error('Error invalidating sessions:', error);
      }
    }

    // Security: Clear all authentication cookies
    cookieStore.delete('session-token'); // Legacy
    cookieStore.delete('access-token');
    cookieStore.delete('refresh-token');
    cookieStore.delete('csrf-token');

  } catch (error) {
    // Security: Always clear cookies even if session invalidation fails
    const cookieStore = await cookies();
    cookieStore.delete('session-token');
    cookieStore.delete('access-token');
    cookieStore.delete('refresh-token');
    cookieStore.delete('csrf-token');

    throw error;
  }
}

// Security: Invalidate all user sessions (for security incidents)
export async function invalidateAllUserSessions(userId: string) {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  try {
    await prisma.session.deleteMany({
      where: { userId },
    });

    await logLogin(userId, 'all_sessions_invalidated');
  } finally {
    await prisma.$disconnect();
  }
}
