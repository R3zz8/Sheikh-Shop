import { NextResponse } from 'next/server';
import { generate2FASecret } from '@/lib/actions/auth/2fa';

export async function POST() {
  try {
    const secretData = await generate2FASecret();
    return NextResponse.json(secretData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
