import app from './app.js';
import { config } from './config/environment.js';
import { testConnection } from './config/database.js';
import { logger } from './config/logger.js';

const start = async () => {
  try {
    await testConnection();
    
    app.listen(config.PORT, () => {
      logger.info(`🚀 Server running on port ${config.PORT}`, {
        environment: config.NODE_ENV,
        url: `http://localhost:${config.PORT}`,
      });
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
};

start();
