import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { logger } from '../config/logger.js';
import { ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData } from './socket.types.js';

let io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> | null = null;

export const initializeSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:4173',
        process.env.CORS_ORIGIN || 'http://localhost:5173'
      ],
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Authentication Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret') as any;
      socket.data.user = {
        id: decoded.id,
        role: decoded.role,
        name: decoded.name || 'User'
      };
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`🔌 Socket connected: ${socket.id} (User: ${socket.data.user?.name})`);

    socket.on('disconnect', () => {
      logger.info(`❌ Socket disconnected: ${socket.id}`);
    });

    // Handle SOS Alerts from client
    socket.on('sos_alert', (data) => {
      logger.warn(`🚨 SOS Alert received from ${socket.data.user?.name}: ${data.reason}`);
      // Broadcast to everyone (or filter by role if needed)
      io?.emit('sos_alert', data);
    });

    // Handle Batch Updates
    socket.on('batch_update', (data) => {
        logger.info(`🏭 Batch update: ${data.batchId} -> ${data.status}`);
        // Broadcast
        io?.emit('batch_update', data);
    });
  });

  logger.info('✅ Socket.IO initialized');
  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized!');
  }
  return io;
};
