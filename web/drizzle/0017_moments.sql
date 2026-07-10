-- "Visualize this moment" image cache on messages, plus a moments table for
-- the reader's saved "shared moments" gallery (a character reply, its
-- generated image if any, and the setting it happened in).
-- Run once in the Neon SQL Editor.
ALTER TABLE messages ADD COLUMN IF NOT EXISTS image_base64 text;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS image_mime text;

CREATE TABLE IF NOT EXISTS moments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  character_id uuid NOT NULL REFERENCES characters(id),
  thread_id uuid,
  message_id uuid,
  dialogue text NOT NULL,
  setting text,
  image text,
  image_mime text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS moments_user_idx ON moments (user_id, created_at);
