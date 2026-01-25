import { env } from '../src/config/environment.js';

console.log('Knexfile: env loaded');
console.log('DATABASE_URL:', env.DATABASE_URL ? 'PRESENT' : 'MISSING');

export default {
  development: {
    client: 'pg',
    connection: env.DATABASE_URL,
    migrations: {
      directory: '../migrations',
      extension: 'ts',
    },
    seeds: {
      directory: '../seeds',
    },
  },
  production: {
    client: 'pg',
    connection: env.DATABASE_URL,
    pool: { min: 2, max: 10 },
    migrations: {
      directory: '../migrations',
      extension: 'ts',
    },
  },
};
