export interface RateLimiterConfig {
  windowMs: number;
  max: number;
  message?: string;
  statusCode?: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private windowMs: number;
  private max: number;
  private message: string;
  private statusCode: number;

  constructor(config: RateLimiterConfig) {
    this.windowMs = config.windowMs;
    this.max = config.max;
    this.message = config.message ?? 'Too many requests, please try again later';
    this.statusCode = config.statusCode ?? 429;
  }

  async check(key: string): Promise<{ success: boolean; remaining: number; resetTime: number }> {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetTime) {
      this.store.set(key, { count: 1, resetTime: now + this.windowMs });
      return { success: true, remaining: this.max - 1, resetTime: now + this.windowMs };
    }

    if (entry.count >= this.max) {
      return { success: false, remaining: 0, resetTime: entry.resetTime };
    }

    entry.count++;
    return { success: true, remaining: this.max - entry.count, resetTime: entry.resetTime };
  }

  getMessage(): string {
    return this.message;
  }

  getStatusCode(): number {
    return this.statusCode;
  }

  reset(): void {
    this.store.clear();
  }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') ?? '127.0.0.1';
}

export function rateLimitMiddleware(limiter: RateLimiter) {
  return async (request: Request): Promise<Response | null> => {
    const ip = getClientIp(request);
    const result = await limiter.check(ip);

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: limiter.getMessage() }),
        {
          status: limiter.getStatusCode(),
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(Math.ceil((result.resetTime - Date.now()) / 1000)),
          },
        }
      );
    }

    return null;
  };
}
