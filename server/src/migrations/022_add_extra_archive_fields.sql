-- Migration: 022_add_extra_archive_fields.sql
-- Description: Add archive fields so deleted extras disappear from admin and public listings

ALTER TABLE extras
  ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;

ALTER TABLE extras
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

UPDATE extras
SET archived = FALSE
WHERE archived IS NULL;

ALTER TABLE extras
  ALTER COLUMN archived SET DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_extras_visible_listing
  ON extras (archived, deleted_at, active, sort_order, name);
