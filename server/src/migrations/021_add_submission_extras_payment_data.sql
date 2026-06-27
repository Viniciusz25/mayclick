-- Migration: 021_add_submission_extras_payment_data.sql
-- Description: Persist extras and calculated payment details selected in public form submissions

ALTER TABLE IF EXISTS form_submissions
  ADD COLUMN IF NOT EXISTS extras_data JSONB DEFAULT '[]'::jsonb;

ALTER TABLE IF EXISTS form_submissions
  ADD COLUMN IF NOT EXISTS payment_data JSONB DEFAULT '{}'::jsonb;

UPDATE form_submissions
SET extras_data = '[]'::jsonb
WHERE extras_data IS NULL
  OR jsonb_typeof(extras_data) <> 'array';

UPDATE form_submissions
SET payment_data = '{}'::jsonb
WHERE payment_data IS NULL
  OR jsonb_typeof(payment_data) <> 'object';
