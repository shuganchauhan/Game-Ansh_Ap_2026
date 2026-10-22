const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const config = {
  host: '127.0.0.1',
  port: 5432,
  user: 'postgres',
  password: 'Sh@gun190120',
};

async function setupDatabase() {
  console.log('[Setup] Connecting to PostgreSQL server...');
  const rootClient = new Client({
    ...config,
    database: 'postgres',
  });

  await rootClient.connect();
  console.log('[Setup] Connected to Postgres root.');

  // Check if off_ground exists
  const checkRes = await rootClient.query("SELECT 1 FROM pg_database WHERE datname = 'off_ground'");
  if (checkRes.rows.length === 0) {
    console.log('[Setup] Database "off_ground" does not exist. Creating...');
    await rootClient.query('CREATE DATABASE off_ground');
    console.log('[Setup] Database "off_ground" created successfully.');
  } else {
    console.log('[Setup] Database "off_ground" already exists.');
  }
  await rootClient.end();

  // Now connect to off_ground
  console.log('[Setup] Connecting to "off_ground" database...');
  const appClient = new Client({
    ...config,
    database: 'off_ground',
  });
  await appClient.connect();
  console.log('[Setup] Connected to "off_ground". Running schema migrations...');

  const schemaPath = path.join(__dirname, '../database/migrations/001_initial_schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  await appClient.query(sql);
  console.log('[Setup] Schema 001_initial_schema.sql executed successfully!');

  // Check existing tables
  const tables = await appClient.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);
  console.log('[Setup] Verified tables in off_ground:');
  tables.rows.forEach(r => console.log(' - ' + r.table_name));

  await appClient.end();
  console.log('[Setup] Database setup complete!');
}

setupDatabase().catch(err => {
  console.error('[Setup] Error setting up database:', err);
  process.exit(1);
});
