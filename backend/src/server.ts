import http from 'http';
import app from './app.js';
import { env } from './config/env.js';
import { db } from './config/database.js';
import { redis } from './config/redis.js';
import { logger } from './config/logger.js';
import { setupRealtime } from './services/realtime.service.js';

/**
 * 1. Create HTTP Server
 */
const server = http.createServer(app);

/**
 * 2. Setup Real-time Layer
 */
setupRealtime(server);

/**
 * 3. Start Server & Verify Connections
 */
const port = env.PORT || 5000;

server.listen(port, async () => {
    logger.info(`Server running on port ${port} [${env.NODE_ENV}]`);
    
    try {
        await db.raw('SELECT 1');
        logger.info('Database connected');
    } catch (err) {
        logger.error('Database connection failed', { err });
    }
});

/**
 * 4. Graceful Shutdown
 */
const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    
    server.close(async () => {
        logger.info('HTTP server closed');
        
        try {
            await db.destroy();
            logger.info('Database connections closed');
            
            await redis.quit();
            logger.info('Redis connection closed');
            
            process.exit(0);
        } catch (err) {
            logger.error('Error during shutdown', { err });
            process.exit(1);
        }
    });

    // Force close after 10 seconds
    setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
