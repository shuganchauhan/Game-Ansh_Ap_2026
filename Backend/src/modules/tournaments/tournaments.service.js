const { query, withTransaction } = require('../../shared/db');
const { NotFoundError, ForbiddenError, ConflictError, BadRequestError } = require('../../shared/errors');
const { emitToScrimLobby } = require('../../shared/socket');

async function submitOrganizerVerification(userId, userRole, userEmail, data) {
  let targetOrganizerId = userId;
  if (userRole !== 'organizer') {
    const orgnName = data.org_name || 'Esports Operations Agency';
    let email = data.email || userEmail;
    if (!email) {
      const p = await query('SELECT email FROM player WHERE id = $1', [userId]);
      if (p.rowCount > 0) email = p.rows[0].email;
    }
    email = email || `organizer_${Date.now()}@gamersg.com`;

    const existing = await query('SELECT id FROM tournament_organizer WHERE email = $1 LIMIT 1', [email]);
    if (existing.rowCount > 0) {
      targetOrganizerId = existing.rows[0].id;
      await query('UPDATE tournament_organizer SET name = $1 WHERE id = $2', [orgnName, targetOrganizerId]);
    } else {
      const newOrganizer = await query(
        `INSERT INTO tournament_organizer (name, email, password_hash, verified)
         VALUES ($1, $2, 'NO_DIRECT_LOGIN', false)
         RETURNING id`,
        [orgnName, email]
      );
      targetOrganizerId = newOrganizer.rows[0].id;
    }
  }

  const res = await query(
    `INSERT INTO organizer_verification (organizer_id, org_name, experience_summary, website, twitter, status)
     VALUES ($1, $2, $3, $4, $5, 'pending')
     RETURNING id, organizer_id, org_name, experience_summary, website, twitter, status, created_at`,
    [
      targetOrganizerId,
      data.org_name || 'Esports Operations Agency',
      data.experience_summary || '',
      data.website || '',
      data.twitter || '',
    ],
  );
  return res.rows[0];
}

async function getOrganizerVerificationStatus(userId, userRole, userEmail) {
  let res;
  if (userRole === 'organizer') {
    res = await query(
      'SELECT * FROM organizer_verification WHERE organizer_id = $1 ORDER BY created_at DESC LIMIT 1',
      [userId],
    );
  } else {
    let email = userEmail;
    if (!email) {
      const p = await query('SELECT email FROM player WHERE id = $1', [userId]);
      if (p.rowCount > 0) email = p.rows[0].email;
    }
    res = await query(
      `SELECT ov.* FROM organizer_verification ov
       JOIN tournament_organizer o ON o.id = ov.organizer_id
       WHERE o.email = $1
       ORDER BY ov.created_at DESC LIMIT 1`,
      [email || ''],
    );
  }
  return res?.rows?.[0] || { status: 'not_submitted' };
}

// Scrims
async function createScrim(organizerId, { name, game, scheduled_at, slots_max = 16, room_id = '', room_password = '' }) {
  // Generate default room credentials if not provided
  const genRoomId = room_id || `ROOM-${Math.floor(100000 + Math.random() * 900000)}`;
  const genPassword = room_password || `GG${Math.floor(1000 + Math.random() * 9000)}`;

  const result = await query(
    `INSERT INTO scrim (organizer_id, name, game, scheduled_at, slots_max, room_id, room_password, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'open')
     RETURNING *`,
    [organizerId, name, game, scheduled_at || new Date(Date.now() + 86400000), slots_max, genRoomId, genPassword],
  );
  return result.rows[0];
}

async function listScrims({ game, status } = {}) {
  const conditions = [];
  const params = [];

  if (game && game !== 'all') {
    params.push(game.toLowerCase());
    conditions.push(`LOWER(s.game) = $${params.length}`);
  }
  if (status && status !== 'all') {
    params.push(status);
    conditions.push(`s.status = $${params.length}`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const sql = `
    SELECT s.id, s.name, s.game, s.scheduled_at, s.slots_max, s.status, s.created_at,
           o.name AS organizer_name,
           COUNT(sr.id)::int AS registered_teams_count
    FROM scrim s
    JOIN tournament_organizer o ON o.id = s.organizer_id
    LEFT JOIN scrim_registration sr ON sr.scrim_id = s.id
    ${where}
    GROUP BY s.id, o.name
    ORDER BY s.scheduled_at ASC
  `;

  const res = await query(sql, params);
  return res.rows;
}

async function getScrimLobby(id, user) {
  const access = await query(
    `SELECT EXISTS (
       SELECT 1 FROM scrim s
       WHERE s.id = $1 AND (
         ($3 = 'admin') OR
         ($3 = 'organizer' AND s.organizer_id = $2) OR
         EXISTS (
           SELECT 1 FROM scrim_registration sr
           JOIN team t ON t.id = sr.team_id
           LEFT JOIN team_member tm ON tm.team_id = t.id
           WHERE sr.scrim_id = s.id AND (
             ($3 = 'org' AND t.org_id = $2) OR
             ($3 = 'player' AND (t.captain_id = $2 OR tm.player_id = $2))
           )
         )
       )
     ) AS allowed`,
    [id, user.id, user.role],
  );
  if (!access.rows[0].allowed) throw new ForbiddenError('Only the host or a registered team member can view lobby details');
  const scrimRes = await query(
    `SELECT s.*, o.name AS organizer_name, o.verified AS organizer_verified
     FROM scrim s
     JOIN tournament_organizer o ON o.id = s.organizer_id
     WHERE s.id = $1`,
    [id],
  );
  if (scrimRes.rowCount === 0) throw new NotFoundError('Scrim lobby');
  const scrim = scrimRes.rows[0];

  const regRes = await query(
    `SELECT sr.id, sr.scrim_id, sr.team_id, sr.check_in_status, sr.created_at,
            t.name AS team_name, t.tag AS team_tag, t.status AS team_status,
            o.name AS org_name,
            COUNT(tm.id)::int AS members_count
     FROM scrim_registration sr
     JOIN team t ON t.id = sr.team_id
     LEFT JOIN org o ON o.id = t.org_id
     LEFT JOIN team_member tm ON tm.team_id = t.id
     WHERE sr.scrim_id = $1
     GROUP BY sr.id, t.name, t.tag, t.status, o.name
     ORDER BY sr.created_at ASC`,
    [id],
  );

  scrim.registrations = regRes.rows;
  return scrim;
}

async function updateScrimCredentials(id, user, { room_id, room_password, status }) {
  const check = await query('SELECT organizer_id FROM scrim WHERE id = $1', [id]);
  if (check.rowCount === 0) throw new NotFoundError('Scrim');
  if (check.rows[0].organizer_id !== user.id && user.role !== 'admin') throw new ForbiddenError('Only the hosting organizer can update this lobby');

  const sets = [];
  const vals = [];
  if (room_id !== undefined) { sets.push(`room_id = $${sets.length + 1}`); vals.push(room_id); }
  if (room_password !== undefined) { sets.push(`room_password = $${sets.length + 1}`); vals.push(room_password); }
  if (status !== undefined) { sets.push(`status = $${sets.length + 1}`); vals.push(status); }

  if (sets.length === 0) throw new BadRequestError('No credentials to update');
  vals.push(id);

  const res = await query(
    `UPDATE scrim SET ${sets.join(', ')} WHERE id = $${vals.length} RETURNING *`,
    vals,
  );
  emitToScrimLobby(id, 'scrim:credentials_updated', res.rows[0]);
  return res.rows[0];
}

async function registerTeamForScrim(scrimId, teamId, user) {
  const registration = await withTransaction(async (client) => {
    const scrimRes = await client.query('SELECT id, slots_max, status FROM scrim WHERE id = $1 FOR UPDATE', [scrimId]);
    if (scrimRes.rowCount === 0) throw new NotFoundError('Scrim');
    if (['locked', 'completed', 'cancelled'].includes(scrimRes.rows[0].status)) {
      throw new BadRequestError('This scrim lobby is closed for registrations');
    }

    const teamRes = await client.query('SELECT id, org_id, captain_id, status FROM team WHERE id = $1', [teamId]);
    if (teamRes.rowCount === 0) throw new NotFoundError('Team');
    const team = teamRes.rows[0];
    const isAuthorized = (team.org_id && team.org_id === user.id) ||
                         (team.captain_id && team.captain_id === user.id) || user.role === 'admin';
    if (!isAuthorized) throw new ForbiddenError('You are not authorized to register this team');
    if (team.status !== 'registered' && user.role !== 'admin') throw new BadRequestError('Only complete team rosters can register');

    const existing = await client.query('SELECT id FROM scrim_registration WHERE scrim_id = $1 AND team_id = $2', [scrimId, teamId]);
    if (existing.rowCount > 0) throw new ConflictError('Team is already registered for this scrim');
    const countRes = await client.query('SELECT COUNT(*) AS cnt FROM scrim_registration WHERE scrim_id = $1', [scrimId]);
    if (parseInt(countRes.rows[0].cnt, 10) >= scrimRes.rows[0].slots_max) throw new BadRequestError('Scrim lobby is full');
    const result = await client.query(
      `INSERT INTO scrim_registration (scrim_id, team_id, check_in_status)
       VALUES ($1, $2, 'registered') RETURNING *`,
      [scrimId, teamId],
    );
    return result.rows[0];
  });
  emitToScrimLobby(scrimId, 'scrim:team_registered', registration);
  return registration;
}

async function updateScrimCheckin(scrimId, teamId, user, checkInStatus = 'checked_in') {
  if (!['checked_in', 'ready'].includes(checkInStatus)) throw new BadRequestError('Invalid check-in status');
  const teamRes = await query('SELECT id, org_id, captain_id FROM team WHERE id = $1', [teamId]);
  if (teamRes.rowCount === 0) throw new NotFoundError('Team');
  const scrimRes = await query('SELECT organizer_id FROM scrim WHERE id = $1', [scrimId]);
  if (scrimRes.rowCount === 0) throw new NotFoundError('Scrim');
  const team = teamRes.rows[0];

  const isAuthorized = (team.org_id && team.org_id === user.id) ||
                       (team.captain_id && team.captain_id === user.id) ||
                       (user.role === 'organizer' && scrimRes.rows[0].organizer_id === user.id) ||
                       user.role === 'admin';
  if (!isAuthorized) throw new ForbiddenError('Unauthorized to update check-in');

  const res = await query(
    `UPDATE scrim_registration SET check_in_status = $1 WHERE scrim_id = $2 AND team_id = $3 RETURNING *`,
    [checkInStatus, scrimId, teamId],
  );
  if (res.rowCount === 0) throw new NotFoundError('Scrim registration not found');
  emitToScrimLobby(scrimId, 'scrim:team_checked_in', { team_id: teamId, check_in_status: checkInStatus });
  return res.rows[0];
}

// Tournaments
async function createTournament(organizerId, { name, game, start_date }) {
  const result = await query(
    `INSERT INTO tournament (organizer_id, name, game, start_date)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [organizerId, name, game, start_date ?? null],
  );
  return result.rows[0];
}

async function getTournament(id) {
  const result = await query(
    `SELECT t.id, t.name, t.game, t.start_date, t.status,
            o.id AS organizer_id, o.name AS organizer_name, t.created_at
     FROM tournament t
     JOIN tournament_organizer o ON o.id = t.organizer_id
     WHERE t.id = $1`,
    [id],
  );
  if (result.rowCount === 0) throw new NotFoundError('Tournament');
  return result.rows[0];
}

async function updateTournament(id, organizerId, data) {
  const tourney = await query('SELECT id, organizer_id FROM tournament WHERE id = $1', [id]);
  if (tourney.rowCount === 0) throw new NotFoundError('Tournament');
  if (tourney.rows[0].organizer_id !== organizerId) throw new ForbiddenError('Not your tournament');
  const result = await query(
    `UPDATE tournament SET
       name = COALESCE($1, name), game = COALESCE($2, game),
       start_date = COALESCE($3, start_date), status = COALESCE($4, status)
     WHERE id = $5 RETURNING *`,
    [data.name ?? null, data.game ?? null, data.start_date ?? null, data.status ?? null, id],
  );
  return result.rows[0];
}

async function registerTeam(tournamentId, teamId, user) {
  const tourneyRes = await query('SELECT id FROM tournament WHERE id = $1', [tournamentId]);
  if (tourneyRes.rowCount === 0) throw new NotFoundError('Tournament');

  const teamRes = await query('SELECT id, org_id, captain_id, status FROM team WHERE id = $1', [teamId]);
  if (teamRes.rowCount === 0) throw new NotFoundError('Team');
  const team = teamRes.rows[0];
  const isOwner = user.role === 'admin' || (user.role === 'org' && team.org_id === user.id) || (user.role === 'player' && team.captain_id === user.id);
  if (!isOwner) throw new ForbiddenError('You do not own this team');
  if (team.status !== 'registered' && user.role !== 'admin') throw new BadRequestError('Only complete team rosters can register');

  const existing = await query(
    'SELECT id FROM registration WHERE tournament_id = $1 AND team_id = $2',
    [tournamentId, teamId],
  );
  if (existing.rowCount > 0) throw new ConflictError('Team already registered');

  const result = await query(
    `INSERT INTO registration (tournament_id, team_id)
     VALUES ($1, $2) RETURNING id, tournament_id, team_id, status, registered_at`,
    [tournamentId, teamId],
  );
  return result.rows[0];
}

async function getTournamentRegistrations(tournamentId, organizerId) {
  const tourney = await query('SELECT organizer_id FROM tournament WHERE id = $1', [tournamentId]);
  if (tourney.rowCount === 0) throw new NotFoundError('Tournament');
  if (tourney.rows[0].organizer_id !== organizerId) throw new ForbiddenError('Not your tournament');

  const result = await query(
    `SELECT r.id, r.team_id, r.status, r.registered_at,
            t.name AS team_name, t.game, o.name AS org_name
     FROM registration r
     JOIN team t ON t.id = r.team_id
     JOIN org o ON o.id = t.org_id
     WHERE r.tournament_id = $1`,
    [tournamentId],
  );
  return result.rows;
}

async function updateRegistration(tournamentId, registrationId, organizerId, { status }) {
  const tourney = await query('SELECT organizer_id FROM tournament WHERE id = $1', [tournamentId]);
  if (tourney.rowCount === 0) throw new NotFoundError('Tournament');
  if (tourney.rows[0].organizer_id !== organizerId) throw new ForbiddenError('Not your tournament');

  const result = await query(
    `UPDATE registration SET status = $1 WHERE id = $2 AND tournament_id = $3
     RETURNING id, tournament_id, team_id, status, registered_at`,
    [status, registrationId, tournamentId],
  );
  if (result.rowCount === 0) throw new NotFoundError('Registration');
  return result.rows[0];
}

module.exports = {
  submitOrganizerVerification,
  getOrganizerVerificationStatus,
  createScrim,
  listScrims,
  getScrimLobby,
  updateScrimCredentials,
  registerTeamForScrim,
  updateScrimCheckin,
  createTournament,
  getTournament,
  updateTournament,
  registerTeam,
  getTournamentRegistrations,
  updateRegistration,
};
