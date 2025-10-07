import { getServerSession } from '@/lib/auth';

export async function checkAccess(req: Request, allowedRoles: string[]) {
    const headerRole = req.headers.get('x-user-role');
    const session = await getServerSession(req as any);
    const role = (headerRole || (session?.role as string | undefined) || '').toUpperCase();
    const allowed = allowedRoles.map(r => r.toUpperCase());
    return allowed.includes(role);
}

export async function requireAccess(req: Request, allowedRoles: string[]) {
    const ok = await checkAccess(req, allowedRoles);
    if (!ok) {
        throw new Error('Insufficient permissions');
    }
}



