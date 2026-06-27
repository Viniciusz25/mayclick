-- Migration: 029_instagram_widget
-- Description: Add instagram_widget_code field to business_settings

ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS instagram_widget_code TEXT;
