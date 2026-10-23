const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const bcrypt = require('bcrypt');
const { pool } = require('./src/shared/db');

async function seedAdmin() {
  console.log('[Seed] Seeding Admin accounts into PostgreSQL (off_ground)...');

  const hashAdmin123 = await bcrypt.hash('Admin@123', 10);
  const hashPassword123 = await bcrypt.hash('Password123!', 10);

  // 1. Primary admin: admin@gamersg.com
  await pool.query(
    `INSERT INTO "admin" (email, password_hash)
     VALUES ('admin@gamersg.com', $1)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [hashAdmin123],
  );

  // 2. Simple admin: admin@admin.com
  await pool.query(
    `INSERT INTO "admin" (email, password_hash)
     VALUES ('admin@admin.com', $1)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [hashAdmin123],
  );

  // 3. Root admin: root@gamersg.com
  await pool.query(
    `INSERT INTO "admin" (email, password_hash)
     VALUES ('root@gamersg.com', $1)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [hashAdmin123],
  );

  console.log('\n=============================================================');
  console.log('  PLATFORM ADMINISTRATOR ACCOUNTS SEEDED SUCCESSFULLY!');
  console.log('=============================================================');
  console.log('  Email:    admin@gamersg.com');
  console.log('  Password: Admin@123  (or Password123!)');
  console.log('-------------------------------------------------------------');
  console.log('  Email:    admin@admin.com');
  console.log('  Password: Admin@123');
  console.log('-------------------------------------------------------------');
  console.log('  Email:    root@gamersg.com');
  console.log('  Password: Admin@123');
  console.log('=============================================================\n');

  await pool.end();
}

seedAdmin().catch((err) => {
  console.error('[Seed Admin Error]', err);
  process.exit(1);
});
