import { Redis } from "@upstash/redis";

/**
 * Upstash Redis (free serverless tier). Used for rate limits, daily-drip
 * counters, and per-reader/day reward caps. Optional in local dev - if the
 * env vars are unset, `redis` is null and callers should no-op gracefully.
 */
export const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;
