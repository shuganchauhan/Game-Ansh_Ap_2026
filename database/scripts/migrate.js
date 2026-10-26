require('dotenv').config();
const { migrate } = require('../../Backend/src/shared/db/migrate');
const { pool } = require('../../Backend/src/shared/db');

migrate()
  .catch((error) => {
    console.error('Migration failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
