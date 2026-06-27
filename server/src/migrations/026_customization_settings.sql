-- Migration: 026_customization_settings
-- Description: Adds customization fields (colors and fonts) to business_settings table

ALTER TABLE business_settings
ADD COLUMN IF NOT EXISTS color_primary VARCHAR(50) DEFAULT '#1A1A1A',
ADD COLUMN IF NOT EXISTS color_accent VARCHAR(50) DEFAULT '#D4AF37',
ADD COLUMN IF NOT EXISTS font_heading VARCHAR(100) DEFAULT 'Outfit',
ADD COLUMN IF NOT EXISTS font_body VARCHAR(100) DEFAULT 'Inter';
