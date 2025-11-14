import { prisma } from '@/lib/prisma';

// Clean up expired email verification codes
export async function cleanupExpiredVerificationCodes(): Promise<void> {
  // Skip cleanup during build time
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return;
  }

  try {
    const result = await prisma.emailVerification.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    if (result.count > 0) {
      console.log(`Cleaned up ${result.count} expired verification codes`);
    }
  } catch (error) {
    // Silently fail during build - database may not be available
    if (process.env.NEXT_PHASE !== 'phase-production-build') {
      console.error('Failed to cleanup expired verification codes:', error);
    }
  }
}

// Schedule cleanup every 5 minutes
if (typeof window === 'undefined' && process.env.NEXT_PHASE !== 'phase-production-build') {
  setInterval(cleanupExpiredVerificationCodes, 5 * 60 * 1000);
}
