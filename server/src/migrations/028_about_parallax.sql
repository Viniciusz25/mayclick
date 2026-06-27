-- Migration: 028_about_parallax
-- Description: Add fields to business_settings for the About Us parallax/video block

ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS about_parallax_image_url TEXT;
ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS about_button_text TEXT DEFAULT 'Saiba Mais';
ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS about_button_link TEXT DEFAULT '/sobre';
