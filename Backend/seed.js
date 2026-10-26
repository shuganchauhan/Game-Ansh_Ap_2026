const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const bcrypt = require('bcrypt');
const { pool } = require('./src/shared/db');

if (process.env.ALLOW_DEMO_SEED !== 'true') {
  throw new Error('Demo seed data is disabled. Set ALLOW_DEMO_SEED=true to opt in.');
}

async function seed() {
  console.log('[Seed] Populating full production data into PostgreSQL (off_ground)...');
  const hash = await bcrypt.hash('Password123!', 10);

  // Clean tables
  await pool.query('DELETE FROM scrim_registration');
  await pool.query('DELETE FROM scrim');
  await pool.query('DELETE FROM team_member');
  await pool.query('DELETE FROM post_like');
  await pool.query('DELETE FROM post_comment');
  await pool.query('DELETE FROM post');
  await pool.query('DELETE FROM player_connection');
  await pool.query('DELETE FROM org_verification');
  await pool.query('DELETE FROM organizer_verification');
  await pool.query('DELETE FROM registration');
  await pool.query('DELETE FROM role_posting');
  await pool.query('UPDATE player SET team_id = NULL');
  await pool.query('DELETE FROM team');

  // 1. Admin Accounts
  console.log('[Seed] Inserting Admin users...');
  const adminRes = await pool.query(
    `INSERT INTO "admin" (email, password_hash)
     VALUES ('admin@gamersg.com', $1)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
     RETURNING id, email`,
    [hash],
  );
  await pool.query(
    `INSERT INTO "admin" (email, password_hash)
     VALUES ('admin@admin.com', $1)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [hash],
  );
  const adminId = adminRes.rows[0].id;

  // 2. Organizations
  console.log('[Seed] Inserting Organizations...');
  const orgs = [
    { name: 'S8UL Esports', email: 'management@s8ul.gg', verified: true },
    { name: 'Global Esports', email: 'contact@globalesports.com', verified: true },
    { name: 'Godlike Esports', email: 'ops@godlike.gg', verified: true },
    { name: 'Total Gaming Esports', email: 'team@totalgaming.in', verified: true },
    { name: 'Reckoning Esports', email: 'founders@reckoningesports.in', verified: false },
    { name: 'Enigma Gaming', email: 'contact@enigma.gg', verified: false },
  ];

  const orgIds = {};
  for (const org of orgs) {
    const res = await pool.query(
      `INSERT INTO "org" (name, email, password_hash, verified)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET verified = EXCLUDED.verified
       RETURNING id, name`,
      [org.name, org.email, hash, org.verified],
    );
    orgIds[org.name] = res.rows[0].id;
  }

  // 3. Org Verification Applications for Admin review
  console.log('[Seed] Inserting Org Verification Applications...');
  const reckoningId = orgIds['Reckoning Esports'];
  if (reckoningId) {
    await pool.query(
      `INSERT INTO "org_verification" (org_id, legal_name, gst_number, website, twitter, rep_name, rep_email, documents_url, status)
       VALUES ($1, 'Reckoning Gaming Pvt Ltd', '27AABCR1234F1Z8', 'https://reckoningesports.in', '@ReckoningEsports', 'Robin Alva', 'robin@reckoning.in', 'https://gamersg.in/docs/reckoning_legal.pdf', 'pending')
       ON CONFLICT DO NOTHING`,
      [reckoningId],
    );
  }
  const enigmaId = orgIds['Enigma Gaming'];
  if (enigmaId) {
    await pool.query(
      `INSERT INTO "org_verification" (org_id, legal_name, gst_number, website, twitter, rep_name, rep_email, documents_url, status)
       VALUES ($1, 'Enigma Global Esports LLP', '29AABCE9876G2Z1', 'https://enigma.gg', '@EnigmaGaming', 'Aryaman Verma', 'aryaman@enigma.gg', 'https://gamersg.in/docs/enigma_legal.pdf', 'pending')
       ON CONFLICT DO NOTHING`,
      [enigmaId],
    );
  }

  // 4. Tournament Organizers
  console.log('[Seed] Inserting Tournament Organizers...');
  const organizers = [
    { name: 'Skyesports Hub', email: 'admin@skyesports.in', verified: true },
    { name: 'Villager Esports Network', email: 'events@villageresports.com', verified: true },
    { name: 'Nodwin Gaming Arena', email: 'ops@nodwingaming.com', verified: false },
  ];

  const organizerIds = {};
  for (const orgn of organizers) {
    const orgnRes = await pool.query(
      `INSERT INTO "tournament_organizer" (name, email, password_hash, verified)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET verified = EXCLUDED.verified
       RETURNING id, name`,
      [orgn.name, orgn.email, hash, orgn.verified],
    );
    organizerIds[orgn.name] = orgnRes.rows[0].id;
  }

  // Organizer Verification Application for Admin Review
  const nodwinId = organizerIds['Nodwin Gaming Arena'];
  if (nodwinId) {
    await pool.query(
      `INSERT INTO "organizer_verification" (organizer_id, org_name, experience_summary, website, twitter, status)
       VALUES ($1, 'Nodwin Gaming Arena Operations', 'Hosted ESL India Premiership, BGMS Master Series Season 1-3. 10+ years broadcast & tournament experience.', 'https://nodwingaming.com', '@NodwinGaming', 'pending')
       ON CONFLICT DO NOTHING`,
      [nodwinId],
    );
  }

  // 5. Players with Rich LinkedIn-style Gamer Profiles
  console.log('[Seed] Inserting Athletes & Gamers...');
  const playersData = [
    {
      username: 'Vortex',
      email: 'vortex@gamersg.com',
      ign: 'Vortex#IND',
      game: 'valorant',
      tagline: 'Professional Duelist (Jett/Reyna) | Top 50 Radiant India',
      bio: 'Ex-Team Velocity. Looking for tier 1 VCT India roster. Available for daily scrims 7PM-11PM IST.',
      stats: { kda: '1.42', winrate: '68%', headshot: '34%', acs: '264' },
      accounts: { riot_id: 'Vortex#IND', tracker_gg: 'tracker.gg/vortex' },
    },
    {
      username: 'Mortal',
      email: 'mortal@s8ul.gg',
      ign: 'SoulMortal',
      game: 'bgmi',
      tagline: 'Team Soul Veteran & Esports Pioneer | 2x PMCO Winner',
      bio: 'Leading S8UL Esports into BMPS 2026. Champion mentality, team strategist.',
      stats: { finishes: '1240', winrate: '54%', avg_dmg: '890', rank: 'Conqueror' },
      accounts: { bgmi_id: '512345678', youtube: 'youtube.com/mortal' },
    },
    {
      username: 'ScoutOP',
      email: 'scout@godlike.gg',
      ign: 'GodL_Scout',
      game: 'bgmi',
      tagline: 'Flanker & Fragger | Godlike Esports',
      bio: 'Known for laser sprays, 4x M416 master. Competitive esports athlete since 2018.',
      stats: { finishes: '1890', winrate: '58%', avg_dmg: '1020', rank: 'Conqueror' },
      accounts: { bgmi_id: '587654321', instagram: '@scout_pubg' },
    },
    {
      username: 'Astraea',
      email: 'astraea@gamersg.com',
      ign: 'Astraea#IN',
      game: 'valorant',
      tagline: 'Controller / IGL | Looking for VCT Split 2 Team',
      bio: 'Immortal 3 Controller main (Omen / Viper / Brim). Calm comms, set-play stratcaller.',
      stats: { kda: '1.25', winrate: '62%', clutch_rate: '22%', acs: '215' },
      accounts: { riot_id: 'Astraea#IN', discord: 'Astraea#4040' },
    },
    {
      username: 'ShadowNinja',
      email: 'shadow@gamersg.com',
      ign: 'ShadowTG',
      game: 'freefire',
      tagline: 'Headshot Specialist & Entry Rusher | Total Gaming',
      bio: 'FFIC Champion 2024. Fast reflexes, shotgun sniper.',
      stats: { kda: '3.8', winrate: '64%', headshot: '68%', rank: 'Grandmaster' },
      accounts: { ff_uid: '109876543' },
    },
    {
      username: 'ClashWarlord',
      email: 'warlord@gamersg.com',
      ign: 'ChiefWarlord',
      game: 'coc',
      tagline: 'Town Hall 16 Legend League Leader | 5800+ Trophies',
      bio: 'War specialist, Lavaloon & Super Bowler meta expert. Clan Capital strategist.',
      stats: { war_stars: '2150', best_trophies: '5920', th_level: '16' },
      accounts: { coc_tag: '#P802JJ9Y' },
    },
  ];

  const playerIds = {};
  for (const p of playersData) {
    const res = await pool.query(
      `INSERT INTO "player" (username, email, password_hash, game_ign, primary_game, tagline, bio, stats, game_accounts, lft_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Available for Competitive Scrims')
       ON CONFLICT (username) DO UPDATE SET
         email = EXCLUDED.email,
         game_ign = EXCLUDED.game_ign,
         primary_game = EXCLUDED.primary_game,
         tagline = EXCLUDED.tagline,
         bio = EXCLUDED.bio,
         stats = EXCLUDED.stats,
         game_accounts = EXCLUDED.game_accounts
       RETURNING id, username`,
      [p.username, p.email, hash, p.ign, p.game, p.tagline, p.bio, JSON.stringify(p.stats), JSON.stringify(p.accounts)],
    );
    playerIds[p.username] = res.rows[0].id;
  }

  // 6. Player Connections (LinkedIn-style)
  console.log('[Seed] Connecting Players...');
  const vId = playerIds['Vortex'];
  const mId = playerIds['Mortal'];
  const sId = playerIds['ScoutOP'];
  const aId = playerIds['Astraea'];

  if (vId && mId) {
    await pool.query(`INSERT INTO "player_connection" (requester_id, receiver_id, status) VALUES ($1, $2, 'connected') ON CONFLICT DO NOTHING`, [vId, mId]);
  }
  if (vId && aId) {
    await pool.query(`INSERT INTO "player_connection" (requester_id, receiver_id, status) VALUES ($1, $2, 'connected') ON CONFLICT DO NOTHING`, [vId, aId]);
  }
  if (mId && sId) {
    await pool.query(`INSERT INTO "player_connection" (requester_id, receiver_id, status) VALUES ($1, $2, 'connected') ON CONFLICT DO NOTHING`, [mId, sId]);
  }

  // 7. Teams and Team Members (Applying 4-5 member registration business rule!)
  console.log('[Seed] Inserting Teams with discrete Roster Slots (4-5 Member Rule)...');
  const teamsData = [
    {
      name: 'Team Soul BGMI',
      tag: 'SOUL',
      game: 'bgmi',
      orgName: 'S8UL Esports',
      captainUser: 'Mortal',
      division: 'Pro Division (Tier 1)',
      members: [
        { name: 'Naman Mathur', ign: 'SoulMortal', role: 'Captain / Support', user: 'Mortal', is_cap: true },
        { name: 'Harsh Paudwal', ign: 'SoulGoblin', role: 'Main Assaulter', is_cap: false },
        { name: 'Khush Singh', ign: 'SoulJoker', role: 'Support Fragger', is_cap: false },
        { name: 'Sohail Shaikh', ign: 'SoulHector', role: 'IGL / Scout', is_cap: false },
        { name: 'Manya Sharma', ign: 'SoulManya', role: 'Entry Fragger', is_cap: false },
      ],
    },
    {
      name: 'Global Esports Red',
      tag: 'GE',
      game: 'valorant',
      orgName: 'Global Esports',
      captainUser: 'Vortex',
      division: 'VCT Tier 1',
      members: [
        { name: 'Aryan Sharma', ign: 'Vortex#IND', role: 'Captain / Duelist', user: 'Vortex', is_cap: true },
        { name: 'Ganesh Gangadhar', ign: 'SkRossi', role: 'Chamber / Jett', is_cap: false },
        { name: 'Abhirup Choudhury', ign: 'LightningFast', role: 'Initiator / Sova', is_cap: false },
        { name: 'Kavya Mehra', ign: 'Astraea#IN', role: 'Controller (Viper/Omen)', user: 'Astraea', is_cap: false },
        { name: 'Pranav Kohli', ign: 'KohliOP', role: 'Sentinel / Cypher', is_cap: false },
      ],
    },
    {
      name: 'Godlike Esports BGMI',
      tag: 'GODL',
      game: 'bgmi',
      orgName: 'Godlike Esports',
      captainUser: 'ScoutOP',
      division: 'Pro Division',
      members: [
        { name: 'Tanmay Singh', ign: 'GodL_Scout', role: 'Captain / Fragger', user: 'ScoutOP', is_cap: true },
        { name: 'Suraj Majumdar', ign: 'GodL_Neyoo', role: 'Main Assaulter', is_cap: false },
        { name: 'Abhishek Choudhary', ign: 'GodL_ZGOD', role: 'Support / Healer', is_cap: false },
        { name: 'Jonathan Amaral', ign: 'GodL_JONATHAN', role: 'Entry Specialist', is_cap: false },
      ],
    },
    {
      name: 'Total Gaming Free Fire',
      tag: 'TG',
      game: 'freefire',
      orgName: 'Total Gaming Esports',
      captainUser: 'ShadowNinja',
      division: 'FFIC Tier 1',
      members: [
        { name: 'Ajay Sharma', ign: 'ShadowTG', role: 'Captain / Rusher', user: 'ShadowNinja', is_cap: true },
        { name: 'Fozy Ajay', ign: 'TG_Fozy', role: 'Sniper', is_cap: false },
        { name: 'Mafia Bala', ign: 'TG_Mafia', role: 'Support / Flanker', is_cap: false },
        { name: 'Vasiyo CRJ', ign: 'TG_Vasiyo', role: 'IGL', is_cap: false },
      ],
    },
    {
      name: 'Vortex Academy Squad',
      tag: 'VTX',
      game: 'valorant',
      captainUser: 'Vortex',
      division: 'Academy Division',
      // Only 2 members => Must remain in 'draft' status until 4 or 5 members join!
      members: [
        { name: 'Aryan Sharma', ign: 'Vortex#IND', role: 'Captain / Mentor', user: 'Vortex', is_cap: true },
        { name: 'Rohan Mehra', ign: 'RohanAim', role: 'Tryout Fragger', is_cap: false },
      ],
    },
  ];

  const teamIds = {};
  for (const t of teamsData) {
    const orgId = t.orgName ? orgIds[t.orgName] : null;
    const captainId = t.captainUser ? playerIds[t.captainUser] : null;

    // Check count of members
    const memberCount = t.members.length;
    // 4 or 5 members => 'registered', otherwise 'draft'
    const status = memberCount >= 4 ? 'registered' : 'draft';

    const tRes = await pool.query(
      `INSERT INTO "team" (name, tag, game, org_id, captain_id, division, slots_max, status)
       VALUES ($1, $2, $3, $4, $5, $6, 5, $7)
       RETURNING id, name, status`,
      [t.name, t.tag, t.game, orgId, captainId, t.division, status],
    );
    const teamId = tRes.rows[0].id;
    teamIds[t.name] = teamId;

    // Insert discrete roster members
    for (const m of t.members) {
      const pId = m.user ? playerIds[m.user] : null;
      await pool.query(
        `INSERT INTO "team_member" (team_id, player_id, name, ign, role, is_captain)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [teamId, pId, m.name, m.ign, m.role, m.is_cap || false],
      );
      if (pId) {
        await pool.query('UPDATE player SET team_id = $1 WHERE id = $2', [teamId, pId]);
      }
    }
  }

  // 8. Scrim Lobbies with Dedicated Room IDs and Passwords
  console.log('[Seed] Inserting Scrim Lobbies with credentials...');
  const skyeId = organizerIds['Skyesports Hub'];
  const villagerId = organizerIds['Villager Esports Network'];

  const scrimsData = [
    {
      organizer_id: skyeId,
      name: 'Skyesports Daily Valorant Tier-1 Pro Scrims #44',
      game: 'valorant',
      scheduled_at: new Date(Date.now() + 3600000 * 2), // in 2 hours
      slots_max: 16,
      room_id: 'CUSTOM-VAL-8821',
      room_password: 'GG_SKYE_PRO',
      status: 'open',
      registeredTeams: ['Global Esports Red'],
    },
    {
      organizer_id: villagerId,
      name: 'Villager BGMI Conqueror Night Scrims - Erangel & Miramar',
      game: 'bgmi',
      scheduled_at: new Date(Date.now() + 3600000 * 4), // in 4 hours
      slots_max: 20,
      room_id: 'ROOM-BGMI-5542',
      room_password: 'PASS-VILLAGER-9',
      status: 'open',
      registeredTeams: ['Team Soul BGMI', 'Godlike Esports BGMI'],
    },
    {
      organizer_id: skyeId,
      name: 'Skyesports Free Fire Pro Clash Lobby',
      game: 'freefire',
      scheduled_at: new Date(Date.now() + 3600000 * 6),
      slots_max: 12,
      room_id: 'ROOM-FF-3021',
      room_password: 'SKYE_FF_FIRE',
      status: 'open',
      registeredTeams: ['Total Gaming Free Fire'],
    },
  ];

  for (const s of scrimsData) {
    if (!s.organizer_id) continue;
    const sRes = await pool.query(
      `INSERT INTO "scrim" (organizer_id, name, game, scheduled_at, slots_max, room_id, room_password, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [s.organizer_id, s.name, s.game, s.scheduled_at, s.slots_max, s.room_id, s.room_password, s.status],
    );
    const scrimId = sRes.rows[0].id;

    for (const tName of s.registeredTeams) {
      const tId = teamIds[tName];
      if (tId) {
        await pool.query(
          `INSERT INTO "scrim_registration" (scrim_id, team_id, check_in_status)
           VALUES ($1, $2, 'checked_in')
           ON CONFLICT DO NOTHING`,
          [scrimId, tId],
        );
      }
    }
  }

  // 9. Community Posts, Comments, and Likes
  console.log('[Seed] Inserting LinkedIn-style Community Posts...');
  const s8ulId = orgIds['S8UL Esports'];
  const geId = orgIds['Global Esports'];

  // Post 1: Org post
  if (s8ulId) {
    const postRes = await pool.query(
      `INSERT INTO "post" (author_type, author_id, content, category, game)
       VALUES ('org', $1, 'We are proud to announce our official 2026 bootcamp in Mumbai! Tryouts for Team Soul sub-fragger slot are open via GamersG.', 'Announcement', 'bgmi')
       RETURNING id`,
      [s8ulId],
    );
    const p1Id = postRes.rows[0].id;
    if (vId) await pool.query('INSERT INTO post_like (post_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [p1Id, vId]);
    if (mId) {
      await pool.query(
        'INSERT INTO post_comment (post_id, author_id, author_name, content) VALUES ($1, $2, $3, $4)',
        [p1Id, mId, 'Mortal', 'Excited for the next season! Let the best talent step up.'],
      );
    }
  }

  // Post 2: Player post (Vortex)
  if (vId) {
    const postRes = await pool.query(
      `INSERT INTO "post" (author_type, author_id, content, category, game)
       VALUES ('player', $1, 'Had an intense 13-11 scrim victory against Velocity Gaming today. Dropped 29 kills on Jett Ascent. Looking for Tier 1 VCT scrim partners for tomorrow 8PM slot!', 'LFT / Scrims', 'valorant')
       RETURNING id`,
      [vId],
    );
    const p2Id = postRes.rows[0].id;
    if (aId) {
      await pool.query(
        'INSERT INTO post_comment (post_id, author_id, author_name, content) VALUES ($1, $2, $3, $4)',
        [p2Id, aId, 'Astraea', 'Insane entry plays today brother! Ready for tomorrow.'],
      );
      await pool.query('INSERT INTO post_like (post_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [p2Id, aId]);
    }
  }

  // Post 3: Organizer post
  if (skyeId) {
    await pool.query(
      `INSERT INTO "post" (author_type, author_id, content, category, game)
       VALUES ('organizer', $1, 'Registration for Skyesports Daily Valorant Tier-1 Scrims is now LIVE! Verified teams can grab their slot and access room credentials directly.', 'Tournament', 'valorant')`,
      [skyeId],
    );
  }

  console.log('[Seed] Done! Production database off_ground is populated with rich test & production data.');
  await pool.end();
}

seed().catch((err) => {
  console.error('[Seed] Error during seeding:', err);
  process.exit(1);
});
