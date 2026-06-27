-- Migration: 023_dynamic_homepage.sql
-- Description: Add fields to business_settings and create portfolio/testimonial tables

-- 1. Add fields to business_settings
ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS hero_title TEXT;
ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS hero_subtitle TEXT;
ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS hero_btn_text TEXT DEFAULT 'Solicitar Orçamento';
ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS hero_btn_link TEXT DEFAULT '/formulario';
ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS hero_image_url TEXT;
ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS hero_active BOOLEAN DEFAULT TRUE;

ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS about_title TEXT DEFAULT 'A Mayclick Photography';
ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS about_image_url TEXT;
ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS about_video_url TEXT;

ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS stat_stories TEXT DEFAULT '+3.000';
ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS stat_events TEXT DEFAULT '+500';
ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS stat_clients TEXT DEFAULT 'Clientes Satisfeitos';
ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS stat_experience TEXT DEFAULT 'Profissional';

ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS instagram_username TEXT DEFAULT 'mayclick';
ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS instagram_active BOOLEAN DEFAULT TRUE;

ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS seo_keywords TEXT;
ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS seo_og_image TEXT;

-- 2. Create testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_name TEXT NOT NULL,
    client_photo_url TEXT,
    content TEXT NOT NULL,
    stars INTEGER DEFAULT 5,
    active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create portfolio_categories table
CREATE TABLE IF NOT EXISTS portfolio_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create portfolio_photos table
CREATE TABLE IF NOT EXISTS portfolio_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES portfolio_categories(id) ON DELETE SET NULL,
    image_url TEXT NOT NULL,
    is_cover BOOLEAN DEFAULT FALSE,
    is_featured_home BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    title TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger updates
DROP TRIGGER IF EXISTS update_testimonials_updated_at ON testimonials;
CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON testimonials FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_portfolio_categories_updated_at ON portfolio_categories;
CREATE TRIGGER update_portfolio_categories_updated_at BEFORE UPDATE ON portfolio_categories FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
