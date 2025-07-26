import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(req: NextRequest) {
    const token = req.cookies.get('session-token')?.value;
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
        if (payload.role !== 'system') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        // Example data
        return NextResponse.json({
            categories: ['HONEY', 'SAFFRON', 'DATES', 'OTHERS'],
            settings: { maintenance: false },
        });
    } catch {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
} 