'use server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function getCsrfToken() {
  const cookieStore = await cookies();
  let token = cookieStore.get('csrf-token')?.value;
  if (!token) {
    token = crypto.randomBytes(32).toString('hex');
    cookieStore.set('csrf-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60,
    });
  }
  return token;
}

export async function verifyCsrfToken(submitted: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get('csrf-token')?.value;
  if (!token || !submitted || token !== submitted) throw new Error('Invalid CSRF token');
}
