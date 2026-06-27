-- Migration: 003_add_budget_number.sql
-- Description: Add sequential budget number to form_submissions

CREATE SEQUENCE IF NOT EXISTS budget_number_seq START WITH 1001;

ALTER TABLE form_submissions
ADD COLUMN IF NOT EXISTS budget_number INTEGER DEFAULT nextval('budget_number_seq');

-- Update existing rows if any
UPDATE form_submissions SET budget_number = nextval('budget_number_seq') WHERE budget_number IS NULL;
