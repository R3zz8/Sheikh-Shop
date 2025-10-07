import { getRedis } from '@/lib/redis';

type RateLimitState = { count: number; resetAt: number };
type RateLimitResult = { allowed: true } | { allowed: false; retryAfter: number };

// Fixed window limiter using Redis get/set with expiry metadata stored in value
export async function rateLimit(key: string, max: number, windowSec: number): Promise<RateLimitResult> {
  const redis = getRedis();
  const nowSec = Math.floor(Date.now() / 1000);
  const windowKey = `ratelimit:${key}`;

  // Try Redis-backed state
  try {
    const raw = await redis.get(windowKey);
    let state: RateLimitState | null = null;
    if (raw) {
      try { state = JSON.parse(raw) as RateLimitState; } catch { state = null; }
    }

    if (!state || nowSec >= state.resetAt) {
      // Start new window
      const newState: RateLimitState = { count: 1, resetAt: nowSec + windowSec };
      await redis.set(windowKey, JSON.stringify(newState), { ex: windowSec });
      return { allowed: true };
    }

    // Within window
    if (state.count >= max) {
      const retryAfter = Math.max(0, state.resetAt - nowSec);
      return { allowed: false, retryAfter };
    }
    const updated: RateLimitState = { count: state.count + 1, resetAt: state.resetAt };
    // Keep same expiry; approximate with remaining seconds
    await redis.set(windowKey, JSON.stringify(updated), { ex: Math.max(1, state.resetAt - nowSec) });
    return { allowed: true };
  } catch {
    // Fallback to in-memory limiter per process when Redis not configured or errors
    const limiter = memoryLimiter.getLimiter(`${key}:${windowSec}`);
    const allowed = limiter.addAndCheck(max, windowSec * 1000);
    if (!allowed) {
      return { allowed: false, retryAfter: Math.ceil(limiter.msUntilReset() / 1000) };
    }
    return { allowed: true };
  }
}

// Simple in-memory limiter as fallback
class MemoryWindowLimiter {
  private count = 0;
  private resetAt = Date.now();

  addAndCheck(max: number, windowMs: number): boolean {
    const now = Date.now();
    if (now >= this.resetAt + windowMs) {
      this.count = 0;
      this.resetAt = now;
    }
    this.count += 1;
    return this.count <= max;
  }

  msUntilReset(): number {
    const now = Date.now();
    const elapsed = now - this.resetAt;
    return Math.max(0, this.resetAt + 1000 - now + (elapsed > 1000 ? 0 : 0));
  }
}

const memoryLimiter = new (class {
  private map = new Map<string, MemoryWindowLimiter>();
  getLimiter(key: string) {
    let l = this.map.get(key);
    if (!l) {
      l = new MemoryWindowLimiter();
      this.map.set(key, l);
    }
    return l;
  }
})();



