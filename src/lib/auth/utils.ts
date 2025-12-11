import { NextRequest } from 'next/server';
import { verifyJwtToken } from '@/lib/auth/jwt';

/**
 * @deprecated This function is being replaced by the more comprehensive getUserFromRequest.
 * It only checks for the access token and returns only the user ID.
 */
export async function getUserIdOnlyFromRequest(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get('access-token')?.value || req.headers.get('Authorization')?.split(' ')[1];

  if (!token) {
    return null;
  }

  try {
    const decoded = await verifyJwtToken(token);
    return decoded?.id as string ?? null;
  } catch (error) {
    console.error('Error decoding JWT in getUserIdOnlyFromRequest:', error);
    return null;
  }
}

/**
 * Extracts the user payload from a request by checking various token sources.
 * Follows the documented security flow.
 * @param request The NextRequest object.
 * @returns A promise that resolves to the JWTPayload or null if no valid token is found.
 */
export async function getUserFromRequest(request: NextRequest): Promise<JWTPayload | null> {
  // 1. Check access-token cookie
  const accessToken = request.cookies.get('access-token')?.value;
  if (accessToken) {
    const user = await verifyJwtToken(accessToken);
    if (user) return user;
  }

  // 2. Fallback to Authorization header
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
      const bearerToken = authHeader.substring(7);
      const user = await verifyJwtToken(bearerToken);
      if (user) return user;
  }

  // 3. Fallback to refresh-token cookie
  const refreshToken = request.cookies.get('refresh-token')?.value;
  if (refreshToken) {
    const user = await verifyJwtToken(refreshToken);
    if (user) return user;
  }

  // 4. Legacy fallback to session-token cookie
  const sessionToken = request.cookies.get('session-token')?.value;
  if (sessionToken) {
    const user = await verifyJwtToken(sessionToken);
    if (user) return user;
  }

  return null;
}
