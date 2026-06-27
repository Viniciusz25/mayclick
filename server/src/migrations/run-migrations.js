import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  const client = await pool.connect();
  let failed = false;
  try {
    console.log('Starting migrations...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        file_name TEXT PRIMARY KEY,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Get all .sql files in the migrations directory
    const files = fs.readdirSync(__dirname)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Run in alphabetical order
    const executedResult = await client.query('SELECT file_name FROM schema_migrations');
    const executedFiles = new Set(executedResult.rows.map((row) => row.file_name));

    for (const file of files) {
      if (executedFiles.has(file)) {
        console.log(`Skipping already executed migration: ${file}`);
        continue;
      }

      console.log(`Running migration: ${file}`);
      const sqlPath = path.join(__dirname, file);
      const sql = fs.readFileSync(sqlPath, 'utf8');

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations (file_name) VALUES ($1) ON CONFLICT (file_name) DO NOTHING',
          [file]
        );
        await client.query('COMMIT');
        console.log(`Migration ${file} completed successfully.`);
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      }
    }

    console.log('All migrations completed.');
  } catch (error) {
    failed = true;
    console.error('Migration failed:', error);
  } finally {
    client.release();
    process.exit(failed ? 1 : 0);
  }
}

runMigrations();
