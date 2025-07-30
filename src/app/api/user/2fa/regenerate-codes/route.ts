import { NextRequest, NextResponse } from 'next/server';
import { regenerateRecoveryCodes } from '@/lib/actions/auth/2fa';

export async function POST(req: NextRequest) {
  try {
    const { csrfToken } = await req.json();
    if (!csrfToken) {
      return NextResponse.json({ error: 'CSRF token is required' }, { status: 400 });
    }

    const codes = await regenerateRecoveryCodes(csrfToken);
    return NextResponse.json({ codes });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
