'use server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

// Security: CSRF configuration
const CSRF_CONFIG = {
  TOKEN_LIFETIME: 30 * 60, // 30 minutes (reduced from 1 hour)
  TOKEN_LENGTH: 32,
  ROTATE_AFTER_AUTH: true,
} as const;

// Security: Generate secure CSRF token
export async function getCsrfToken() {
  const cookieStore = await cookies();
  let token = cookieStore.get('csrf-token')?.value;
  
  if (!token) {
    // Security: Generate cryptographically secure token
    token = crypto.randomBytes(CSRF_CONFIG.TOKEN_LENGTH).toString('hex');
    
    // Security: Set secure cookie with shorter lifetime
    cookieStore.set('csrf-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', // Enhanced from 'lax' for better security
      path: '/',
      maxAge: CSRF_CONFIG.TOKEN_LIFETIME,
    });
  }
  
  return token;
}

// Security: Verify CSRF token with timing attack protection
export async function verifyCsrfToken(submitted: string) {
  if (!submitted || typeof submitted !== 'string') {
    throw new Error('CSRF token is required');
  }
  
  const cookieStore = await cookies();
  const token = cookieStore.get('csrf-token')?.value;
  
  if (!token) {
    throw new Error('CSRF token not found in cookies');
  }
  
  // Security: Use crypto.timingSafeEqual for timing attack protection
  if (!crypto.timingSafeEqual(
    Buffer.from(submitted, 'utf8'),
    Buffer.from(token, 'utf8')
  )) {
    throw new Error('Invalid CSRF token');
  }
}

// Security: Rotate CSRF token (e.g., after successful authentication)
export async function rotateCsrfToken() {
  const cookieStore = await cookies();
  
  // Security: Generate new token
  const newToken = crypto.randomBytes(CSRF_CONFIG.TOKEN_LENGTH).toString('hex');
  
  // Security: Set new token with secure settings
  cookieStore.set('csrf-token', newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: CSRF_CONFIG.TOKEN_LIFETIME,
  });
  
  return newToken;
}

// Security: Clear CSRF token
export async function clearCsrfToken() {
  const cookieStore = await cookies();
  cookieStore.delete('csrf-token');
}

// Security: Validate CSRF token format
export async function validateCsrfTokenFormat(token: string): Promise<boolean> {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  // Security: Check token length and format
  if (token.length !== CSRF_CONFIG.TOKEN_LENGTH * 2) { // hex string is 2x bytes
    return false;
  }
  
  // Security: Check if token contains only valid hex characters
  if (!/^[a-f0-9]+$/i.test(token)) {
    return false;
  }
  
  return true;
}
