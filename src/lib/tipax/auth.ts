/**
 * Tipax Server-Only Authentication Module
 * Serves as access token manager with caching, single-flight concurrency mutex, automatic refresh, and safe retry logic.
 */

import type { TipaxAuthToken, TipaxTokenResponse } from './types';

const TIPAX_BASE_URL = process.env.TIPAX_BASE_URL || 'https://omapi.tipax.ir';

// In-memory token cache
let cachedToken: TipaxAuthToken | null = null;

// Single-flight promise mutex to prevent concurrent token fetch stampedes
let pendingTokenPromise: Promise<TipaxAuthToken | null> | null = null;

/**
 * Retrieves valid authentication credentials from server environment variables
 */
export function getTipaxCredentials() {
  return {
    username: process.env.TIPAX_USERNAME || '',
    password: process.env.TIPAX_PASSWORD || '',
    apiKey: process.env.TIPAX_API_KEY || '',
    baseUrl: process.env.TIPAX_BASE_URL || TIPAX_BASE_URL,
  };
}

/**
 * Internal single execution token fetch
 */
async function executeTokenFetch(): Promise<TipaxAuthToken | null> {
  const { username, password, apiKey, baseUrl } = getTipaxCredentials();

  if (!username || !password) {
    return null;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (apiKey) {
      headers['X-API-KEY'] = apiKey;
      headers['ApiKey'] = apiKey;
    }

    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/OM/v3/Account/token`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        username,
        password,
        userName: username,
      }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (!response.ok) {
      console.warn(`[Tipax Auth] Token fetch failed with HTTP ${response.status}`);
      return null;
    }

    const data: TipaxTokenResponse = await response.json();
    const tokenStr =
      data.accessToken ||
      data.token ||
      data.data?.accessToken;

    const refreshTokenStr =
      data.refreshToken ||
      data.data?.refreshToken;

    if (!tokenStr) {
      console.warn('[Tipax Auth] Token string missing in response payload');
      return null;
    }

    // Default 55 minutes expiration (3300 seconds) if not provided
    const expiresInSec = data.expiresIn || data.data?.expiresIn || 3300;
    const expiresAt = Date.now() + expiresInSec * 1000 - 60000; // 1 min safety margin

    cachedToken = {
      accessToken: tokenStr,
      refreshToken: refreshTokenStr,
      expiresAt,
    };

    return cachedToken;
  } catch (error: any) {
    console.error('[Tipax Auth Error]', error?.message || error);
    return null;
  }
}

/**
 * Requests a new access token from Tipax API (`POST /api/OM/v3/Account/token`).
 * Uses single-flight promise mutex to handle concurrent token requests safely.
 */
export async function fetchTipaxToken(): Promise<TipaxAuthToken | null> {
  if (pendingTokenPromise) {
    return pendingTokenPromise;
  }

  pendingTokenPromise = executeTokenFetch().finally(() => {
    pendingTokenPromise = null;
  });

  return pendingTokenPromise;
}

/**
 * Attempts to refresh an existing access token (`POST /api/OM/v3/Account/RefreshToken`)
 */
export async function refreshTipaxToken(refreshToken: string): Promise<TipaxAuthToken | null> {
  const { apiKey, baseUrl } = getTipaxCredentials();

  if (!refreshToken) {
    return fetchTipaxToken();
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (apiKey) {
      headers['X-API-KEY'] = apiKey;
      headers['ApiKey'] = apiKey;
    }

    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/OM/v3/Account/RefreshToken`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ refreshToken }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (!response.ok) {
      // Fallback to fresh token request if refresh fails
      return fetchTipaxToken();
    }

    const data: TipaxTokenResponse = await response.json();
    const tokenStr = data.accessToken || data.token || data.data?.accessToken;
    const newRefreshToken = data.refreshToken || data.data?.refreshToken || refreshToken;

    if (!tokenStr) {
      return fetchTipaxToken();
    }

    const expiresInSec = data.expiresIn || data.data?.expiresIn || 3300;
    const expiresAt = Date.now() + expiresInSec * 1000 - 60000;

    cachedToken = {
      accessToken: tokenStr,
      refreshToken: newRefreshToken,
      expiresAt,
    };

    return cachedToken;
  } catch (error: any) {
    console.warn('[Tipax Token Refresh Failed, falling back to full login]', error?.message || error);
    return fetchTipaxToken();
  }
}

/**
 * Retrieves valid cached Tipax access token or obtains a fresh one automatically.
 */
export async function getValidTipaxToken(forceRefresh = false): Promise<string | null> {
  if (!forceRefresh && cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.accessToken;
  }

  if (cachedToken?.refreshToken && forceRefresh) {
    const refreshed = await refreshTipaxToken(cachedToken.refreshToken);
    if (refreshed) {
      return refreshed.accessToken;
    }
  }

  const fresh = await fetchTipaxToken();
  return fresh ? fresh.accessToken : null;
}

/**
 * Clears current in-memory token cache (useful for testing or resetting auth)
 */
export function clearTipaxTokenCache() {
  cachedToken = null;
  pendingTokenPromise = null;
}
