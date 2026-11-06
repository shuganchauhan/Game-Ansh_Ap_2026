const bcrypt = require('bcrypt');
const { query } = require('../../shared/db');
const { signToken } = require('../../shared/auth/jwt');
const { ConflictError, UnauthorizedError } = require('../../shared/errors');

const SALT_ROUNDS = 10;

async function signupPlayer({ email, password, username, game_ign }) {
  const existing = await query('SELECT id FROM player WHERE email = $1', [email]);
  if (existing.rowCount > 0) throw new ConflictError('An account with this email already exists. Please sign in.');

  let finalUsername = username?.trim();
  if (!finalUsername) {
    const raw = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');
    finalUsername = raw || 'gamer';
    const checkUsername = await query('SELECT id FROM player WHERE username = $1', [finalUsername]);
    if (checkUsername.rowCount > 0) {
      finalUsername = `${finalUsername}_${Math.floor(100 + Math.random() * 900)}`;
    }
  } else {
    const checkUsername = await query('SELECT id FROM player WHERE username = $1', [finalUsername]);
    if (checkUsername.rowCount > 0) throw new ConflictError('Username already in use');
  }

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  const result = await query(
    `INSERT INTO player (username, email, password_hash, game_ign)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [finalUsername, email, password_hash, game_ign ?? null],
  );
  const player = result.rows[0];
  const token = signToken({ id: player.id, role: 'player', email: player.email });
  const { password_hash: _ph, ...safePlayer } = player;
  return {
    token,
    user: {
      ...safePlayer,
      role: 'player',
      name: safePlayer.username || safePlayer.name || safePlayer.email?.split('@')[0],
      primary_game: safePlayer.primary_game || null,
      tagline: safePlayer.tagline || '',
      avatar_url: safePlayer.avatar_url || '',
    },
  };
}

async function signupOrg({ name, email, password }) {
  const existing = await query('SELECT id FROM org WHERE email = $1', [email]);
  if (existing.rowCount > 0) throw new ConflictError('Email already in use');
  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  const result = await query(
    `INSERT INTO org (name, email, password_hash)
     VALUES ($1, $2, $3) RETURNING id, name, email, verified, created_at`,
    [name, email, password_hash],
  );
  const org = result.rows[0];
  const token = signToken({ id: org.id, role: 'org', email: org.email });
  return { token, user: { ...org, role: 'org' } };
}

async function signupOrganizer({ name, email, password }) {
  const existing = await query('SELECT id FROM tournament_organizer WHERE email = $1', [email]);
  if (existing.rowCount > 0) throw new ConflictError('Email already in use');
  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  const result = await query(
    `INSERT INTO tournament_organizer (name, email, password_hash)
     VALUES ($1, $2, $3) RETURNING id, name, email, verified, created_at`,
    [name, email, password_hash],
  );
  const organizer = result.rows[0];
  const token = signToken({ id: organizer.id, role: 'organizer', email: organizer.email });
  return { token, user: { ...organizer, role: 'organizer' } };
}

async function login({ email, password, role }) {
  let cleanEmail = (email || '').trim().toLowerCase();
  if (cleanEmail === 'admin' || cleanEmail === 'admin@gamersg') {
    cleanEmail = 'admin@gamersg.com';
  }

  // If role is explicitly provided, verify against that role's table first
  if (role) {
    const tableMap = { player: 'player', org: 'org', organizer: 'tournament_organizer', admin: 'admin' };
    const table = tableMap[role];
    if (table) {
      try {
        const whereClause = role === 'admin'
          ? 'LOWER(email) = LOWER($1)'
          : (role === 'player'
              ? 'LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($1)'
              : 'LOWER(email) = LOWER($1) OR LOWER(name) = LOWER($1)');
        const res = await query(`SELECT * FROM "${table}" WHERE ${whereClause}`, [cleanEmail]);
        if (res.rowCount > 0) {
          const u = res.rows[0];
          const valid = await bcrypt.compare(password, u.password_hash);
          if (valid) {
            const { password_hash, ...safeUser } = u;
            const token = signToken({ id: u.id, role, email: u.email });
            return {
              token,
              user: {
                ...safeUser,
                role,
                name: role === 'admin' ? 'Platform Administrator' : safeUser.name || safeUser.username || safeUser.email?.split('@')[0],
                primary_game: safeUser.primary_game || null,
                tagline: safeUser.tagline || '',
                avatar_url: safeUser.avatar_url || '',
              },
            };
          }
        }
      } catch (err) {
        console.warn(`[Auth] Error querying ${role} table:`, err.message);
      }
    }
  }

  // Automatic multi-role detection (Admin -> Player -> Org -> Organizer)
  // 1. Admin check
  try {
    const adminRes = await query('SELECT * FROM "admin" WHERE LOWER(email) = LOWER($1)', [cleanEmail]);
    if (adminRes.rowCount > 0) {
      const admin = adminRes.rows[0];
      const valid = await bcrypt.compare(password, admin.password_hash);
      if (valid) {
        const token = signToken({ id: admin.id, role: 'admin', email: admin.email });
        return { token, user: { id: admin.id, email: admin.email, role: 'admin', name: 'Platform Administrator' } };
      }
    }
  } catch (err) {
    console.warn('[Auth] Admin check error:', err.message);
  }

  // 2. Player check (default standard gaming account)
  try {
    const playerRes = await query(
      'SELECT * FROM "player" WHERE LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($1)',
      [cleanEmail]
    );
    if (playerRes.rowCount > 0) {
      const player = playerRes.rows[0];
      const valid = await bcrypt.compare(password, player.password_hash);
      if (valid) {
        const { password_hash, ...safePlayer } = player;
        const token = signToken({ id: player.id, role: 'player', email: player.email });
        return {
          token,
          user: {
            ...safePlayer,
            role: 'player',
            name: safePlayer.name || safePlayer.username || safePlayer.email?.split('@')[0],
            primary_game: safePlayer.primary_game || null,
            tagline: safePlayer.tagline || '',
            avatar_url: safePlayer.avatar_url || '',
          },
        };
      }
    }
  } catch (err) {
    console.warn('[Auth] Player check error:', err.message);
  }

  // 3. Org check
  try {
    const orgRes = await query(
      'SELECT * FROM "org" WHERE LOWER(email) = LOWER($1) OR LOWER(name) = LOWER($1)',
      [cleanEmail]
    );
    if (orgRes.rowCount > 0) {
      const org = orgRes.rows[0];
      const valid = await bcrypt.compare(password, org.password_hash);
      if (valid) {
        const { password_hash, ...safeOrg } = org;
        const token = signToken({ id: org.id, role: 'org', email: org.email });
        return { token, user: { ...safeOrg, role: 'org', name: safeOrg.name || safeOrg.email?.split('@')[0] } };
      }
    }
  } catch (err) {
    console.warn('[Auth] Org check error:', err.message);
  }

  // 4. Organizer check
  try {
    const orgnRes = await query(
      'SELECT * FROM "tournament_organizer" WHERE LOWER(email) = LOWER($1) OR LOWER(name) = LOWER($1)',
      [cleanEmail]
    );
    if (orgnRes.rowCount > 0) {
      const organizer = orgnRes.rows[0];
      const valid = await bcrypt.compare(password, organizer.password_hash);
      if (valid) {
        const { password_hash, ...safeOrganizer } = organizer;
        const token = signToken({ id: organizer.id, role: 'organizer', email: organizer.email });
        return { token, user: { ...safeOrganizer, role: 'organizer', name: safeOrganizer.name || safeOrganizer.email?.split('@')[0] } };
      }
    }
  } catch (err) {
    console.warn('[Auth] Organizer check error:', err.message);
  }

  throw new UnauthorizedError('Invalid email or password');
}

module.exports = {
  signupPlayer,
  signupOrg,
  signupOrganizer,
  login,
};
