import { logFailedAttempt } from '@/lib/actions/auth/audit';
import { verifyCsrfToken } from '@/lib/auth/csrf';

export async function forgotPassword(email: string, csrfToken: string, ip?: string, userAgent?: string) {
    await verifyCsrfToken(csrfToken);
    if (!email) throw new Error('Email required');
    
    // Rate limiting is handled at the API route level
    // ... existing logic ...
    await logFailedAttempt(null, 'forgot_password', ip, userAgent);
}
