-- Migration: 027_home_highlights
-- Description: Creates the home_highlights table for dynamic homepage sections

CREATE TABLE IF NOT EXISTS home_highlights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    eyebrow VARCHAR(100),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    button_text VARCHAR(100),
    button_link VARCHAR(255),
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed an initial highlight based on the hardcoded debutantes block
INSERT INTO home_highlights (eyebrow, title, description, button_text, button_link, image_url, sort_order)
VALUES (
    'Destaque',
    'Sonhos de 15 Anos',
    'Cada debutante possui uma história única. Nosso objetivo é registrar cada detalhe, emoção e momento especial para que ele seja lembrado para sempre.',
    'Ver Galeria de Debutantes',
    '/portfolio/debutantes',
    '/debutante-highlight.jpg',
    0
) ON CONFLICT DO NOTHING;
