import dotenv from 'dotenv';
import app from './app.js';
import { checkConnection } from './config/database.js';
import { logger } from './config/logger.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Start Server
 */
async function startServer() {
  try {
    // Test database connection before starting server
    logger.info('🔍 Checking database connection...');
    await checkConnection();
    logger.info('✅ Database connected successfully');

    // Start Express server
    app.listen(PORT, () => {
      logger.info(`🚀 CocoaFlow API running on port ${PORT}`);
      logger.info(`📍 Environment: ${NODE_ENV}`);
      logger.info(`🔗 Health check: http://localhost:${PORT}/api/health`);
      logger.info(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      logger.info(`🌐 Frontend URL: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);

      if (NODE_ENV === 'development') {
        logger.info('\n📋 Available Endpoints:');
        logger.info('  - POST   /api/auth/login');
        logger.info('  - POST   /api/auth/register');
        logger.info('  - GET    /api/inventory');
        logger.info('  - GET    /api/recipes');
        logger.info('  - GET    /api/production');
        logger.info('  - GET    /api/qc');
        logger.info('  - GET    /api/mechanics');
        logger.info('  - GET    /api/dashboard');
        logger.info('  - POST   /api/ai/chat');
        logger.info('  - GET    /metrics');
      }
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM signal received: closing HTTP server');
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      logger.info('SIGINT signal received: closing HTTP server');
      process.exit(0);
    });

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
  process.exit(1);
});

// Start the server
startServer();
