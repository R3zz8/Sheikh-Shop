import { NextRequest } from 'next/server';
import { verifyJwtToken } from '@/lib/auth/jwt';

export async function getUserIdFromRequest(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get('access-token')?.value || req.headers.get('Authorization')?.split(' ')[1];

  if (!token) {
    return null;
  }

  try {
    const decoded = await verifyJwtToken(token);
    return decoded?.id as string ?? null;
  } catch (error) {
    console.error('Error decoding JWT in getUserIdFromRequest:', error);
    return null;
  }
}
