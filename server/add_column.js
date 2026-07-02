import 'dotenv/config';
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  try {
    await pool.query('ALTER TABLE business_settings ADD COLUMN form_page_image_url TEXT;');
    console.log('Column form_page_image_url added successfully.');
  } catch (error) {
    if (error.code === '42701') {
      console.log('Column already exists.');
    } else {
      console.error('Error adding column:', error);
    }
  } finally {
    await pool.end();
  }
}

main();
