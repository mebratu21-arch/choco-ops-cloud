import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { env } from './env.js';

export let io: Server;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: [env.FRONTEND_URL as string, 'https://choco-ops-cloud.vercel.app'],
      credentials: true,
    },
  });

  return io;
};
