interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory token bucket sliding window
const rateLimits = new Map<string, RateLimitEntry>();

// Clean expired entries every 5 minutes to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimits.entries()) {
      if (now > entry.resetAt) {
        rateLimits.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export function checkRateLimit(
  identifier: string,
  limit: number = 5,
  windowSeconds: number = 60
): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  const now = Date.now();
  const entry = rateLimits.get(identifier);

  if (!entry || now > entry.resetAt) {
    rateLimits.set(identifier, {
      count: 1,
      resetAt: now + windowSeconds * 1000
    });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  if (entry.count >= limit) {
    const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count, retryAfterSeconds: 0 };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}
