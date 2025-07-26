'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { rateLimit } from '@/lib/middleware/rateLimit';

export async function registerUser(email: string, password: string, csrfToken: string, ip?: string) {
    if (!rateLimit(`register:${ip || email}`, 5, 60_000)) {
        throw new Error('Too many registration attempts. Please try again later.');
    }
    // Basic validation
    if (!email || !password) {
        throw new Error('Email and password are required');
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        throw new Error('Invalid email format');
    }
    if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
    }

    // Check for existing user
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        throw new Error('Email already in use');
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
        data: {
            email,
            password: hashed,
        },
    });

    // Optionally, do not return password
    return { id: user.id, email: user.email, createdAt: user.createdAt };
} 