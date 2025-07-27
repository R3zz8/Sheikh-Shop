'use server';
import { cookies } from 'next/headers';

export async function logoutUser() {
    const cookieStore = await cookies();
    cookieStore.delete('session-token');
    cookieStore.delete('refresh-token');
} 