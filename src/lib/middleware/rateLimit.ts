import { NextRequest, NextResponse } from 'next/server';

// Security: Rate limiting configuration
export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean; // Skip rate limiting for successful requests
  skipFailedRequests?: boolean; // Skip rate limiting for failed requests
  keyGenerator?: (req: NextRequest) => string; // Custom key generator
  handler?: (req: NextRequest) => NextResponse; // Custom handler for rate limit exceeded
}

// Security: Default rate limit configurations
export const RATE_LIMIT_CONFIGS = {
  // General API rate limiting
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
  },
  // Login attempts
  login: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10, // Increased from 5
  },
  // Token refresh
  refresh: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 10,
  },
  // 2FA attempts
  twoFactor: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
  },
  // Password reset
  passwordReset: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5, // Increased from 3
  },
  // Registration - More lenient for development
  registration: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10, // Increased from 3 for development
  },
} as const;

// Security: In-memory rate limiting store (use Redis in production)
class MemoryRateLimitStore {
  private store = new Map<string, { count: number; resetTime: number }>();

  async increment(key: string, windowMs: number): Promise<{ count: number; resetTime: number }> {
  const now = Date.now();
    const record = this.store.get(key);

    if (!record || now > record.resetTime) {
      const newRecord = { count: 1, resetTime: now + windowMs };
      this.store.set(key, newRecord);
      return newRecord;
    }

    record.count++;
    return record;
  }

  async reset(key: string): Promise<void> {
    this.store.delete(key);
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (now > record.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

// Security: Rate limiting store instance
const rateLimitStore = new MemoryRateLimitStore();

// Security: Clean up expired entries every 5 minutes
setInterval(() => {
  rateLimitStore.cleanup();
}, 5 * 60 * 1000);

// Security: Default key generator
function defaultKeyGenerator(req: NextRequest): string {
      const ip = req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      'unknown';

  const userAgent = req.headers.get('user-agent') || 'unknown';
  const path = req.nextUrl.pathname;

  return `${ip}:${userAgent}:${path}`;
}

// Security: Default rate limit exceeded handler
function defaultHandler(req: NextRequest): NextResponse {
  return NextResponse.json(
    {
      success: false,
      message: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil(RATE_LIMIT_CONFIGS.api.windowMs / 1000),
    },
    {
      status: 429,
      headers: {
        'Retry-After': Math.ceil(RATE_LIMIT_CONFIGS.api.windowMs / 1000).toString(),
        'X-RateLimit-Limit': RATE_LIMIT_CONFIGS.api.maxRequests.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': new Date(Date.now() + RATE_LIMIT_CONFIGS.api.windowMs).toISOString(),
      },
    }
  );
}

// Security: Enhanced rate limiting middleware
export function createRateLimitMiddleware(config: RateLimitConfig) {
  return async function rateLimitMiddleware(req: NextRequest): Promise<NextResponse | null> {
    const key = config.keyGenerator ? config.keyGenerator(req) : defaultKeyGenerator(req);

    try {
      const { count, resetTime } = await rateLimitStore.increment(key, config.windowMs);

      // Check if rate limit exceeded
      if (count > config.maxRequests) {
        return config.handler ? config.handler(req) : defaultHandler(req);
      }

      // Add rate limit headers
      const response = NextResponse.next();
      response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
      response.headers.set('X-RateLimit-Remaining', Math.max(0, config.maxRequests - count).toString());
      response.headers.set('X-RateLimit-Reset', new Date(resetTime).toISOString());

      return response;
    } catch (error) {
      // If rate limiting fails, allow the request but log the error
      console.error('Rate limiting error:', error);
      return NextResponse.next();
    }
  };
}

// Security: Specific rate limit middlewares
export const apiRateLimit = createRateLimitMiddleware(RATE_LIMIT_CONFIGS.api);
export const rateLimit = apiRateLimit; // Add this alias for backward compatibility
export const loginRateLimit = createRateLimitMiddleware(RATE_LIMIT_CONFIGS.login);
export const refreshRateLimit = createRateLimitMiddleware(RATE_LIMIT_CONFIGS.refresh);
export const twoFactorRateLimit = createRateLimitMiddleware(RATE_LIMIT_CONFIGS.twoFactor);
export const passwordResetRateLimit = createRateLimitMiddleware(RATE_LIMIT_CONFIGS.passwordReset);
export const registrationRateLimit = createRateLimitMiddleware(RATE_LIMIT_CONFIGS.registration);

// Security: Dynamic rate limiting based on user role
export function createDynamicRateLimitMiddleware(baseConfig: RateLimitConfig) {
  return async function dynamicRateLimitMiddleware(req: NextRequest): Promise<NextResponse | null> {
    // Get user role from headers (set by auth middleware)
    const userRole = req.headers.get('x-user-role');

    // Adjust rate limits based on user role
    const adjustedConfig = { ...baseConfig };

    if (userRole === 'ADMIN' || userRole === 'SUPERADMIN') {
      adjustedConfig.maxRequests = Math.floor(baseConfig.maxRequests * 2); // Double limit for admins
    } else if (userRole === 'SYSTEM') {
      adjustedConfig.maxRequests = Math.floor(baseConfig.maxRequests * 5); // 5x limit for system users
    }

    return createRateLimitMiddleware(adjustedConfig)(req);
  };
}

// Security: IP-based rate limiting with whitelist
export function createIPRateLimitMiddleware(config: RateLimitConfig, whitelist: string[] = []) {
  return async function ipRateLimitMiddleware(req: NextRequest): Promise<NextResponse | null> {
    const ip = req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      'unknown';

    // Skip rate limiting for whitelisted IPs
    if (whitelist.includes(ip)) {
      return NextResponse.next();
    }

    const key = `ip:${ip}`;

    try {
      const { count, resetTime } = await rateLimitStore.increment(key, config.windowMs);

      if (count > config.maxRequests) {
        return defaultHandler(req);
      }

      const response = NextResponse.next();
      response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
      response.headers.set('X-RateLimit-Remaining', Math.max(0, config.maxRequests - count).toString());
      response.headers.set('X-RateLimit-Reset', new Date(resetTime).toISOString());

      return response;
    } catch (error) {
      console.error('IP rate limiting error:', error);
      return NextResponse.next();
    }
  };
}

// Security: Burst rate limiting for short time windows
export function createBurstRateLimitMiddleware(maxBurst: number, windowMs: number = 60000) {
  return createRateLimitMiddleware({
    windowMs,
    maxRequests: maxBurst,
    handler: (req: NextRequest) => {
      return NextResponse.json(
        {
          success: false,
          message: 'Too many requests in a short time. Please slow down.',
        },
        { status: 429 }
      );
    },
  });
}
