import { prisma } from '@/lib/prisma';

export async function verifyEmail(token: string) {
    // Find user by verification token and check expiry
    const user = await prisma.user.findFirst({
        where: {
            emailVerificationToken: token,
            emailVerificationTokenExpires: { gt: new Date() },
        },
    });
    if (!user) throw new Error('Invalid or expired verification token');
    // Mark email as verified and clear token
    await prisma.user.update({
        where: { id: user.id },
        data: {
            emailVerified: true,
            emailVerificationToken: null,
            emailVerificationTokenExpires: null,
        },
    });
} 