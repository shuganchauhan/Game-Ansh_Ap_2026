const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
const { Pool } = require('pg');

function sanitizeConnStr(connStr) {
  if (!connStr) return '';
  let cleaned = connStr.trim();
  while (cleaned.startsWith('DATABASE_URL=')) {
    cleaned = cleaned.substring('DATABASE_URL='.length).trim();
  }
  // Strip 'psql' prefix if user copied from terminal command tab
  cleaned = cleaned.replace(/^psql\s+/i, '').trim();
  // Strip leading and trailing quotes (' or ")
  cleaned = cleaned.replace(/^['"]+|['"]+$/g, '').trim();
  return cleaned;
}

const rawDbUrl = sanitizeConnStr(process.env.DATABASE_URL);

if (!rawDbUrl) {
  if (process.env.RENDER || process.env.NODE_ENV === 'production') {
    throw new Error(
      '\n=======================================================\n' +
      '[RENDER CONFIGURATION ERROR] DATABASE_URL is missing!\n' +
      'Render Web Services run in an isolated cloud container without a local database.\n' +
      '1. Create a PostgreSQL database on Aiven, Neon, or Render\n' +
      '2. Copy the Service URI (postgres://...)\n' +
      '3. In your Web Service -> Environment tab, add: DATABASE_URL=<URI>\n' +
      '=======================================================\n'
    );
  }
}

if (rawDbUrl && (rawDbUrl.includes('127.0.0.1') || rawDbUrl.includes('localhost')) && (process.env.RENDER || process.env.NODE_ENV === 'production')) {
  throw new Error(
    '\n=======================================================\n' +
    '[RENDER CONFIGURATION ERROR] DATABASE_URL is pointing to 127.0.0.1 / localhost!\n' +
    'Localhost (127.0.0.1) does NOT exist inside cloud containers on Render.\n' +
    'Please copy the cloud Service URI from Aiven/Neon/Render\n' +
    'and paste it into your Render Web Service Environment tab as DATABASE_URL.\n' +
    '=======================================================\n'
  );
}

const { parse: parseConnectionString } = require('pg-connection-string');

function parseDbConfig(connStr) {
  const cleaned = sanitizeConnStr(connStr);
  if (!cleaned) return {};

  const isLocal = cleaned.includes('localhost') || cleaned.includes('127.0.0.1');

  // Strip sslmode from query parameters so pg-connection-string doesn't overwrite our custom ssl object
  const urlWithoutSslMode = cleaned.replace(/([?&])sslmode=[^&]+(&|$)/i, '$1').replace(/[?&]$/, '');

  let parsed = {};
  try {
    parsed = parseConnectionString(urlWithoutSslMode);
    delete parsed.ssl;
    delete parsed.sslmode;
  } catch {
    parsed = { connectionString: cleaned };
  }

  const config = { ...parsed };
  // Automatically enable SSL for cloud-hosted databases (Aiven, Neon, Supabase, Render)
  if (!isLocal) {
    config.ssl = { rejectUnauthorized: false };
  }

  try {
    const host = parsed.host || new URL(cleaned).host;
    const db = parsed.database || new URL(cleaned).pathname.slice(1);
    console.log(`[DB] Connecting to PostgreSQL host: ${host}, database: ${db}, ssl: ${!isLocal}`);
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
