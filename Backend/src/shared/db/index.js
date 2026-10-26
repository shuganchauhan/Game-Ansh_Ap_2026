const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
const { Pool } = require('pg');

const rawDbUrl = process.env.DATABASE_URL;

if (!rawDbUrl) {
  if (process.env.RENDER || process.env.NODE_ENV === 'production') {
    throw new Error(
      '\n=======================================================\n' +
      '[RENDER CONFIGURATION ERROR] DATABASE_URL is missing!\n' +
      'Render Web Services run in an isolated cloud container without a local database.\n' +
      '1. Create a PostgreSQL database on Render (New + -> PostgreSQL)\n' +
      '2. Copy its "Internal Database URL"\n' +
      '3. In your Web Service -> Environment tab, add: DATABASE_URL=<Internal Database URL>\n' +
      '=======================================================\n'
    );
  }
}

if (rawDbUrl && (rawDbUrl.includes('127.0.0.1') || rawDbUrl.includes('localhost')) && (process.env.RENDER || process.env.NODE_ENV === 'production')) {
  throw new Error(
    '\n=======================================================\n' +
    '[RENDER CONFIGURATION ERROR] DATABASE_URL is pointing to 127.0.0.1 / localhost!\n' +
    'Localhost (127.0.0.1) does NOT exist inside cloud containers on Render.\n' +
    'Please copy the "Internal Database URL" from your Render PostgreSQL database\n' +
    '(looks like: postgresql://user:pass@dpg-xxxxxx.oregon-postgres.render.com/gamers_g)\n' +
    'and paste it into your Render Web Service Environment tab as DATABASE_URL.\n' +
    '=======================================================\n'
  );
}

function parseDbConfig(connStr) {
  if (!connStr) return {};
  let cleaned = connStr.trim();
  while (cleaned.startsWith('DATABASE_URL=')) {
    cleaned = cleaned.substring('DATABASE_URL='.length).trim();
  }

  const config = { connectionString: cleaned };
  // Automatically enable SSL for cloud-hosted databases (Render, Supabase, Neon)
  if (!cleaned.includes('localhost') && !cleaned.includes('127.0.0.1')) {
    config.ssl = { rejectUnauthorized: false };
  }
  try {
    const parsed = new URL(cleaned);
    console.log(`[DB] Connecting to PostgreSQL host: ${parsed.host}, database: ${parsed.pathname.slice(1)}`);
  } catch {}
  return config;
}

const poolConfig = {
  ...parseDbConfig(process.env.DATABASE_URL),
  max: Number(process.env.DB_POOL_MAX) || 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
};

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('[DB Pool Error]', err);
});

async function query(text, params) {
  return pool.query(text, params);
}

async function getClient() {
  return pool.connect();
}

async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { query, getClient, withTransaction, pool };
