'use client';

import { useQuery } from '@tanstack/react-query';
import type { User as PrismaUser } from '@prisma/client';

export type User = {
    id: string;
    email: string;
    role: PrismaUser['role'];
};

export function useUser() {
    return useQuery<User | null>({
        queryKey: ['user'],
        queryFn: async () => {
            const res = await fetch('/api/user');
            if (!res.ok) return null;
            return res.json();
        },
        staleTime: 5 * 60 * 1000,
    });
} 