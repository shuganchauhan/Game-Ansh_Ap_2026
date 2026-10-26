const { query } = require('../../shared/db');
const { BadRequestError, ForbiddenError } = require('../../shared/errors');
const { encodeCursor } = require('../../shared/pagination');
const { buildCursorPage, parsePaginationParams } = require('../../shared/pagination');
const { emitToUser } = require('../../shared/socket');

function getParticipants(threadId) {
  const parts = threadId.split(':');
  if (parts.length !== 2 || parts[0] === parts[1] || parts.some((part) => !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(part))) {
    throw new BadRequestError('Invalid thread ID format');
  }
  return [parts[0], parts[1]];
}

async function getMessages(threadId, requesterId, queryParams) {
  const [p1, p2] = getParticipants(threadId);
  if (requesterId !== p1 && requesterId !== p2) throw new ForbiddenError('You are not part of this conversation');

  const { limit, cursor } = parsePaginationParams(queryParams);
  if (queryParams.cursor && !cursor) throw new BadRequestError('Invalid message cursor');
  let cursorData = null;
  if (cursor) {
    try { cursorData = JSON.parse(cursor); } catch { throw new BadRequestError('Invalid message cursor'); }
    if (!cursorData || !cursorData.at || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(cursorData.id || '') || Number.isNaN(Date.parse(cursorData.at))) {
      throw new BadRequestError('Invalid message cursor');
    }
  }
  const cursorClause = cursorData ? 'AND (m.created_at, m.id) > ($4::timestamptz, $5::uuid)' : '';

  const result = await query(
    `SELECT m.id, m.sender_id, m.receiver_id, m.content, m.read, m.created_at
     FROM message m
     WHERE ((m.sender_id = $1 AND m.receiver_id = $2) OR (m.sender_id = $2 AND m.receiver_id = $1))
     ${cursorClause}
     ORDER BY m.created_at ASC, m.id ASC
     LIMIT $3`,
    [p1, p2, limit + 1, ...(cursorData ? [cursorData.at, cursorData.id] : [])],
  );

  const otherId = requesterId === p1 ? p2 : p1;
  await query(
    'UPDATE message SET read = true WHERE receiver_id = $1 AND sender_id = $2 AND read = false',
    [requesterId, otherId],
  );

  return buildCursorPage(result.rows, limit, (row) => JSON.stringify({ at: row.created_at, id: row.id }));
}

async function sendMessage(threadId, senderId, content) {
  const participants = getParticipants(threadId);
  if (!participants.includes(senderId)) throw new ForbiddenError('You are not part of this conversation');
  const receiverId = participants.find((id) => id !== senderId);
  if (senderId === receiverId) throw new BadRequestError('Cannot message yourself');
  const result = await query(
    `INSERT INTO message (sender_id, receiver_id, content)
     VALUES ($1, $2, $3) RETURNING id, sender_id, receiver_id, content, read, created_at`,
    [senderId, receiverId, content],
  );
  const message = result.rows[0];
  emitToUser(receiverId, 'new_message', message);
  return message;
}

module.exports = { getMessages, sendMessage };
