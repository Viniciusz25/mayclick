-- Migration: 010_sync_official_packages.sql
-- Description: Upsert official public packages and deactivate legacy generic packages

CREATE TEMP TABLE official_packages_sync (
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  description TEXT NOT NULL,
  features JSONB NOT NULL,
  coverage_time TEXT NOT NULL,
  team TEXT NOT NULL,
  deliveries TEXT NOT NULL,
  sort_order INTEGER NOT NULL
) ON COMMIT DROP;

INSERT INTO official_packages_sync (
  category, name, price, description, features, coverage_time, team, deliveries, sort_order
)
VALUES
  ('infantil', 'Infantil - Silver 1', 690, 'Cobertura fotográfica de até 4 horas de evento, com registros ilimitados de todos os momentos. As imagens são tratadas e entregues em alta resolução por meio de link digital, com acesso a galeria online. Inclui como cortesia um álbum no formato revista, proporcionando uma lembrança física do evento.', '["Cobertura fotográfica de até 4 horas","Registros ilimitados de todos os momentos","Fotos tratadas em alta resolução","Entrega digital via link","Galeria online","Álbum formato revista como cortesia"]'::jsonb, 'Até 4 horas', '1 fotógrafo', 'Fotos editadas em alta resolução via link digital e galeria online.', 10),
  ('infantil', 'Infantil - Chosen 2', 990, 'Cobertura de até 5 horas, com acompanhamento completo da festa. O serviço conta com fotógrafo e produção de conteúdo para redes sociais através de Story Maker, registrando os melhores momentos de forma dinâmica. Todas as fotos são editadas em alta resolução e entregues via link digital, juntamente com vídeos no estilo stories.', '["Cobertura fotográfica de até 5 horas","Acompanhamento completo da festa","Fotógrafo","Story Maker","Produção de conteúdo para redes sociais","Fotos editadas em alta resolução","Entrega digital via link","Vídeos no estilo stories"]'::jsonb, 'Até 5 horas', 'Fotógrafo e Story Maker', 'Fotos editadas em alta resolução, entrega digital via link e vídeos em stories.', 20),
  ('infantil', 'Infantil - Gold 3', 1600, 'Cobertura de até 6 horas com equipe ampliada, composta por dois fotógrafos e filmmaker, garantindo um registro completo do evento. Inclui produção de vídeo retrospectiva com os principais momentos, além de conteúdos em formato reels para redes sociais. Todas as fotos são editadas e entregues digitalmente, acompanhadas de pendrive, fotos reveladas e fotolivro em formato de álbum grande.', '["Cobertura fotográfica de até 6 horas","Equipe com dois fotógrafos","Filmmaker","Registro completo do evento","Vídeo retrospectiva com os principais momentos","Reels para redes sociais","Fotos editadas em alta resolução","Entrega digital","Pendrive personalizado","Fotos reveladas","Fotolivro em formato de álbum grande"]'::jsonb, 'Até 6 horas', '2 fotógrafos e filmmaker', 'Entrega digital, pendrive personalizado, fotos reveladas e fotolivro em álbum grande.', 30),
  ('debutante', 'Debutante - Silver 1', 1500, 'Cobertura fotográfica de até 4 horas do evento, com registros ilimitados. Todas as imagens são tratadas e entregues em alta resolução por meio de link digital, com acesso a uma galeria online para visualização.', '["Cobertura fotográfica de até 4 horas","Registros ilimitados durante o evento","Fotos tratadas em alta resolução","Entrega digital via link","Galeria online para visualização"]'::jsonb, 'Até 4 horas', '1 fotógrafo', 'Fotos tratadas em alta resolução via link digital e galeria online.', 10),
  ('debutante', 'Debutante - Chosen 2', 2500, 'Cobertura de até 5 horas, com registros completos do evento e produção de conteúdos voltados para redes sociais através do Story Maker. Inclui a possibilidade de pré-ensaio ou making of, trazendo ainda mais narrativa ao material final. Todas as fotos são editadas e entregues em alta resolução via link.', '["Cobertura fotográfica de até 5 horas","Registros completos do evento","Produção de conteúdo para redes sociais","Story Maker","Possibilidade de pré-ensaio ou making of","Fotos editadas em alta resolução","Entrega digital via link"]'::jsonb, 'Até 5 horas', 'Fotógrafo e Story Maker', 'Fotos editadas em alta resolução via link.', 20),
  ('debutante', 'Debutante - Gold 3', 3800, 'Cobertura de até 5 horas com registros ilimitados em fotografia e produção de vídeos para redes sociais, como TikTok e Instagram, além de Story Maker. O pacote inclui pré-ensaio ou making of da debutante, garantindo um material mais completo e emocional. A entrega é realizada de forma digital, acompanhada de pendrive personalizado, além de fotos reveladas como brinde.', '["Cobertura fotográfica de até 5 horas","Registros ilimitados em fotografia","Vídeos para redes sociais (TikTok/Instagram)","Story Maker","Pré-ensaio ou making of da debutante","Entrega digital via link","Pendrive personalizado","Fotos reveladas como brinde"]'::jsonb, 'Até 5 horas', 'Fotografia, vídeos para redes sociais e Story Maker', 'Entrega digital, pendrive personalizado e fotos reveladas como brinde.', 30),
  ('debutante', 'Debutante - Platinum 4', 4900, 'Experiência completa com cobertura de até 5 horas, reunindo fotografia, filmagem e produção de conteúdos para redes sociais. Inclui pré-ensaio com fotos, making of, vídeo retrospectiva com edição profissional e materiais dinâmicos como stories e reels. Todo o conteúdo é entregue em alta qualidade de forma digital e também em pendrive, acompanhado de fotos reveladas e um álbum físico personalizado com caixa, tornando o registro ainda mais especial e completo.', '["Cobertura fotográfica de até 5 horas","Fotografia, filmagem e produção de conteúdo para redes sociais","Pré-ensaio com fotos","Making of","Vídeo retrospectiva com edição profissional","Stories e reels","Entrega digital em alta qualidade","Pendrive personalizado","Fotos reveladas","Álbum físico personalizado com caixa"]'::jsonb, 'Até 5 horas', 'Fotografia, filmagem e produção de conteúdo', 'Entrega digital, pendrive, fotos reveladas e álbum físico personalizado com caixa.', 40),
  ('casamento', 'Casamento - Silver 1', 1900, 'Cobertura de até 4 horas com foco nos momentos principais da cerimônia. O serviço é realizado por um fotógrafo, garantindo registros essenciais com sensibilidade e cuidado. Todas as imagens são editadas e entregues em alta resolução por meio de link digital. Indicado para cerimônias em cartório ou comemorações mais íntimas.', '["Cobertura fotográfica de até 4 horas","Registro dos principais momentos da cerimônia","1 fotógrafo","Fotos editadas em alta resolução","Entrega digital via link","Indicado para cartório ou comemorações íntimas"]'::jsonb, 'Até 4 horas', '1 fotógrafo', 'Fotos editadas em alta resolução via link digital.', 10),
  ('casamento', 'Casamento - Chosen 2', 3500, 'Cobertura de até 5 horas com acompanhamento completo do evento, realizada por fotógrafo e auxiliar videomaker. O material contempla todos os momentos do casamento, com fotos tratadas em alta resolução e entrega digital. Inclui também vídeos no estilo stories, registrando os melhores momentos de forma leve e dinâmica. Ideal para cartório seguido de recepção ou mini eventos.', '["Cobertura fotográfica de até 5 horas","Acompanhamento completo do evento","Fotógrafo","Auxiliar videomaker","Fotos tratadas em alta resolução","Entrega digital via link","Vídeos no estilo stories","Ideal para cartório com recepção ou mini eventos"]'::jsonb, 'Até 5 horas', 'Fotógrafo e auxiliar videomaker', 'Fotos tratadas em alta resolução, entrega digital e vídeos em stories.', 20),
  ('casamento', 'Casamento - Gold 3', 5800, 'Cobertura de até 5 horas com equipe composta por dois fotógrafos e videomaker, garantindo um registro mais completo e detalhado. Inclui mini pré-wedding ou making of, agregando ainda mais valor emocional ao material. Todas as fotos são editadas e entregues em alta resolução via link digital, contemplando desde os preparativos até os principais momentos da cerimônia.', '["Cobertura fotográfica de até 5 horas","Equipe com dois fotógrafos","Videomaker","Registro completo e detalhado","Mini pré-wedding ou making of","Fotos editadas em alta resolução","Entrega digital via link","Cobertura dos preparativos e principais momentos"]'::jsonb, 'Até 5 horas', '2 fotógrafos e videomaker', 'Fotos editadas em alta resolução via link digital.', 30),
  ('casamento', 'Casamento - Platinum 4', 8900, 'Cobertura completa de até 5 horas com dois fotógrafos e videomaker, registrando todos os detalhes do casamento com olhar técnico e sensível. O pacote inclui mini pré-wedding, cobertura de cartório, making of da noiva e filmagem completa da cerimônia com edição dos melhores momentos. Também contempla totem fotográfico com fotos reveladas na hora (serviço terceirizado), além da entrega de todas as imagens editadas em alta resolução de forma digital. Uma experiência completa para quem deseja um registro sofisticado e abrangente.', '["Cobertura completa de até 5 horas","Dois fotógrafos","Videomaker","Registro dos detalhes do casamento","Mini pré-wedding","Cobertura de cartório","Making of da noiva","Filmagem completa da cerimônia","Edição dos melhores momentos","Totem fotográfico com fotos reveladas na hora","Entrega digital das imagens editadas em alta resolução"]'::jsonb, 'Até 5 horas', '2 fotógrafos e videomaker', 'Entrega digital das imagens editadas em alta resolução.', 40);

WITH ranked_matches AS (
  SELECT
    p.id,
    o.category,
    o.name,
    ROW_NUMBER() OVER (
      PARTITION BY LOWER(o.category), LOWER(o.name)
      ORDER BY p.created_at ASC NULLS LAST, p.id ASC
    ) AS row_num
  FROM packages p
  JOIN official_packages_sync o
    ON LOWER(p.category) = LOWER(o.category)
   AND LOWER(p.name) = LOWER(o.name)
)
UPDATE packages p
SET
  category = o.category,
  name = o.name,
  price = o.price,
  description = o.description,
  features = o.features,
  coverage_time = o.coverage_time,
  team = o.team,
  deliveries = o.deliveries,
  active = TRUE,
  sort_order = o.sort_order,
  updated_at = CURRENT_TIMESTAMP
FROM ranked_matches m
JOIN official_packages_sync o
  ON LOWER(m.category) = LOWER(o.category)
 AND LOWER(m.name) = LOWER(o.name)
WHERE p.id = m.id
  AND m.row_num = 1;

INSERT INTO packages (
  category, name, price, description, features, coverage_time, team, deliveries, active, sort_order
)
SELECT
  o.category,
  o.name,
  o.price,
  o.description,
  o.features,
  o.coverage_time,
  o.team,
  o.deliveries,
  TRUE,
  o.sort_order
FROM official_packages_sync o
WHERE NOT EXISTS (
  SELECT 1
  FROM packages p
  WHERE LOWER(p.category) = LOWER(o.category)
    AND LOWER(p.name) = LOWER(o.name)
);

WITH ranked_matches AS (
  SELECT
    p.id,
    ROW_NUMBER() OVER (
      PARTITION BY LOWER(p.category), LOWER(p.name)
      ORDER BY p.created_at ASC NULLS LAST, p.id ASC
    ) AS row_num
  FROM packages p
  JOIN official_packages_sync o
    ON LOWER(p.category) = LOWER(o.category)
   AND LOWER(p.name) = LOWER(o.name)
)
UPDATE packages p
SET
  active = FALSE,
  updated_at = CURRENT_TIMESTAMP
FROM ranked_matches m
WHERE p.id = m.id
  AND m.row_num > 1;

UPDATE packages
SET
  active = FALSE,
  updated_at = CURRENT_TIMESTAMP
WHERE (LOWER(category), LOWER(name)) IN (
  ('casamento', 'civil'),
  ('casamento', 'completo'),
  ('infantil', 'essencial'),
  ('infantil', 'premium')
);
