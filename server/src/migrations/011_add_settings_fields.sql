-- Migration: 011_add_settings_fields.sql
-- Description: Add missing fields to business_settings table for full persistence

ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS pdf_validity TEXT;
ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS pdf_footer TEXT;

-- Ensure updated_at is always set
ALTER TABLE business_settings ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;
