'use client';

import { useRouter } from 'next/navigation';
import { useUser } from './useUser';
import type { User } from '@prisma/client';
import { useEffect } from 'react';

type Role = User['role'];

export function useHasRole(role: Role | Role[]): boolean {
    const { data: user } = useUser();
    if (!user) return false;
    if (Array.isArray(role)) return role.includes(user.role);
    return user.role === role;
}

export function useRequireRole(role: Role | Role[]) {
    const { data: user, isLoading } = useUser();
    const router = useRouter();
    useEffect(() => {
        if (isLoading) return;
        if (!user || (Array.isArray(role) ? !role.includes(user.role) : user.role !== role)) {
            router.replace('/403');
        }
    }, [user, isLoading, role, router]);
    return user && (Array.isArray(role) ? role.includes(user.role) : user.role === role);
} 