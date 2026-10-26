function encodeCursor(id) {
  return Buffer.from(String(id)).toString('base64url');
}

function decodeCursor(cursor) {
  try {
    const decoded = Buffer.from(cursor, 'base64url').toString('utf8');
    return decoded && Buffer.from(decoded).toString('base64url') === cursor ? decoded : null;
  } catch {
    return null;
  }
}

function buildCursorPage(rows, limit, cursorForRow = (row) => row.id) {
  const hasMore = rows.length > limit;
  const data = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore && data.length > 0 ? encodeCursor(cursorForRow(data[data.length - 1])) : null;
  return { data, nextCursor, hasMore };
}

function parsePaginationParams(query = {}) {
  const parsedLimit = Number(query.limit);
  const limit = (!isNaN(parsedLimit) && parsedLimit > 0) ? Math.min(parsedLimit, 100) : 20;
  const cursor = (query.cursor && typeof query.cursor === 'string') ? decodeCursor(query.cursor) : null;
  return { limit, cursor };
}

module.exports = { encodeCursor, decodeCursor, buildCursorPage, parsePaginationParams };
