const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
const { Pool } = require('pg');

function parseDbConfig(connStr) {
  if (!connStr) return {};
  let cleaned = connStr.trim();
  while (cleaned.startsWith('DATABASE_URL=')) {
    cleaned = cleaned.substring('DATABASE_URL='.length).trim();
  }

  // Handle postgresql://user:password@host:port/dbname where password can contain '@'
  const match = cleaned.match(/^postgres(?:ql)?:\/\/([^:]+):(.*)@([^:/@]+)(?::(\d+))?\/([^?]+)(?:\?.*)?$/);
  if (match) {
    const [, user, password, host, port, database] = match;
    return {
      user: decodeURIComponent(user),
      password: password.includes('%') ? decodeURIComponent(password) : password,
      host: host === 'localhost' ? '127.0.0.1' : host,
      port: port ? Number(port) : 5432,
      database: database.trim(),
    };
  }

  return { connectionString: cleaned };
}

const poolConfig = {
  ...parseDbConfig(process.env.DATABASE_URL),
  max: 20,
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
