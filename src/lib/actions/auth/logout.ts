'use server';
import { removeSessionCookie } from '@/lib/auth/jwt';
import { redirect } from 'next/navigation';

export async function logoutUser() {
    await removeSessionCookie();
    redirect('/login');
} 