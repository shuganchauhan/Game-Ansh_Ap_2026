require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const { Client } = require('pg');
const { migrate } = require('./src/shared/db/migrate');
const { pool } = require('./src/shared/db');

async function setupDatabase() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL must be set.');
  const databaseUrl = new URL(process.env.DATABASE_URL);
  const databaseName = decodeURIComponent(databaseUrl.pathname.replace(/^\//, ''));
  if (!databaseName || databaseName === 'postgres') throw new Error('DATABASE_URL must name an application database.');

  const adminUrl = new URL(databaseUrl);
  adminUrl.pathname = '/postgres';
  const client = new Client({ connectionString: adminUrl.toString() });
  await client.connect();
  try {
    const exists = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [databaseName]);
    if (!exists.rowCount) {
      const quotedName = `"${databaseName.replace(/"/g, '""')}"`;
      await client.query(`CREATE DATABASE ${quotedName}`);
    }
  } finally {
    await client.end();
  }

  await migrate();
  console.log(`Database ${databaseName} is ready.`);
}

setupDatabase().catch((error) => {
  console.error('[Setup] Database setup failed:', error.message);
  process.exitCode = 1;
}).finally(() => pool.end());
