-- Migration: 009_harden_packages_defaults.sql
-- Description: Reinforce editable package defaults without recreating data

ALTER TABLE packages ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS observations TEXT;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS coverage_time TEXT;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS team TEXT;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS deliveries TEXT;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE packages ALTER COLUMN features SET DEFAULT '[]'::jsonb;
ALTER TABLE packages ALTER COLUMN active SET DEFAULT TRUE;
ALTER TABLE packages ALTER COLUMN sort_order SET DEFAULT 0;

UPDATE packages SET features = '[]'::jsonb WHERE features IS NULL;
UPDATE packages SET active = TRUE WHERE active IS NULL;
UPDATE packages SET sort_order = 0 WHERE sort_order IS NULL;

CREATE INDEX IF NOT EXISTS idx_packages_listing_active_category_sort
  ON packages (active, category, sort_order, name);
