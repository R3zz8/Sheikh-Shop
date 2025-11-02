# Authentication System Documentation

## Overview

The Sheikh Shop application uses a JWT-based authentication system with multiple token types for enhanced security and flexibility. This document describes the authentication flow, token handling, cookie behavior, and session lifecycle.

## Table of Contents

1. [Environment Variables](#environment-variables)
2. [Token Types](#token-types)
3. [Cookie Behavior](#cookie-behavior)
4. [Session Lifecycle](#session-lifecycle)
5. [Authentication Flow](#authentication-flow)
6. [Token Verification](#token-verification)
7. [Error Handling](#error-handling)
8. [Troubleshooting](#troubleshooting)

## Environment Variables

### Required Variables

#### `JWT_SECRET`
- **Type**: String
- **Required**: Yes
- **Minimum Length**: 32 characters
- **Description**: Secret key used for signing and verifying JWT tokens
- **Security**: Must be a cryptographically secure random string
- **Generation**: Use `openssl rand -hex 32` or similar tool
- **Example**: `JWT_SECRET="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6"`

#### Validation Rules
The system validates `JWT_SECRET` with the following checks:
- Must be set (non-empty)
- Must be at least 32 characters long
- Cannot be default values like `dev-secret-key`, `changeme`, or contain `dev-secret`

If validation fails, the application will throw an error on startup or during token operations.

## Token Types

The system supports three token types for backward compatibility and enhanced security:

### 1. Access Token (`access-token`)
- **Lifetime**: 15 minutes
- **Cookie Name**: `access-token`
- **Purpose**: Primary authentication token for API requests
- **Audience**: `sheikh-shop-users`
- **Usage**: Used first in authentication checks

### 2. Refresh Token (`refresh-token`)
- **Lifetime**: 7 days
- **Cookie Name**: `refresh-token`
- **Purpose**: Long-lived token for refreshing access tokens
- **Audience**: `sheikh-shop-refresh`
- **Usage**: Fallback when access token expires or is missing

### 3. Session Token (`session-token`) - Legacy
- **Lifetime**: 7 days
- **Cookie Name**: `session-token`
- **Purpose**: Legacy token for backward compatibility
- **Audience**: `sheikh-shop-users`
- **Usage**: Last fallback for legacy authentication

## Cookie Behavior

### Cookie Configuration

All authentication cookies are configured with the following settings:

```typescript
{
  httpOnly: true,        // Prevents JavaScript access (XSS protection)
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'strict',    // CSRF protection
  path: '/',             // Available site-wide
  maxAge: <token-lifetime> // Token-specific expiration
}
```

### Cookie Persistence

For client-side requests to work correctly, **all fetch calls must include `credentials: 'include'`**:

```typescript
const res = await fetch('/api/cart', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // Required for cookies to be sent
  body: JSON.stringify({ productId, unitId, quantity }),
});
```

### Cookie Priority in API Routes

API routes check tokens in the following order:
1. `access-token` (primary)
2. `refresh-token` (fallback)
3. `session-token` (legacy fallback)

This ensures backward compatibility while supporting the modern token system.

## Session Lifecycle

### Login Flow

1. User submits credentials via `/api/login` or login action
2. System validates credentials and creates a session
3. System generates `access-token` and `refresh-token`
4. Cookies are set with appropriate expiration times
5. User is authenticated and redirected

### Token Refresh Flow

1. Access token expires (after 15 minutes)
2. Client receives 401 Unauthorized response
3. Client can use refresh token to obtain new access token
4. New access token cookie is set
5. Original request is retried

### Logout Flow

1. User initiates logout
2. System blacklists current tokens
3. All session cookies are cleared
4. Session is invalidated in database
5. User is redirected to login page

### Session Cleanup

- **Expired Sessions**: Cleaned up automatically
- **Blacklisted Tokens**: Cleaned up every hour via scheduled task
- **Session Limits**: Maximum 5 active sessions per user (new sessions may invalidate oldest)

## Authentication Flow

### Client-Side (React Hooks)

#### `useUser()` Hook
```typescript
import { useUser } from '@/hooks/useUser';

const { data: user, isLoading } = useUser();
```

- Fetches current user from `/api/user`
- Includes `credentials: 'include'` automatically
- Returns `null` if user is not authenticated (401)
- Automatically retries on errors (except 401)

#### `useCart()` Hook
```typescript
import { useCart } from '@/hooks/useCart';

const { addToCartMutation } = useCart();
```

- All cart operations include `credentials: 'include'`
- Automatically handles 401 errors by:
  - Clearing user state
  - Showing error toast
  - Redirecting to login page

### Server-Side (API Routes)

#### Token Extraction Pattern
```typescript
async function getUserIdFromToken(request: NextRequest): Promise<string | null> {
  // Check access-token first
  const accessToken = request.cookies.get('access-token')?.value;
  if (accessToken) {
    const user = await verifyJwtToken(accessToken);
    if (user?.id) return user.id;
  }
  
  // Fallback to refresh-token
  const refreshToken = request.cookies.get('refresh-token')?.value;
  if (refreshToken) {
    const user = await verifyJwtToken(refreshToken);
    if (user?.id) return user.id;
  }
  
  // Legacy: session-token
  const sessionToken = request.cookies.get('session-token')?.value;
  if (sessionToken) {
    const user = await verifyJwtToken(sessionToken);
    if (user?.id) return user.id;
  }
  
  return null;
}
```

## Token Verification

### Verification Process

1. **Blacklist Check**: Verify token is not blacklisted
2. **Signature Verification**: Verify token signature with `JWT_SECRET`
3. **Expiration Check**: Verify token has not expired
4. **Issuer/Audience Check**: Verify `iss: 'sheikh-shop'` and `aud: 'sheikh-shop-users'`

### Error Types

The system logs specific error types for debugging:

- **TokenExpiredError**: Token has passed its expiration time
- **JsonWebTokenError**: Invalid token format or signature
- **NotBeforeError**: Token is not yet valid
- **Blacklisted**: Token has been revoked/logged out

### Logging

In development mode, verification failures are logged with timestamps:
```
[2024-01-15T10:30:00.000Z] Access token verification failed: Token expired
[2024-01-15T10:30:00.000Z] 401 Unauthorized - No valid token found. Cookies present: { hasSessionToken: false, hasAccessToken: true, hasRefreshToken: true }
```

## Error Handling

### 401 Unauthorized Errors

When a 401 error occurs:

1. **Client-Side**:
   - `useCart` hook detects 401 in mutation errors
   - Reverts any optimistic updates
   - Shows error toast: "Your session has expired. Please log in again."
   - Clears user query cache
   - Redirects to `/login` after 1.5 seconds

2. **Server-Side**:
   - Logs detailed information including:
     - Timestamp
     - Available cookies (presence only, not values)
     - Request path and method
     - IP address and user agent

### Common Issues and Solutions

#### Issue: "JWT_SECRET environment variable is not set"
**Solution**: 
1. Add `JWT_SECRET` to `.env.local`
2. Ensure it's at least 32 characters long
3. Restart the development server

#### Issue: "401 Unauthorized" when adding to cart
**Possible Causes**:
1. Token expired and not refreshed
2. Missing `credentials: 'include'` in fetch calls
3. Cookie not being sent (check browser cookie settings)
4. Token blacklisted (user logged out)

**Solution**:
1. Check browser console for detailed error logs
2. Verify cookies are present in browser DevTools
3. Ensure `credentials: 'include'` is in all fetch calls
4. Try logging out and back in

#### Issue: Token verification fails silently
**Solution**:
1. Check development console for JWT error logs
2. Verify `JWT_SECRET` is correct and matches across instances
3. Check token expiration times
4. Verify token is not blacklisted

## Troubleshooting

### Debug Checklist

1. ✅ `JWT_SECRET` is set and at least 32 characters
2. ✅ Cookies are present in browser DevTools
3. ✅ All fetch calls include `credentials: 'include'`
4. ✅ Token has not expired (check `exp` claim)
5. ✅ Token is not blacklisted (check database)
6. ✅ Server logs show token verification attempts
7. ✅ Network tab shows cookies in request headers

### Manual Token Inspection

You can decode tokens (without verification) for debugging:

```typescript
import { decodeJwtToken } from '@/lib/auth/jwt';

const decoded = decodeJwtToken(token);
console.log('Token payload:', decoded);
console.log('Expires at:', new Date(decoded.exp * 1000));
```

### Token Blacklist Cleanup

Expired blacklisted tokens are automatically cleaned up every hour. You can manually trigger cleanup:

```typescript
import { cleanupExpiredBlacklistedTokens } from '@/lib/auth/jwt';

await cleanupExpiredBlacklistedTokens();
```

## Security Best Practices

1. **Never log token values** - Only log presence/absence
2. **Use HTTPS in production** - Ensures secure cookie transmission
3. **Rotate JWT_SECRET regularly** - Invalidates all existing tokens
4. **Monitor blacklist size** - Large blacklists indicate security issues
5. **Set appropriate token lifetimes** - Balance security and UX
6. **Implement rate limiting** - Prevent brute force attacks
7. **Use sameSite: 'strict'** - CSRF protection
8. **Keep httpOnly: true** - XSS protection

## API Reference

### Authentication Utilities

#### `signJwtToken(payload, expiresIn?)`
Signs a JWT token with the provided payload.

#### `verifyJwtToken(token)`
Verifies a JWT token and returns the payload or `null`.

#### `isTokenBlacklisted(token)`
Checks if a token has been blacklisted.

#### `blacklistToken(token, expiresAt?)`
Adds a token to the blacklist.

#### `cleanupExpiredBlacklistedTokens()`
Removes expired tokens from the blacklist.

### Server Functions

#### `getUserIdFromToken(request)`
Extracts user ID from request cookies (checks all token types).

#### `getCurrentUserId()`
Gets the current user ID from server-side context (uses cookies).

## Migration Notes

### Legacy Session Token Support

The system maintains backward compatibility with `session-token` cookies:
- Legacy tokens are checked as a last resort
- New logins create `access-token` and `refresh-token`
- Both systems work simultaneously during migration

### Upgrading from Legacy

1. Users with `session-token` will continue to work
2. On next login, they receive new token types
3. Legacy tokens are gradually phased out
4. No forced logout required

## Related Documentation

- [System User Guide](./SYSTEM_USER_GUIDE.md)
- [Environment Variables](../ENV_TEMPLATE.md)
- [Security Guide](../SECURITY_GUIDE.md)

