-- Migration: 018_archive_deleted_packages.sql
-- Description: Add safe archive/delete flags for packages without breaking historical records.

ALTER TABLE packages
  ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;

ALTER TABLE packages
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

UPDATE packages
SET archived = FALSE
WHERE archived IS NULL;

ALTER TABLE packages
  ALTER COLUMN archived SET DEFAULT FALSE;

ALTER TABLE packages
  ALTER COLUMN archived SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_packages_not_deleted
  ON packages(active, sort_order, category, name)
  WHERE deleted_at IS NULL AND archived = FALSE;
