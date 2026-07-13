-- Reports (trust & safety flagging) and character blocks (personal hide list).
-- Run once in the Neon SQL Editor.
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES users(id),
  target_type text NOT NULL,   -- 'character' | 'story'
  target_id uuid NOT NULL,
  reason text NOT NULL,
  note text,
  status text NOT NULL DEFAULT 'open',  -- 'open' | 'resolved'
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS reports_status_idx ON reports (status);

CREATE TABLE IF NOT EXISTS character_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  character_id uuid NOT NULL REFERENCES characters(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS character_blocks_user_char_uniq ON character_blocks (user_id, character_id);
CREATE INDEX IF NOT EXISTS character_blocks_user_idx ON character_blocks (user_id);
