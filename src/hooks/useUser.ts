'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { User as PrismaUser } from '@prisma/client';

export type User = {
    id: string;
    email: string;
    role: PrismaUser['role'];
    // Note: The User model in Prisma doesn't have a 'name' field
    // Components expecting 'name' should be updated to use 'email' or add a name field to the schema
};

export function useUser() {
  const queryClient = useQueryClient();
  return useQuery<User | null>({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/user', {
          credentials: 'include', // Include cookies in the request
        });
        if (!res.ok) {
          if (res.status === 401) {
            // User is not authenticated
            return null;
          }
          throw new Error(`Failed to fetch user: ${res.status}`);
        }
        return res.json();
      } catch {
        // Silently handle errors - user will be treated as not authenticated
        return null;
      }
    },
    // For login UX, keep very short stale time so UI reflects changes fast
    staleTime: 5 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      // Don't retry on 401 (unauthorized) errors
      if (error instanceof Error && error.message.includes('401')) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

// Helper to immediately set user after login for optimistic UI
export function setUserOptimistic(user: User | null, queryClient: ReturnType<typeof useQueryClient> extends never ? any : any) {
  queryClient.setQueryData(['user'], user);
}
