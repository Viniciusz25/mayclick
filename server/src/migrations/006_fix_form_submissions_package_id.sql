-- Migration: 006_fix_form_submissions_package_id.sql
-- Description: Change selected_package_id to TEXT to support named IDs and add selected_package_name

-- 1. Remove the foreign key constraint
ALTER TABLE form_submissions DROP CONSTRAINT IF EXISTS form_submissions_selected_package_id_fkey;

-- 2. Change the column type to TEXT
ALTER TABLE form_submissions ALTER COLUMN selected_package_id TYPE TEXT;

-- 3. Add selected_package_name column if it doesn't exist
ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS selected_package_name TEXT;
