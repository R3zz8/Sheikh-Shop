// src/lib/rateLimiter.ts
// REFACTORED: This file now uses the central resilient cache adapter for state,
// removing the need for a local store object and the problematic setInterval.

import { NextRequest, NextResponse } from 'next/server';
import { getCacheClient } from '@/lib/cache/adapter';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: NextRequest) => string;
}

interface RateLimitState {
  count: number;
  resetTime: number;
}

const cache = getCacheClient();

export function createRateLimiter(config: RateLimitConfig) {
  return async (req: NextRequest): Promise<NextResponse | null> => {
    const key = config.keyGenerator ? config.keyGenerator(req) : getDefaultKey(req);
    const now = Date.now();

    const rawState = await cache.get(key);
    let state: RateLimitState | null = rawState ? JSON.parse(rawState) : null;

    if (!state || state.resetTime < now) {
      state = {
        count: 1,
        resetTime: now + config.windowMs,
      };
    } else {
      state.count++;
    }

    const ttlSeconds = Math.ceil((state.resetTime - now) / 1000);
    if (ttlSeconds > 0) {
      await cache.set(key, JSON.stringify(state), { ex: ttlSeconds });
    }

    if (state.count > config.maxRequests) {
      const retryAfter = Math.ceil((state.resetTime - now) / 1000);

      const headers = {
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Limit': config.maxRequests.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': state.resetTime.toString(),
      };

      return new NextResponse(
        JSON.stringify({
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
        }),
        { status: 429, headers }
      );
    }

    return null;
  };
}

function getDefaultKey(req: NextRequest): string {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  return `rate_limit:${ip}`;
}

export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
  keyGenerator: (req) => `auth:${getDefaultKey(req)}`,
});

export const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 100,
});

export const cartRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 20,
  keyGenerator: (req) => `cart:${getDefaultKey(req)}`,
});

export const analyticsRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 200,
  keyGenerator: (req) => `analytics:${getDefaultKey(req)}`,
});

export function withRateLimit<T extends any[]>(
  rateLimiter: (req: NextRequest) => Promise<NextResponse | null>
) {
  return (
    handler: (req: NextRequest, ...args: T) => Promise<NextResponse>
  ) => {
    return async (req: NextRequest, ...args: T): Promise<NextResponse> => {
      const rateLimitResponse = await rateLimiter(req);
      
      if (rateLimitResponse) {
        return rateLimitResponse;
      }

      // HACK: The withRole wrapper passes the user object as a second argument.
      // We need to ensure it's passed through correctly.
      // A better solution would be to unify middleware handling.
      return handler(req, ...args);
    };
  };
}
