import { NextResponse } from 'next/server';
import { logoutUser } from '@/lib/actions/auth/logout';

export async function POST() {
  await logoutUser();
  return NextResponse.json({ success: true });
}
