import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateSecurePassword } from '@/lib/auth/password';
import { createSession } from '@/lib/actions/auth/session';
import { logAudit, logFailedAttempt } from '@/lib/actions/auth/audit';

export async function GET(req: NextRequest) {
  console.log('[GOOGLE_CALLBACK] START - Processing callback request...');
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const errorParam = searchParams.get('error');

    // Get absolute redirect page url
    const host = req.headers.get('host') || 'localhost:3000';
    const proto = req.headers.get('x-forwarded-proto') || 'http';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${proto}://${host}`;

    console.log('[GOOGLE_CALLBACK] PARAMS - Query string values parsed:', {
      hasCode: !!code,
      hasState: !!state,
      stateLength: state?.length || 0,
      errorParam,
      appUrl,
    });

    // Gracefully handle cancellation or errors from Google
    if (errorParam) {
      console.warn('[GOOGLE_CALLBACK] CANCELLED - Error received from Google:', errorParam);
      return NextResponse.redirect(new URL(`/login?error=cancelled`, appUrl));
    }

    if (!code || !state) {
      console.warn('[GOOGLE_CALLBACK] FAILURE - Code or State missing in callback parameters.');
      return NextResponse.redirect(new URL(`/login?error=invalid_callback`, appUrl));
    }

    // Retrieve state and PKCE verifier from cookies
    const storedState = req.cookies.get('google-oauth-state')?.value;
    const storedVerifier = req.cookies.get('google-oauth-verifier')?.value;

    console.log('[GOOGLE_CALLBACK] COOKIES - Stored verification cookies found:', {
      hasStoredState: !!storedState,
      hasStoredVerifier: !!storedVerifier,
      stateMatches: state === storedState,
    });

    if (!storedState || !storedVerifier || state !== storedState) {
      console.warn('[GOOGLE_CALLBACK] FAILURE - CSRF State mismatch or session expired.', {
        state,
        storedState,
        hasStoredVerifier: !!storedVerifier,
      });
      return NextResponse.redirect(new URL(`/login?error=invalid_state`, appUrl));
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error('[GOOGLE_CALLBACK] FAILURE - Missing Google OAuth client configuration variables.');
      return NextResponse.redirect(new URL(`/login?error=config_missing`, appUrl));
    }

    // Exchange authorization code and PKCE verifier for Google tokens
    const tokenRedirectUri = `${appUrl}/api/auth/google/callback`;
    console.log('[GOOGLE_CALLBACK] EXCHANGE - Exchanging code for token with Redirect URI:', tokenRedirectUri);

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
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

    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.text();
      console.error('[GOOGLE_CALLBACK] FAILURE - Token exchange failed with status:', tokenResponse.status, 'Error:', tokenError);
      return NextResponse.redirect(new URL(`/login?error=failed_exchange`, appUrl));
    }

    const tokenData = await tokenResponse.json();
    const accessTokenGoogle = tokenData.access_token;

    if (!accessTokenGoogle) {
      console.error('[GOOGLE_CALLBACK] FAILURE - Access token missing from Google token response.');
      return NextResponse.redirect(new URL(`/login?error=failed_exchange`, appUrl));
    }

    console.log('[GOOGLE_CALLBACK] EXCHANGE - Token exchange successful!');

    // Fetch User Profile from Google using backchannel API over HTTPS
    console.log('[GOOGLE_CALLBACK] PROFILE - Querying Google userinfo endpoint...');
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessTokenGoogle}` },
    });

    if (!profileResponse.ok) {
      console.error('[GOOGLE_CALLBACK] FAILURE - Failed to fetch Google user profile. Status:', profileResponse.status);
      return NextResponse.redirect(new URL(`/login?error=failed_profile`, appUrl));
    }

    const googleProfile = await profileResponse.json();
    const email = googleProfile.email?.toLowerCase();

    if (!email) {
      console.error('[GOOGLE_CALLBACK] FAILURE - Google profile did not include an email address.');
      return NextResponse.redirect(new URL(`/login?error=no_email`, appUrl));
    }

    const fullName = googleProfile.name || 'کاربر گوگل';
    const profilePicture = googleProfile.picture || null;
    const emailVerified = googleProfile.email_verified === true;

    console.log('[GOOGLE_CALLBACK] PROFILE - Google Profile retrieved successfully:', {
      email,
      fullName,
      emailVerified,
      hasPicture: !!profilePicture,
    });

    // Get client tracking information for audit logs and sessions
    const userAgent = req.headers.get('user-agent') || 'Unknown';
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'Unknown';

    // Locate or create user in our single-source-of-truth database pipeline
    console.log('[GOOGLE_CALLBACK] DB - Checking user existence in database for:', email);
    let user = await prisma.user.findUnique({
      where: { email },
    });

    let isNewUserCreated = false;

    if (user) {
      console.log('[GOOGLE_CALLBACK] DB - Existing user account found with ID:', user.id);
      // If user exists, verify they can login
      if (!user.canLogin || user.disabled) {
        console.warn('[GOOGLE_CALLBACK] BLOCKED - User login disabled or locked out for ID:', user.id);
        await logFailedAttempt(user.id, 'google_login_blocked', ip, userAgent);
        return NextResponse.redirect(new URL(`/login?error=disabled`, appUrl));
      }

      // Update provider to GOOGLE if they are email but verified via Google (or preserve custom flow)
      // and ensure email is verified since Google says so
      const updatedData: any = {
        emailVerified: true,
      };

      if (!user.profilePicture && profilePicture) {
        updatedData.profilePicture = profilePicture;
      }

      console.log('[GOOGLE_CALLBACK] DB - Updating existing user metadata fields...');
      user = await prisma.user.update({
        where: { id: user.id },
        data: updatedData,
      });
      console.log('[GOOGLE_CALLBACK] DB - User metadata updated successfully.');
    } else {
      // Create user account safely if not exists
      console.log('[GOOGLE_CALLBACK] DB - User does not exist. Creating new federated account...');
      isNewUserCreated = true;

      // Extract firstName & lastName from name safely
      const nameParts = fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || 'کاربر';
      const lastName = nameParts.slice(1).join(' ') || 'گوگل';

      // Generate a timing-attack-resistant, high-entropy password
      const tempPass = generateSecurePassword();
      const hashedPassword = await hashPassword(tempPass);

      // Generate a unique beautiful username
      const randomSuffix = Math.random().toString(36).substring(2, 7);
      const username = `google_${firstName.toLowerCase()}_${randomSuffix}`.replace(/[^a-zA-Z0-9_]/g, '');

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

      console.log('[GOOGLE_CALLBACK] DB - New Google user registered successfully with ID:', user.id);
    }

    // Issue Session, custom JWT, and Refresh Tokens
    console.log('[GOOGLE_CALLBACK] SESSION - Creating secure user session for User ID:', user.id);
    const { session, accessToken, refreshToken } = await createSession(
      user.id,
      userAgent,
      ip
    );
    console.log('[GOOGLE_CALLBACK] SESSION - Session created successfully. ID:', session.id);

    // Log successful audit trail
    await logAudit(
      user.id,
      isNewUserCreated ? 'registration_success' : 'login_success',
      {
        sessionId: session.id,
        userAgent,
        ip,
        provider: 'GOOGLE',
      }
    );

    // Build redirect with successful authentication state identical to Email/Password
    const response = NextResponse.redirect(new URL('/?login_success=true', appUrl));

    // Clear temporary OAuth cookies
    response.cookies.delete('google-oauth-state');
    response.cookies.delete('google-oauth-verifier');

    // Set short-lived secure access-token cookie
    const isProd = process.env.NODE_ENV === 'production';

    response.cookies.set('access-token', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      path: '/',
      maxAge: 15 * 60, // 15 minutes
    });

    // Set long-lived secure refresh-token cookie
    response.cookies.set('refresh-token', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    console.log('[GOOGLE_CALLBACK] SUCCESS - Authentication completed. Cookies set, redirecting to app home page.');
    return response;
  } catch (error) {
    console.error('[GOOGLE_CALLBACK] FAILURE - Critical exception occurred inside Google callback pipeline:', error);
    const host = req.headers.get('host') || 'localhost:3000';
    const proto = req.headers.get('x-forwarded-proto') || 'http';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${proto}://${host}`;
    return NextResponse.redirect(new URL(`/login?error=server_error`, appUrl));
  }
}
