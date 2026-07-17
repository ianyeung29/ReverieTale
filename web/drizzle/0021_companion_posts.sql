-- Public companion profile updates. These are safe, platform-authored snapshots
-- and are not the same as a reader's private saved chat moments.
CREATE TABLE IF NOT EXISTS companion_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id uuid NOT NULL REFERENCES characters(id),
  caption text NOT NULL,
  scene text NOT NULL,
  image_key text NOT NULL,
  image_mime text,
  automated boolean NOT NULL DEFAULT false,
  posted_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS companion_posts_character_idx
  ON companion_posts(character_id, posted_at);
