"use server";

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { signJwtToken, setSessionCookie } from '@/lib/auth/jwt';
import { redirect } from 'next/navigation';

export async function loginUser(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('Invalid email or password');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid email or password');

    // Sign JWT and set cookie
    const token = signJwtToken({ id: user.id, email: user.email });
    await setSessionCookie(token);

    // Redirect to dashboard
    redirect('/dashboard');
} 