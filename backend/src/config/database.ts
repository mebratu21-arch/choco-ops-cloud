import knex from 'knex';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

// Simplified config to ensure connection works without complex path resolution
const config = {
  client: 'pg',
  connection: (process.env.DATABASE_URL && process.env.DATABASE_URL.length > 0) ? process.env.DATABASE_URL : {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'cocoaflow',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
  },
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    directory: './src/db/migrations'
  },
  seeds: {
    directory: './src/db/seeds'
  }
};

export const db = knex(config);

export async function checkConnection(): Promise<boolean> {
  try {
    await db.raw('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}
