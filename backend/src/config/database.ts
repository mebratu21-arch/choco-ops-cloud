import knex from 'knex';
import { config } from './environment.js';

export const db = knex({
  client: 'pg',
  connection: config.DATABASE_URL,
  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 60000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 200,
  },
  acquireConnectionTimeout: 60000,
  migrations: {
    directory: './migrations',
    extension: 'ts',
  },
  seeds: {
    directory: './seeds',
  },
});

export async function testConnection() {
  try {
    await db.raw('SELECT 1');
    console.log('✅ Database connected');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}
