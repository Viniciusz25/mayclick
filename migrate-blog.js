import pool from './server/src/db.js';

async function migrate() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(255) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        cover_image_url TEXT,
        category VARCHAR(100),
        excerpt TEXT,
        content TEXT,
        views INTEGER DEFAULT 0,
        likes INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Check if empty
    const { rowCount } = await pool.query('SELECT id FROM blog_posts LIMIT 1');
    if (rowCount === 0) {
      await pool.query(`
        INSERT INTO blog_posts (slug, title, cover_image_url, category, excerpt, content, views, likes) VALUES
        ('a-magia-das-fotos-de-debutantes', 'A Magia das Fotos de Debutantes', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop', 'Debutantes', 'Como transformamos os 15 anos em um momento inesquecível e digno de cinema.', '<p>Os 15 anos são um marco na vida de qualquer garota. É a transição da infância para a juventude, repleta de sonhos e magia. Neste post, vamos detalhar nossas inspirações e bastidores dos melhores ensaios que já fotografamos. Uma fotografia não é apenas um registro, é uma lembrança que ficará para as próximas gerações.</p><p>Geralmente dividimos o ensaio em três etapas: <strong>A Preparação, A Celebração e Os Retratos da Alma.</strong></p>', 142, 35),
        ('dicas-para-casamento-perfeito', 'Dicas para um Casamento Perfeito ao Ar Livre', 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&auto=format&fit=crop', 'Casamentos', 'O que você precisa saber antes de planejar o seu casamento em lugares abertos.', '<p>Casar ao ar livre traz um charme único e fotografias espetaculares. Porém, a luz do sol e o clima imprevisível exigem preparação minuciosa. O segredo? Escolher a "Golden Hour", a última hora antes do pôr do sol, onde a luz natural envolve todos os convidados com um abraço dourado. Evite ensaios fotográficos ao meio-dia para não criar sombras fortes nos rostos.</p>', 385, 92),
        ('alegria-das-festas-infantis', 'A Alegria Genuína das Festas Infantis', 'https://images.unsplash.com/photo-1518049362265-f5b249d01f52?q=80&w=800&auto=format&fit=crop', 'Infantil', 'Capturando a verdadeira essência da infância.', '<p>Correr, brincar, sorrir. Nas festas infantis, a nossa missão é ser invisível para captar a alegria no seu estado mais puro. Crianças não gostam de posar, elas gostam de viver o momento. É nesse instante que a magia fotográfica acontece: o clique não planejado, a risada não ensaiada.</p>', 201, 48);
      `);
      console.log('Blog posts seeded!');
    } else {
      console.log('Blog posts table already exists and has data.');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

migrate();
