-- Migration: 030_about_page
-- Description: Add fields for the dedicated About page

ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS about_page_hero_image TEXT;
ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS about_page_text TEXT;
ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS about_page_gallery_1 TEXT;
ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS about_page_gallery_2 TEXT;
ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS about_page_gallery_3 TEXT;
