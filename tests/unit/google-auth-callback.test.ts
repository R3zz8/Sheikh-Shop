/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/auth/google/callback/route';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('@/lib/actions/auth/session', () => ({
  createSession: jest.fn(),
}));

jest.mock('@/lib/actions/auth/audit', () => ({
  logAudit: jest.fn().mockResolvedValue(true),
  logFailedAttempt: jest.fn().mockResolvedValue(true),
}));

describe('Google OAuth Callback Route (/api/auth/google/callback)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.GOOGLE_CLIENT_ID = 'test-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('redirects to login with error=oauth_rejected if Google returns error parameter', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/google/callback?error=access_denied');
    const res = await GET(req);

    expect(res.headers.get('location')).toBe('http://localhost:3000/login?error=oauth_rejected');
  });

  it('redirects to login with error=invalid_callback if code or state is missing', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/google/callback?code=123');
    const res = await GET(req);

    expect(res.headers.get('location')).toBe('http://localhost:3000/login?error=invalid_callback');
  });

  it('redirects to login with error=invalid_state if stored cookies do not match state', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/google/callback?code=123&state=abc');
    req.cookies.set('google-oauth-state', 'different_state');
    req.cookies.set('google-oauth-verifier', 'verifier_value');

    const res = await GET(req);

    expect(res.headers.get('location')).toBe('http://localhost:3000/login?error=invalid_state');
  });
});
