import knex from 'knex';
import { env } from './env.js';
import { logger } from '../config/logger.js';

export const db = knex({
  client: 'pg',
  connection: env.DATABASE_URL,
  pool: { 
    min: 2, 
    max: 10,
    afterCreate: (conn: any, cb: any) => {
        conn.on('error', (err: any) => {
            logger.error('Database connection error in pool', { err });
        });
        cb(null, conn);
    }
  },
  migrations: { directory: './migrations', extension: 'ts' },
  searchPath: ['public'],
});

process.on('SIGTERM', async () => {
    await db.destroy();
    logger.info('Database connections closed via SIGTERM');
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
