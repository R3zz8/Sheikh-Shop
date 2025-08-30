import { prisma } from '@/lib/prisma';

// Clean up expired email verification codes
export async function cleanupExpiredVerificationCodes(): Promise<void> {
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
    console.error('Failed to cleanup expired verification codes:', error);
  }
}

// Schedule cleanup every 5 minutes
if (typeof window === 'undefined') {
  setInterval(cleanupExpiredVerificationCodes, 5 * 60 * 1000);
}
