import pool from '../src/db.js';

const seedTestimonials = async () => {
  try {
    // Clear old testimonials (optional, but requested 3 examples)
    await pool.query('DELETE FROM testimonials');

    const examples = [
      {
        client_name: 'Mariana & Lucas',
        client_photo_url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=150&q=80',
        content: 'Foi a melhor escolha que fizemos para o nosso casamento. A equipe foi super atenciosa, as fotos ficaram parecendo cena de cinema e a entrega foi super rápida. Recomendamos de olhos fechados!',
        stars: 5,
        sort_order: 1
      },
      {
        client_name: 'Isabella Mendes',
        client_photo_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
        content: 'Meus 15 anos não seriam os mesmos sem o olhar incrível da Mayclick! Cada detalhe da festa foi registrado com muita sensibilidade. Eu me emociono toda vez que vejo o álbum.',
        stars: 5,
        sort_order: 2
      },
      {
        client_name: 'Carlos e Renata',
        client_photo_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
        content: 'Profissionalismo do começo ao fim. A prévia que recebemos já nos deixou sem palavras. Eles têm um dom para capturar emoções verdadeiras e momentos espontâneos. Muito obrigado!',
        stars: 5,
        sort_order: 3
      }
    ];

    for (const t of examples) {
      await pool.query(
        `INSERT INTO testimonials (client_name, client_photo_url, content, stars, sort_order)
         VALUES ($1, $2, $3, $4, $5)`,
        [t.client_name, t.client_photo_url, t.content, t.stars, t.sort_order]
      );
    }
    console.log('Testimonials seeded successfully!');
  } catch (err) {
    console.error('Error seeding testimonials:', err);
  } finally {
    process.exit(0);
  }
};

seedTestimonials();
