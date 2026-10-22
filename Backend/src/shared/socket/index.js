const { Server: SocketServer } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const redis = require('../redis');

let io;

function initSocket(httpServer) {
  io = new SocketServer(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST', 'PATCH', 'PUT'] },
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
    const userId = socket.handshake.auth?.userId;
    if (userId) {
      socket.join(`user:${userId}`);
    }

    // Join / Leave dedicated Scrim Match Lobby room
    socket.on('join_scrim_lobby', (scrimId) => {
      if (scrimId) {
        socket.join(`scrim:${scrimId}`);
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
