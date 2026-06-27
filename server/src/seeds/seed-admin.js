import bcrypt from 'bcrypt';
import pool from '../db.js';

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || 'Administrador Mayclick';

  if (!email || !password) {
    console.log('ADMIN_EMAIL e ADMIN_PASSWORD não definidos. Seed de admin ignorado.');
    process.exit();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const check = await pool.query('SELECT id FROM admin_users WHERE email = $1', [email]);

    if (check.rows.length === 0) {
      await pool.query(
        'INSERT INTO admin_users (name, email, password_hash) VALUES ($1, $2, $3)',
        [name, email, passwordHash]
      );
      console.log('Admin user seeded successfully.');
    } else {
      console.log('Admin user already exists.');
    }
  } catch (error) {
    console.error('Error seeding admin:', {
      message: error.message,
      code: error.code,
    });
  } finally {
    process.exit();
  }
}

seedAdmin();
