-- Reader ratings for characters and stories (run once in the Neon SQL Editor).
-- One 1-5 star rating per (user, target); re-rating overwrites via the unique index.
CREATE TABLE IF NOT EXISTS ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  target_type text NOT NULL,   -- 'character' | 'story'
  target_id uuid NOT NULL,
  rating integer NOT NULL,      -- 1..5
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS ratings_user_target_uniq ON ratings (user_id, target_type, target_id);
CREATE INDEX IF NOT EXISTS ratings_target_idx ON ratings (target_type, target_id);
