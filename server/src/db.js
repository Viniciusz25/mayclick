import pg from 'pg';
import { AsyncLocalStorage } from 'node:async_hooks';

const { Pool } = pg;

export const dbContext = new AsyncLocalStorage();

let globalNodePool = null;

const getPoolConfig = (rawUrl) => {
  const connectionString = rawUrl || process.env.DATABASE_URL;
  const needsSsl = Boolean(
    connectionString && (
      connectionString.includes('supabase.co') ||
      connectionString.includes('supabase.com') ||
      connectionString.includes('sslmode=require')
    )
  );

  const cleanConnectionString = connectionString
    ? connectionString
        .replace(/([?&])sslmode=require(&?)/i, (_, prefix, suffix) => (suffix ? prefix : ''))
        .replace(/[?&]$/, '')
    : connectionString;

  return {
    connectionString: cleanConnectionString,
    ...(needsSsl ? { ssl: { rejectUnauthorized: false } } : {}),
  };
};

const getActivePool = () => {
  const requestPool = dbContext.getStore();
  if (requestPool) {
    return requestPool;
  }

  if (!globalNodePool) {
    globalNodePool = new Pool(getPoolConfig(process.env.DATABASE_URL));
    globalNodePool.on('connect', () => {
      console.log('PostgreSQL connected');
    });
    globalNodePool.on('error', (err) => {
      console.error('Unexpected error on idle client', {
        message: err.message,
        code: err.code,
      });
    });
  }

  return globalNodePool;
};

export const createRequestPool = (connectionString) => {
  return new Pool({
    ...getPoolConfig(connectionString),
    max: 2,
    idleTimeoutMillis: 5000,
    connectionTimeoutMillis: 10000,
  });
};

const pool = {
  query: (text, params) => getActivePool().query(text, params),
  connect: () => getActivePool().connect(),
  end: () => (globalNodePool ? globalNodePool.end() : Promise.resolve()),
  on: (event, handler) => getActivePool().on(event, handler),
};

export const query = (text, params) => pool.query(text, params);

export default pool;
