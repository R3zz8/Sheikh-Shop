// src/lib/cache/adapter.ts

// TODO: This is a simple in-memory LRU cache. For a production environment
// with multiple server instances, this will lead to inconsistent caching.
// A distributed cache like Redis or Memcached would be a better solution
// if consistency is critical. This implementation is sufficient for a single-node
// setup or for development purposes.

interface CacheEntry {
  value: string;
  expiry: number | null;
  createdAt: number;
}

class InMemoryLRUCache {
  private maxSize: number;
  private cache: Map<string, CacheEntry>;

  constructor(maxSize: number = 500) {
    this.maxSize = maxSize;
    this.cache = new Map<string, CacheEntry>();
  }

  get(key: string): string | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    // Check for expiry
    if (entry.expiry && Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    // Refresh entry for LRU
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.value;
  }

  set(key: string, value: string, opts?: { ex?: number }): void {
    if (this.cache.size >= this.maxSize) {
      // Evict the least recently used item
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    const expiry = opts?.ex ? Date.now() + opts.ex * 1000 : null;
    const entry: CacheEntry = {
      value,
      expiry,
      createdAt: Date.now(),
    };

    this.cache.set(key, entry);
  }

  del(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

// Singleton instance
const cacheClient = new InMemoryLRUCache();

export function getCacheClient() {
  return cacheClient;
}
