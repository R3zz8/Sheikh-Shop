'use server';
import { signJwtToken } from '@/lib/auth/jwt';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function registerAction(email: string, password: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('Email already in use');
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      // Add fullName to the schema if you want to store it
    },
  });
    // Auto-login after signup
  const token = signJwtToken({ id: user.id, email: user.email, role: user.role });
  const cookieStore = await cookies();
  cookieStore.set('session-token', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
  });
  return { success: true };
}
