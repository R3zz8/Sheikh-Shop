import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { signJwtToken } from '@/lib/auth/jwt';

export async function POST(req: NextRequest) {
    const { email, password } = await req.json();
    try {
        // Authenticate user
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) throw new Error('Invalid credentials');
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) throw new Error('Invalid credentials');
        // (Add CSRF validation if needed)
        const token = signJwtToken({ id: user.id, email: user.email, role: user.role });
        const res = NextResponse.json({ success: true });
        res.cookies.set('session-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
        });
        return res;
    } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message || 'Login failed' }, { status: 400 });
    }
} 