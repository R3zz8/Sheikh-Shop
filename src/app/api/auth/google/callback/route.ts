import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateSecurePassword } from '@/lib/auth/password';
import { createSession } from '@/lib/actions/auth/session';
import { logAudit, logFailedAttempt } from '@/lib/actions/auth/audit';
import { getAppUrl } from '../route';

const FETCH_TIMEOUT_MS = 12000; // 12 seconds timeout for Google API calls

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = FETCH_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(id);
  }
}

export async function GET(req: NextRequest) {
  const requestId = crypto.randomUUID().substring(0, 8);
  const appUrl = getAppUrl(req);
  console.log(`[GOOGLE_CALLBACK][${requestId}] START - Processing callback request...`);

  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const errorParam = searchParams.get('error');

    console.log(`[GOOGLE_CALLBACK][${requestId}] PARAMS - Query string values parsed:`, {
      hasCode: !!code,
      hasState: !!state,
      stateLength: state?.length || 0,
      errorParam,
      appUrl,
    });

    // Gracefully handle cancellation or errors from Google
    if (errorParam) {
      console.warn(`[GOOGLE_CALLBACK][${requestId}] CANCELLED - Error received from Google:`, errorParam);
      return NextResponse.redirect(new URL('/login?error=oauth_rejected', appUrl));
    }

    if (!code || !state) {
      console.warn(`[GOOGLE_CALLBACK][${requestId}] FAILURE - Code or State missing in callback parameters.`);
      return NextResponse.redirect(new URL('/login?error=invalid_callback', appUrl));
    }

    // Retrieve state and PKCE verifier from cookies
    const storedState = req.cookies.get('google-oauth-state')?.value;
    const storedVerifier = req.cookies.get('google-oauth-verifier')?.value;

    console.log(`[GOOGLE_CALLBACK][${requestId}] COOKIES - Stored verification cookies found:`, {
      hasStoredState: !!storedState,
      hasStoredVerifier: !!storedVerifier,
      stateMatches: state === storedState,
    });

    if (!storedState || !storedVerifier || state !== storedState) {
      console.warn(`[GOOGLE_CALLBACK][${requestId}] FAILURE - CSRF State mismatch or session expired.`);
      return NextResponse.redirect(new URL('/login?error=invalid_state', appUrl));
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error(`[GOOGLE_CALLBACK][${requestId}] FAILURE - Missing Google OAuth client configuration variables.`);
      return NextResponse.redirect(new URL('/login?error=config_missing', appUrl));
    }

    // Exchange authorization code and PKCE verifier for Google tokens
    const tokenRedirectUri = `${appUrl}/api/auth/google/callback`;
    console.log(`[GOOGLE_CALLBACK][${requestId}] EXCHANGE - Exchanging code for token with Redirect URI:`, tokenRedirectUri);

    let tokenResponse: Response;
    try {
      tokenResponse = await fetchWithTimeout('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          code_verifier: storedVerifier,
          grant_type: 'authorization_code',
          redirect_uri: tokenRedirectUri,
        }),
      });
    } catch (tokenFetchError: any) {
      console.error(`[GOOGLE_CALLBACK][${requestId}] FAILURE - Timeout/Network error exchanging token with Google:`, tokenFetchError);
      const errType = tokenFetchError.name === 'AbortError' ? 'timeout' : 'network_error';
      return NextResponse.redirect(new URL(`/login?error=${errType}`, appUrl));
    }

    if (!tokenResponse.ok) {
      const tokenErrorText = await tokenResponse.text();
      console.error(`[GOOGLE_CALLBACK][${requestId}] FAILURE - Token exchange failed with status:`, tokenResponse.status, 'Error:', tokenErrorText);
      return NextResponse.redirect(new URL('/login?error=failed_exchange', appUrl));
    }

    const tokenData = await tokenResponse.json();
    const accessTokenGoogle = tokenData.access_token;

    if (!accessTokenGoogle) {
      console.error(`[GOOGLE_CALLBACK][${requestId}] FAILURE - Access token missing from Google token response.`);
      return NextResponse.redirect(new URL('/login?error=failed_exchange', appUrl));
    }

    console.log(`[GOOGLE_CALLBACK][${requestId}] EXCHANGE - Token exchange successful!`);

    // Fetch User Profile from Google using backchannel API over HTTPS
    console.log(`[GOOGLE_CALLBACK][${requestId}] PROFILE - Querying Google userinfo endpoint...`);
    let profileResponse: Response;
    try {
      profileResponse = await fetchWithTimeout('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessTokenGoogle}` },
      });
    } catch (profileFetchError: any) {
      console.error(`[GOOGLE_CALLBACK][${requestId}] FAILURE - Timeout/Network error fetching profile from Google:`, profileFetchError);
      const errType = profileFetchError.name === 'AbortError' ? 'timeout' : 'network_error';
      return NextResponse.redirect(new URL(`/login?error=${errType}`, appUrl));
    }

    if (!profileResponse.ok) {
      console.error(`[GOOGLE_CALLBACK][${requestId}] FAILURE - Failed to fetch Google user profile. Status:`, profileResponse.status);
      return NextResponse.redirect(new URL('/login?error=failed_profile', appUrl));
    }

    const googleProfile = await profileResponse.json();
    const email = googleProfile.email?.toLowerCase();

    if (!email) {
      console.error(`[GOOGLE_CALLBACK][${requestId}] FAILURE - Google profile did not include an email address.`);
      return NextResponse.redirect(new URL('/login?error=no_email', appUrl));
    }

    const fullName = googleProfile.name || 'کاربر گوگل';
    const profilePicture = googleProfile.picture || null;

    console.log(`[GOOGLE_CALLBACK][${requestId}] PROFILE - Google Profile retrieved successfully:`, {
      email,
      fullName,
      hasPicture: !!profilePicture,
    });

    // Get client tracking information for audit logs and sessions
    const userAgent = req.headers.get('user-agent') || 'Unknown';
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'Unknown';

    // Locate or create user in database safely
    console.log(`[GOOGLE_CALLBACK][${requestId}] DB - Checking user existence in database for:`, email);
    let user = null;
    let isNewUserCreated = false;

    try {
      user = await prisma.user.findUnique({
        where: { email },
      });

      if (user) {
        console.log(`[GOOGLE_CALLBACK][${requestId}] DB - Existing user account found with ID:`, user.id);
        if (!user.canLogin || user.disabled) {
          console.warn(`[GOOGLE_CALLBACK][${requestId}] BLOCKED - User login disabled or locked out for ID:`, user.id);
          await logFailedAttempt(user.id, 'google_login_blocked', ip, userAgent).catch(() => {});
          return NextResponse.redirect(new URL('/login?error=disabled', appUrl));
        }

        const updatedData: Record<string, any> = { emailVerified: true };
        if (!user.profilePicture && profilePicture) {
          updatedData.profilePicture = profilePicture;
        }

        user = await prisma.user.update({
          where: { id: user.id },
          data: updatedData,
        });
      } else {
        console.log(`[GOOGLE_CALLBACK][${requestId}] DB - User does not exist. Registering new account...`);
        isNewUserCreated = true;

        const nameParts = fullName.trim().split(/\s+/);
        const firstName = nameParts[0] || 'کاربر';
        const lastName = nameParts.slice(1).join(' ') || 'گوگل';

        const tempPass = generateSecurePassword();
        const hashedPassword = await hashPassword(tempPass);

        const emailPrefix = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') || 'user';
        const randomSuffix = crypto.randomBytes(3).toString('hex');
        const username = `google_${emailPrefix}_${randomSuffix}`;

        try {
          user = await prisma.user.create({
            data: {
              email,
              password: hashedPassword,
              firstName,
              lastName,
              username,
              profilePicture,
              role: 'USER',
              emailVerified: true,
              provider: 'GOOGLE',
              canLogin: true,
              disabled: false,
              loginAttempts: 0,
            },
          });
        } catch (createError: any) {
          // Handle concurrent creation race condition safely (Prisma P2002)
          if (createError.code === 'P2002') {
            console.warn(`[GOOGLE_CALLBACK][${requestId}] DB - Race condition detected on user creation. Refetching...`);
            user = await prisma.user.findUnique({ where: { email } });
            if (!user) throw createError;
          } else {
            throw createError;
          }
        }
      }
    } catch (dbError: any) {
      console.error(`[GOOGLE_CALLBACK][${requestId}] FAILURE - Database operation error:`, dbError);
      return NextResponse.redirect(new URL('/login?error=db_error', appUrl));
    }

    if (!user) {
      console.error(`[GOOGLE_CALLBACK][${requestId}] FAILURE - User record unresolved.`);
      return NextResponse.redirect(new URL('/login?error=db_error', appUrl));
    }

    // Issue Session, custom JWT, and Refresh Tokens
    console.log(`[GOOGLE_CALLBACK][${requestId}] SESSION - Creating secure session for User ID:`, user.id);
    let sessionData;
    try {
      sessionData = await createSession(user.id, userAgent, ip);
    } catch (sessionError: any) {
      console.error(`[GOOGLE_CALLBACK][${requestId}] FAILURE - Session creation failed:`, sessionError);
      return NextResponse.redirect(new URL('/login?error=db_error', appUrl));
    }

    const { session, accessToken, refreshToken } = sessionData;

    // Audit log (fire and forget to prevent blocking authentication on audit failure)
    logAudit(user.id, isNewUserCreated ? 'registration_success' : 'login_success', {
      sessionId: session.id,
      userAgent,
      ip,
      provider: 'GOOGLE',
    }).catch((err) => console.error(`[GOOGLE_CALLBACK][${requestId}] Audit log error:`, err));

    // Build redirect with successful authentication state
    const response = NextResponse.redirect(new URL('/?login_success=true', appUrl));

    // Clear temporary OAuth cookies
    response.cookies.delete('google-oauth-state');
    response.cookies.delete('google-oauth-verifier');

    // Set secure access and refresh cookies
    const isProd = process.env.NODE_ENV === 'production';

    response.cookies.set('access-token', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      path: '/',
      maxAge: 15 * 60, // 15 minutes
    });

    response.cookies.set('refresh-token', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    console.log(`[GOOGLE_CALLBACK][${requestId}] SUCCESS - Authentication completed cleanly.`);
    return response;
  } catch (error: any) {
    console.error(`[GOOGLE_CALLBACK][${requestId}] FAILURE - Critical exception in Google callback:`, error);
    return NextResponse.redirect(new URL('/login?error=server_error', appUrl));
  }
}
