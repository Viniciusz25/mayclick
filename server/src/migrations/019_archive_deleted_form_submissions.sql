-- Migration: 019_archive_deleted_form_submissions.sql
-- Description: Add safe archive/delete flags for public form submissions.

ALTER TABLE form_submissions
  ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;

ALTER TABLE form_submissions
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

UPDATE form_submissions
SET archived = FALSE
WHERE archived IS NULL;

ALTER TABLE form_submissions
  ALTER COLUMN archived SET DEFAULT FALSE;

ALTER TABLE form_submissions
  ALTER COLUMN archived SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_form_submissions_not_deleted
  ON form_submissions(created_at DESC)
  WHERE archived = FALSE AND deleted_at IS NULL;
