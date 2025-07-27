import { prisma } from '@/lib/prisma';

export async function logLogin(userId: string, ip?: string, userAgent?: string) {
    await prisma.auditLog.create({
        data: {
            userId,
            action: 'LOGIN',
            ip,
            userAgent,
            metadata: {},
        },
    });
}

export async function logFailedAttempt(userId: string | null, action: string, ip?: string, userAgent?: string) {
    await prisma.auditLog.create({
        data: {
            userId: userId || undefined,
            action,
            ip,
            userAgent,
            metadata: {},
        },
    });
}

export async function logAudit(userId: string, action: string, metadata?: any) {
    await prisma.auditLog.create({
        data: {
            userId,
            action,
            metadata: metadata || {},
        },
    });
} 