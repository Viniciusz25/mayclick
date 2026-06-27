import pool from '../db.js';

async function seedExtras() {
  try {
    const defaultExtras = [
      { name: 'Hora Extra', price: 190.00, description: 'Valor por hora adicional de cobertura.', sort_order: 10 },
      { name: 'Teaser em Vídeo', price: 250.00, description: 'Vídeo dinâmico para redes sociais.', sort_order: 20 },
      { name: 'Plataforma 360º (4 horas)', price: 600.00, description: 'Vídeos giratórios em slow motion.', sort_order: 30 },
      { name: 'Robô de LED (1 a 2 horas)', price: 600.00, description: 'Atração com luzes e animação.', sort_order: 40 },
      { name: 'Totem Fotográfico com Revelação Ilimitada (4 horas)', price: 1000.00, description: 'Fotos reveladas na hora para convidados.', sort_order: 50 },
      { name: 'Story Maker à parte', price: 350.00, description: 'Cobertura de stories durante o evento.', sort_order: 60 },
    ];

    for (const extra of defaultExtras) {
      const existing = await pool.query(
        'SELECT id FROM extras WHERE lower(name) = lower($1) LIMIT 1',
        [extra.name]
      );

      if (existing.rows.length > 0) {
        await pool.query(
          `UPDATE extras
           SET price = $1,
               description = $2,
               sort_order = $3,
               active = true,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $4`,
          [extra.price, extra.description, extra.sort_order, existing.rows[0].id]
        );
      } else {
        await pool.query(
          `INSERT INTO extras (name, price, description, sort_order, active)
           VALUES ($1, $2, $3, $4, true)`,
          [extra.name, extra.price, extra.description, extra.sort_order]
        );
      }
    }

    console.log('Default extras seeded/updated successfully.');
  } catch (error) {
    console.error('Error seeding extras:', {
      message: error.message,
      code: error.code,
    });
    process.exitCode = 1;
  } finally {
    process.exit();
  }
}

seedExtras();
