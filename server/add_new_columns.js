import 'dotenv/config';
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  try {
    await pool.query('ALTER TABLE business_settings ADD COLUMN hide_prices BOOLEAN DEFAULT false;');
    console.log('Column hide_prices added successfully.');
  } catch (error) {
    if (error.code === '42701') {
      console.log('Column hide_prices already exists.');
    } else {
      console.error('Error adding column hide_prices:', error);
    }
  }

  try {
    await pool.query('ALTER TABLE business_settings ADD COLUMN hide_promo_banner BOOLEAN DEFAULT false;');
    console.log('Column hide_promo_banner added successfully.');
  } catch (error) {
    if (error.code === '42701') {
      console.log('Column hide_promo_banner already exists.');
    } else {
      console.error('Error adding column hide_promo_banner:', error);
    }
  }
  
  await pool.end();
}

main();
