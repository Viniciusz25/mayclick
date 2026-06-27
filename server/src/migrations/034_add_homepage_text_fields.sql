ALTER TABLE business_settings
ADD COLUMN IF NOT EXISTS portfolio_eyebrow VARCHAR(255) DEFAULT 'Nosso Portfólio',
ADD COLUMN IF NOT EXISTS portfolio_title VARCHAR(255) DEFAULT 'Conheça Nosso Trabalho',
ADD COLUMN IF NOT EXISTS portfolio_description TEXT DEFAULT 'Selecione uma categoria para visualizar nossas galerias exclusivas',
ADD COLUMN IF NOT EXISTS testimonials_eyebrow VARCHAR(255) DEFAULT 'O Que Dizem',
ADD COLUMN IF NOT EXISTS testimonials_title VARCHAR(255) DEFAULT 'Depoimentos de Clientes',
ADD COLUMN IF NOT EXISTS cta_title VARCHAR(255) DEFAULT 'Vamos contar sua história?',
ADD COLUMN IF NOT EXISTS cta_text TEXT DEFAULT 'Solicite seu orçamento e descubra como podemos eternizar seu momento especial.',
ADD COLUMN IF NOT EXISTS cta_button_text VARCHAR(255) DEFAULT 'Solicitar Orçamento';
