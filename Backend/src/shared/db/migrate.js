require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool, withTransaction } = require('./index');

async function migrate() {
  const candidateDirs = [
    path.join(__dirname, '../../../../database/migrations'),
    path.join(__dirname, '../../../database/migrations'),
    path.join(process.cwd(), 'database/migrations'),
    path.join(process.cwd(), '../database/migrations'),
  ];
  const migrationsDir = candidateDirs.find((d) => fs.existsSync(d));
  if (!migrationsDir) {
    throw new Error('Migrations directory not found in candidate paths: ' + candidateDirs.join(', '));
  }
  const files = fs.readdirSync(migrationsDir).filter((file) => file.endsWith('.sql')).sort();
  await withTransaction(async (client) => {
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', ['gamersg:migrations']);
    await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
    const applied = await client.query('SELECT filename FROM schema_migrations');
    const appliedFiles = new Set(applied.rows.map((row) => row.filename));

    for (const file of files) {
      if (appliedFiles.has(file)) continue;
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      console.log(`Running migration: ${file}`);
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
    }
  });
  console.log('All migrations complete.');
}

if (require.main === module) migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exitCode = 1;
}).finally(() => pool.end());

module.exports = { migrate };
