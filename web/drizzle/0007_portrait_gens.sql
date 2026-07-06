-- Portrait generation metering (run once in the Neon SQL Editor).
-- Counts lifetime portrait generations per user; the first FREE_PORTRAITS are
-- free, then each costs PORTRAIT_PRICE credits.
ALTER TABLE users ADD COLUMN IF NOT EXISTS portrait_gens integer NOT NULL DEFAULT 0;
