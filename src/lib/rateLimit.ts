// src/lib/rateLimit.ts
import { getRedis } from '@/lib/redis';

type RateLimitState = { count: number; resetAt: number };
type RateLimitResult = { allowed: true } | { allowed: false; retryAfter: number };

// This rate limiter now uses the central resilient cache adapter (distributed Redis/InMemory).
export async function rateLimit(key: string, max: number, windowSec: number): Promise<RateLimitResult> {
  const cache = getRedis(); // This now returns our resilient cache client adapter
  const nowSec = Math.floor(Date.now() / 1000);
  const windowKey = `ratelimit:${key}`;

  const raw = await cache.get(windowKey);
  let state: RateLimitState | null = null;
  if (raw) {
    try {
      state = JSON.parse(raw) as RateLimitState;
    } catch {
      state = null;
    }
  }

  if (!state || nowSec >= state.resetAt) {
    // Start new window
    const newState: RateLimitState = { count: 1, resetAt: nowSec + windowSec };
    await cache.set(windowKey, JSON.stringify(newState), { ex: windowSec });
    return { allowed: true };
  }

  // Within window
  if (state.count >= max) {
    const retryAfter = Math.max(0, state.resetAt - nowSec);
    return { allowed: false, retryAfter };
  }

  const updated: RateLimitState = { count: state.count + 1, resetAt: state.resetAt };
  // Keep same expiry; approximate with remaining seconds
  const ttl = Math.max(1, state.resetAt - nowSec);
  await cache.set(windowKey, JSON.stringify(updated), { ex: ttl });
  return { allowed: true };
}
