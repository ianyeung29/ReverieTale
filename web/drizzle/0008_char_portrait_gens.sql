-- Per-character portrait metering (run once in the Neon SQL Editor).
-- Each character's first portrait is free; regenerating it costs PORTRAIT_PRICE.
ALTER TABLE characters ADD COLUMN IF NOT EXISTS portrait_gens integer NOT NULL DEFAULT 0;
