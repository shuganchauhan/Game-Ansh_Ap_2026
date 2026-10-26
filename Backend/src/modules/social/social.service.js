const { query, withTransaction } = require('../../shared/db');
const { NotFoundError, ConflictError, BadRequestError } = require('../../shared/errors');

async function follow(playerId, { target_type, target_id }) {
  let table = 'org';
  if (target_type === 'team') table = 'team';
  if (target_type === 'organizer') table = 'tournament_organizer';

  const targetRes = await query(`SELECT id FROM "${table}" WHERE id = $1`, [target_id]);
  if (targetRes.rowCount === 0) throw new NotFoundError(target_type);

  const existing = await query(
    'SELECT id FROM follow WHERE player_id = $1 AND target_type = $2 AND target_id = $3',
    [playerId, target_type, target_id],
  );
  if (existing.rowCount > 0) throw new ConflictError('Already following');

  const result = await query(
    'INSERT INTO follow (player_id, target_type, target_id) VALUES ($1, $2, $3) RETURNING id, player_id, target_type, target_id, created_at',
    [playerId, target_type, target_id],
  );
  return result.rows[0];
}

async function unfollow(playerId, { target_type, target_id }) {
  const result = await query(
    'DELETE FROM follow WHERE player_id = $1 AND target_type = $2 AND target_id = $3 RETURNING id',
    [playerId, target_type, target_id],
  );
  if (result.rowCount === 0) throw new NotFoundError('Follow relationship');
  return { message: 'Unfollowed successfully' };
}

async function createPost(user, { content, category = 'General', game = 'valorant' }) {
  if (!content || !content.trim()) throw new BadRequestError('Content cannot be empty');

  const authorType = user.role || 'player';
  if (authorType === 'admin') throw new BadRequestError('Administrators cannot publish community posts');
  const authorId = user.id;

  const result = await query(
    `INSERT INTO post (author_type, author_id, content, category, game)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, author_type, author_id, content, category, game, likes_count, created_at`,
    [authorType, authorId, content.trim(), category, game.toLowerCase()],
  );
  const post = result.rows[0];

  // Resolve author metadata
  if (authorType === 'player') {
    const p = await query('SELECT username, game_ign, avatar_url, tagline FROM player WHERE id = $1', [authorId]);
    if (p.rowCount > 0) {
      post.author_name = p.rows[0].username;
      post.author_ign = p.rows[0].game_ign;
      post.author_tagline = p.rows[0].tagline;
      post.avatar_url = p.rows[0].avatar_url;
    }
  } else if (authorType === 'org') {
    const o = await query('SELECT name, verified FROM org WHERE id = $1', [authorId]);
    if (o.rowCount > 0) {
      post.author_name = o.rows[0].name;
      post.author_verified = o.rows[0].verified;
    }
  } else if (authorType === 'organizer') {
    const orgn = await query('SELECT name, verified FROM tournament_organizer WHERE id = $1', [authorId]);
    if (orgn.rowCount > 0) {
      post.author_name = orgn.rows[0].name;
      post.author_verified = orgn.rows[0].verified;
    }
  }

  post.comments = [];
  post.liked = false;
  return post;
}

async function getFeed(userId = null) {
  // Production LinkedIn-style feed query returning all public posts,
  // enhanced with likes, comments, and author profiles
  const sql = `
    SELECT p.id, p.author_type, p.author_id, p.content, p.category, p.game, p.created_at,
           CASE 
             WHEN p.author_type = 'player' THEN pl.username 
             WHEN p.author_type = 'org' THEN o.name 
             WHEN p.author_type = 'organizer' THEN orgn.name
             WHEN p.author_type = 'team' THEN t.name 
             ELSE 'Gamer' 
           END AS author_name,
           pl.game_ign AS author_ign,
           pl.tagline AS author_tagline,
           pl.avatar_url AS author_avatar,
           CASE 
             WHEN p.author_type = 'org' THEN o.verified
             WHEN p.author_type = 'organizer' THEN orgn.verified
             ELSE false
           END AS author_verified,
           COUNT(DISTINCT plk.id)::int AS likes_count,
           COUNT(DISTINCT pc.id)::int AS comments_count,
           EXISTS(SELECT 1 FROM post_like WHERE post_id = p.id AND user_id = $1) AS liked
    FROM post p
    LEFT JOIN player pl ON p.author_type = 'player' AND pl.id = p.author_id
    LEFT JOIN org o ON p.author_type = 'org' AND o.id = p.author_id
    LEFT JOIN tournament_organizer orgn ON p.author_type = 'organizer' AND orgn.id = p.author_id
    LEFT JOIN team t ON p.author_type = 'team' AND t.id = p.author_id
    LEFT JOIN post_like plk ON plk.post_id = p.id
    LEFT JOIN post_comment pc ON pc.post_id = p.id
    GROUP BY p.id, pl.username, pl.game_ign, pl.tagline, pl.avatar_url, o.name, o.verified, orgn.name, orgn.verified, t.name
    ORDER BY p.created_at DESC
    LIMIT 60
  `;

  const result = await query(sql, [userId || '00000000-0000-0000-0000-000000000000']);
  
  const postIds = result.rows.map((post) => post.id);
  const commentsRes = postIds.length
    ? await query(
      `SELECT id, post_id, author_name, content, created_at FROM (
         SELECT id, post_id, author_name, content, created_at,
                ROW_NUMBER() OVER (PARTITION BY post_id ORDER BY created_at ASC) AS position
         FROM post_comment WHERE post_id = ANY($1::uuid[])
       ) recent WHERE position <= 5 ORDER BY post_id, created_at ASC`,
      [postIds],
    )
    : { rows: [] };
  const commentsByPost = new Map();
  for (const comment of commentsRes.rows) {
    if (!commentsByPost.has(comment.post_id)) commentsByPost.set(comment.post_id, []);
    commentsByPost.get(comment.post_id).push(comment);
  }
  for (const post of result.rows) post.comments = commentsByPost.get(post.id) || [];

  return result.rows;
}

async function getPost(id, userId = null) {
  const result = await query(
    `SELECT p.*,
            CASE 
              WHEN p.author_type = 'player' THEN pl.username 
              WHEN p.author_type = 'org' THEN o.name 
              WHEN p.author_type = 'organizer' THEN orgn.name
              WHEN p.author_type = 'team' THEN t.name 
              ELSE 'Gamer' 
            END AS author_name,
            pl.avatar_url, pl.tagline,
            COUNT(DISTINCT plk.id)::int AS likes_count,
            EXISTS(SELECT 1 FROM post_like WHERE post_id = p.id AND user_id = $2) AS liked
     FROM post p
     LEFT JOIN player pl ON p.author_type = 'player' AND pl.id = p.author_id
     LEFT JOIN org o ON p.author_type = 'org' AND o.id = p.author_id
     LEFT JOIN tournament_organizer orgn ON p.author_type = 'organizer' AND orgn.id = p.author_id
     LEFT JOIN team t ON p.author_type = 'team' AND t.id = p.author_id
     LEFT JOIN post_like plk ON plk.post_id = p.id
     WHERE p.id = $1
     GROUP BY p.id, pl.username, pl.avatar_url, pl.tagline, o.name, orgn.name, t.name`,
    [id, userId || '00000000-0000-0000-0000-000000000000'],
  );
  if (result.rowCount === 0) throw new NotFoundError('Post');
  const post = result.rows[0];

  const commentsRes = await query(
    'SELECT id, author_name, content, created_at FROM post_comment WHERE post_id = $1 ORDER BY created_at ASC',
    [id],
  );
  post.comments = commentsRes.rows;
  return post;
}

async function toggleLike(postId, userId) {
  return withTransaction(async (client) => {
    const post = await client.query('SELECT id FROM post WHERE id = $1 FOR UPDATE', [postId]);
    if (post.rowCount === 0) throw new NotFoundError('Post');
    const existing = await client.query('SELECT id FROM post_like WHERE post_id = $1 AND user_id = $2', [postId, userId]);
    if (existing.rowCount > 0) {
      await client.query('DELETE FROM post_like WHERE post_id = $1 AND user_id = $2', [postId, userId]);
      await client.query('UPDATE post SET likes_count = GREATEST(0, likes_count - 1) WHERE id = $1', [postId]);
      return { liked: false };
    }
    await client.query('INSERT INTO post_like (post_id, user_id) VALUES ($1, $2)', [postId, userId]);
    await client.query('UPDATE post SET likes_count = likes_count + 1 WHERE id = $1', [postId]);
    return { liked: true };
  });
}

async function addComment(postId, user, content) {
  if (!content || !content.trim()) throw new BadRequestError('Comment cannot be empty');

  let authorName = 'Gamer';
  if (user.role === 'player') {
    const p = await query('SELECT username FROM player WHERE id = $1', [user.id]);
    if (p.rowCount > 0) authorName = p.rows[0].username;
  } else if (user.role === 'org') {
    const o = await query('SELECT name FROM org WHERE id = $1', [user.id]);
    if (o.rowCount > 0) authorName = o.rows[0].name;
  } else if (user.role === 'organizer') {
    const orgn = await query('SELECT name FROM tournament_organizer WHERE id = $1', [user.id]);
    if (orgn.rowCount > 0) authorName = orgn.rows[0].name;
  }

  const result = await query(
    `INSERT INTO post_comment (post_id, author_id, author_name, content)
     VALUES ($1, $2, $3, $4)
     RETURNING id, post_id, author_id, author_name, content, created_at`,
    [postId, user.id, authorName, content.trim()],
  );
  return result.rows[0];
}

// Connections (LinkedIn-style)
async function connectPlayers(requesterId, receiverId) {
  if (requesterId === receiverId) throw new BadRequestError('Cannot connect with yourself');
  const rec = await query('SELECT id FROM player WHERE id = $1', [receiverId]);
  if (rec.rowCount === 0) throw new NotFoundError('Target player');

  const existing = await query(
    'SELECT * FROM player_connection WHERE (requester_id = $1 AND receiver_id = $2) OR (requester_id = $2 AND receiver_id = $1)',
    [requesterId, receiverId],
  );
  if (existing.rowCount > 0) {
    return existing.rows[0];
  }

  const res = await query(
    `INSERT INTO player_connection (requester_id, receiver_id, status)
     VALUES ($1, $2, 'connected')
     RETURNING *`,
    [requesterId, receiverId],
  );
  return res.rows[0];
}

async function getConnections(playerId) {
  const sql = `
    SELECT pc.id AS connection_id, pc.created_at AS connected_at,
           p.id, p.username, p.game_ign, p.primary_game, p.tagline, p.avatar_url, p.lft_status
    FROM player_connection pc
    JOIN player p ON (p.id = CASE WHEN pc.requester_id = $1 THEN pc.receiver_id ELSE pc.requester_id END)
    WHERE pc.requester_id = $1 OR pc.receiver_id = $1
    ORDER BY pc.created_at DESC
  `;
  const res = await query(sql, [playerId]);
  return res.rows;
}

async function getFollows(playerId) {
  const result = await query('SELECT target_type, target_id FROM follow WHERE player_id = $1', [playerId]);
  return result.rows;
}

async function getRecommendedPlayers(currentUserId = null) {
  const params = [];
  let filterClause = '';
  if (currentUserId) {
    params.push(currentUserId);
    filterClause = `
      WHERE p.id != $1
        AND p.id NOT IN (
          SELECT CASE WHEN requester_id = $1 THEN receiver_id ELSE requester_id END
          FROM player_connection
          WHERE requester_id = $1 OR receiver_id = $1
        )
    `;
  }
  const sql = `
    SELECT p.id, p.username, p.game_ign, p.primary_game, p.tagline, p.avatar_url, p.lft_status,
           t.name AS team_name
    FROM player p
    LEFT JOIN team t ON t.id = p.team_id
    ${filterClause}
    ORDER BY p.created_at DESC
    LIMIT 10
  `;
  const res = await query(sql, params);
  return res.rows;
}

module.exports = {
  follow,
  unfollow,
  createPost,
  getFeed,
  getPost,
  toggleLike,
  addComment,
  connectPlayers,
  getConnections,
  getFollows,
  getRecommendedPlayers,
};
