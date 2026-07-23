CREATE TABLE IF NOT EXISTS portfolio_albums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES portfolio_categories(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  cover_image_url VARCHAR(1024),
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE portfolio_photos 
ADD COLUMN IF NOT EXISTS album_id UUID REFERENCES portfolio_albums(id) ON DELETE CASCADE;

-- If a photo has no album, it belongs directly to the category. We will keep category_id on the photo for legacy or direct photos.
-- Optionally, we can set category_id to NULL if album_id is set, but keeping it allows easier filtering.
