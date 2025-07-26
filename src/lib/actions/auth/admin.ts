import { prisma } from '@/lib/prisma';
import { verifyCsrfToken } from '@/lib/auth/csrf';
import { logAudit } from './audit';

export async function getAllUsers() {
    // RBAC should be enforced at the API route or middleware level
    const users = await prisma.user.findMany({
        select: { id: true, email: true, role: true, disabled: true },
        orderBy: { createdAt: 'desc' },
    });
    return users;
}

export async function updateUserRole(userId: string, role: string, csrfToken: string) {
    // RBAC should be enforced at the API route or middleware level
    await verifyCsrfToken(csrfToken);
    await prisma.user.update({ where: { id: userId }, data: { role } });
    await logAudit(userId, 'role_updated');
}

export async function toggleUserDisabled(userId: string, disabled: boolean, csrfToken: string) {
    // RBAC should be enforced at the API route or middleware level
    await verifyCsrfToken(csrfToken);
    await prisma.user.update({ where: { id: userId }, data: { disabled } });
    await logAudit(userId, disabled ? 'user_disabled' : 'user_enabled');
} 