'use server';
import { cookies } from 'next/headers';

export async function logoutUser() {
    const cookieStore = cookies();
    cookieStore.delete('session-token');
    cookieStore.delete('refresh-token');
} 