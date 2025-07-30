import { NextResponse } from 'next/server';
import { get2FAStatus } from '@/lib/actions/auth/2fa';

export async function GET() {
  try {
    const status = await get2FAStatus();
    return NextResponse.json(status);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
