const { query, withTransaction } = require('../../shared/db');
const { NotFoundError } = require('../../shared/errors');

async function getStats() {
  const [
    playersRes,
    orgsRes,
    organizersRes,
    teamsRes,
    orgVerifRes,
    orgnVerifRes,
    scrimsRes,
  ] = await Promise.all([
    query('SELECT COUNT(*) AS total FROM player'),
    query('SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE verified = true) AS verified FROM org'),
    query('SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE verified = true) AS verified FROM tournament_organizer'),
    query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status = 'registered') AS registered, COUNT(*) FILTER (WHERE status = 'draft') AS draft FROM team"),
    query("SELECT COUNT(*) FILTER (WHERE status = 'pending') AS pending FROM org_verification"),
    query("SELECT COUNT(*) FILTER (WHERE status = 'pending') AS pending FROM organizer_verification"),
    query('SELECT COUNT(*) AS total FROM scrim'),
  ]);

  return {
    players: parseInt(playersRes.rows[0].total, 10),
    orgs: {
      total: parseInt(orgsRes.rows[0].total, 10),
      verified: parseInt(orgsRes.rows[0].verified, 10),
      pending_verifications: parseInt(orgVerifRes.rows[0].pending, 10) || 0,
    },
    organizers: {
      total: parseInt(organizersRes.rows[0].total, 10),
      verified: parseInt(organizersRes.rows[0].verified, 10),
      pending_verifications: parseInt(orgnVerifRes.rows[0].pending, 10) || 0,
    },
    teams: {
      total: parseInt(teamsRes.rows[0].total, 10),
      registered: parseInt(teamsRes.rows[0].registered, 10),
      draft: parseInt(teamsRes.rows[0].draft, 10),
    },
    scrims: parseInt(scrimsRes.rows[0].total, 10) || 0,
  };
}

async function listOrgVerifications(status = null) {
  let sql = `
    SELECT ov.*, o.name AS org_name, o.email AS org_email, o.verified AS current_org_verified
    FROM org_verification ov
    JOIN org o ON o.id = ov.org_id
  `;
  const params = [];
  if (status && status !== 'all') {
    params.push(status);
    sql += ` WHERE ov.status = $1`;
  }
  sql += ` ORDER BY ov.created_at DESC`;
  const res = await query(sql, params);
  return res.rows;
}

async function approveOrgVerification(id, adminId) {
  return withTransaction(async (client) => {
    const check = await client.query('SELECT * FROM org_verification WHERE id = $1', [id]);
    if (check.rowCount === 0) throw new NotFoundError('Org verification application');
    const verif = check.rows[0];

    await client.query(
      `UPDATE org_verification SET status = 'approved', reviewed_by = $1, updated_at = NOW() WHERE id = $2`,
      [adminId || null, id],
    );
    await client.query('UPDATE org SET verified = true WHERE id = $1', [verif.org_id]);

    return { id, status: 'approved', org_id: verif.org_id, verified: true };
  });
}

async function rejectOrgVerification(id, adminId, reviewNotes = '') {
  return withTransaction(async (client) => {
    const check = await client.query('SELECT * FROM org_verification WHERE id = $1', [id]);
    if (check.rowCount === 0) throw new NotFoundError('Org verification application');
    const verif = check.rows[0];

    await client.query(
      `UPDATE org_verification SET status = 'rejected', reviewed_by = $1, review_notes = $2, updated_at = NOW() WHERE id = $3`,
      [adminId || null, reviewNotes, id],
    );
    await client.query('UPDATE org SET verified = false WHERE id = $1', [verif.org_id]);

    return { id, status: 'rejected', org_id: verif.org_id, verified: false };
  });
}

async function listOrganizerVerifications(status = null) {
  let sql = `
    SELECT ov.*, o.name AS organizer_name, o.email AS organizer_email, o.verified AS current_verified
    FROM organizer_verification ov
    JOIN tournament_organizer o ON o.id = ov.organizer_id
  `;
  const params = [];
  if (status && status !== 'all') {
    params.push(status);
    sql += ` WHERE ov.status = $1`;
  }
  sql += ` ORDER BY ov.created_at DESC`;
  const res = await query(sql, params);
  return res.rows;
}

async function approveOrganizerVerification(id, adminId) {
  return withTransaction(async (client) => {
    const check = await client.query('SELECT * FROM organizer_verification WHERE id = $1', [id]);
    if (check.rowCount === 0) throw new NotFoundError('Organizer verification application');
    const verif = check.rows[0];

    await client.query(
      `UPDATE organizer_verification SET status = 'approved', reviewed_by = $1, updated_at = NOW() WHERE id = $2`,
      [adminId || null, id],
    );
    await client.query('UPDATE tournament_organizer SET verified = true WHERE id = $1', [verif.organizer_id]);

    return { id, status: 'approved', organizer_id: verif.organizer_id, verified: true };
  });
}

async function rejectOrganizerVerification(id, adminId, reviewNotes = '') {
  return withTransaction(async (client) => {
    const check = await client.query('SELECT * FROM organizer_verification WHERE id = $1', [id]);
    if (check.rowCount === 0) throw new NotFoundError('Organizer verification application');
    const verif = check.rows[0];

    await client.query(
      `UPDATE organizer_verification SET status = 'rejected', reviewed_by = $1, review_notes = $2, updated_at = NOW() WHERE id = $3`,
      [adminId || null, reviewNotes, id],
    );
    await client.query('UPDATE tournament_organizer SET verified = false WHERE id = $1', [verif.organizer_id]);

    return { id, status: 'rejected', organizer_id: verif.organizer_id, verified: false };
  });
}

async function verifyOrg(id) {
  const result = await query(
    'UPDATE org SET verified = true WHERE id = $1 RETURNING id, name, email, verified', [id],
  );
  if (result.rowCount === 0) throw new NotFoundError('Org');
  return result.rows[0];
}

async function verifyOrganizer(id) {
  const result = await query(
    'UPDATE tournament_organizer SET verified = true WHERE id = $1 RETURNING id, name, email, verified', [id],
  );
  if (result.rowCount === 0) throw new NotFoundError('Tournament organizer');
  return result.rows[0];
}

async function listUsers() {
  const [players, orgs, organizers] = await Promise.all([
    query('SELECT id, username, email, game_ign, primary_game, created_at FROM player ORDER BY created_at DESC LIMIT 50'),
    query('SELECT id, name, email, verified, created_at FROM org ORDER BY created_at DESC LIMIT 50'),
    query('SELECT id, name, email, verified, created_at FROM tournament_organizer ORDER BY created_at DESC LIMIT 50'),
  ]);
  return { players: players.rows, orgs: orgs.rows, organizers: organizers.rows };
}

module.exports = {
  getStats,
  listOrgVerifications,
  approveOrgVerification,
  rejectOrgVerification,
  listOrganizerVerifications,
  approveOrganizerVerification,
  rejectOrganizerVerification,
  verifyOrg,
  verifyOrganizer,
  listUsers,
};
