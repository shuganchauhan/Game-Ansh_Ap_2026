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
     RETURNING id, username, email, game_ign, primary_game, tagline, bio, avatar_url, created_at`,
    [finalUsername, email, password_hash, game_ign ?? null],
  );
  const player = result.rows[0];
  const token = signToken({ id: player.id, role: 'player', email: player.email });
  return { token, user: { ...player, role: 'player' } };
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
  // If role is explicitly provided, verify against that role's table first
  if (role) {
    const tableMap = { player: 'player', org: 'org', organizer: 'tournament_organizer', admin: 'admin' };
    const selectMap = {
      player: 'id, username, email, password_hash, primary_game, tagline, avatar_url',
      org: 'id, name, email, password_hash, verified',
      organizer: 'id, name, email, password_hash, verified',
      admin: 'id, email, password_hash',
    };
    const table = tableMap[role];
    if (table) {
      const res = await query(`SELECT ${selectMap[role]} FROM "${table}" WHERE email = $1`, [email]);
      if (res.rowCount > 0) {
        const u = res.rows[0];
        const valid = await bcrypt.compare(password, u.password_hash);
        if (valid) {
          const { password_hash, ...safeUser } = u;
          const token = signToken({ id: u.id, role, email: u.email });
          return { token, user: { ...safeUser, role } };
        }
      }
    }
  }

  // Automatic multi-role detection (Admin -> Player -> Org -> Organizer)
  // 1. Admin check
  const adminRes = await query('SELECT id, email, password_hash FROM "admin" WHERE email = $1', [email]);
  if (adminRes.rowCount > 0) {
    const admin = adminRes.rows[0];
    const valid = await bcrypt.compare(password, admin.password_hash);
    if (valid) {
      const token = signToken({ id: admin.id, role: 'admin', email: admin.email });
      return { token, user: { id: admin.id, email: admin.email, role: 'admin' } };
    }
  }

  // 2. Player check (default standard gaming account)
  const playerRes = await query('SELECT id, username, email, password_hash, primary_game, tagline, avatar_url FROM "player" WHERE email = $1', [email]);
  if (playerRes.rowCount > 0) {
    const player = playerRes.rows[0];
    const valid = await bcrypt.compare(password, player.password_hash);
    if (valid) {
      const { password_hash, ...safePlayer } = player;
      const token = signToken({ id: player.id, role: 'player', email: player.email });
      return { token, user: { ...safePlayer, role: 'player' } };
    }
  }

  // 3. Org check
  const orgRes = await query('SELECT id, name, email, password_hash, verified FROM "org" WHERE email = $1', [email]);
  if (orgRes.rowCount > 0) {
    const org = orgRes.rows[0];
    const valid = await bcrypt.compare(password, org.password_hash);
    if (valid) {
      const { password_hash, ...safeOrg } = org;
      const token = signToken({ id: org.id, role: 'org', email: org.email });
      return { token, user: { ...safeOrg, role: 'org' } };
    }
  }

  // 4. Organizer check
  const orgnRes = await query('SELECT id, name, email, password_hash, verified FROM "tournament_organizer" WHERE email = $1', [email]);
  if (orgnRes.rowCount > 0) {
    const organizer = orgnRes.rows[0];
    const valid = await bcrypt.compare(password, organizer.password_hash);
    if (valid) {
      const { password_hash, ...safeOrganizer } = organizer;
      const token = signToken({ id: organizer.id, role: 'organizer', email: organizer.email });
      return { token, user: { ...safeOrganizer, role: 'organizer' } };
    }
  }

  throw new UnauthorizedError('Invalid email or password');
}

module.exports = {
  signupPlayer,
  signupOrg,
  signupOrganizer,
  login,
};
