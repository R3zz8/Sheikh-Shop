import { NextResponse } from 'next/server';
import { getCsrfToken } from '@/lib/auth/csrf';

export async function GET() {
  const csrfToken = await getCsrfToken();
  return NextResponse.json({ csrfToken });
}
