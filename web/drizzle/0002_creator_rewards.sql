-- Creator revenue-share accrual (run once in the Neon SQL Editor).
-- Tracks the cumulative PURCHASED credits readers spend chatting with each
-- creator's characters, so the fractional 15% share can accumulate and pay out
-- whole earned credits without rounding losses.
CREATE TABLE IF NOT EXISTS creator_rewards (
  creator_id  uuid PRIMARY KEY,
  basis       bigint NOT NULL DEFAULT 0,
  updated_at  timestamptz NOT NULL DEFAULT now()
);
