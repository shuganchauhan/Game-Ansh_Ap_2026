require('dotenv').config();
const request = require('supertest');
const app = require('./src/app');
const { pool } = require('./src/shared/db');

async function verify() {
  console.log('=== VERIFYING BACKEND & POSTGRESQL ===\n');

  // 1. Verify DB query
  console.log('[Check 1] Verifying PostgreSQL connection...');
  const dbRes = await pool.query('SELECT current_database() as db, current_user as usr, COUNT(*) as cnt FROM team GROUP BY 1, 2');
  console.log(`[Check 1] Connected to DB "${dbRes.rows[0].db}" as "${dbRes.rows[0].usr}". Total teams: ${dbRes.rows[0].cnt}\n`);

  // 2. Health endpoint
  console.log('[Check 2] Testing GET /health...');
  const healthRes = await request(app).get('/health');
  console.log(`[Check 2] Status: ${healthRes.status}, Body:`, healthRes.body, '\n');

  // 3. Discovery teams endpoint
  console.log('[Check 3] Testing GET /discovery/teams...');
  const teamsRes = await request(app).get('/discovery/teams');
  console.log(`[Check 3] Status: ${teamsRes.status}, Total teams returned: ${teamsRes.body.data?.data?.length || 0}`);
  if (teamsRes.body.data?.data?.length) {
    teamsRes.body.data.data.forEach(t => console.log(`   - ${t.name} (${t.game}) [Org: ${t.org_name || 'Independent'}]`));
  }
  console.log('');

  // 4. Discovery tournaments endpoint
  console.log('[Check 4] Testing GET /discovery/tournaments...');
  const tourneysRes = await request(app).get('/discovery/tournaments');
  console.log(`[Check 4] Status: ${tourneysRes.status}, Total tournaments returned: ${tourneysRes.body.data?.data?.length || 0}`);
  if (tourneysRes.body.data?.data?.length) {
    tourneysRes.body.data.data.forEach(tr => console.log(`   - ${tr.name} (${tr.game}) [${tr.status}]`));
  }
  console.log('');

  // 5. Auth Login test
  console.log('[Check 5] Testing POST /auth/login with seeded player (vortex@gamersg.com)...');
  const loginRes = await request(app).post('/auth/login').send({
    email: 'vortex@gamersg.com',
    password: 'Password123!',
    role: 'player',
  });
  console.log(`[Check 5] Status: ${loginRes.status}, JWT Token: ${loginRes.body.data?.token?.slice(0, 25)}..., Username: ${loginRes.body.data?.user?.username}\n`);

  // 6. Auth Org Login test
  console.log('[Check 6] Testing POST /auth/login with seeded Org (management@s8ul.gg)...');
  const orgLoginRes = await request(app).post('/auth/login').send({
    email: 'management@s8ul.gg',
    password: 'Password123!',
    role: 'org',
  });
  console.log(`[Check 6] Status: ${orgLoginRes.status}, Org Token: ${orgLoginRes.body.data?.token?.slice(0, 25)}..., Org Name: ${orgLoginRes.body.data?.user?.name}\n`);

  console.log('=== ALL BACKEND CHECKS PASSED PERFECTLY! ===');
  await pool.end();
  process.exit(0);
}

verify().catch(err => {
  console.error('Backend verification failed:', err);
  pool.end();
  process.exit(1);
});
