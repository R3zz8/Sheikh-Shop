// Lightweight Redis helper with graceful fallback (no-op) when Redis is unavailable
// Supports Upstash REST (preferred for middleware/edge) and ioredis URL if provided.

type RedisClient = {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string, opts?: { ex?: number }) => Promise<void>;
  del: (key: string) => Promise<void>;
};

class NoopRedis implements RedisClient {
  async get(): Promise<string | null> { return null; }
  async set(): Promise<void> { /* noop */ }
  async del(): Promise<void> { /* noop */ }
}

class UpstashRedis implements RedisClient {
  private url: string;
  private token: string;
  constructor(url: string, token: string) {
    this.url = url;
    this.token = token;
  }
  private async request<T>(body: any): Promise<T> {
    const res = await fetch(this.url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      // Do not block the event loop
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Upstash error: ${res.status}`);
    return res.json() as Promise<T>;
  }
  async get(key: string): Promise<string | null> {
    try {
      const data = await this.request<{ result: string | null }>({
        // Upstash REST protocol
        // eslint-disable-next-line @typescript-eslint/naming-convention
        pipeline: [['GET', key]],
      });
      return Array.isArray((data as any).result) ? (data as any).result[0] : (data as any).result;
    } catch {
      return null;
    }
  }
  async set(key: string, value: string, opts?: { ex?: number }): Promise<void> {
    try {
      const args: (string | number)[] = ['SET', key, value];
      if (opts?.ex) {
        args.push('EX', opts.ex);
      }
      await this.request({ pipeline: [args] });
    } catch {
      // swallow
    }
  }
  async del(key: string): Promise<void> {
    try {
      await this.request({ pipeline: [['DEL', key]] });
    } catch {
      // swallow
    }
  }
}

let client: RedisClient | null = null;

export function getRedis(): RedisClient {
  if (client) return client;

  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    client = new UpstashRedis(upstashUrl, upstashToken);
    return client;
  }

  // Fallback to no-op to avoid breaking environments without Redis
  client = new NoopRedis();
  return client;
}

export const redis = getRedis();

// Helpers for session caching
export type CachedUser = { id: string; email: string; role: string; sessionId: string };
const SESSION_PREFIX = 'session:';

export async function cacheSession(user: CachedUser, ttlSeconds: number): Promise<void> {
  await redis.set(SESSION_PREFIX + user.sessionId, JSON.stringify(user), { ex: ttlSeconds });
}

export async function getCachedSession(sessionId: string): Promise<CachedUser | null> {
  const raw = await redis.get(SESSION_PREFIX + sessionId);
  if (!raw) return null;
  try { return JSON.parse(raw) as CachedUser; } catch { return null; }
}

export async function deleteCachedSession(sessionId: string): Promise<void> {
  await redis.del(SESSION_PREFIX + sessionId);
}


