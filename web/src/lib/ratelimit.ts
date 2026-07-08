import { redis } from "./redis";

/**
 * Fixed-window rate limit keyed by caller-supplied string (e.g. `login:<email>`).
 * No-ops (always allows) when Redis isn't configured, same fallback style as
 * the rest of the optional-Redis code.
 */
export async function rateLimit(key: string, max: number, windowSeconds: number): Promise<boolean> {
  if (!redis) return true;
  const n = await redis.incr(key);
  if (n === 1) await redis.expire(key, windowSeconds);
  return n <= max;
}
