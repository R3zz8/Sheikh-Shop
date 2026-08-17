/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET, getAppUrl } from '@/app/api/auth/google/route';

describe('Google OAuth Initiation Route (/api/auth/google)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('correctly resolves appUrl using getAppUrl helper', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://sheikhshops.com/';
    const req = new NextRequest('http://localhost:3000/api/auth/google');
    expect(getAppUrl(req)).toBe('https://sheikhshops.com');
  });

  it('redirects to login with error=config_missing if GOOGLE_CLIENT_ID is absent', async () => {
    delete process.env.GOOGLE_CLIENT_ID;
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';

    const req = new NextRequest('http://localhost:3000/api/auth/google');
    const res = await GET(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:3000/login?error=config_missing');
  });

  it('sets secure state and verifier cookies and redirects to Google Auth URL', async () => {
    process.env.GOOGLE_CLIENT_ID = 'test-client-id.apps.googleusercontent.com';
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';

    const req = new NextRequest('http://localhost:3000/api/auth/google');
    const res = await GET(req);

    expect(res.status).toBe(307);
    const location = res.headers.get('location');
    expect(location).toContain('https://accounts.google.com/o/oauth2/v2/auth');
    expect(location).toContain('client_id=test-client-id.apps.googleusercontent.com');
    expect(location).toContain('redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fauth%2Fgoogle%2Fcallback');

    // Check set-cookie headers
    const cookies = res.cookies;
    expect(cookies.get('google-oauth-state')?.value).toBeDefined();
    expect(cookies.get('google-oauth-verifier')?.value).toBeDefined();
  });
});
