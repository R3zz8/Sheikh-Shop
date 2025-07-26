import { prisma } from '@/lib/prisma';
import { verifyCsrfToken } from '@/lib/auth/csrf';
import bcrypt from 'bcrypt';

export async function resetPassword(token: string, newPassword: string, csrfToken: string) {
    await verifyCsrfToken(csrfToken);
    // Find user by reset token and check expiry
    const user = await prisma.user.findFirst({
        where: {
            passwordResetToken: token,
            passwordResetTokenExpires: { gt: new Date() },
        },
    });
    if (!user) throw new Error('Invalid or expired reset token');
    // Update password and clear token
    await prisma.user.update({
        where: { id: user.id },
        data: {
            password: await bcrypt.hash(newPassword, 10),
            passwordResetToken: null,
            passwordResetTokenExpires: null,
        },
    });
    // Optionally revoke all sessions for the user
    // await revokeAllSessionsForUser(user.id);
} 