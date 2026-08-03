// src/lib/cache/adapter.ts

import { Redis } from '@upstash/redis';

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

  async get(key: string): Promise<string | null> {
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

  async set(key: string, value: string, opts?: { ex?: number }): Promise<void> {
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

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }
}

class ResilientCacheAdapter {
  private upstashClient: Redis | null = null;
  private inMemoryFallback: InMemoryLRUCache;
  private useUpstash: boolean = false;

  constructor() {
    this.inMemoryFallback = new InMemoryLRUCache();

    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (url && token) {
      try {
        this.upstashClient = new Redis({
          url,
          token,
        });
        this.useUpstash = true;
        console.log('🚀 Distributed Upstash Redis Cache initialized successfully.');
      } catch (error) {
        console.error('❌ Failed to initialize Upstash Redis. Falling back to InMemoryLRUCache:', error);
        this.useUpstash = false;
      }
    } else {
      console.log('ℹ️ Upstash Redis credentials not found. Utilizing InMemoryLRUCache fallback.');
    }
  }

  async get(key: string): Promise<string | null> {
    if (this.useUpstash && this.upstashClient) {
      try {
        return await this.upstashClient.get(key);
      } catch (error) {
        console.error(`⚠️ Redis GET error for key "${key}". Falling back to memory:`, error);
        return await this.inMemoryFallback.get(key);
      }
    }
    return await this.inMemoryFallback.get(key);
  }

  async set(key: string, value: string, opts?: { ex?: number }): Promise<void> {
    if (this.useUpstash && this.upstashClient) {
      try {
        if (opts?.ex) {
          await this.upstashClient.set(key, value, { ex: opts.ex });
        } else {
          await this.upstashClient.set(key, value);
        }
        return;
      } catch (error) {
        console.error(`⚠️ Redis SET error for key "${key}". Falling back to memory:`, error);
        await this.inMemoryFallback.set(key, value, opts);
        return;
      }
    }
    await this.inMemoryFallback.set(key, value, opts);
  }

  async del(key: string): Promise<void> {
    if (this.useUpstash && this.upstashClient) {
      try {
        await this.upstashClient.del(key);
        return;
      } catch (error) {
        console.error(`⚠️ Redis DEL error for key "${key}". Falling back to memory:`, error);
        await this.inMemoryFallback.del(key);
        return;
      }
    }
    await this.inMemoryFallback.del(key);
  }

  async clear(): Promise<void> {
    if (this.useUpstash && this.upstashClient) {
      try {
        // Warning: flushdb clears the entire database. For Upstash, it's safe if it's a dedicated db.
        await this.upstashClient.flushdb();
        return;
      } catch (error) {
        console.error('⚠️ Redis FLUSHDB error. Falling back to memory:', error);
        await this.inMemoryFallback.clear();
        return;
      }
    }
    await this.inMemoryFallback.clear();
  }
}

// Singleton instance
const cacheClient = new ResilientCacheAdapter();

export function getCacheClient() {
  return cacheClient;
}
