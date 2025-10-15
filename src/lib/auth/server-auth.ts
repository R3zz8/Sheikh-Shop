'use server';

import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCachedSession } from '@/lib/redis';

// Security: Accessor to read JWT secret on demand
function getJwtSecret(): string | null {
  const secret = process.env.JWT_SECRET || '';
  if (!secret || secret.length < 32) return null;
  return secret;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  emailVerified: boolean;
}

export async function getServerUser(): Promise<AuthenticatedUser | null> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access-token')?.value;
    const refreshToken = cookieStore.get('refresh-token')?.value;

    if (!accessToken && !refreshToken) {
      return null;
    }

    let payload: any = null;

    // Try access token first
    if (accessToken) {
      try {
        const JWT_SECRET = getJwtSecret();
        if (!JWT_SECRET) throw new Error('Missing JWT secret');
        
        const { payload: accessPayload } = await jwtVerify(
          accessToken,
          new TextEncoder().encode(JWT_SECRET),
          {
            algorithms: ['HS256'],
            issuer: 'sheikh-shop',
            audience: 'sheikh-shop-users',
          }
        );
        
        payload = accessPayload;
      } catch (error) {
        // Access token invalid/expired, try refresh token
        if (refreshToken) {
          try {
            const JWT_SECRET = getJwtSecret();
            if (!JWT_SECRET) throw new Error('Missing JWT secret');
            
            const { payload: refreshPayload } = await jwtVerify(
              refreshToken,
              new TextEncoder().encode(JWT_SECRET),
              {
                algorithms: ['HS256'],
                issuer: 'sheikh-shop',
                audience: 'sheikh-shop-refresh',
              }
            );
            
            payload = refreshPayload;
          } catch (refreshError) {
            // Both tokens invalid
            return null;
          }
        }
      }
    }

    if (!payload?.id) {
      return null;
    }

    // Get fresh user data from database
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        email: true,
        role: true,
        emailVerified: true,
        canLogin: true,
        disabled: true,
      },
    });

    if (!user || !user.canLogin || user.disabled) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
    };
  } catch (error) {
    console.error('Server auth error:', error);
    return null;
  }
}

export async function requireAuth(requiredRoles?: string[]): Promise<AuthenticatedUser> {
  const user = await getServerUser();
  
  if (!user) {
    redirect('/login');
  }

  if (requiredRoles && !requiredRoles.includes(user.role)) {
    redirect('/403');
  }

  return user;
}

export async function requireSuperAdmin(): Promise<AuthenticatedUser> {
  return requireAuth(['SUPERADMIN']);
}

export async function requireAdminOrSuperAdmin(): Promise<AuthenticatedUser> {
  return requireAuth(['ADMIN', 'SUPERADMIN']);
}
