import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function createDb() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL nao definida.');
    process.exit(1);
  }

  const databaseUrl = new URL(process.env.DATABASE_URL);
  const dbName = databaseUrl.pathname.replace(/^\//, '');
  databaseUrl.pathname = '/postgres';
  const connectionString = databaseUrl.toString();
  const client = new pg.Client({ connectionString });
  const quotedDbName = `"${dbName.replace(/"/g, '""')}"`;

  try {
    await client.connect();
    console.log('Connected to postgres database.');

    const res = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);

    if (res.rowCount === 0) {
      await client.query(`CREATE DATABASE ${quotedDbName}`);
      console.log(`Database ${dbName} created successfully.`);
    } else {
      console.log(`Database ${dbName} already exists.`);
    }
  } catch (err) {
    console.error('Error creating database:', {
      message: err.message,
      code: err.code,
    });
  } finally {
    await client.end();
  }
}

createDb();
