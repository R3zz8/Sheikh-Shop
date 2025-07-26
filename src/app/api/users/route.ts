import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const size = parseInt(searchParams.get('size') || '20', 10);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';

    const where: any = {};
    if (search) where.email = { contains: search, mode: 'insensitive' };
    if (role) where.role = role;

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            orderBy: { email: 'asc' },
            skip: (page - 1) * size,
            take: size,
            select: { id: true, email: true, role: true },
        }),
        prisma.user.count({ where }),
    ]);

    return NextResponse.json({ users, total });
} 