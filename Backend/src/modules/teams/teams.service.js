const { query, withTransaction } = require('../../shared/db');
const { NotFoundError, ForbiddenError, BadRequestError } = require('../../shared/errors');

async function claimPlayerForTeam(client, teamId, playerId) {
  const player = await client.query('SELECT id, team_id, org_id FROM player WHERE id = $1 FOR UPDATE', [playerId]);
  if (player.rowCount === 0) throw new NotFoundError('Player');
  if (player.rows[0].org_id || (player.rows[0].team_id && player.rows[0].team_id !== teamId)) {
    throw new BadRequestError('Player already belongs to another team or organization');
  }
  const duplicate = await client.query('SELECT id FROM team_member WHERE player_id = $1 AND team_id = $2', [playerId, teamId]);
  if (duplicate.rowCount > 0) throw new BadRequestError('Player is already on this roster');
  await client.query('UPDATE player SET team_id = $1 WHERE id = $2', [teamId, playerId]);
}

async function createTeam(user, { name, game, tag = '', division = 'Competitive Tier', slots_max = 5, members = [] }) {
  if (!['org', 'player'].includes(user.role)) throw new ForbiddenError('Only a player or organization can create a team');
  if (members.length + (user.role === 'player' ? 1 : 0) > slots_max) throw new BadRequestError('Initial roster exceeds the team slot limit');
  return withTransaction(async (client) => {
    const isOrg = user.role === 'org';
    const isPlayer = user.role === 'player';
    const orgId = isOrg ? user.id : null;
    const captainId = isPlayer ? user.id : null;

    const teamRes = await client.query(
      `INSERT INTO team (name, game, org_id, captain_id, tag, division, slots_max, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'draft')
       RETURNING id, org_id, captain_id, name, game, tag, division, slots_max, status, created_at`,
      [name, game, orgId, captainId, tag || name.substring(0, 4).toUpperCase(), division, slots_max],
    );
    const team = teamRes.rows[0];

    // If a player created the team, add them as captain in team_member
    if (isPlayer) {
      const pRes = await client.query('SELECT id, username, game_ign FROM player WHERE id = $1', [user.id]);
      if (pRes.rowCount > 0) {
        const p = pRes.rows[0];
        await client.query('UPDATE player SET team_id = $1 WHERE id = $2', [team.id, p.id]);
        await client.query(
          `INSERT INTO team_member (team_id, player_id, name, ign, role, is_captain)
           VALUES ($1, $2, $3, $4, 'Captain / IGL', true)
           ON CONFLICT DO NOTHING`,
          [team.id, p.id, p.username, p.game_ign || p.username],
        );
      }
    }

    // Add any initial extra members provided
    if (Array.isArray(members) && members.length > 0) {
      for (const m of members) {
        if (!m.name && !m.ign) continue;
        if (m.player_id) {
          try {
            await claimPlayerForTeam(client, team.id, m.player_id);
          } catch (e) {
            // Keep roster addition even if exclusive claim fails
          }
        }
        await client.query(
          `INSERT INTO team_member (team_id, player_id, name, ign, role, is_captain)
           VALUES ($1, $2, $3, $4, $5, false)`,
          [team.id, m.player_id || null, m.name || m.ign, m.ign || m.name, m.role || 'Player / Member'],
        );
      }
    }

    // Count members in team_member
    const countRes = await client.query('SELECT COUNT(*) AS cnt FROM team_member WHERE team_id = $1', [team.id]);
    const memberCount = parseInt(countRes.rows[0].cnt, 10);

    // Business Rule: 4 or 5 members => registered, otherwise draft
    const newStatus = memberCount >= 4 ? 'registered' : 'draft';
    await client.query('UPDATE team SET status = $1 WHERE id = $2', [newStatus, team.id]);
    team.status = newStatus;

    // Fetch members list
    const mRes = await client.query(
      'SELECT id, player_id, name, ign, role, is_captain, created_at FROM team_member WHERE team_id = $1 ORDER BY is_captain DESC, created_at ASC',
      [team.id],
    );
    team.members = mRes.rows;
    return team;
  });
}

async function getTeam(id) {
  const result = await query(
    `SELECT t.id, t.name, t.game, t.tag, t.division, t.slots_max, t.status, t.org_id, t.captain_id, t.created_at,
            o.name AS org_name,
            p.username AS captain_username, p.game_ign AS captain_ign
     FROM team t
     LEFT JOIN org o ON o.id = t.org_id
     LEFT JOIN player p ON p.id = t.captain_id
     WHERE t.id = $1`,
    [id],
  );
  if (result.rowCount === 0) throw new NotFoundError('Team');
  const team = result.rows[0];

  const membersRes = await query(
    `SELECT tm.id, tm.player_id, tm.name, tm.ign, tm.role, tm.is_captain, tm.created_at,
            p.avatar_url, p.tagline
     FROM team_member tm
     LEFT JOIN player p ON p.id = tm.player_id
     WHERE tm.team_id = $1
     ORDER BY tm.is_captain DESC, tm.created_at ASC`,
    [id],
  );
  team.members = membersRes.rows;

  const postingsRes = await query(
    `SELECT id, role, description, status, created_at
     FROM role_posting
     WHERE team_id = $1 AND status = 'open'
     ORDER BY created_at DESC`,
    [id],
  );
  team.open_roles = postingsRes.rows;

  return team;
}

async function listTeams({ game, status, limit = 50, offset = 0 } = {}) {
  const conditions = [];
  const params = [];

  if (game && game !== 'all') {
    params.push(game.toLowerCase());
    conditions.push(`LOWER(t.game) = $${params.length}`);
  }
  if (status && status !== 'all') {
    params.push(status);
    conditions.push(`t.status = $${params.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  params.push(limit, offset);

  const sql = `
    SELECT t.id, t.name, t.game, t.tag, t.division, t.slots_max, t.status, t.org_id, t.captain_id, t.created_at,
           o.name AS org_name,
           p.username AS captain_username,
           COUNT(tm.id)::int AS members_count
    FROM team t
    LEFT JOIN org o ON o.id = t.org_id
    LEFT JOIN player p ON p.id = t.captain_id
    LEFT JOIN team_member tm ON tm.team_id = t.id
    ${whereClause}
    GROUP BY t.id, o.name, p.username
    ORDER BY t.created_at DESC
    LIMIT $${params.length - 1} OFFSET $${params.length}
  `;

  const result = await query(sql, params);
  return result.rows;
}

async function updateTeam(id, user, data) {
  const teamRes = await query('SELECT id, org_id, captain_id FROM team WHERE id = $1', [id]);
  if (teamRes.rowCount === 0) throw new NotFoundError('Team');
  const team = teamRes.rows[0];

  const isOwner = (team.org_id && team.org_id === user.id) || (team.captain_id && team.captain_id === user.id) || user.role === 'admin';
  if (!isOwner) throw new ForbiddenError('You do not own this team');

  const result = await query(
    `UPDATE team SET 
       name = COALESCE($1, name), 
       game = COALESCE($2, game),
       tag = COALESCE($3, tag),
       division = COALESCE($4, division)
     WHERE id = $5 
     RETURNING id, org_id, captain_id, name, game, tag, division, slots_max, status, created_at`,
    [data.name ?? null, data.game ?? null, data.tag ?? null, data.division ?? null, id],
  );
  return result.rows[0];
}

async function addMember(teamId, user, { name, ign, role = 'Member', player_id = null }) {
  return withTransaction(async (client) => {
    const teamRes = await client.query('SELECT id, org_id, captain_id, status, slots_max FROM team WHERE id = $1 FOR UPDATE', [teamId]);
    if (teamRes.rowCount === 0) throw new NotFoundError('Team');
    const team = teamRes.rows[0];

    const isAuthorized = (team.org_id && team.org_id === user.id) ||
                         (team.captain_id && team.captain_id === user.id) ||
                         user.role === 'admin';
    if (!isAuthorized) throw new ForbiddenError('Only the captain or team organization can manage the roster');

    const countRes = await client.query('SELECT COUNT(*) AS cnt FROM team_member WHERE team_id = $1', [teamId]);
    if (parseInt(countRes.rows[0].cnt, 10) >= team.slots_max) throw new BadRequestError('Team roster is full');
    if (player_id) await claimPlayerForTeam(client, teamId, player_id);

    // Insert into team_member
    const memRes = await client.query(
      `INSERT INTO team_member (team_id, player_id, name, ign, role, is_captain)
       VALUES ($1, $2, $3, $4, $5, false)
       RETURNING id, team_id, player_id, name, ign, role, is_captain, created_at`,
      [teamId, player_id, name, ign || name, role],
    );

    // Check count and apply 4-5 member registration rule
    const updatedCount = await client.query('SELECT COUNT(*) AS cnt FROM team_member WHERE team_id = $1', [teamId]);
    const memberCount = parseInt(updatedCount.rows[0].cnt, 10);
    const newStatus = memberCount >= 4 ? 'registered' : 'draft';

    await client.query('UPDATE team SET status = $1 WHERE id = $2', [newStatus, teamId]);

    const updatedMembers = await client.query(
      'SELECT id, player_id, name, ign, role, is_captain, created_at FROM team_member WHERE team_id = $1 ORDER BY is_captain DESC, created_at ASC',
      [teamId],
    );

    return {
      team_id: teamId,
      status: newStatus,
      member_count: memberCount,
      added_member: memRes.rows[0],
      members: updatedMembers.rows,
    };
  });
}

async function removeMember(teamId, memberId, user) {
  return withTransaction(async (client) => {
    const teamRes = await client.query('SELECT id, org_id, captain_id FROM team WHERE id = $1', [teamId]);
    if (teamRes.rowCount === 0) throw new NotFoundError('Team');
    const team = teamRes.rows[0];

    const isAuthorized = (team.org_id && team.org_id === user.id) ||
                         (team.captain_id && team.captain_id === user.id) ||
                         user.role === 'admin';
    if (!isAuthorized) throw new ForbiddenError('Only the captain or team organization can manage the roster');

    const mRes = await client.query('SELECT id, player_id FROM team_member WHERE id = $1 AND team_id = $2', [memberId, teamId]);
    if (mRes.rowCount === 0) throw new NotFoundError('Team member');

    const member = mRes.rows[0];
    if (member.player_id) {
      await client.query('UPDATE player SET team_id = NULL WHERE id = $1', [member.player_id]);
    }

    await client.query('DELETE FROM team_member WHERE id = $1', [memberId]);

    // Recheck count
    const countRes = await client.query('SELECT COUNT(*) AS cnt FROM team_member WHERE team_id = $1', [teamId]);
    const memberCount = parseInt(countRes.rows[0].cnt, 10);
    const newStatus = memberCount >= 4 ? 'registered' : 'draft';

    await client.query('UPDATE team SET status = $1 WHERE id = $2', [newStatus, teamId]);

    return {
      message: 'Member removed',
      status: newStatus,
      member_count: memberCount,
    };
  });
}

/* ── Team Invitations (Formal Request-Accept Workflow) ── */
async function inviteMember(teamId, user, { player_id, role = 'Member', message = '' }) {
  return withTransaction(async (client) => {
    const tRes = await client.query('SELECT id, org_id, captain_id, name, slots_max FROM team WHERE id = $1', [teamId]);
    if (tRes.rowCount === 0) throw new NotFoundError('Team');
    const team = tRes.rows[0];

    const isAuthorized = (team.org_id && team.org_id === user.id) ||
                         (team.captain_id && team.captain_id === user.id) ||
                         user.role === 'admin';
    if (!isAuthorized) throw new ForbiddenError('Only the captain or team organization can invite players to the squad');

    // Verify target player exists
    const pRes = await client.query('SELECT id, username, game_ign, avatar_url, primary_game FROM player WHERE id = $1', [player_id]);
    if (pRes.rowCount === 0) throw new NotFoundError('Player to invite');
    const targetPlayer = pRes.rows[0];

    // Check if player is already on this roster
    const mRes = await client.query('SELECT id FROM team_member WHERE team_id = $1 AND player_id = $2', [teamId, player_id]);
    if (mRes.rowCount > 0) throw new BadRequestError('Player is already a member of this squad roster');

    // Check capacity
    const countRes = await client.query('SELECT COUNT(*) AS cnt FROM team_member WHERE team_id = $1', [teamId]);
    const memberCount = parseInt(countRes.rows[0].cnt, 10);
    if (memberCount >= (team.slots_max || 5)) {
      throw new BadRequestError('Squad roster is full');
    }

    // Insert or update invitation
    const invRes = await client.query(
      `INSERT INTO team_invitation (team_id, player_id, invited_by, role, message, status, updated_at)
       VALUES ($1, $2, $3, $4, $5, 'pending', NOW())
       ON CONFLICT (team_id, player_id)
       DO UPDATE SET status = 'pending', role = EXCLUDED.role, message = EXCLUDED.message, updated_at = NOW()
       RETURNING id, team_id, player_id, invited_by, role, message, status, created_at, updated_at`,
      [teamId, player_id, user.id, role, message]
    );

    return {
      ...invRes.rows[0],
      player: targetPlayer,
      team_name: team.name,
    };
  });
}

async function listTeamInvitations(teamId, user) {
  const tRes = await query('SELECT id, org_id, captain_id FROM team WHERE id = $1', [teamId]);
  if (tRes.rowCount === 0) throw new NotFoundError('Team');
  const team = tRes.rows[0];

  const isAuthorized = (team.org_id && team.org_id === user.id) ||
                       (team.captain_id && team.captain_id === user.id) ||
                       user.role === 'admin';
  if (!isAuthorized) throw new ForbiddenError('Only team managers can view sent squad invitations');

  const res = await query(
    `SELECT ti.id, ti.team_id, ti.player_id, ti.role, ti.message, ti.status, ti.created_at, ti.updated_at,
            p.username, p.game_ign, p.avatar_url, p.primary_game
     FROM team_invitation ti
     JOIN player p ON p.id = ti.player_id
     WHERE ti.team_id = $1
     ORDER BY ti.created_at DESC`,
    [teamId]
  );
  return res.rows;
}

async function cancelInvitation(teamId, inviteId, user) {
  const tRes = await query('SELECT id, org_id, captain_id FROM team WHERE id = $1', [teamId]);
  if (tRes.rowCount === 0) throw new NotFoundError('Team');
  const team = tRes.rows[0];

  const isAuthorized = (team.org_id && team.org_id === user.id) ||
                       (team.captain_id && team.captain_id === user.id) ||
                       user.role === 'admin';
  if (!isAuthorized) throw new ForbiddenError('Only team managers can cancel invitations');

  const res = await query(
    `UPDATE team_invitation SET status = 'cancelled', updated_at = NOW()
     WHERE id = $1 AND team_id = $2 RETURNING id, status`,
    [inviteId, teamId]
  );
  if (res.rowCount === 0) throw new NotFoundError('Invitation');
  return { message: 'Invitation cancelled', id: inviteId };
}

async function listMyInvitations(user) {
  const res = await query(
    `SELECT ti.id, ti.team_id, ti.player_id, ti.role, ti.message, ti.status, ti.created_at,
            t.name AS team_name, t.tag AS team_tag, t.game AS team_game, t.division, t.slots_max, t.status AS team_status,
            COALESCE(inv.username, 'Captain') AS inviter_name,
            (SELECT COUNT(*) FROM team_member WHERE team_id = t.id) AS member_count
     FROM team_invitation ti
     JOIN team t ON t.id = ti.team_id
     LEFT JOIN player inv ON inv.id = ti.invited_by
     WHERE ti.player_id = $1 AND ti.status = 'pending'
     ORDER BY ti.created_at DESC`,
    [user.id]
  );
  return res.rows;
}

async function respondInvitation(inviteId, user, action) {
  return withTransaction(async (client) => {
    const invRes = await client.query(
      `SELECT ti.*, t.slots_max, t.name AS team_name
       FROM team_invitation ti
       JOIN team t ON t.id = ti.team_id
       WHERE ti.id = $1 AND ti.player_id = $2 FOR UPDATE`,
      [inviteId, user.id]
    );
    if (invRes.rowCount === 0) throw new NotFoundError('Invitation');
    const invite = invRes.rows[0];

    if (invite.status !== 'pending') {
      throw new BadRequestError(`Invitation has already been ${invite.status}`);
    }

    if (action === 'decline') {
      await client.query(
        "UPDATE team_invitation SET status = 'declined', updated_at = NOW() WHERE id = $1",
        [inviteId]
      );
      return { id: inviteId, status: 'declined', message: 'Invitation declined' };
    }

    // Action === 'accept'
    // Check team capacity
    const countRes = await client.query('SELECT COUNT(*) AS cnt FROM team_member WHERE team_id = $1', [invite.team_id]);
    const memberCount = parseInt(countRes.rows[0].cnt, 10);
    if (memberCount >= (invite.slots_max || 5)) {
      throw new BadRequestError('This squad is now full and cannot accept more members');
    }

    // Get accepting player details
    const pRes = await client.query('SELECT id, username, game_ign FROM player WHERE id = $1', [user.id]);
    const p = pRes.rows[0];

    // Add to team_member if not already there
    const existing = await client.query('SELECT id FROM team_member WHERE team_id = $1 AND player_id = $2', [invite.team_id, user.id]);
    if (existing.rowCount === 0) {
      await client.query(
        `INSERT INTO team_member (team_id, player_id, name, ign, role, is_captain)
         VALUES ($1, $2, $3, $4, $5, false)`,
        [invite.team_id, p.id, p.username, p.game_ign || p.username, invite.role || 'Member']
      );
    }

    // Set player's active team_id
    await client.query('UPDATE player SET team_id = $1 WHERE id = $2', [invite.team_id, user.id]);

    // Mark invitation accepted
    await client.query(
      "UPDATE team_invitation SET status = 'accepted', updated_at = NOW() WHERE id = $1",
      [inviteId]
    );

    // Recheck member count & update status to registered if >= 4
    const newCountRes = await client.query('SELECT COUNT(*) AS cnt FROM team_member WHERE team_id = $1', [invite.team_id]);
    const newMemberCount = parseInt(newCountRes.rows[0].cnt, 10);
    const newStatus = newMemberCount >= 4 ? 'registered' : 'draft';
    await client.query('UPDATE team SET status = $1 WHERE id = $2', [newStatus, invite.team_id]);

    return {
      id: inviteId,
      status: 'accepted',
      team_id: invite.team_id,
      team_name: invite.team_name,
      team_status: newStatus,
      member_count: newMemberCount,
      message: `You have successfully joined ${invite.team_name}!`,
    };
  });
}

module.exports = {
  createTeam,
  getTeam,
  listTeams,
  updateTeam,
  addMember,
  removeMember,
  inviteMember,
  listTeamInvitations,
  cancelInvitation,
  listMyInvitations,
  respondInvitation,
};
