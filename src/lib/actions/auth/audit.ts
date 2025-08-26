import { prisma } from '@/lib/prisma';

export async function logLogin(userId: string, ip?: string, userAgent?: string) {
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'LOGIN',
      ip: ip || null,
      userAgent: userAgent || null,
      metadata: {},
    },
  });
}

export async function logFailedAttempt(userId: string | null, action: string, ip?: string, userAgent?: string) {
  await prisma.auditLog.create({
    data: {
      userId: userId || null,
      action,
      ip: ip || null,
      userAgent: userAgent || null,
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
