export const pricingData = {
  categories: [
    { id: 'infantil', name: 'Festa Infantil' },
    { id: 'debutante', name: 'Debutantes' },
    { id: 'casamento', name: 'Casamentos' }
  ],
  packages: [
    // DEBUTANTE
    {
      id: 'debutante-silver',
      category: 'debutante',
      name: 'Debutante - SILVER 1',
      description: 'Cobertura fotográfica de até 4 horas do evento, com registros ilimitados. Todas as imagens são tratadas e entregues em alta resolução por meio de link digital, com acesso a uma galeria online para visualização.',
      features: [
        'Cobertura fotográfica de até 4 horas',
        'Registros ilimitados durante o evento',
        'Fotos tratadas em alta resolução',
        'Entrega digital via link',
        'Galeria online para visualização'
      ],
      price: 1500.00
    },
    {
      id: 'debutante-chosen',
      category: 'debutante',
      name: 'Debutante - CHOSEN 2',
      description: 'Cobertura de até 5 horas, com registros completos do evento e produção de conteúdos voltados para redes sociais através do Story Maker. Inclui a possibilidade de pré-ensaio ou making of, trazendo ainda mais narrativa ao material final. Todas as fotos são editadas e entregues em alta resolução via link.',
      features: [
        'Cobertura fotográfica de até 5 horas',
        'Registros completos do evento',
        'Produção de conteúdo para redes sociais',
        'Story Maker',
        'Possibilidade de pré-ensaio ou making of',
        'Fotos editadas em alta resolução',
        'Entrega digital via link'
      ],
      price: 2500.00
    },
    {
      id: 'debutante-gold',
      category: 'debutante',
      name: 'Debutante - GOLD 3',
      description: 'Cobertura de até 5 horas com registros ilimitados em fotografia e produção de vídeos para redes sociais, como TikTok e Instagram, além de Story Maker. O pacote inclui pré-ensaio ou making of da debutante, garantindo um material mais completo e emocional. A entrega é realizada de forma digital, acompanhada de pendrive personalizado, além de fotos reveladas como brinde.',
      features: [
        'Cobertura fotográfica de até 5 horas',
        'Registros ilimitados em fotografia',
        'Vídeos para redes sociais (TikTok/Instagram)',
        'Story Maker',
        'Pré-ensaio ou making of da debutante',
        'Entrega digital via link',
        'Pendrive personalizado',
        'Fotos reveladas como brinde'
      ],
      price: 3800.00
    },
    {
      id: 'debutante-platinum',
      category: 'debutante',
      name: 'Debutante - PLATINUM 4',
      description: 'Experiência completa com cobertura de até 5 horas, reunindo fotografia, filmagem e produção de conteúdos para redes sociais. Inclui pré-ensaio com fotos, making of, vídeo retrospectiva com edição profissional e materiais dinâmicos como stories e reels. Todo o conteúdo é entregue em alta qualidade de forma digital e também em pendrive, acompanhado de fotos reveladas e um álbum físico personalizado com caixa, tornando o registro ainda mais especial e completo.',
      features: [
        'Cobertura fotográfica de até 5 horas',
        'Fotografia, filmagem e produção de conteúdo para redes sociais',
        'Pré-ensaio com fotos',
        'Making of',
        'Vídeo retrospectiva com edição profissional',
        'Stories e reels',
        'Entrega digital em alta qualidade',
        'Pendrive personalizado',
        'Fotos reveladas',
        'Álbum físico personalizado com caixa'
      ],
      price: 4900.00
    },

    // INFANTIL
    {
      id: 'infantil-silver',
      category: 'infantil',
      name: 'Infantil - SILVER 1',
      description: 'Cobertura fotográfica de até 4 horas de evento, com registros ilimitados de todos os momentos. As imagens são tratadas e entregues em alta resolução por meio de link digital, com acesso a galeria online. Inclui como cortesia um álbum no formato revista, proporcionando uma lembrança física do evento.',
      features: [
        'Cobertura fotográfica de até 4 horas',
        'Registros ilimitados de todos os momentos',
        'Fotos tratadas em alta resolução',
        'Entrega digital via link',
        'Galeria online',
        'Álbum formato revista como cortesia'
      ],
      price: 690.00
    },
    {
      id: 'infantil-chosen',
      category: 'infantil',
      name: 'Infantil - CHOSEN 2',
      description: 'Cobertura de até 5 horas, com acompanhamento completo da festa. O serviço conta com fotógrafo e produção de conteúdo para redes sociais através de Story Maker, registrando os melhores momentos de forma dinâmica. Todas as fotos são editadas em alta resolução e entregues via link digital, juntamente com vídeos no estilo stories.',
      features: [
        'Cobertura fotográfica de até 5 horas',
        'Acompanhamento completo da festa',
        'Fotógrafo',
        'Story Maker',
        'Produção de conteúdo para redes sociais',
        'Fotos editadas em alta resolução',
        'Entrega digital via link',
        'Vídeos no estilo stories'
      ],
      price: 990.00
    },
    {
      id: 'infantil-gold',
      category: 'infantil',
      name: 'Infantil - GOLD 3',
      description: 'Cobertura de até 6 horas com equipe ampliada, composta por dois fotógrafos e filmmaker, garantindo um registro completo do evento. Inclui produção de vídeo retrospectiva com os principais momentos, além de conteúdos em formato reels para redes sociais. Todas as fotos são editadas e entregues digitalmente, acompanhadas de pendrive, fotos reveladas e fotolivro em formato de álbum grande.',
      features: [
        'Cobertura fotográfica de até 6 horas',
        'Equipe com dois fotógrafos',
        'Filmmaker',
        'Registro completo do evento',
        'Vídeo retrospectiva com os principais momentos',
        'Reels para redes sociais',
        'Fotos editadas em alta resolução',
        'Entrega digital',
        'Pendrive personalizado',
        'Fotos reveladas',
        'Fotolivro em formato de álbum grande'
      ],
      price: 1600.00
    },

    // CASAMENTO
    {
      id: 'casamento-silver',
      category: 'casamento',
      name: 'Casamento - SILVER 1',
      description: 'Cobertura de até 4 horas com foco nos momentos principais da cerimônia. O serviço é realizado por um fotógrafo, garantindo registros essenciais com sensibilidade e cuidado. Todas as imagens são editadas e entregues em alta resolução por meio de link digital. Indicado para cerimônias em cartório ou comemorações mais íntimas.',
      features: [
        'Cobertura fotográfica de até 4 horas',
        'Registro dos principais momentos da cerimônia',
        '1 fotógrafo',
        'Fotos editadas em alta resolução',
        'Entrega digital via link',
        'Indicado para cartório ou comemorações íntimas'
      ],
      price: 1900.00
    },
    {
      id: 'casamento-chosen',
      category: 'casamento',
      name: 'Casamento - CHOSEN 2',
      description: 'Cobertura de até 5 horas com acompanhamento completo do evento, realizada por fotógrafo e auxiliar videomaker. O material contempla todos os momentos do casamento, com fotos tratadas em alta resolução e entrega digital. Inclui também vídeos no estilo stories, registrando os melhores momentos de forma leve e dinâmica. Ideal para cartório seguido de recepção ou mini eventos.',
      features: [
        'Cobertura fotográfica de até 5 horas',
        'Acompanhamento completo do evento',
        'Fotógrafo',
        'Auxiliar videomaker',
        'Fotos tratadas em alta resolução',
        'Entrega digital via link',
        'Vídeos no estilo stories',
        'Ideal para cartório com recepção ou mini eventos'
      ],
      price: 3500.00
    },
    {
      id: 'casamento-gold',
      category: 'casamento',
      name: 'Casamento - GOLD 3',
      description: 'Cobertura de até 5 horas com equipe composta por dois fotógrafos e videomaker, garantindo um registro mais completo e detalhado. Inclui mini pré-wedding ou making of, agregando ainda mais valor emocional ao material. Todas as fotos são editadas e entregues em alta resolução via link digital, contemplando desde os preparativos até os principais momentos da cerimônia.',
      features: [
        'Cobertura fotográfica de até 5 horas',
        'Equipe com dois fotógrafos',
        'Videomaker',
        'Registro completo e detalhado',
        'Mini pré-wedding ou making of',
        'Fotos editadas em alta resolução',
        'Entrega digital via link',
        'Cobertura dos preparativos e principais momentos'
      ],
      price: 5800.00
    },
    {
      id: 'casamento-platinum',
      category: 'casamento',
      name: 'Casamento - PLATINUM 4',
      description: 'Cobertura completa de até 5 horas com dois fotógrafos e videomaker, registrando todos os detalhes do casamento com olhar técnico e sensível. O pacote inclui mini pré-wedding, cobertura de cartório, making of da noiva e filmagem completa da cerimônia com edição dos melhores momentos. Também contempla totem fotográfico com fotos reveladas na hora (serviço terceirizado), além da entrega de todas as imagens editadas em alta resolução de forma digital. Uma experiência completa para quem deseja um registro sofisticado e abrangente.',
      features: [
        'Cobertura completa de até 5 horas',
        'Dois fotógrafos',
        'Videomaker',
        'Registro dos detalhes do casamento',
        'Mini pré-wedding',
        'Cobertura de cartório',
        'Making of da noiva',
        'Filmagem completa da cerimônia',
        'Edição dos melhores momentos',
        'Totem fotográfico com fotos reveladas na hora',
        'Entrega digital das imagens editadas em alta resolução'
      ],
      price: 8900.00
    }
  ],
  modalities: [
    {
      id: 'hora-extra',
      name: 'Hora Extra',
      description: 'Valor por hora adicional de evento.',
      price: 190.00
    },
    {
      id: 'video-teaser',
      name: 'Teaser em Vídeo',
      description: 'Vídeo dinâmico para redes sociais.',
      price: 250.00
    },
    {
      id: 'plataforma-360',
      name: 'Plataforma 360º (4 horas)',
      description: 'Vídeos giratórios em slow motion.',
      price: 600.00
    },
    {
      id: 'robo-led',
      name: 'Robô de LED (1 a 2 horas)',
      description: 'Atração com luzes e animação.',
      price: 600.00
    },
    {
      id: 'totem-foto',
      name: 'Totem Fotográfico com Revelação Ilimitada (4 horas)',
      description: 'Fotos reveladas na hora para convidados.',
      price: 1000.00
    },
    {
      id: 'story-maker',
      name: 'Story Maker à parte',
      description: 'Cobertura de stories durante o evento.',
      price: 350.00
    }
  ],
  transport: [
    { id: 'isento', name: 'Isento', price: 0 },
    { id: 'local', name: 'Deslocamento Local', price: 50.00 },
    { id: 'regional', name: 'Deslocamento Regional', price: 150.00 }
  ]
};
