-- Migration: 025_hero_carousel_category.sql
-- Description: Add hero_carousel_category_slug field to business_settings

ALTER TABLE business_settings
  ADD COLUMN IF NOT EXISTS hero_carousel_category_slug TEXT DEFAULT NULL;
