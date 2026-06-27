ALTER TABLE business_settings
ADD COLUMN IF NOT EXISTS instagram_eyebrow VARCHAR(255) DEFAULT 'Siga no Instagram',
ADD COLUMN IF NOT EXISTS instagram_title VARCHAR(255) DEFAULT 'Acompanhe nosso trabalho em tempo real',
ADD COLUMN IF NOT EXISTS instagram_description TEXT DEFAULT 'Fique por dentro dos bastidores e novidades diárias';
