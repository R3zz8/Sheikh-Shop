import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth/password';

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
              password: true,
              emailVerified: true,
              canLogin: true
            }
          });

          if (!user || !user.password || !user.canLogin) {
            return null;
          }

          const isValidPassword = await verifyPassword(credentials.password, user.password);
          if (!isValidPassword) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : undefined,
            role: user.role
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 15 * 60, // 15 minutes
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.sub!;
        (session.user as any).role = token.role as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

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

