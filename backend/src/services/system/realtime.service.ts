import { Server } from 'socket.io';
import http from 'http';
import { env } from '../../config/env.js';
import jwt from 'jsonwebtoken';
import { logger } from '../../config/logger.js';

let io: Server | null = null;

/**
 * Setup real-time communication via Socket.IO
 */
export function setupRealtime(server: http.Server) {
  io = new Server(server, {
    cors: {
      origin: [env.FRONTEND_URL || 'http://localhost:3000'],
      credentials: true,
    },
  });

  // Authentication Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication failed: No token provided'));

    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as any;
      (socket as any).user = { id: payload.id, role: payload.role };
      next();
    } catch (err) {
      next(new Error('Authentication failed: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = (socket as any).user;
    logger.info('Socket client connected', { userId: user.id });

    // Join personal room
    socket.join(`user:${user.id}`);

    // Subscribe to batch updates
    socket.on('subscribe:batch', (batchId: string) => {
      socket.join(`batch:${batchId}`);
      logger.debug('User subscribed to batch updates', { userId: user.id, batchId });
    });

    socket.on('disconnect', () => {
      logger.info('Socket client disconnected', { userId: user.id });
    });
  });

  return io;
}

export function emitToUser(userId: string, event: string, payload: any) {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
}

export function emitToBatch(batchId: string, event: string, payload: any) {
  if (!io) return;
  io.to(`batch:${batchId}`).emit(event, payload);
}

export function getIO() {
  return io;
}
