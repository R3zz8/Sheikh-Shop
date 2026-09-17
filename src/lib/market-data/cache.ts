import type { NormalizedQuote } from './types';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cacheStore = new Map<string, CacheEntry<any>>();

export const DEFAULT_CACHE_TTL_MS = 60 * 1000; // 60 seconds stale boundary

export function getCachedData<T>(key: string, ttlMs: number = DEFAULT_CACHE_TTL_MS): { data: T | null; isStale: boolean } {
  const entry = cacheStore.get(key);
  if (!entry) {
    return { data: null, isStale: true };
  }

  const age = Date.now() - entry.timestamp;
  const isStale = age > ttlMs;

  return { data: entry.data, isStale };
}

export function setCachedData<T>(key: string, data: T): void {
  cacheStore.set(key, {
    data,
    timestamp: Date.now(),
  });
}

export function clearMarketCache(): void {
  cacheStore.clear();
}
