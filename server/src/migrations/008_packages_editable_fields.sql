-- Migration: 008_packages_editable_fields.sql
-- Description: Add editable package metadata used by admin, public form and PDFs

ALTER TABLE packages ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS observations TEXT;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS coverage_time TEXT;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS team TEXT;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS deliveries TEXT;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

UPDATE packages SET features = '[]'::jsonb WHERE features IS NULL;

CREATE INDEX IF NOT EXISTS idx_packages_active_sort ON packages(active, category, sort_order);
CREATE INDEX IF NOT EXISTS idx_packages_category_name ON packages(category, name);
