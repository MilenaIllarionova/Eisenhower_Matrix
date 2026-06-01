import { Server as HttpServer } from 'http';
import { Server as IOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

let io: IOServer | null = null;
const userSockets = new Map<string, Set<string>>();

interface SocketUser {
  id: string;
  email: string;
}

declare module 'socket.io' {
  interface Socket {
    user?: SocketUser;
  }
}

export function initSocket(server: HttpServer): IOServer {
  io = new IOServer(server, {
    cors: { origin: env.clientOrigin, credentials: true },
  });

  io.use((socket: Socket, next) => {
    const token =
      (socket.handshake.auth as { token?: string } | undefined)?.token ||
      (socket.handshake.headers.authorization?.startsWith('Bearer ')
        ? socket.handshake.headers.authorization.slice(7)
        : undefined);

    if (!token) return next(new Error('No token'));

    try {
      const decoded = jwt.verify(token, env.jwtSecret) as SocketUser;
      socket.user = { id: decoded.id, email: decoded.email };
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = socket.user;
    if (!user) return socket.disconnect();

    const set = userSockets.get(user.id) ?? new Set<string>();
    set.add(socket.id);
    userSockets.set(user.id, set);

    socket.join(`user:${user.id}`);
    console.log(`[socket] connect ${user.email} (${socket.id})`);

    socket.on('team:join', (teamId: string) => {
      socket.join(`team:${teamId}`);
    });

    socket.on('team:leave', (teamId: string) => {
      socket.leave(`team:${teamId}`);
    });

    socket.on('disconnect', () => {
      const current = userSockets.get(user.id);
      current?.delete(socket.id);
      if (current && current.size === 0) userSockets.delete(user.id);
      console.log(`[socket] disconnect ${user.email} (${socket.id})`);
    });
  });

  return io;
}

export function emitToUser(userId: string, event: string, payload: unknown) {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
}

export function emitToTeam(teamId: string, event: string, payload: unknown) {
  if (!io) return;
  io.to(`team:${teamId}`).emit(event, payload);
}
