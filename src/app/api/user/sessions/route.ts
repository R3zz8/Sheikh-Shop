import { NextResponse } from 'next/server';
import { getCurrentUserSessions } from '@/lib/actions/auth/session';

export async function GET() {
    try {
        const sessions = await getCurrentUserSessions();
        return NextResponse.json({ sessions });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 401 });
    }
} 