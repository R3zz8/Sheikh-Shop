const rateLimitStore: Record<string, { count: number; last: number }> = {};

export function rateLimit(key: string, limit: number, windowMs = 60_000): boolean {
    const now = Date.now();
    if (!rateLimitStore[key] || now - rateLimitStore[key].last > windowMs) {
        rateLimitStore[key] = { count: 1, last: now };
        return true;
    }
    if (rateLimitStore[key].count < limit) {
        rateLimitStore[key].count++;
        return true;
    }
    return false;
}
// TODO: Replace with Redis/Upstash for production 