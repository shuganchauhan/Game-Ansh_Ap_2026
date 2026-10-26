const { query } = require('../../shared/db');
const { buildCursorPage, parsePaginationParams } = require('../../shared/pagination');

async function discoverTeams(queryParams) {
  const { limit, cursor } = parsePaginationParams(queryParams);
  const conditions = ['1=1'];
  const values = [];

  if (queryParams.game) { values.push(`%${queryParams.game}%`); conditions.push(`t.game ILIKE $${values.length}`); }
  if (queryParams.status) { values.push(queryParams.status); conditions.push(`t.status = $${values.length}`); }
  if (queryParams.name) { values.push(`%${queryParams.name}%`); conditions.push(`t.name ILIKE $${values.length}`); }
  if (cursor) { values.push(cursor); conditions.push(`t.id > $${values.length}`); }

  values.push(limit + 1);
  const sql = `
    SELECT t.id, t.name, t.game, t.status, t.org_id, o.name AS org_name, o.verified,
           t.tag, t.division, t.slots_max, t.captain_id, t.created_at,
           COUNT(tm.id)::int AS members_count,
           COALESCE((SELECT json_agg(json_build_object('id', rp.id, 'role', rp.role))
                     FROM role_posting rp WHERE rp.team_id = t.id AND rp.status = 'open'), '[]'::json) AS open_postings
    FROM team t
    LEFT JOIN org o ON o.id = t.org_id
    LEFT JOIN team_member tm ON tm.team_id = t.id
    WHERE ${conditions.join(' AND ')}
    GROUP BY t.id, o.name, o.verified
    ORDER BY t.id
    LIMIT $${values.length}
  `;
  const result = await query(sql, values);
  return buildCursorPage(result.rows, limit);
}

async function discoverTournaments(queryParams) {
  const { limit, cursor } = parsePaginationParams(queryParams);
  const conditions = ['1=1'];
  const values = [];

  if (queryParams.game) { values.push(`%${queryParams.game}%`); conditions.push(`t.game ILIKE $${values.length}`); }
  if (queryParams.status) { values.push(queryParams.status); conditions.push(`t.status = $${values.length}`); }
  if (queryParams.name) { values.push(`%${queryParams.name}%`); conditions.push(`t.name ILIKE $${values.length}`); }
  if (cursor) { values.push(cursor); conditions.push(`t.id > $${values.length}`); }

  values.push(limit + 1);
  const sql = `
    SELECT t.id, t.name, t.game, t.start_date, t.status, t.organizer_id,
           o.name AS organizer_name, t.created_at
    FROM tournament t
    JOIN tournament_organizer o ON o.id = t.organizer_id
    WHERE ${conditions.join(' AND ')}
    ORDER BY t.id
    LIMIT $${values.length}
  `;
  const result = await query(sql, values);
  return buildCursorPage(result.rows, limit);
}

module.exports = { discoverTeams, discoverTournaments };
