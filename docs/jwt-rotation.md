# JWT Secret Rotation Guide

## 1. Overview

JWT secret rotation is a critical security practice that involves periodically changing the secret key used to sign and verify JSON Web Tokens (JWTs). Regularly rotating secrets limits the damage if a key is compromised, as any stolen keys will have a limited lifespan.

This application supports zero-downtime secret rotation, meaning you can update the JWT secret without invalidating all active user sessions.

## 2. How It Works

The system uses the `JWT_SECRETS` environment variable to manage multiple keys simultaneously.

-   **Format:** The `JWT_SECRETS` variable is a comma-separated list of your secret keys.
-   **Signing New Tokens:** The **first** secret in the list is always used as the **primary key** to sign all new JWTs.
-   **Verifying Existing Tokens:** When a user makes a request, the system will try to verify their JWT against **every secret** in the list. The token is considered valid if it matches any of the keys.

This allows for a seamless transition period. After you introduce a new secret, old tokens signed with the previous secret will continue to work until they expire or are refreshed, while all new tokens will be signed with the new, more secure secret.

## 3. How to Rotate a Secret: Step-by-Step

Follow these steps to rotate your JWT signing secret without logging out all your users.

### Step 1: Generate a New Secret

First, generate a new, cryptographically secure secret key. It must be at least 32 characters long.

You can use `openssl` to generate a strong key:

```bash
openssl rand -hex 32
```

This will output a 64-character hexadecimal string, which is an excellent secret.

### Step 2: Add the New Secret to the Environment

In your environment configuration (e.g., your `.env.local` file or your hosting provider's environment variable settings), prepend the newly generated secret to the `JWT_SECRETS` list.

**Example:**

Let's say your current configuration is:

```
JWT_SECRETS="old_secret_key_123"
```

And your newly generated secret is `new_super_secret_key_456`.

You would update the variable to:

```
JWT_SECRETS="new_super_secret_key_456,old_secret_key_123"
```

**Important:** The new secret must be at the beginning of the list, followed by a comma. Do not delete the old secret yet.

### Step 3: Deploy the Application

Deploy your application with the updated environment variable.

-   All new tokens will now be signed using `new_super_secret_key_456`.
-   Existing tokens signed with `old_secret_key_123` will still be successfully verified.

### Step 4: (Optional) Remove the Old Secret

After a sufficient grace period, you can remove the old secret from the list. The grace period should be long enough for all active user sessions to be refreshed. A safe duration is the lifetime of your refresh token (e.g., 7 days).

**Example:**

After the grace period, you can update your environment variable again:

```
JWT_SECRETS="new_super_secret_key_456"
```

After deploying this final change, any remaining tokens signed with the old key will no longer be valid.

## 4. Security Best Practices

-   **Grace Period:** Always allow a sufficient grace period before decommissioning an old secret. If you remove it too soon, you will force users to log in again.
-   **Backup:** Always back up your environment variables before making changes.
-   **Never Commit Secrets:** Never commit your `.env` files or secrets directly to your version control system (e.g., Git).
-   **Frequency:** Rotate your secrets at a regular interval (e.g., every 90 days) or immediately if you suspect a key has been compromised.
