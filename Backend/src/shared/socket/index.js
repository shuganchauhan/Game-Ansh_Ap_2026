const { Server: SocketServer } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const redis = require('../redis');
const { verifyToken } = require('../auth/jwt');
const { query } = require('../db');

let io;

function initSocket(httpServer) {
  io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'production'
        ? (process.env.CORS_ORIGINS || '').split(',').map((origin) => origin.trim()).filter(Boolean)
        : true,
      methods: ['GET', 'POST', 'PATCH', 'PUT'],
    },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));
      socket.data.user = verifyToken(token);
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  if (redis.status === 'ready' || redis.status === 'connect') {
    try {
      const pubClient = redis.duplicate();
      const subClient = redis.duplicate();
      io.adapter(createAdapter(pubClient, subClient));
      console.log('[Socket.io] Using Redis adapter for multi-instance scaling');
    } catch (e) {
      console.log('[Socket.io] Using in-memory adapter');
    }
  } else {
    console.log('[Socket.io] Using high-performance in-memory adapter');
  }

  io.on('connection', (socket) => {
    const userId = socket.data.user.id;
    if (userId) {
      socket.join(`user:${userId}`);
    }

    // Join / Leave dedicated Scrim Match Lobby room
    socket.on('join_scrim_lobby', async (scrimId) => {
      if (typeof scrimId !== 'string' || !/^[0-9a-f-]{36}$/i.test(scrimId)) return;
      try {
        const user = socket.data.user;
        const check = await query(
          `SELECT EXISTS (
             SELECT 1 FROM scrim s
             WHERE s.id = $1 AND (
               $3 = 'admin' OR ($3 = 'organizer' AND s.organizer_id = $2) OR
               EXISTS (
                 SELECT 1 FROM scrim_registration sr JOIN team t ON t.id = sr.team_id
                 LEFT JOIN team_member tm ON tm.team_id = t.id
                 WHERE sr.scrim_id = s.id AND (
                   ($3 = 'org' AND t.org_id = $2) OR
                   ($3 = 'player' AND (t.captain_id = $2 OR tm.player_id = $2))
                 )
               )
             )
           ) AS allowed`,
          [scrimId, user.id, user.role],
        );
        if (check.rows[0].allowed) socket.join(`scrim:${scrimId}`);
      } catch (error) {
        console.warn('[Socket] Could not authorize scrim room join:', error.message);
      }
    });

    socket.on('leave_scrim_lobby', (scrimId) => {
      if (scrimId) {
        socket.leave(`scrim:${scrimId}`);
      }
    });
  });

  return io;
}

function emitToUser(userId, event, data) {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
}

function emitToScrimLobby(scrimId, event, data) {
  if (!io) return;
  io.to(`scrim:${scrimId}`).emit(event, data);
}

function broadcastEvent(event, data) {
  if (!io) return;
  io.emit(event, data);
}

function getIO() {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}

module.exports = {
  initSocket,
  emitToUser,
  emitToScrimLobby,
  broadcastEvent,
  getIO,
};
