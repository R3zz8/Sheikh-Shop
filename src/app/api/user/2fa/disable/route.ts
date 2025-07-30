import { NextRequest, NextResponse } from 'next/server';
import { disable2FA } from '@/lib/actions/auth/2fa';

export async function POST(req: NextRequest) {
  try {
    const { csrfToken } = await req.json();
    if (!csrfToken) {
      return NextResponse.json({ error: 'CSRF token is required' }, { status: 400 });
    }

    await disable2FA(csrfToken);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
