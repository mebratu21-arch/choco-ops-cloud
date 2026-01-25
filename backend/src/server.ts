import http from 'http';
import app from './app.js';
import { env } from './config/environment.js';
import { testConnection } from './config/database.js';
import { logger } from './utils/logger.js';
import { initSocket } from './config/socket.js';

const server = http.createServer(app);

const start = async () => {
  try {
    await testConnection();
    
    initSocket(server);

    server.listen(env.PORT, () => {
      logger.info(`STARTUP: Server running on port ${env.PORT}`, {
        environment: env.NODE_ENV,
        url: `http://localhost:${env.PORT}`,
      });
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
};

start();
