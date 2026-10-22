const { query } = require('../../shared/db');
const { NotFoundError, ForbiddenError } = require('../../shared/errors');

async function getOrg(id) {
  const result = await query(
    `SELECT o.id, o.name, o.email, o.verified, o.created_at,
            (SELECT COUNT(*) FROM team WHERE org_id = o.id)::int AS total_teams,
            (SELECT COUNT(*) FROM player WHERE org_id = o.id)::int AS total_players
     FROM org o WHERE o.id = $1`,
    [id],
  );
  if (result.rowCount === 0) throw new NotFoundError('Org');
  const org = result.rows[0];

  const verif = await query(
    'SELECT id, legal_name, gst_number, website, status, review_notes, created_at FROM org_verification WHERE org_id = $1 ORDER BY created_at DESC LIMIT 1',
    [id],
  );
  org.verification_application = verif.rows[0] || null;

  return org;
}

async function updateOrg(id, requesterId, data) {
  if (id !== requesterId) throw new ForbiddenError('Cannot edit another org');
  const result = await query(
    'UPDATE org SET name = COALESCE($1, name) WHERE id = $2 RETURNING id, name, email, verified, created_at',
    [data.name ?? null, id],
  );
  return result.rows[0];
}

async function getOrgTeams(id) {
  const result = await query(
    `SELECT t.id, t.name, t.game, t.tag, t.division, t.slots_max, t.status, t.created_at,
            COUNT(tm.id)::int AS members_count
     FROM team t
     LEFT JOIN team_member tm ON tm.team_id = t.id
     WHERE t.org_id = $1
     GROUP BY t.id
     ORDER BY t.created_at DESC`,
    [id],
  );
  return result.rows;
}

async function getOrgPlayers(id) {
  const result = await query(
    'SELECT id, username, email, game_ign, primary_game, tagline, created_at FROM player WHERE org_id = $1 ORDER BY created_at DESC',
    [id],
  );
  return result.rows;
}

async function submitVerification(userId, userRole, userEmail, data) {
  let targetOrgId = userId;
  if (userRole !== 'org') {
    const orgName = data.org_name || data.legal_name || 'My Esports Organization';
    let email = data.rep_email || userEmail;
    if (!email) {
      const p = await query('SELECT email FROM player WHERE id = $1', [userId]);
      if (p.rowCount > 0) email = p.rows[0].email;
    }
    email = email || `org_${Date.now()}@gamersg.com`;
    const existingOrg = await query('SELECT id FROM org WHERE email = $1 OR name = $2 LIMIT 1', [email, orgName]);
    if (existingOrg.rowCount > 0) {
      targetOrgId = existingOrg.rows[0].id;
    } else {
      const checkName = await query('SELECT id FROM org WHERE name = $1', [orgName]);
      const finalName = checkName.rowCount > 0 ? `${orgName} (${Date.now().toString().slice(-4)})` : orgName;
      const newOrg = await query(
        `INSERT INTO org (name, email, password_hash, verified)
         VALUES ($1, $2, 'NO_DIRECT_LOGIN', false)
         RETURNING id`,
        [finalName, email]
      );
      targetOrgId = newOrg.rows[0].id;
    }
  }

  const res = await query(
    `INSERT INTO org_verification (org_id, legal_name, gst_number, website, twitter, rep_name, rep_email, documents_url, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
     RETURNING id, org_id, legal_name, gst_number, website, twitter, rep_name, rep_email, documents_url, status, created_at`,
    [
      targetOrgId,
      data.legal_name || 'Esports Org PVT LTD',
      data.gst_number || '',
      data.website || '',
      data.twitter || '',
      data.rep_name || '',
      data.rep_email || userEmail || '',
      data.documents_url || 'verified_contract_bundle.pdf',
    ],
  );
  return res.rows[0];
}

async function getVerificationStatus(userId, userRole, userEmail) {
  let res;
  if (userRole === 'org') {
    res = await query(
      'SELECT * FROM org_verification WHERE org_id = $1 ORDER BY created_at DESC LIMIT 1',
      [userId],
    );
  } else {
    let email = userEmail;
    if (!email) {
      const p = await query('SELECT email FROM player WHERE id = $1', [userId]);
      if (p.rowCount > 0) email = p.rows[0].email;
    }
    res = await query(
      `SELECT ov.* FROM org_verification ov
       LEFT JOIN org o ON o.id = ov.org_id
       WHERE ov.rep_email = $1 OR o.email = $1
       ORDER BY ov.created_at DESC LIMIT 1`,
      [email || ''],
    );
  }
  return res?.rows?.[0] || { status: 'not_submitted' };
}

module.exports = {
  getOrg,
  updateOrg,
  getOrgTeams,
  getOrgPlayers,
  submitVerification,
  getVerificationStatus,
};
