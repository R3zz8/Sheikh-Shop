import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

export async function getServerSession(request: NextRequest): Promise<User | null> {
  try {
    const token = await getToken({ req: request });
    if (!token) return null;
    
    return {
      id: token.sub || '',
      email: token.email || '',
      name: token.name || undefined,
      role: token.role as string || undefined,
    };
  } catch (error) {
    console.error('Error getting server session:', error);
    return null;
  }
}

export async function requireAuth(request: NextRequest): Promise<User> {
  const user = await getServerSession(request);
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

export async function requireRole(request: NextRequest, role: string): Promise<User> {
  const user = await requireAuth(request);
  if (user.role !== role) {
    throw new Error(`Role ${role} required`);
  }
  return user;
}

