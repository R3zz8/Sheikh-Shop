'use server';
import { signJwtToken } from '@/lib/auth/jwt';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function loginAction(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Invalid credentials');
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error('Invalid credentials');
  // Include role in JWT and log payload
  const payload = { id: user.id, email: user.email, role: user.role };
  const token = signJwtToken(payload);
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
