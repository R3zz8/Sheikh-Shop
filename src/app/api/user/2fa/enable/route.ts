import { NextRequest, NextResponse } from 'next/server';
import { enable2FA } from '@/lib/actions/auth/2fa';

export async function POST(req: NextRequest) {
  try {
    const { code, csrfToken } = await req.json();
    if (!code || !csrfToken) {
      return NextResponse.json({ error: 'Code and CSRF token are required' }, { status: 400 });
    }

    await enable2FA(code, csrfToken);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
