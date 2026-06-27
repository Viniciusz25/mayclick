ALTER TABLE business_settings
ADD COLUMN homepage_layout JSONB DEFAULT '["hero", "portfolio", "highlights", "about", "testimonials", "instagram", "cta"]'::jsonb;
