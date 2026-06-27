-- Migration: 015_seed_official_mayclick_packages.sql
-- Description: Seed official Mayclick packages/extras and deactivate legacy package names

ALTER TABLE packages ADD COLUMN IF NOT EXISTS label TEXT;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS comparison_items JSONB DEFAULT '[]'::jsonb;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS differential TEXT;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS observations TEXT;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS coverage_time TEXT;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS team TEXT;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS deliveries TEXT;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE packages ALTER COLUMN features SET DEFAULT '[]'::jsonb;
ALTER TABLE packages ALTER COLUMN comparison_items SET DEFAULT '[]'::jsonb;
ALTER TABLE packages ALTER COLUMN active SET DEFAULT TRUE;
ALTER TABLE packages ALTER COLUMN sort_order SET DEFAULT 0;

CREATE TEMP TABLE official_mayclick_packages (
  category TEXT,
  name TEXT,
  label TEXT,
  price NUMERIC,
  coverage_time TEXT,
  team TEXT,
  deliveries TEXT,
  description TEXT,
  differential TEXT,
  observations TEXT,
  sort_order INTEGER,
  features JSONB
) ON COMMIT DROP;

INSERT INTO official_mayclick_packages
(category, name, label, price, coverage_time, team, deliveries, description, differential, observations, sort_order, features)
VALUES
('infantil','Infantil - Essencial','Essencial',690,'Ate 4 horas','1 fotografo','Entrega via link digital e galeria online.','Cobertura fotografica infantil essencial para festas e comemoracoes.','Pacote enxuto para registrar os principais momentos com fotos tratadas em alta resolucao.','Album formato revista como cortesia.',10,
'[
  {"label":"Fotos tratadas em alta resolucao","type":"boolean","included":true,"value":""},
  {"label":"Story Maker","type":"boolean","included":false,"value":""},
  {"label":"Video retrospectiva","type":"boolean","included":false,"value":""},
  {"label":"Videos/Reels","type":"boolean","included":false,"value":""},
  {"label":"Making of","type":"boolean","included":false,"value":""},
  {"label":"Pre-ensaio","type":"boolean","included":false,"value":""},
  {"label":"Cabine fotografica/Totem","type":"boolean","included":false,"value":""},
  {"label":"Fotos reveladas na hora","type":"boolean","included":false,"value":""},
  {"label":"Album incluso","type":"text","included":true,"value":"Album revista 10x15"},
  {"label":"Pen drive","type":"boolean","included":false,"value":""},
  {"label":"Entrega via link/galeria online","type":"boolean","included":true,"value":""},
  {"label":"Cortesia","type":"text","included":true,"value":"Album formato revista"}
]'::jsonb),
('infantil','Infantil - Experience','Experience',990,'Ate 5 horas','Fotografo e Story Maker','Entrega via link digital, galeria online e videos em stories.','Cobertura infantil com acompanhamento ampliado e Story Maker.','Inclui producao de conteudo para redes sociais durante a festa.','',20,
'[
  {"label":"Fotos tratadas em alta resolucao","type":"boolean","included":true,"value":""},
  {"label":"Story Maker","type":"boolean","included":true,"value":""},
  {"label":"Video retrospectiva","type":"boolean","included":false,"value":""},
  {"label":"Videos/Reels","type":"text","included":true,"value":"Videos em stories"},
  {"label":"Making of","type":"boolean","included":false,"value":""},
  {"label":"Pre-ensaio","type":"boolean","included":false,"value":""},
  {"label":"Cabine fotografica/Totem","type":"boolean","included":false,"value":""},
  {"label":"Fotos reveladas na hora","type":"boolean","included":false,"value":""},
  {"label":"Album incluso","type":"boolean","included":false,"value":""},
  {"label":"Pen drive","type":"boolean","included":false,"value":""},
  {"label":"Entrega via link/galeria online","type":"boolean","included":true,"value":""}
]'::jsonb),
('infantil','Infantil - Premium','Premium',1600,'Ate 6 horas','2 fotografos e filmmaker','Entrega digital, pendrive personalizado, fotos reveladas e fotolivro.','Cobertura infantil premium com fotografia, video e entregas fisicas.','Registro completo com equipe ampliada, retrospectiva e materiais para redes sociais.','Inclui fotolivro em formato de album grande.',30,
'[
  {"label":"Fotos tratadas em alta resolucao","type":"boolean","included":true,"value":""},
  {"label":"Story Maker","type":"boolean","included":false,"value":""},
  {"label":"Video retrospectiva","type":"boolean","included":true,"value":""},
  {"label":"Videos/Reels","type":"boolean","included":true,"value":""},
  {"label":"Making of","type":"boolean","included":false,"value":""},
  {"label":"Pre-ensaio","type":"boolean","included":false,"value":""},
  {"label":"Cabine fotografica/Totem","type":"boolean","included":false,"value":""},
  {"label":"Fotos reveladas na hora","type":"text","included":true,"value":"Fotos reveladas inclusas"},
  {"label":"Album incluso","type":"text","included":true,"value":"Fotolivro em album grande"},
  {"label":"Pen drive","type":"boolean","included":true,"value":""},
  {"label":"Entrega via link/galeria online","type":"boolean","included":true,"value":""}
]'::jsonb),
('debutante','Debutante - Essencial','Essencial',1500,'Ate 4 horas','1 fotografo','Entrega via link digital e galeria online.','Cobertura fotografica essencial para debutante.','Cobertura objetiva para registrar os momentos principais da festa.','',10,
'[
  {"label":"Fotos tratadas em alta resolucao","type":"boolean","included":true,"value":""},
  {"label":"Story Maker","type":"boolean","included":false,"value":""},
  {"label":"Video retrospectiva","type":"boolean","included":false,"value":""},
  {"label":"Videos/Reels","type":"boolean","included":false,"value":""},
  {"label":"Making of","type":"boolean","included":false,"value":""},
  {"label":"Pre-ensaio","type":"boolean","included":false,"value":""},
  {"label":"Cabine fotografica/Totem","type":"boolean","included":false,"value":""},
  {"label":"Fotos reveladas na hora","type":"boolean","included":false,"value":""},
  {"label":"Album incluso","type":"boolean","included":false,"value":""},
  {"label":"Pen drive","type":"boolean","included":false,"value":""},
  {"label":"Entrega via link/galeria online","type":"boolean","included":true,"value":""}
]'::jsonb),
('debutante','Debutante - Experience','Experience',2500,'Ate 5 horas','Fotografo e Story Maker','Entrega via link digital e galeria online.','Cobertura de debutante com Story Maker e narrativa ampliada.','Conteudo para redes sociais e possibilidade de pre-ensaio ou making of.','',20,
'[
  {"label":"Fotos tratadas em alta resolucao","type":"boolean","included":true,"value":""},
  {"label":"Story Maker","type":"boolean","included":true,"value":""},
  {"label":"Video retrospectiva","type":"boolean","included":false,"value":""},
  {"label":"Videos/Reels","type":"text","included":true,"value":"Conteudo para redes sociais"},
  {"label":"Making of","type":"text","included":true,"value":"Possibilidade de making of"},
  {"label":"Pre-ensaio","type":"text","included":true,"value":"Possibilidade de pre-ensaio"},
  {"label":"Cabine fotografica/Totem","type":"boolean","included":false,"value":""},
  {"label":"Fotos reveladas na hora","type":"boolean","included":false,"value":""},
  {"label":"Album incluso","type":"boolean","included":false,"value":""},
  {"label":"Pen drive","type":"boolean","included":false,"value":""},
  {"label":"Entrega via link/galeria online","type":"boolean","included":true,"value":""}
]'::jsonb),
('debutante','Debutante - Completo','Completo',3800,'Ate 5 horas','Fotografia, videos para redes sociais e Story Maker','Entrega digital, pendrive personalizado e fotos reveladas como brinde.','Pacote completo para debutante com fotografia e conteudo social.','Inclui pre-ensaio ou making of e materiais para TikTok/Instagram.','Fotos reveladas como brinde.',30,
'[
  {"label":"Fotos tratadas em alta resolucao","type":"boolean","included":true,"value":""},
  {"label":"Story Maker","type":"boolean","included":true,"value":""},
  {"label":"Video retrospectiva","type":"boolean","included":false,"value":""},
  {"label":"Videos/Reels","type":"text","included":true,"value":"Videos para TikTok/Instagram"},
  {"label":"Making of","type":"text","included":true,"value":"Pre-ensaio ou making of"},
  {"label":"Pre-ensaio","type":"text","included":true,"value":"Pre-ensaio ou making of"},
  {"label":"Cabine fotografica/Totem","type":"boolean","included":false,"value":""},
  {"label":"Fotos reveladas na hora","type":"boolean","included":false,"value":""},
  {"label":"Album incluso","type":"boolean","included":false,"value":""},
  {"label":"Pen drive","type":"boolean","included":true,"value":""},
  {"label":"Entrega via link/galeria online","type":"boolean","included":true,"value":""},
  {"label":"Cortesia","type":"text","included":true,"value":"Fotos reveladas como brinde"}
]'::jsonb),
('debutante','Debutante - Premium','Premium',4900,'Ate 5 horas','Fotografia, filmagem e producao de conteudo','Entrega digital, pendrive, fotos reveladas e album fisico personalizado com caixa.','Cobertura premium para debutante com fotografia, filmagem e album.','Experiencia completa com pre-ensaio, making of, retrospectiva e album fisico.','Album fisico personalizado com caixa.',40,
'[
  {"label":"Fotos tratadas em alta resolucao","type":"boolean","included":true,"value":""},
  {"label":"Story Maker","type":"boolean","included":true,"value":""},
  {"label":"Video retrospectiva","type":"boolean","included":true,"value":""},
  {"label":"Videos/Reels","type":"text","included":true,"value":"Stories e reels"},
  {"label":"Making of","type":"boolean","included":true,"value":""},
  {"label":"Pre-ensaio","type":"text","included":true,"value":"Pre-ensaio com fotos"},
  {"label":"Cabine fotografica/Totem","type":"boolean","included":false,"value":""},
  {"label":"Fotos reveladas na hora","type":"text","included":true,"value":"Fotos reveladas inclusas"},
  {"label":"Album incluso","type":"text","included":true,"value":"Album fisico personalizado com caixa"},
  {"label":"Pen drive","type":"boolean","included":true,"value":""},
  {"label":"Entrega via link/galeria online","type":"boolean","included":true,"value":""}
]'::jsonb),
('casamento','Casamento - Cartório','Cartório',1900,'Ate 4 horas','1 fotografo','Fotos editadas em alta resolucao via link digital.','Cobertura de casamento em cartorio ou evento intimista.','Indicado para cartorio ou comemoracoes intimas.','',10,
'[
  {"label":"Fotos tratadas em alta resolucao","type":"boolean","included":true,"value":""},
  {"label":"Story Maker","type":"boolean","included":false,"value":""},
  {"label":"Video retrospectiva","type":"boolean","included":false,"value":""},
  {"label":"Videos/Reels","type":"boolean","included":false,"value":""},
  {"label":"Making of","type":"boolean","included":false,"value":""},
  {"label":"Pre-wedding","type":"boolean","included":false,"value":""},
  {"label":"Cabine fotografica/Totem","type":"boolean","included":false,"value":""},
  {"label":"Fotos reveladas na hora","type":"boolean","included":false,"value":""},
  {"label":"Album incluso","type":"boolean","included":false,"value":""},
  {"label":"Pen drive","type":"boolean","included":false,"value":""},
  {"label":"Entrega via link/galeria online","type":"boolean","included":true,"value":""}
]'::jsonb),
('casamento','Casamento - Experience','Experience',3500,'Ate 5 horas','Fotografo e auxiliar videomaker','Fotos tratadas em alta resolucao, entrega digital e videos em stories.','Cobertura de casamento com fotos e videos em stories.','Ideal para cartorio seguido de recepcao ou mini eventos.','',20,
'[
  {"label":"Fotos tratadas em alta resolucao","type":"boolean","included":true,"value":""},
  {"label":"Story Maker","type":"text","included":true,"value":"Videos no estilo stories"},
  {"label":"Video retrospectiva","type":"boolean","included":false,"value":""},
  {"label":"Videos/Reels","type":"text","included":true,"value":"Videos em stories"},
  {"label":"Making of","type":"boolean","included":false,"value":""},
  {"label":"Pre-wedding","type":"boolean","included":false,"value":""},
  {"label":"Cabine fotografica/Totem","type":"boolean","included":false,"value":""},
  {"label":"Fotos reveladas na hora","type":"boolean","included":false,"value":""},
  {"label":"Album incluso","type":"boolean","included":false,"value":""},
  {"label":"Pen drive","type":"boolean","included":false,"value":""},
  {"label":"Entrega via link/galeria online","type":"boolean","included":true,"value":""}
]'::jsonb),
('casamento','Casamento - Completo','Completo',5800,'Ate 5 horas','2 fotografos e videomaker','Fotos editadas em alta resolucao via link digital.','Cobertura completa de casamento com fotografia e videomaker.','Registro mais completo com mini pre-wedding ou making of.','',30,
'[
  {"label":"Fotos tratadas em alta resolucao","type":"boolean","included":true,"value":""},
  {"label":"Story Maker","type":"boolean","included":false,"value":""},
  {"label":"Video retrospectiva","type":"boolean","included":false,"value":""},
  {"label":"Videos/Reels","type":"boolean","included":false,"value":""},
  {"label":"Making of","type":"text","included":true,"value":"Mini pre-wedding ou making of"},
  {"label":"Pre-wedding","type":"text","included":true,"value":"Mini pre-wedding ou making of"},
  {"label":"Cabine fotografica/Totem","type":"boolean","included":false,"value":""},
  {"label":"Fotos reveladas na hora","type":"boolean","included":false,"value":""},
  {"label":"Album incluso","type":"boolean","included":false,"value":""},
  {"label":"Pen drive","type":"boolean","included":false,"value":""},
  {"label":"Entrega via link/galeria online","type":"boolean","included":true,"value":""}
]'::jsonb),
('casamento','Casamento - Premium','Premium',8900,'Ate 5 horas','2 fotografos e videomaker','Entrega digital das imagens editadas em alta resolucao.','Cobertura premium de casamento com fotografia, video e experiencia completa.','Experiencia completa com mini pre-wedding, cartorio, making of e totem fotografico.','Totem fotografico com fotos reveladas na hora e servico terceirizado.',40,
'[
  {"label":"Fotos tratadas em alta resolucao","type":"boolean","included":true,"value":""},
  {"label":"Story Maker","type":"boolean","included":false,"value":""},
  {"label":"Video retrospectiva","type":"text","included":true,"value":"Edicao dos melhores momentos"},
  {"label":"Videos/Reels","type":"boolean","included":false,"value":""},
  {"label":"Making of","type":"text","included":true,"value":"Making of da noiva"},
  {"label":"Pre-wedding","type":"text","included":true,"value":"Mini pre-wedding"},
  {"label":"Cabine fotografica/Totem","type":"text","included":true,"value":"Totem fotografico"},
  {"label":"Fotos reveladas na hora","type":"text","included":true,"value":"Fotos reveladas no totem"},
  {"label":"Album incluso","type":"boolean","included":false,"value":""},
  {"label":"Pen drive","type":"boolean","included":false,"value":""},
  {"label":"Entrega via link/galeria online","type":"boolean","included":true,"value":""},
  {"label":"Cortesia","type":"text","included":true,"value":"Cobertura de cartorio"}
]'::jsonb);

UPDATE packages p
SET
  label = o.label,
  price = o.price,
  description = o.description,
  features = o.features,
  comparison_items = o.features,
  coverage_time = o.coverage_time,
  team = o.team,
  deliveries = o.deliveries,
  differential = o.differential,
  observations = o.observations,
  sort_order = o.sort_order,
  active = true,
  updated_at = CURRENT_TIMESTAMP
FROM official_mayclick_packages o
WHERE lower(p.category) = lower(o.category)
  AND lower(p.name) = lower(o.name);

INSERT INTO packages
(category, name, label, price, description, features, comparison_items, coverage_time, team, deliveries, differential, observations, sort_order, active)
SELECT o.category, o.name, o.label, o.price, o.description, o.features, o.features, o.coverage_time, o.team, o.deliveries, o.differential, o.observations, o.sort_order, true
FROM official_mayclick_packages o
WHERE NOT EXISTS (
  SELECT 1 FROM packages p
  WHERE lower(p.category) = lower(o.category)
    AND lower(p.name) = lower(o.name)
);

UPDATE packages
SET active = false, updated_at = CURRENT_TIMESTAMP
WHERE lower(name) IN ('civil', 'completo', 'essencial', 'premium')
   OR lower(name) LIKE '% - silver 1'
   OR lower(name) LIKE '% - chosen 2'
   OR lower(name) LIKE '% - gold 3'
   OR lower(name) LIKE '% - platinum 4';

ALTER TABLE extras ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE extras ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT 0;
ALTER TABLE extras ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;
ALTER TABLE extras ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE extras ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE extras ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

CREATE TEMP TABLE official_mayclick_extras (
  name TEXT,
  price NUMERIC,
  description TEXT,
  sort_order INTEGER
) ON COMMIT DROP;

INSERT INTO official_mayclick_extras (name, price, description, sort_order)
VALUES
('Hora Extra', 190, 'Valor por hora adicional de cobertura.', 10),
('Teaser em Vídeo', 250, 'Video dinamico para redes sociais.', 20),
('Plataforma 360º (4 horas)', 600, 'Videos giratorios em slow motion.', 30),
('Robô de LED (1 a 2 horas)', 600, 'Atracao com luzes e animacao.', 40),
('Totem Fotográfico com Revelação Ilimitada (4 horas)', 1000, 'Fotos reveladas na hora para convidados.', 50),
('Story Maker à parte', 350, 'Cobertura de stories durante o evento.', 60);

UPDATE extras e
SET price = o.price,
    description = o.description,
    sort_order = o.sort_order,
    active = true,
    updated_at = CURRENT_TIMESTAMP
FROM official_mayclick_extras o
WHERE lower(e.name) = lower(o.name);

INSERT INTO extras (name, price, description, sort_order, active)
SELECT o.name, o.price, o.description, o.sort_order, true
FROM official_mayclick_extras o
WHERE NOT EXISTS (
  SELECT 1 FROM extras e WHERE lower(e.name) = lower(o.name)
);
