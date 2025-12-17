import { auth } from '@/lib/auth/index';
import { jwtVerify } from 'jose';

export async function checkAccess(req: Request, allowedRoles: string[]) {
    try {
        // First try to get role from middleware headers (most reliable)
        const headerRole = req.headers.get('x-user-role');
        if (headerRole) {
            const role = headerRole.toUpperCase();
            const allowed = allowedRoles.map(r => r.toUpperCase());
            return allowed.includes(role);
        }

        // Fallback: try NextAuth session
        const session = await auth();
        if (session?.user?.role) {
            const role = session.user.role.toUpperCase();
            const allowed = allowedRoles.map(r => r.toUpperCase());
            return allowed.includes(role);
        }

        // Fallback: try direct JWT token verification
        const cookieHeader = req.headers.get('cookie');
        if (cookieHeader) {
            const cookies = Object.fromEntries(
                cookieHeader.split(';').map(c => {
                    const [key, value] = c.trim().split('=');
                    return [key, value];
                })
            );

            const accessToken = cookies['access-token'];
            const sessionToken = cookies['session-token'];
            const token = accessToken || sessionToken;

            if (token) {
                const JWT_SECRET = process.env.JWT_SECRET;
                if (JWT_SECRET) {
                    try {
                        const { payload } = await jwtVerify(
                            token,
                            new TextEncoder().encode(JWT_SECRET),
                            {
                                algorithms: ['HS256'],
                                issuer: 'sheikh-shop',
                                audience: 'sheikh-shop-users',
                            }
                        );
                        const role = String(payload.role || '').toUpperCase();
                        const allowed = allowedRoles.map(r => r.toUpperCase());
                        return allowed.includes(role);
                    } catch (jwtError) {
                        console.warn('[checkAccess] JWT verification failed:', jwtError);
                    }
                }
            }
        }

        return false;
    } catch (error) {
        console.warn('[checkAccess] Session validation failed:', error);
        return false;
    }
}

export async function requireAccess(req: Request, allowedRoles: string[]) {
    const ok = await checkAccess(req, allowedRoles);
    if (!ok) {
        throw new Error('Insufficient permissions');
    }
}








