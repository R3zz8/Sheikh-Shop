'use client';

import { useRouter } from 'next/navigation';
import { useUser } from './useUser';
import type { User } from '@prisma/client';
import { useEffect } from 'react';

type Role = User['role'];

export function useHasRole(role: Role | Role[]): boolean {
  const isLocal = typeof window !== 'undefined' && (
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === 'localhost'
  );
  const isMockAuth = isLocal && (
    window.location.search.includes('mock_auth=true') ||
    localStorage.getItem('MOCK_AUTH') === 'true'
  );
  if (isMockAuth) return true;

  const { data: user } = useUser();
  if (!user) return false;
  if (Array.isArray(role)) return role.includes(user.role);
  return user.role === role;
}

export function useRequireRole(role: Role | Role[]) {
  const { data: user, isLoading } = useUser();
  const router = useRouter();

  const isLocal = typeof window !== 'undefined' && (
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === 'localhost'
  );
  const isMockAuth = isLocal && (
    window.location.search.includes('mock_auth=true') ||
    localStorage.getItem('MOCK_AUTH') === 'true'
  );

  useEffect(() => {
    if (isMockAuth) return;
    if (isLoading) return;
    if (!user || (Array.isArray(role) ? !role.includes(user.role) : user.role !== role)) {
      router.replace('/403');
    }
  }, [user, isLoading, role, router, isMockAuth]);

  if (isMockAuth) return true;
  return user && (Array.isArray(role) ? role.includes(user.role) : user.role === role);
}
