import { APP_CONSTANTS } from '../config/constants.ts';
import { errorResponse } from '../lib/response.ts';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

class MemoryRateLimiter {
  private records = new Map<string, RateLimitRecord>();

  /**
   * Consume a rate limit hit for a given key
   */
  consume(key: string, limit: number = APP_CONSTANTS.DEFAULT_RATE_LIMIT_MAX, windowMs: number = APP_CONSTANTS.DEFAULT_RATE_LIMIT_WINDOW_MS): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
  } {
    const now = Date.now();
    let record = this.records.get(key);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs,
      };
      this.records.set(key, record);
      return {
        allowed: true,
        remaining: limit - 1,
        resetTime: record.resetTime,
      };
    }

    if (record.count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime,
      };
    }

    record.count += 1;
    return {
      allowed: true,
      remaining: limit - record.count,
      resetTime: record.resetTime,
    };
  }

  /**
   * Periodic cleanup of expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.records.entries()) {
      if (now > record.resetTime) {
        this.records.delete(key);
      }
    }
  }
}

export const rateLimiter = new MemoryRateLimiter();

// Clean up expired entries every 5 minutes
setInterval(() => rateLimiter.cleanup(), 5 * 60 * 1000).unref();

export function applyRateLimit(
  req: Request,
  options: { limit?: number; windowMs?: number; identifier?: string } = {}
): Response | null {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
  const key = options.identifier ? `${options.identifier}:${ip}` : ip;
  const limit = options.limit ?? APP_CONSTANTS.DEFAULT_RATE_LIMIT_MAX;
  const windowMs = options.windowMs ?? APP_CONSTANTS.DEFAULT_RATE_LIMIT_WINDOW_MS;

  const result = rateLimiter.consume(key, limit, windowMs);

  if (!result.allowed) {
    const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
    return errorResponse(
      'Too many requests. Please try again later.',
      429,
      'RATE_LIMIT_EXCEEDED',
      { retryAfterSeconds: retryAfter },
      {
        'Retry-After': String(retryAfter),
        'X-RateLimit-Limit': String(limit),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(Math.ceil(result.resetTime / 1000)),
      }
    );
  }

  return null;
}
