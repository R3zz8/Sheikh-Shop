import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

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
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error('[GOOGLE_AUTH] Missing GOOGLE_CLIENT_ID environment variable.');
      return NextResponse.json(
        { success: false, message: 'تنظیمات گوگل آیدی در سرور انجام نشده است.' },
        { status: 500 }
      );
    }

    // Determine absolute application URL
    const host = req.headers.get('host') || 'localhost:3000';
    const proto = req.headers.get('x-forwarded-proto') || 'http';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${proto}://${host}`;
    const redirectUri = `${appUrl}/api/auth/google/callback`;

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
    googleAuthUrl.searchParams.set('prompt', 'consent');

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

    return response;
  } catch (error) {
    console.error('[GOOGLE_AUTH_INIT_ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'خطای سیستمی در فرآیند ورود با گوگل.' },
      { status: 500 }
    );
  }
}
