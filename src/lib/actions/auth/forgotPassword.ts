import { rateLimit } from '@/lib/middleware/rateLimit';
import { logFailedAttempt } from '@/lib/actions/auth/audit';
import { verifyCsrfToken } from '@/lib/auth/csrf';

export async function forgotPassword(email: string, csrfToken: string, ip?: string, userAgent?: string) {
    await verifyCsrfToken(csrfToken);
    if (!email) throw new Error('Email required');
    if (!rateLimit(`forgot:${email}`, 3, 60_000)) {
        await logFailedAttempt(null, 'forgot_rate_limit', ip, userAgent);
        throw new Error('Too many reset attempts. Please try again later.');
    }
    // ... existing logic ...
    await logFailedAttempt(null, 'forgot_password', ip, userAgent);
}
