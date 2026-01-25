import knex from 'knex';
import { env } from './environment.js';
import { logger } from '../utils/logger.js';

export const db = knex({
  client: 'pg',
  connection: env.DATABASE_URL,
  pool: { min: 2, max: 10 },
  migrations: { directory: './migrations', extension: 'ts' },
  searchPath: ['public'],
});

export const checkConnection = async () => {
  try {
    await db.raw('SELECT 1');
    logger.info('PostgreSQL connected');
  } catch (err) {
    logger.error('Database connection failed', { err });
    throw err;
  }
};

export const disconnectDB = async () => {
  await db.destroy();
};

export const testConnection = async () => {
    try {
        await db.raw('SELECT 1');
        return true;
    } catch (error) {
        throw error;
    }
};
