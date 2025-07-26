import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyJwtToken } from '@/lib/auth/jwt';

export async function createSession(userId: string, refreshToken: string, expiresAt: Date, userAgent?: string, ip?: string) {
    return prisma.session.create({
        data: {
            userId,
            refreshToken,
            expiresAt,
            userAgent,
            ip,
        },
    });
}

export async function revokeSession(refreshToken: string) {
    return prisma.session.deleteMany({ where: { refreshToken } });
}

export async function getUserSessions(userId: string) {
    return prisma.session.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
}

export async function getCurrentUserId() {
    const cookieStore = cookies();
    const token = cookieStore.get('session-token')?.value;
    if (!token) throw new Error('Not authenticated');
    const user = verifyJwtToken(token);
    if (!user) throw new Error('Invalid token');
    return user.id;
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

export async function cleanupExpiredSessions() {
    await prisma.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });
} 