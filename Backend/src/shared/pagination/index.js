function encodeCursor(id) {
  return Buffer.from(String(id)).toString('base64url');
}

function decodeCursor(cursor) {
  try {
    return Buffer.from(cursor, 'base64url').toString('utf8');
  } catch {
    return null;
  }
}

function buildCursorPage(rows, limit) {
  const hasMore = rows.length > limit;
  const data = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore && data.length > 0 ? encodeCursor(data[data.length - 1].id) : null;
  return { data, nextCursor, hasMore };
}

function parsePaginationParams(query = {}) {
  const parsedLimit = Number(query.limit);
  const limit = (!isNaN(parsedLimit) && parsedLimit > 0) ? Math.min(parsedLimit, 100) : 20;
  const cursor = (query.cursor && typeof query.cursor === 'string') ? decodeCursor(query.cursor) : null;
  return { limit, cursor };
}

module.exports = { encodeCursor, decodeCursor, buildCursorPage, parsePaginationParams };
