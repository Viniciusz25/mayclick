import pool from './db.js';

async function checkConnection() {
  try {
    const res = await pool.query('SELECT 1 as result');
    console.log('PostgreSQL connection successful:', res.rows[0].result === 1);
  } catch (err) {
    console.error('PostgreSQL connection failed:', err.message);
  } finally {
    await pool.end();
  }
}

checkConnection();
