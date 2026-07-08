-- Reader-saved stories, distinct from stories.user_id (who wrote it).
-- Run once in the Neon SQL Editor.
CREATE TABLE IF NOT EXISTS bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  story_id uuid NOT NULL REFERENCES stories(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS bookmarks_user_story_uniq ON bookmarks (user_id, story_id);
CREATE INDEX IF NOT EXISTS bookmarks_user_idx ON bookmarks (user_id);
