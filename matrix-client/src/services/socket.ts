import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (socket) return socket;
  const token = localStorage.getItem('matrix:token') ?? '';
  const base = import.meta.env.VITE_API_URL ?? window.location.origin;
  socket = io(base, {
    auth: { token },
    autoConnect: true,
    transports: ['websocket'],
  });
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
