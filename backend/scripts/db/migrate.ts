import { db } from '../src/config/database.js';
import { logger } from '../src/config/logger.js';

async function runMigrations() {
  try {
    logger.info('Running migrations...');
    await db.migrate.latest({
        directory: './migrations',
        extension: 'ts' // Ensure it picks up .ts files
    });
    logger.info('Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Migration failed', { error });
    process.exit(1);
  }
}

runMigrations();
