import { io } from 'socket.io-client';

let socket = null;

export function connectSocket(userId) {
  if (socket) {
    if (socket.connected) return socket;
    socket.disconnect();
  }

  if (!userId) return null;

  socket = io(window.location.origin, {
    auth: { userId },
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected as user:', userId);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
