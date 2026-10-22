require('dotenv').config({ path: require('path').join(__dirname, '../Backend/.env') });
const { pool } = require('../Backend/src/shared/db');
const request = require('../Backend/node_modules/supertest');
const app = require('../Backend/src/app');

async function runFullStackVerification() {
  console.log('╔══════════════════════════════════════════════════════════════════════════╗');
  console.log('║       GAMERS\'G PRODUCTION FULL-STACK VERIFICATION & COMPLIANCE SUITE      ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════╝\n');

  let passed = 0;
  let total = 9;

  let playerToken = '';
  let adminToken = '';
  let orgToken = '';
  let organizerToken = '';

  // 1. Database & Schema Tables Check
  try {
    const db = await pool.query('SELECT current_database(), current_user');
    const tablesRes = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
    const tableNames = tablesRes.rows.map(r => r.table_name);
    const requiredTables = ['player', 'org', 'team', 'team_member', 'admin', 'org_verification', 'organizer_verification', 'scrim', 'scrim_registration', 'post', 'post_like', 'post_comment'];
    const missing = requiredTables.filter(t => !tableNames.includes(t));
    if (missing.length === 0) {
      console.log(`[PASS 1/9] PostgreSQL Database & Migrations: "${db.rows[0].current_database}" has all required tables (${tableNames.length} total)`);
      passed++;
    } else {
      console.error('[FAIL 1/9] Missing required tables:', missing);
    }
  } catch (err) {
    console.error('[FAIL 1/9] PostgreSQL Connection failed:', err.message);
  }

  // 2. Health Endpoint
  try {
    const res = await request(app).get('/health');
    if (res.status === 200 && res.body.status === 'ok') {
      console.log(`[PASS 2/9] Backend Health Route (GET /health): 200 OK (${res.body.timestamp})`);
      passed++;
    } else {
      console.error('[FAIL 2/9] Health check failed:', res.status, res.body);
    }
  } catch (err) {
    console.error('[FAIL 2/9] Health check failed:', err.message);
  }

  // 3. Multi-Role Authentication (Player, Org, Organizer, Admin)
  try {
    const [pRes, oRes, orgnRes, aRes] = await Promise.all([
      request(app).post('/auth/login').send({ email: 'vortex@gamersg.com', password: 'Password123!', role: 'player' }),
      request(app).post('/auth/login').send({ email: 'management@s8ul.gg', password: 'Password123!', role: 'org' }),
      request(app).post('/auth/login').send({ email: 'admin@skyesports.in', password: 'Password123!', role: 'organizer' }),
      request(app).post('/auth/login').send({ email: 'admin@gamersg.com', password: 'Password123!', role: 'admin' }),
    ]);

    if (pRes.status === 200 && oRes.status === 200 && orgnRes.status === 200 && aRes.status === 200) {
      playerToken = pRes.body.data.token;
      orgToken = oRes.body.data.token;
      organizerToken = orgnRes.body.data.token;
      adminToken = aRes.body.data.token;
      console.log(`[PASS 3/9] Multi-Role Authentication: Player, Org, Organizer, and Admin tokens issued successfully.`);
      passed++;
    } else {
      console.error('[FAIL 3/9] Auth failed:', { p: pRes.status, o: oRes.status, orgn: orgnRes.status, a: aRes.status });
    }
  } catch (err) {
    console.error('[FAIL 3/9] Multi-Role Auth failed:', err.message);
  }

  // 4. Teams Listing & 4-5 Member Registration Rule Validation
  try {
    // Create draft team with player
    const createRes = await request(app)
      .post('/teams')
      .set('Authorization', `Bearer ${playerToken}`)
      .send({
        name: 'Alpha Verification Squad',
        game: 'valorant',
        tag: 'AVS',
        members: [{ name: 'Member Two', ign: 'M2#IND', role: 'Flex' }]
      });

    const team = createRes.body.data;
    const isDraftInitially = team?.status === 'draft';

    // Add 3rd member -> draft
    await request(app)
      .post(`/teams/${team.id}/members`)
      .set('Authorization', `Bearer ${playerToken}`)
      .send({ name: 'Member Three', ign: 'M3#IND', role: 'Support' });

    // Add 4th member -> MUST transition to registered!
    const add4Res = await request(app)
      .post(`/teams/${team.id}/members`)
      .set('Authorization', `Bearer ${playerToken}`)
      .send({ name: 'Member Four', ign: 'M4#IND', role: 'Entry' });

    const isRegisteredNow = add4Res.body.data?.status === 'registered';

    if (isDraftInitially && isRegisteredNow) {
      console.log(`[PASS 4/9] 4-5 Member Registration Rule: Team started in 'draft' (2 members) -> transitioned to 'registered' upon reaching 4 members.`);
      passed++;
    } else {
      console.error('[FAIL 4/9] Registration rule check failed:', { isDraftInitially, isRegisteredNow, body: add4Res.body });
    }
  } catch (err) {
    console.error('[FAIL 4/9] Teams registration rule failed:', err.message);
  }

  // 5. Admin Portal Stats & Verification Pipelines
  try {
    const statsRes = await request(app)
      .get('/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    const orgVerifRes = await request(app)
      .get('/admin/verifications/orgs')
      .set('Authorization', `Bearer ${adminToken}`);

    const orgnVerifRes = await request(app)
      .get('/admin/verifications/organizers')
      .set('Authorization', `Bearer ${adminToken}`);

    if (statsRes.status === 200 && orgVerifRes.status === 200 && orgnVerifRes.status === 200) {
      console.log(`[PASS 5/9] Admin Portal Endpoints: Stats retrieved (${statsRes.body.data.players} athletes, ${statsRes.body.data.teams.registered} registered squads), ${orgVerifRes.body.data.length} org applications, ${orgnVerifRes.body.data.length} organizer applications.`);
      passed++;
    } else {
      console.error('[FAIL 5/9] Admin endpoints failed:', statsRes.status, orgVerifRes.status);
    }
  } catch (err) {
    console.error('[FAIL 5/9] Admin endpoints failed:', err.message);
  }

  // 6. Tournament Organizer Scrim Creation & Dedicated Scrim Lobby
  try {
    const scrimRes = await request(app)
      .post('/tournaments/scrims')
      .set('Authorization', `Bearer ${organizerToken}`)
      .send({
        name: 'VCT Split 2 Night Warmup Scrims',
        game: 'valorant',
        slots_max: 16,
        room_id: 'CUSTOM-ROOM-9090',
        room_password: 'VCT_SECRET_PASS',
      });

    const scrim = scrimRes.body.data;
    const lobbyRes = await request(app).get(`/tournaments/scrims/${scrim.id}`);

    if (lobbyRes.status === 200 && lobbyRes.body.data.room_id === 'CUSTOM-ROOM-9090') {
      console.log(`[PASS 6/9] Dedicated Scrim Lobby: Provisioned with Room ID "${scrim.room_id}" & status "${scrim.status}".`);
      passed++;
    } else {
      console.error('[FAIL 6/9] Scrim lobby check failed:', lobbyRes.status, lobbyRes.body);
    }
  } catch (err) {
    console.error('[FAIL 6/9] Scrim creation failed:', err.message);
  }

  // 7. Player Posting (Text-only LinkedIn style)
  try {
    const postRes = await request(app)
      .post('/social/posts')
      .set('Authorization', `Bearer ${playerToken}`)
      .send({
        content: 'Officially looking for tier-1 scrim opponents for tomorrow 9PM IST. Drop a message to book slot.',
        category: 'LFT / Scrims',
        game: 'valorant'
      });

    if (postRes.status === 201 && postRes.body.data.id) {
      console.log(`[PASS 7/9] Player Posting (LinkedIn-style): Player posted text update without image requirements.`);
      passed++;
    } else {
      console.error('[FAIL 7/9] Player post creation failed:', postRes.status, postRes.body);
    }
  } catch (err) {
    console.error('[FAIL 7/9] Player posting failed:', err.message);
  }

  // 8. Social Feed, Likes & Comments
  try {
    const feedRes = await request(app)
      .get('/social/feed')
      .set('Authorization', `Bearer ${playerToken}`);

    const firstPost = feedRes.body.data?.[0];
    let likeWorked = false;
    let commentWorked = false;

    if (firstPost) {
      const likeRes = await request(app)
        .post(`/social/posts/${firstPost.id}/like`)
        .set('Authorization', `Bearer ${playerToken}`);
      likeWorked = likeRes.status === 200;

      const commentRes = await request(app)
        .post(`/social/posts/${firstPost.id}/comments`)
        .set('Authorization', `Bearer ${playerToken}`)
        .send({ content: 'Great update, let’s schedule comms.' });
      commentWorked = commentRes.status === 200 || commentRes.status === 201;
    }

    if (feedRes.status === 200 && likeWorked && commentWorked) {
      console.log(`[PASS 8/9] Social Network Feed: ${feedRes.body.data.length} posts retrieved with live like & comment interaction.`);
      passed++;
    } else {
      console.error('[FAIL 8/9] Social feed interaction failed:', { feed: feedRes.status, likeWorked, commentWorked });
    }
  } catch (err) {
    console.error('[FAIL 8/9] Social feed failed:', err.message);
  }

  // 9. Discovery Routes
  try {
    const [tRes, trRes] = await Promise.all([
      request(app).get('/discovery/teams'),
      request(app).get('/discovery/tournaments'),
    ]);

    if (tRes.status === 200 && trRes.status === 200) {
      console.log(`[PASS 9/9] Discovery APIs: Teams and Tournaments public discovery endpoints 200 OK.`);
      passed++;
    } else {
      console.error('[FAIL 9/9] Discovery APIs failed:', tRes.status, trRes.status);
    }
  } catch (err) {
    console.error('[FAIL 9/9] Discovery failed:', err.message);
  }

  console.log(`\n══════════════════════════════════════════════════════════════════════════`);
  console.log(`  VERIFICATION SUMMARY: ${passed}/${total} CHECKS PASSED (${Math.round((passed/total)*100)}%)`);
  console.log(`══════════════════════════════════════════════════════════════════════════\n`);

  await pool.end();
  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runFullStackVerification().catch(e => {
  console.error('Test suite error:', e);
  process.exit(1);
});
