import pg from 'pg';
import { AsyncLocalStorage } from 'node:async_hooks';

const { Pool, Client } = pg;

export const dbContext = new AsyncLocalStorage();

let globalNodePool = null;

export const getPoolConfig = (rawUrl, { isEdge = false } = {}) => {
  const connectionString = rawUrl || process.env.DATABASE_URL;
  const isPooler = Boolean(connectionString && connectionString.includes('pooler.supabase.com'));
  const needsSsl = Boolean(
    !isEdge &&
    !isPooler &&
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
    ssl: needsSsl ? { rejectUnauthorized: false } : false,
  };
};

const getActivePool = () => {
  const requestDb = dbContext.getStore();
  if (requestDb) {
    return requestDb;
  }

  if (!globalNodePool) {
    globalNodePool = new Pool(getPoolConfig(process.env.DATABASE_URL, { isEdge: false }));
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

// Lightweight request-scoped DB wrapper using pg.Client directly (ideal for Cloudflare Workers/Pages)
export const createRequestPool = (connectionString) => {
  const config = getPoolConfig(connectionString, { isEdge: true });
  let sharedClient = null;
  let sharedConnectPromise = null;
  const extraClients = [];

  const getSharedClient = async () => {
    if (!sharedClient) {
      sharedClient = new Client(config);
      sharedConnectPromise = sharedClient.connect();
    }
    await sharedConnectPromise;
    return sharedClient;
  };

  return {
    async query(text, params) {
      const client = await getSharedClient();
      return client.query(text, params);
    },
    async connect() {
      const client = new Client(config);
      await client.connect();
      extraClients.push(client);
      client.release = () => {
        const idx = extraClients.indexOf(client);
        if (idx !== -1) extraClients.splice(idx, 1);
        client.end().catch(() => {});
      };
      return client;
    },
    async end() {
      const tasks = [];
      if (sharedClient) {
        tasks.push(sharedClient.end().catch(() => {}));
        sharedClient = null;
      }
      while (extraClients.length > 0) {
        const c = extraClients.pop();
        tasks.push(c.end().catch(() => {}));
      }
      await Promise.all(tasks);
    },
  };
};

const pool = {
  query: (text, params) => getActivePool().query(text, params),
  connect: () => getActivePool().connect(),
  end: () => (globalNodePool ? globalNodePool.end() : Promise.resolve()),
  on: (event, handler) => getActivePool().on?.(event, handler),
};

export const query = (text, params) => pool.query(text, params);

export default pool;
