// src/lib/redis.ts
// This file is being repurposed to use the resilient cache adapter (distributed Redis/InMemory).
// The filename is kept to minimize changes in other files.

import { getCacheClient } from './cache/adapter';

const cache = getCacheClient();

// Helpers for session caching
export type CachedUser = { id: string; email: string; role: string; sessionId: string };
const SESSION_PREFIX = 'session:';

export async function cacheSession(user: CachedUser, ttlSeconds: number): Promise<void> {
  await cache.set(SESSION_PREFIX + user.sessionId, JSON.stringify(user), { ex: ttlSeconds });
}

export async function getCachedSession(sessionId: string): Promise<CachedUser | null> {
  const raw = await cache.get(SESSION_PREFIX + sessionId);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CachedUser;
  } catch {
    return null;
  }
}

export async function deleteCachedSession(sessionId: string): Promise<void> {
  await cache.del(SESSION_PREFIX + sessionId);
}

// Re-exporting the raw cache client for other potential uses, like rate limiting.
// This preserves the `getRedis` naming to avoid extensive refactoring.
export function getRedis() {
  return cache;
}
