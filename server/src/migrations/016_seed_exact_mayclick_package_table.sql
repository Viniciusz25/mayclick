BEGIN;

ALTER TABLE packages ADD COLUMN IF NOT EXISTS label TEXT;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS package_number TEXT;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS installment_text TEXT;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS comparison_items JSONB DEFAULT '[]'::jsonb;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS coverage_time TEXT;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS team TEXT;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS deliveries TEXT;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS differential TEXT;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS observations TEXT;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

UPDATE packages SET features = '[]'::jsonb WHERE features IS NULL;
UPDATE packages SET comparison_items = features WHERE comparison_items IS NULL;
ALTER TABLE packages ALTER COLUMN features SET DEFAULT '[]'::jsonb;
ALTER TABLE packages ALTER COLUMN comparison_items SET DEFAULT '[]'::jsonb;

CREATE TEMP TABLE exact_mayclick_packages (
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  label TEXT NOT NULL,
  package_number TEXT NOT NULL,
  installment_text TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  coverage_time TEXT NOT NULL,
  team TEXT NOT NULL,
  deliveries TEXT NOT NULL,
  description TEXT NOT NULL,
  differential TEXT NOT NULL,
  observations TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  features JSONB NOT NULL
) ON COMMIT DROP;

INSERT INTO exact_mayclick_packages
(category, name, label, package_number, installment_text, price, coverage_time, team, deliveries, description, differential, observations, sort_order, features)
VALUES
(
  'infantil',
  'Infantil - Essencial',
  'Essencial',
  '1',
  'ou 2x de R$ 375,00',
  750,
  'Até 4 horas',
  '1 fotógrafo',
  'Entrega via link em galeria online.',
  'Cobertura fotográfica de até 4 horas, realizada por 1 fotógrafo, com fotos tratadas em alta resolução e entrega via link em galeria online. Inclui álbum revista 10x15.',
  'O essencial para registrar cada momento.',
  '',
  1,
  $$[
    {"label":"Fotos tratadas em alta resolução","type":"boolean","included":true,"value":""},
    {"label":"Story Maker","type":"boolean","included":false,"value":""},
    {"label":"Filme completo (7 a 11 minutos)","type":"boolean","included":false,"value":""},
    {"label":"Reels dos melhores momentos","type":"boolean","included":false,"value":""},
    {"label":"Álbum incluso","type":"text","included":true,"value":"Álbum revista 10x15"},
    {"label":"Pen drive","type":"boolean","included":false,"value":""},
    {"label":"Entrega via link (galeria online)","type":"boolean","included":true,"value":""}
  ]$$::jsonb
),
(
  'infantil',
  'Infantil - Experience',
  'Experience',
  '2',
  'ou 2x de R$ 645,00',
  1290,
  'Até 5 horas',
  '1 fotógrafo + Story Maker',
  'Pen drive e entrega via link em galeria online.',
  'Cobertura de até 5 horas com 1 fotógrafo e Story Maker, incluindo fotos tratadas em alta resolução, produção de conteúdo para redes sociais, pen drive e entrega via link em galeria online.',
  'Fotos e vídeos para reviver e compartilhar.',
  '',
  2,
  $$[
    {"label":"Fotos tratadas em alta resolução","type":"boolean","included":true,"value":""},
    {"label":"Story Maker","type":"boolean","included":true,"value":""},
    {"label":"Filme completo (7 a 11 minutos)","type":"boolean","included":false,"value":""},
    {"label":"Reels dos melhores momentos","type":"boolean","included":false,"value":""},
    {"label":"Álbum incluso","type":"boolean","included":false,"value":""},
    {"label":"Pen drive","type":"boolean","included":true,"value":""},
    {"label":"Entrega via link (galeria online)","type":"boolean","included":true,"value":""}
  ]$$::jsonb
),
(
  'infantil',
  'Infantil - Premium',
  'Premium',
  '3',
  'ou 3x de R$ 700,00',
  2100,
  'Até 6 horas',
  '2 fotógrafos + Filmmaker',
  'Álbum fotolivro 21x30, pen drive e entrega via link em galeria online.',
  'Cobertura de até 6 horas com equipe ampliada, composta por 2 fotógrafos e filmmaker. Inclui fotos tratadas em alta resolução, Story Maker, filme completo de 7 a 11 minutos, reels dos melhores momentos, álbum fotolivro 21x30, pen drive e entrega via link em galeria online.',
  'Experiência completa com filme e álbum premium.',
  '',
  3,
  $$[
    {"label":"Fotos tratadas em alta resolução","type":"boolean","included":true,"value":""},
    {"label":"Story Maker","type":"boolean","included":true,"value":""},
    {"label":"Filme completo (7 a 11 minutos)","type":"boolean","included":true,"value":""},
    {"label":"Reels dos melhores momentos","type":"boolean","included":true,"value":""},
    {"label":"Álbum incluso","type":"text","included":true,"value":"Álbum fotolivro 21x30"},
    {"label":"Pen drive","type":"boolean","included":true,"value":""},
    {"label":"Entrega via link (galeria online)","type":"boolean","included":true,"value":""}
  ]$$::jsonb
),
(
  'debutante',
  'Debutante - Essencial',
  'Essencial',
  '1',
  'ou 2x de R$ 495,00',
  990,
  'Até 4 horas',
  '1 fotógrafo',
  'Entrega via link em galeria online.',
  'Cobertura de até 4 horas com 1 fotógrafo, incluindo fotos tratadas em alta resolução e entrega via link em galeria online.',
  'Registro completo do seu grande dia.',
  '',
  4,
  $$[
    {"label":"Fotos tratadas em alta resolução","type":"boolean","included":true,"value":""},
    {"label":"Story Maker","type":"boolean","included":false,"value":""},
    {"label":"Vídeo retrospectiva","type":"boolean","included":false,"value":""},
    {"label":"Reels para redes","type":"boolean","included":false,"value":""},
    {"label":"Pré-ensaio","type":"boolean","included":false,"value":""},
    {"label":"Making of","type":"boolean","included":false,"value":""},
    {"label":"Álbum incluso","type":"boolean","included":false,"value":""},
    {"label":"Pen drive","type":"boolean","included":false,"value":""},
    {"label":"Entrega via link (galeria online)","type":"boolean","included":true,"value":""}
  ]$$::jsonb
),
(
  'debutante',
  'Debutante - Experience',
  'Experience',
  '2',
  'ou 2x de R$ 695,00',
  1390,
  'Até 5 horas',
  '1 fotógrafo + Story Maker',
  'Entrega via link em galeria online.',
  'Cobertura de até 5 horas com 1 fotógrafo e Story Maker, incluindo fotos tratadas em alta resolução, produção de conteúdo para redes sociais e entrega via link em galeria online.',
  'Fotos e vídeos para compartilhar cada emoção.',
  '',
  5,
  $$[
    {"label":"Fotos tratadas em alta resolução","type":"boolean","included":true,"value":""},
    {"label":"Story Maker","type":"boolean","included":true,"value":""},
    {"label":"Vídeo retrospectiva","type":"boolean","included":false,"value":""},
    {"label":"Reels para redes","type":"boolean","included":false,"value":""},
    {"label":"Pré-ensaio","type":"boolean","included":false,"value":""},
    {"label":"Making of","type":"boolean","included":false,"value":""},
    {"label":"Álbum incluso","type":"boolean","included":false,"value":""},
    {"label":"Pen drive","type":"boolean","included":false,"value":""},
    {"label":"Entrega via link (galeria online)","type":"boolean","included":true,"value":""}
  ]$$::jsonb
),
(
  'debutante',
  'Debutante - Completo',
  'Completo',
  '3',
  'ou 3x de R$ 663,00',
  1990,
  'Até 5 horas',
  'Foto + Vídeo + Story Maker',
  'Pen drive e entrega via link em galeria online.',
  'Cobertura de até 5 horas com foto, vídeo e Story Maker. Inclui fotos tratadas em alta resolução, vídeo retrospectiva, reels para redes, pré-ensaio ou making of, pen drive e entrega via link em galeria online.',
  'Vídeo + ensaio ou making of para uma experiência única.',
  '',
  6,
  $$[
    {"label":"Fotos tratadas em alta resolução","type":"boolean","included":true,"value":""},
    {"label":"Story Maker","type":"boolean","included":true,"value":""},
    {"label":"Vídeo retrospectiva","type":"boolean","included":true,"value":""},
    {"label":"Reels para redes","type":"boolean","included":true,"value":""},
    {"label":"Pré-ensaio","type":"text","included":true,"value":"incluso ou Making Of"},
    {"label":"Making of","type":"text","included":true,"value":"incluso ou Pré-ensaio"},
    {"label":"Álbum incluso","type":"boolean","included":false,"value":""},
    {"label":"Pen drive","type":"boolean","included":true,"value":""},
    {"label":"Entrega via link (galeria online)","type":"boolean","included":true,"value":""}
  ]$$::jsonb
),
(
  'debutante',
  'Debutante - Premium',
  'Premium',
  '4',
  'ou 4x de R$ 697,50',
  2790,
  'Até 5 horas',
  '2 profissionais (foto + vídeo)',
  'Álbum 15x21 com caixa, pen drive e entrega via link em galeria online.',
  'Experiência premium com cobertura de até 5 horas por 2 profissionais, incluindo foto e vídeo, Story Maker, vídeo retrospectiva, reels para redes, pré-ensaio, making of, álbum 15x21 com caixa, pen drive e entrega via link em galeria online.',
  'Tudo incluso: experiência premium com álbum exclusivo.',
  '',
  7,
  $$[
    {"label":"Fotos tratadas em alta resolução","type":"boolean","included":true,"value":""},
    {"label":"Story Maker","type":"boolean","included":true,"value":""},
    {"label":"Vídeo retrospectiva","type":"boolean","included":true,"value":""},
    {"label":"Reels para redes","type":"boolean","included":true,"value":""},
    {"label":"Pré-ensaio","type":"boolean","included":true,"value":""},
    {"label":"Making of","type":"boolean","included":true,"value":""},
    {"label":"Álbum incluso","type":"text","included":true,"value":"Álbum 15x21 com caixa"},
    {"label":"Pen drive","type":"boolean","included":true,"value":""},
    {"label":"Entrega via link (galeria online)","type":"boolean","included":true,"value":""}
  ]$$::jsonb
),
(
  'casamento',
  'Casamento - Cartório',
  'Cartório',
  '1',
  'ou 2x de R$ 745,00',
  1490,
  'Cartório + civil (evento simples)',
  '1 fotógrafo',
  'Entrega via link em galeria online.',
  'Cobertura de cartório e civil para evento simples, realizada por 1 fotógrafo. Inclui fotos tratadas em alta resolução, entrega via link em galeria online e mini cobertura do civil como cortesia.',
  'O essencial para formalizar seu amor.',
  '',
  8,
  $$[
    {"label":"Fotos tratadas em alta resolução","type":"boolean","included":true,"value":""},
    {"label":"Story Maker","type":"boolean","included":false,"value":""},
    {"label":"Vídeo retrospectiva","type":"boolean","included":false,"value":""},
    {"label":"Vídeos reels","type":"boolean","included":false,"value":""},
    {"label":"Making of","type":"boolean","included":false,"value":""},
    {"label":"Pré-wedding","type":"boolean","included":false,"value":""},
    {"label":"Cabine fotográfica (fotos na hora)","type":"boolean","included":false,"value":""},
    {"label":"Fotos reveladas na hora","type":"boolean","included":false,"value":""},
    {"label":"Pen drive","type":"boolean","included":false,"value":""},
    {"label":"Entrega via link (galeria online)","type":"boolean","included":true,"value":""},
    {"label":"Cortesia","type":"text","included":true,"value":"Mini cobertura do civil"}
  ]$$::jsonb
),
(
  'casamento',
  'Casamento - Experience',
  'Experience',
  '2',
  'ou 3x de R$ 730,00',
  2190,
  'Cartório + evento até 5 horas',
  '1 fotógrafo + Story Maker',
  'Pen drive e entrega via link em galeria online.',
  'Cobertura de cartório e evento de até 5 horas com 1 fotógrafo e Story Maker. Inclui fotos tratadas em alta resolução, pen drive e entrega via link em galeria online.',
  'Registro completo do início ao fim com vídeos para compartilhar.',
  '',
  9,
  $$[
    {"label":"Fotos tratadas em alta resolução","type":"boolean","included":true,"value":""},
    {"label":"Story Maker","type":"boolean","included":true,"value":""},
    {"label":"Vídeo retrospectiva","type":"boolean","included":false,"value":""},
    {"label":"Vídeos reels","type":"boolean","included":false,"value":""},
    {"label":"Making of","type":"boolean","included":false,"value":""},
    {"label":"Pré-wedding","type":"boolean","included":false,"value":""},
    {"label":"Cabine fotográfica (fotos na hora)","type":"boolean","included":false,"value":""},
    {"label":"Fotos reveladas na hora","type":"boolean","included":false,"value":""},
    {"label":"Pen drive","type":"boolean","included":true,"value":""},
    {"label":"Entrega via link (galeria online)","type":"boolean","included":true,"value":""},
    {"label":"Cortesia","type":"boolean","included":false,"value":""}
  ]$$::jsonb
),
(
  'casamento',
  'Casamento - Completo',
  'Completo',
  '3',
  'ou 4x de R$ 797,50',
  3190,
  'Cerimônia + evento até 5 horas',
  'Foto + Vídeo + Story Maker',
  'Pen drive e entrega via link em galeria online.',
  'Cobertura de cerimônia e evento de até 5 horas com foto, vídeo e Story Maker. Inclui vídeo retrospectiva, vídeos reels, making of ou pré-wedding, pen drive e entrega via link em galeria online.',
  'Experiência completa com vídeos, reels e ensaio para recordar para sempre.',
  '',
  10,
  $$[
    {"label":"Fotos tratadas em alta resolução","type":"boolean","included":true,"value":""},
    {"label":"Story Maker","type":"boolean","included":true,"value":""},
    {"label":"Vídeo retrospectiva","type":"boolean","included":true,"value":""},
    {"label":"Vídeos reels","type":"boolean","included":true,"value":""},
    {"label":"Making of","type":"text","included":true,"value":"incluso ou Pré-Wedding"},
    {"label":"Pré-wedding","type":"text","included":true,"value":"incluso ou Making Of"},
    {"label":"Cabine fotográfica (fotos na hora)","type":"boolean","included":false,"value":""},
    {"label":"Fotos reveladas na hora","type":"boolean","included":false,"value":""},
    {"label":"Pen drive","type":"boolean","included":true,"value":""},
    {"label":"Entrega via link (galeria online)","type":"boolean","included":true,"value":""},
    {"label":"Cortesia","type":"boolean","included":false,"value":""}
  ]$$::jsonb
),
(
  'casamento',
  'Casamento - Premium',
  'Premium',
  '4',
  'ou 5x de R$ 898,00',
  4490,
  'Cerimônia + evento até 5 horas',
  '2 profissionais (foto + vídeo)',
  'Pen drive e entrega via link em galeria online.',
  'Pacote premium para casamento com cobertura de cerimônia e evento de até 5 horas por 2 profissionais. Inclui foto e vídeo, Story Maker, vídeo retrospectiva, reels, making of, pré-wedding, cabine fotográfica com fotos na hora, fotos reveladas, pen drive e entrega via link em galeria online.',
  'Pacote premium com cabine e fotos impressas para seus convidados.',
  '',
  11,
  $$[
    {"label":"Fotos tratadas em alta resolução","type":"boolean","included":true,"value":""},
    {"label":"Story Maker","type":"boolean","included":true,"value":""},
    {"label":"Vídeo retrospectiva","type":"boolean","included":true,"value":""},
    {"label":"Vídeos reels","type":"boolean","included":true,"value":""},
    {"label":"Making of","type":"boolean","included":true,"value":""},
    {"label":"Pré-wedding","type":"boolean","included":true,"value":""},
    {"label":"Cabine fotográfica (fotos na hora)","type":"boolean","included":true,"value":""},
    {"label":"Fotos reveladas na hora","type":"boolean","included":true,"value":""},
    {"label":"Pen drive","type":"boolean","included":true,"value":""},
    {"label":"Entrega via link (galeria online)","type":"boolean","included":true,"value":""},
    {"label":"Cortesia","type":"boolean","included":false,"value":""}
  ]$$::jsonb
);

UPDATE packages p
SET
  category = o.category,
  name = o.name,
  label = o.label,
  package_number = o.package_number,
  installment_text = o.installment_text,
  price = o.price,
  coverage_time = o.coverage_time,
  team = o.team,
  deliveries = o.deliveries,
  description = o.description,
  features = o.features,
  comparison_items = o.features,
  differential = o.differential,
  observations = o.observations,
  sort_order = o.sort_order,
  active = true,
  updated_at = CURRENT_TIMESTAMP
FROM exact_mayclick_packages o
WHERE lower(p.category) = lower(o.category)
  AND lower(p.name) = lower(o.name);

INSERT INTO packages
(category, name, label, package_number, installment_text, price, coverage_time, team, deliveries, description, features, comparison_items, differential, observations, sort_order, active)
SELECT
  o.category,
  o.name,
  o.label,
  o.package_number,
  o.installment_text,
  o.price,
  o.coverage_time,
  o.team,
  o.deliveries,
  o.description,
  o.features,
  o.features,
  o.differential,
  o.observations,
  o.sort_order,
  true
FROM exact_mayclick_packages o
WHERE NOT EXISTS (
  SELECT 1
  FROM packages p
  WHERE lower(p.category) = lower(o.category)
    AND lower(p.name) = lower(o.name)
);

UPDATE packages
SET active = false, updated_at = CURRENT_TIMESTAMP
WHERE (
  lower(name) IN ('civil', 'completo', 'essencial', 'premium')
  OR lower(name) LIKE '% - silver 1'
  OR lower(name) LIKE '% - chosen 2'
  OR lower(name) LIKE '% - gold 3'
  OR lower(name) LIKE '% - platinum 4'
  OR name LIKE '%Ã%'
  OR name LIKE '%Â%'
)
AND NOT EXISTS (
  SELECT 1
  FROM exact_mayclick_packages o
  WHERE lower(packages.category) = lower(o.category)
    AND lower(packages.name) = lower(o.name)
);

COMMIT;
