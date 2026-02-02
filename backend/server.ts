import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import fs from 'fs';
import path from 'path';
import { config } from './src/config/env';
import { configureApp } from './src/app';

// --- LOGGING SETUP ---
const LOG_FILE = path.join(process.cwd(), 'server_startup.log');
const log = (m: string) => {
  const entry = `${new Date().toISOString()} - ${m}\n`;
  fs.appendFileSync(LOG_FILE, entry);
  console.log(m);
};

// --- GLOBAL ERROR HANDLING ---
process.on('uncaughtException', (err) => {
  log(`UNCAUGHT EXCEPTION: ${err.message}\n${err.stack}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log(`UNHANDLED REJECTION: ${reason}`);
});

// --- SERVER SETUP ---
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('🔌 Client Connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client Disconnected:', socket.id);
  });
});

// Configure Express App with Routes & Middleware
configureApp(app, io);

// --- BACKGROUND SERVICES ---
// Serialize Telemetry (Moving this out later would be good, but fine here for now)
setInterval(() => {
  const telemetry = {
    coldStorage: { temp: (14 + Math.random() * 0.5).toFixed(1), humidity: Math.round(45 + Math.random() * 2) },
    ambient: { temp: (18 + Math.random() * 0.5).toFixed(1), humidity: Math.round(50 + Math.random() * 2) },
    packaging: { temp: (20 + Math.random() * 0.5).toFixed(1), humidity: Math.round(55 + Math.random() * 2) }
  };
  io.emit('telemetry_update', telemetry);
}, config.TELEMETRY_INTERVAL_MS);

// --- START SERVER ---
if (process.env.NODE_ENV !== 'test') {
  log(`Starting server with config: PORT=${config.PORT}, ENV=${process.env.NODE_ENV || 'dev'}`);
  server.listen(Number(config.PORT), '127.0.0.1', () => {
    log(`SUCCESS: Backend active on 127.0.0.1:${config.PORT}`);
    console.log(`🍫 CocoaFlow Backend: ACTIVE ON 127.0.0.1:${config.PORT}`);
    console.log('🔌 WebSocket Server: ACTIVE');
  });
  
  server.on('error', (err) => {
    log(`SERVER LISTEN ERROR: ${err.message}`);
  });
}

export default app;
