import bcrypt from 'bcryptjs';
import pool from '../db.js';

async function resetAdminPassword() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('ADMIN_EMAIL e ADMIN_PASSWORD devem estar definidos para atualizar a senha admin.');
    process.exit(1);
  }

  try {
    const result = await pool.query('SELECT id FROM admin_users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      console.error('Admin não encontrado para o e-mail informado.');
      process.exit(1);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await pool.query(
      'UPDATE admin_users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE email = $2',
      [passwordHash, email]
    );

    console.log('Senha admin atualizada com sucesso.');
  } catch (error) {
    console.error('Erro ao atualizar senha admin:', {
      message: error.message,
      code: error.code,
    });
    process.exit(1);
  } finally {
    await pool.end();
  }
}

resetAdminPassword();
