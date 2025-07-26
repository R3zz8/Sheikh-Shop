import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

interface JWTPayload {
    id: string;
    email: string;
    role: string;
}

export async function GET(req: NextRequest) {
    // Read session-token from req.cookies (Edge-compatible)
    const token = req.cookies.get('session-token')?.value;
    let user: JWTPayload | null = null;
    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            user = typeof decoded === 'string' ? null : decoded as JWTPayload;
        } catch {
            user = null;
        }
    }
    if (!user) return NextResponse.json(null, { status: 401 });
    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { id: true, email: true, role: true },
    });
    if (!dbUser) return NextResponse.json(null, { status: 404 });
    return NextResponse.json(dbUser);
} 