-- Durable, spoiler-bounded "story we shared" memory per conversation (run once in
-- the Neon SQL Editor). Seeded when a chat starts from a story and refreshed as the
-- reader advances; kept separate from the rolling conversation summary so it is
-- never overwritten. story_context_chapter = how many chapters are reflected.
ALTER TABLE threads ADD COLUMN IF NOT EXISTS story_id uuid;
ALTER TABLE threads ADD COLUMN IF NOT EXISTS story_context text;
ALTER TABLE threads ADD COLUMN IF NOT EXISTS story_context_chapter integer NOT NULL DEFAULT 0;
