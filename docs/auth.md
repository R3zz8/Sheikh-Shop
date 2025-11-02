# Authentication Flow and JWT Management

This document outlines the authentication system used in the Sheikh Shop e-commerce platform, with a focus on JSON Web Tokens (JWTs), environment configuration, and token lifecycle.

## 1. Overview

The authentication system is built around JWTs, providing a secure and stateless way to manage user sessions. The core logic is implemented in `src/lib/auth/jwt.ts`, which handles token signing, verification, and blacklisting.

## 2. Environment Configuration

Proper environment configuration is **critical** for the authentication system to function correctly. The required variables are defined in `ENV_TEMPLATE.md` and must be present in a `.env.local` file in the project's root directory.

### Required Variables:

-   `JWT_SECRET`: A secure, randomly generated string of **at least 32 characters**. This secret is used to sign and verify all JWTs. If this variable is missing, invalid, or uses a default value, the application will throw an error, and all authenticated requests will fail.
-   `NEXTAUTH_SECRET`: A secure, randomly generated string used by NextAuth for session encryption.
-   `NEXTAUTH_URL`: The canonical URL of the application, required for NextAuth callbacks.

**Example `.env.local`:**

```
JWT_SECRET="a_very_long_and_secure_randomly_generated_string_32_chars"
NEXTAUTH_SECRET="another_very_long_and_secure_randomly_generated_string"
NEXTAUTH_URL="http://localhost:3000"
```

## 3. Token Lifecycle

The application uses a standard token-based authentication flow:

1.  **Login:** When a user successfully logs in, the server generates a `session-token` (a JWT) containing the user's ID, email, and role. This token is then set as an HTTP-only cookie in the user's browser.
2.  **Authenticated Requests:** For any subsequent request to a protected API endpoint (e.g., adding an item to the cart), the browser automatically sends the `session-token` cookie.
3.  **Verification:** The server receives the request, extracts the `session-token`, and uses `verifyJwtToken` to validate it. This function checks:
    -   The token's signature against the `JWT_SECRET`.
    -   The token's expiration date.
    -   If the token has been blacklisted (e.g., after a user logs out).
4.  **Authorization:** If the token is valid, the user is considered authenticated, and the API endpoint proceeds with the requested operation. If the token is invalid, missing, or expired, the API returns a `401 Unauthorized` error.

## 4. Client-Side Handling

The client-side application, particularly the `src/hooks/useCart.tsx` hook, is designed to handle `401 Unauthorized` errors gracefully. If an API request fails with this status code, the following actions are triggered:

-   A toast notification is displayed to the user, informing them that their session has expired.
-   The local user session data is invalidated.
-   The user is automatically redirected to the `/login` page to re-authenticate.

## 5. Security Best Practices

-   **Secure Secrets:** Always use strong, unique, and randomly generated secrets for `JWT_SECRET` and `NEXTAUTH_SECRET`.
-   **Token Blacklisting:** When a user logs out, their `session-token` is added to a blacklist in the database. This prevents the token from being used again, even if it has not yet expired.
-   **Error Handling:** The system is designed to "fail closed," meaning that any error during the token verification process will result in the user being treated as unauthenticated.
