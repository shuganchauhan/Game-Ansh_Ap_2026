const { query } = require('../../shared/db');
const { NotFoundError, ForbiddenError } = require('../../shared/errors');

async function getPlayer(id) {
  const result = await query(
    `SELECT p.id, p.username, p.game_ign, p.team_id, p.org_id, p.created_at,
            p.tagline, p.bio, p.avatar_url, p.banner_url, p.location, p.primary_game,
            p.discord, p.lft_status, p.scrim_availability, p.game_accounts, p.stats, p.career_milestones,
            t.name AS team_name, t.tag AS team_tag, t.game AS team_game, t.status AS team_status,
            o.name AS org_name, o.verified AS org_verified
     FROM player p
     LEFT JOIN team t ON t.id = p.team_id
     LEFT JOIN org o ON o.id = p.org_id
     WHERE p.id = $1`,
    [id],
  );
  if (result.rowCount === 0) throw new NotFoundError('Player');
  const player = result.rows[0];

  // Connections count
  const connCount = await query(
    'SELECT COUNT(*)::int AS cnt FROM player_connection WHERE requester_id = $1 OR receiver_id = $1',
    [id],
  );
  player.connections_count = connCount.rows[0].cnt;

  return player;
}

async function listPlayers({ game, lft, limit = 50, offset = 0 } = {}) {
  const conditions = [];
  const params = [];

  if (game && game !== 'all') {
    params.push(game.toLowerCase());
    conditions.push(`LOWER(p.primary_game) = $${params.length}`);
  }
  if (lft === 'true' || lft === true) {
    conditions.push(`p.lft_status ILIKE '%available%' OR p.lft_status ILIKE '%lft%'`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  params.push(limit, offset);

  const sql = `
    SELECT p.id, p.username, p.game_ign, p.tagline, p.primary_game, p.avatar_url, p.lft_status,
           p.scrim_availability, p.stats, p.created_at,
           t.name AS team_name, t.tag AS team_tag,
           o.name AS org_name
    FROM player p
    LEFT JOIN team t ON t.id = p.team_id
    LEFT JOIN org o ON o.id = p.org_id
    ${whereClause}
    ORDER BY p.created_at DESC
    LIMIT $${params.length - 1} OFFSET $${params.length}
  `;

  const res = await query(sql, params);
  return res.rows;
}

async function updatePlayer(id, requesterId, data) {
  if (id !== requesterId) throw new ForbiddenError("Cannot edit another player's profile");

  const fields = [
    'username', 'game_ign', 'tagline', 'bio', 'avatar_url', 'banner_url',
    'location', 'primary_game', 'discord', 'lft_status', 'scrim_availability',
    'game_accounts', 'stats', 'career_milestones'
  ];

  const sets = [];
  const values = [];

  for (const field of fields) {
    if (data[field] !== undefined) {
      sets.push(`${field} = $${sets.length + 1}`);
      values.push(typeof data[field] === 'object' ? JSON.stringify(data[field]) : data[field]);
    }
  }

  if (sets.length === 0) throw new Error('No fields to update');
  values.push(id);

  const result = await query(
    `UPDATE player SET ${sets.join(', ')} WHERE id = $${values.length} 
     RETURNING id, username, email, game_ign, tagline, bio, avatar_url, banner_url, location, primary_game, discord, lft_status, scrim_availability, game_accounts, stats, career_milestones, created_at`,
    values,
  );
  return result.rows[0];
}

module.exports = { getPlayer, listPlayers, updatePlayer };
