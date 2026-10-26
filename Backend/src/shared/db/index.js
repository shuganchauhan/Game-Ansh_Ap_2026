const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
const { Pool } = require('pg');

if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be configured in production.');
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
  return config;
}

const poolConfig = {
  ...parseDbConfig(process.env.DATABASE_URL),
  max: Number(process.env.DB_POOL_MAX) || 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
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
