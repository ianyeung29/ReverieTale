-- Character-specific scene art (the companion in their world, behind the
-- profile hero) plus one generated scene image per story chapter (placed at a
-- turning point in the reader). Chapter scenes live in their own table so the
-- large base64 payloads don't bloat the stories row.
-- Run once in the Neon SQL Editor.
ALTER TABLE characters ADD COLUMN IF NOT EXISTS scene_image text;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS scene_image_mime text;

CREATE TABLE IF NOT EXISTS chapter_scenes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL REFERENCES stories(id),
  chapter_index integer NOT NULL,
  image text NOT NULL,
  image_mime text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS chapter_scenes_story_chapter_uniq ON chapter_scenes (story_id, chapter_index);
