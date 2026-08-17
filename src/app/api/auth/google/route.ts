import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export function getAppUrl(req: NextRequest): string {
  let url = process.env.NEXT_PUBLIC_APP_URL;
  if (!url) {
    const host = req.headers.get('host') || 'localhost:3000';
    const proto = req.headers.get('x-forwarded-proto') || 'http';
    url = `${proto}://${host}`;
  }
  return url.replace(/\/+$/, '');
}

function generateState(): string {
  return crypto.randomBytes(32).toString('hex');
}

function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString('base64url');
}

function generateCodeChallenge(verifier: string): string {
  return crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64url');
}

export async function GET(req: NextRequest) {
  const requestId = crypto.randomUUID().substring(0, 8);
  console.log(`[GOOGLE_AUTH][${requestId}] START - Initiating Google OAuth Flow...`);
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const appUrl = getAppUrl(req);

    if (!clientId) {
      console.error(`[GOOGLE_AUTH][${requestId}] FAILURE - Missing GOOGLE_CLIENT_ID environment variable.`);
      return NextResponse.redirect(new URL('/login?error=config_missing', appUrl));
    }

    const redirectUri = `${appUrl}/api/auth/google/callback`;

    console.log(`[GOOGLE_AUTH][${requestId}] CONFIG - Environment Context:`, {
      hasClientId: !!clientId,
      appUrl,
      redirectUri,
      nodeEnv: process.env.NODE_ENV,
    });

    // Generate secure state and PKCE verifier
    const state = generateState();
    const verifier = generateCodeVerifier();
    const challenge = generateCodeChallenge(verifier);

    // Build Google OAuth 2.0 URL
    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleAuthUrl.searchParams.set('client_id', clientId);
    googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
    googleAuthUrl.searchParams.set('response_type', 'code');
    googleAuthUrl.searchParams.set('scope', 'openid email profile');
    googleAuthUrl.searchParams.set('state', state);
    googleAuthUrl.searchParams.set('code_challenge', challenge);
    googleAuthUrl.searchParams.set('code_challenge_method', 'S256');
    googleAuthUrl.searchParams.set('access_type', 'offline');
    googleAuthUrl.searchParams.set('prompt', 'select_account');

    const response = NextResponse.redirect(googleAuthUrl.toString());

    // Security: Save state and PKCE verifier in secure, httpOnly cookies
    const isProd = process.env.NODE_ENV === 'production';

    response.cookies.set('google-oauth-state', state, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60, // 15 minutes
    });

    response.cookies.set('google-oauth-verifier', verifier, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60, // 15 minutes
    });

    console.log(`[GOOGLE_AUTH][${requestId}] SUCCESS - Cookies set, redirecting user to Google Login Page.`);
    return response;
  } catch (error) {
    console.error(`[GOOGLE_AUTH] FAILURE - Error during authorization initiation:`, error);
    const appUrl = getAppUrl(req);
    return NextResponse.redirect(new URL('/login?error=server_error', appUrl));
  }
}
